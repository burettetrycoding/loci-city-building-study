import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { EnvironmentsPanel } from './components/EnvironmentsPanel';
import { GitHubGuideView } from './components/GitHubGuideView';
import { IsometricWorld } from './components/IsometricWorld';
import { SubjectsPanel } from './components/SubjectsPanel';
import { TimerControls } from './components/TimerControls';
import {
  ENVIRONMENT_THEMES,
  LEVEL_DURATION_SECONDS,
  formatReadableDuration,
  getBlueprintsForStyle,
  getNextStructure,
  getSecondsInLevel,
  getSubjectLevelNumber,
  getThemeById,
  getTotalStudySeconds,
  getUnlockedStructures,
  isEnvironmentUnlocked,
} from './data/worldData';
import {
  EnvironmentId,
  EnvironmentTheme,
  SettlementStyle,
  StructureBlueprint,
  StudySession,
  SubjectCity,
  TimerMode,
  UserAccount,
} from './types/loci';
import {
  playBuildChime,
  playLevelUnlockChime,
  playStartChime,
  playStopChime,
} from './utils/sound';
import {
  createAccount,
  ensureInitialAccount,
  loadAllAccounts,
  setActiveAccountId,
  upsertAccount,
} from './utils/storage';

type ActiveTab = 'stage' | 'subjects' | 'environments' | 'github';

export default function App() {
  const [account, setAccount] = useState<UserAccount>(() => ensureInitialAccount());
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(() => loadAllAccounts());
  const [activeTab, setActiveTab] = useState<ActiveTab>('stage');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerMode, setTimerMode] = useState<TimerMode>('free');
  const sessionStartedAtRef = useRef<string | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Visual inspection & milestone feedback
  const [selectedStructure, setSelectedStructure] = useState<StructureBlueprint | null>(null);
  const [newlyUnlockedId, setNewlyUnlockedId] = useState<string | null>(null);
  const [milestoneNotice, setMilestoneNotice] = useState<{
    title: string;
    detail: string;
    themeId?: EnvironmentId;
  } | null>(null);

  const activeSubject: SubjectCity = useMemo(() => {
    return (
      account.subjects.find((s) => s.id === account.activeSubjectId) ?? account.subjects[0]
    );
  }, [account.subjects, account.activeSubjectId]);

  const totalStudySeconds = useMemo(
    () => getTotalStudySeconds(account.subjects),
    [account.subjects]
  );

  const activeTheme: EnvironmentTheme = useMemo(() => {
    const chosen = getThemeById(account.selectedEnvironmentId);
    if (isEnvironmentUnlocked(chosen, totalStudySeconds)) {
      return chosen;
    }
    return ENVIRONMENT_THEMES[0];
  }, [account.selectedEnvironmentId, totalStudySeconds]);

  const subjectLevel = useMemo(
    () => getSubjectLevelNumber(activeSubject.totalSeconds),
    [activeSubject.totalSeconds]
  );

  const [viewingLevel, setViewingLevel] = useState<number>(() =>
    getSubjectLevelNumber(activeSubject.totalSeconds)
  );

  useEffect(() => {
    setViewingLevel(subjectLevel);
  }, [activeSubject.id, subjectLevel]);

  const secondsInLevel = useMemo(
    () => getSecondsInLevel(activeSubject.totalSeconds, subjectLevel),
    [activeSubject.totalSeconds, subjectLevel]
  );

  const allBlueprints = useMemo(
    () => getBlueprintsForStyle(activeSubject.style),
    [activeSubject.style]
  );

  // Structures for the currently viewed level (defaults to active level)
  const unlockedStructures = useMemo(
    () => getUnlockedStructures(activeSubject.style, activeSubject.totalSeconds, viewingLevel),
    [activeSubject.style, activeSubject.totalSeconds, viewingLevel]
  );

  // Structures for the active live level (used for progress bar & unlock chime)
  const activeLevelUnlocked = useMemo(
    () => getUnlockedStructures(activeSubject.style, activeSubject.totalSeconds, subjectLevel),
    [activeSubject.style, activeSubject.totalSeconds, subjectLevel]
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedStructures.map((s) => s.id)),
    [unlockedStructures]
  );

  const nextStructure = useMemo(
    () => getNextStructure(activeSubject.style, activeSubject.totalSeconds, subjectLevel),
    [activeSubject.style, activeSubject.totalSeconds, subjectLevel]
  );

  const prevUnlockSeconds = useMemo(() => {
    if (activeLevelUnlocked.length === 0) return 0;
    return activeLevelUnlocked[activeLevelUnlocked.length - 1].unlockSeconds;
  }, [activeLevelUnlocked]);

  // Persist account whenever it changes
  useEffect(() => {
    upsertAccount(account);
    setAllAccounts(loadAllAccounts());
  }, [account]);

  // Track newly unlocked buildings and environment levels during live study
  const prevUnlockedCountRef = useRef<number>(activeLevelUnlocked.length);
  const prevSubjectLevelRef = useRef<number>(subjectLevel);
  const prevTotalSecondsRef = useRef<number>(totalStudySeconds);
  const prevSubjectIdRef = useRef<string>(activeSubject.id);

  useEffect(() => {
    if (prevSubjectIdRef.current !== activeSubject.id) {
      prevSubjectIdRef.current = activeSubject.id;
      prevSubjectLevelRef.current = subjectLevel;
      prevUnlockedCountRef.current = activeLevelUnlocked.length;
      setSelectedStructure(null);
      setNewlyUnlockedId(null);
      return;
    }

    if (subjectLevel !== prevSubjectLevelRef.current) {
      prevSubjectLevelRef.current = subjectLevel;
      prevUnlockedCountRef.current = activeLevelUnlocked.length;
      return;
    }

    if (activeLevelUnlocked.length > prevUnlockedCountRef.current) {
      const newest = activeLevelUnlocked[activeLevelUnlocked.length - 1];
      const cumulativeUnlock = (subjectLevel - 1) * LEVEL_DURATION_SECONDS + newest.unlockSeconds;
      setNewlyUnlockedId(newest.id);
      setSelectedStructure(newest);
      playBuildChime(account.soundEnabled);
      setMilestoneNotice({
        title: `Built: ${newest.name} (Level ${subjectLevel})`,
        detail: `${activeSubject.name} reached ${formatReadableDuration(cumulativeUnlock)} of focus.`,
      });
    }
    prevUnlockedCountRef.current = activeLevelUnlocked.length;
  }, [activeLevelUnlocked, subjectLevel, activeSubject.id, activeSubject.name, account.soundEnabled]);

  useEffect(() => {
    const prevTotal = prevTotalSecondsRef.current;
    if (totalStudySeconds > prevTotal) {
      const justUnlockedTheme = ENVIRONMENT_THEMES.find(
        (t) => t.unlockSeconds > prevTotal && t.unlockSeconds <= totalStudySeconds
      );
      if (justUnlockedTheme) {
        playLevelUnlockChime(account.soundEnabled);
        setMilestoneNotice({
          title: `Environment Level ${justUnlockedTheme.level} Unlocked: ${justUnlockedTheme.name}`,
          detail: justUnlockedTheme.subtitle,
          themeId: justUnlockedTheme.id,
        });
      }
    }
    prevTotalSecondsRef.current = totalStudySeconds;
  }, [totalStudySeconds, account.soundEnabled]);

  // Accurate timestamp-delta timer loop
  useEffect(() => {
    if (!isRunning) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const prev = lastTickRef.current ?? now;
      const deltaSeconds = Math.floor((now - prev) / 1000);
      if (deltaSeconds < 1) return;

      lastTickRef.current = prev + deltaSeconds * 1000;
      setSessionSeconds((s) => s + deltaSeconds);

      setAccount((curr) => ({
        ...curr,
        subjects: curr.subjects.map((sub) =>
          sub.id === curr.activeSubjectId
            ? {
                ...sub,
                totalSeconds: sub.totalSeconds + deltaSeconds,
                lastStudiedAt: new Date().toISOString(),
              }
            : sub
        ),
      }));
    }, 500);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const commitSessionRecord = (duration: number, subject: SubjectCity) => {
    if (duration <= 0) return;
    const endedAt = new Date().toISOString();
    const startedAt =
      sessionStartedAtRef.current ?? new Date(Date.now() - duration * 1000).toISOString();
    const entry: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subjectId: subject.id,
      subjectName: subject.name,
      durationSeconds: duration,
      startedAt,
      endedAt,
    };
    setAccount((curr) => ({
      ...curr,
      sessions: [entry, ...curr.sessions].slice(0, 50),
    }));
  };

  const handleStart = () => {
    if (!sessionStartedAtRef.current) {
      sessionStartedAtRef.current = new Date().toISOString();
    }
    playStartChime(account.soundEnabled);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStopAndSave = () => {
    setIsRunning(false);
    commitSessionRecord(sessionSeconds, activeSubject);
    playStopChime(account.soundEnabled);
    setSessionSeconds(0);
    sessionStartedAtRef.current = null;
  };

  const handleSelectSubject = (subjectId: string) => {
    if (subjectId === account.activeSubjectId) {
      setActiveTab('stage');
      return;
    }
    if (isRunning) {
      setIsRunning(false);
    }
    if (sessionSeconds > 0) {
      commitSessionRecord(sessionSeconds, activeSubject);
      setSessionSeconds(0);
      sessionStartedAtRef.current = null;
    }
    setAccount((curr) => ({
      ...curr,
      activeSubjectId: subjectId,
    }));
    setActiveTab('stage');
  };

  const handleCreateSubject = (name: string, style: SettlementStyle) => {
    const now = new Date().toISOString();
    const newSub: SubjectCity = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      style,
      totalSeconds: 0,
      createdAt: now,
      lastStudiedAt: now,
    };
    if (isRunning) setIsRunning(false);
    if (sessionSeconds > 0) {
      commitSessionRecord(sessionSeconds, activeSubject);
      setSessionSeconds(0);
      sessionStartedAtRef.current = null;
    }
    setAccount((curr) => ({
      ...curr,
      activeSubjectId: newSub.id,
      subjects: [...curr.subjects, newSub],
    }));
    setActiveTab('stage');
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (account.subjects.length <= 1) return;
    setAccount((curr) => {
      const remaining = curr.subjects.filter((s) => s.id !== subjectId);
      const nextActive =
        curr.activeSubjectId === subjectId ? remaining[0].id : curr.activeSubjectId;
      return {
        ...curr,
        activeSubjectId: nextActive,
        subjects: remaining,
      };
    });
  };

  const handleChangeActiveStyle = (style: SettlementStyle) => {
    setSelectedStructure(null);
    setAccount((curr) => ({
      ...curr,
      subjects: curr.subjects.map((sub) =>
        sub.id === curr.activeSubjectId ? { ...sub, style } : sub
      ),
    }));
  };

  const handleSelectEnvironment = (envId: EnvironmentId) => {
    setAccount((curr) => ({
      ...curr,
      selectedEnvironmentId: envId,
    }));
  };

  const handleToggleSound = () => {
    setAccount((curr) => ({
      ...curr,
      soundEnabled: !curr.soundEnabled,
    }));
  };

  const handleSwitchAccount = (target: UserAccount) => {
    if (isRunning) setIsRunning(false);
    if (sessionSeconds > 0) {
      commitSessionRecord(sessionSeconds, activeSubject);
      setSessionSeconds(0);
      sessionStartedAtRef.current = null;
    }
    setActiveAccountId(target.id);
    setAccount(target);
    setSelectedStructure(null);
    setMilestoneNotice(null);
  };

  const handleCreateAccount = (username: string, pin?: string) => {
    if (isRunning) setIsRunning(false);
    setSessionSeconds(0);
    sessionStartedAtRef.current = null;
    const created = createAccount(username, pin);
    setAccount(created);
    setAllAccounts(loadAllAccounts());
    setSelectedStructure(null);
    setMilestoneNotice(null);
  };

  const handleImportAccount = (imported: UserAccount) => {
    if (isRunning) setIsRunning(false);
    setSessionSeconds(0);
    sessionStartedAtRef.current = null;
    upsertAccount(imported);
    setActiveAccountId(imported.id);
    setAccount(imported);
    setAllAccounts(loadAllAccounts());
    setSelectedStructure(null);
    setMilestoneNotice(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('stage')}
            className="shrink-0 whitespace-nowrap font-display text-xl font-bold tracking-tight text-slate-900"
          >
            Loci
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="flex items-center gap-6 overflow-x-auto text-sm font-medium">
            {(
              [
                { id: 'stage', label: 'City Stage' },
                { id: 'subjects', label: 'Subjects' },
                { id: 'environments', label: 'Environments' },
                { id: 'github', label: 'GitHub Guide' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-1 transition-colors ${
                    active
                      ? 'border-teal-700 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary account action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="whitespace-nowrap shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {account.username}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === 'stage' && (
          <div className="space-y-8">
            {/* Milestone Unlock Notification (appears only on live unlock) */}
            {milestoneNotice && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-teal-50/70 px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-teal-950">{milestoneNotice.title}</p>
                  <p className="text-xs text-teal-800">{milestoneNotice.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  {milestoneNotice.themeId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectEnvironment(milestoneNotice.themeId!);
                        setMilestoneNotice(null);
                      }}
                      className="whitespace-nowrap rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Apply Theme
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMilestoneNotice(null)}
                    className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Primary Stage Split: Left Isometric Diorama + Right Timer Controls */}
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-8">
                <IsometricWorld
                  theme={activeTheme}
                  style={activeSubject.style}
                  allBlueprints={allBlueprints}
                  unlockedIds={unlockedIds}
                  selectedStructureId={selectedStructure?.id ?? null}
                  onSelectStructure={setSelectedStructure}
                  isRunning={isRunning}
                  newlyUnlockedId={newlyUnlockedId}
                />

                {/* Quiet Stage Bar: Inspector or Settlement Style Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                  {selectedStructure ? (
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{selectedStructure.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Unlocked at {formatReadableDuration(selectedStructure.unlockSeconds)}
                          </span>
                        </div>
                        <p className="mt-0.5 font-display text-base font-semibold text-slate-900">
                          {selectedStructure.name}
                        </p>
                        <p className="text-xs text-slate-600">{selectedStructure.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStructure(null)}
                        className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Clear Selection
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">
                          Total Focus: {formatReadableDuration(totalStudySeconds)}
                        </span>
                        <span className="mx-2 text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span>Level {viewingLevel} ({unlockedStructures.length}/16 built)</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {subjectLevel > 1 && (
                          <div
                            className="inline-flex rounded-lg bg-slate-100 p-1"
                            role="group"
                            aria-label="Inspect level"
                          >
                            {Array.from({ length: subjectLevel }, (_, idx) => idx + 1).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  setViewingLevel(lvl);
                                  setSelectedStructure(null);
                                }}
                                className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                  viewingLevel === lvl
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Lvl {lvl}
                              </button>
                            ))}
                          </div>
                        )}

                        <div
                          className="inline-flex rounded-lg bg-slate-100 p-1"
                          role="group"
                          aria-label="Settlement archetype"
                        >
                          {(
                            [
                              { id: 'city', label: 'City' },
                              { id: 'village', label: 'Village' },
                              { id: 'park', label: 'Park' },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleChangeActiveStyle(opt.id)}
                              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                activeSubject.style === opt.id
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex lg:col-span-4">
                <div className="flex w-full">
                  <div className="w-full">
                    <TimerControls
                      subject={activeSubject}
                      theme={activeTheme}
                      isRunning={isRunning}
                      sessionSeconds={sessionSeconds}
                      timerMode={timerMode}
                      onChangeMode={setTimerMode}
                      onStart={handleStart}
                      onPause={handlePause}
                      onStopAndSave={handleStopAndSave}
                      soundEnabled={account.soundEnabled}
                      onToggleSound={handleToggleSound}
                      subjectLevel={subjectLevel}
                      secondsInLevel={secondsInLevel}
                      unlockedCount={activeLevelUnlocked.length}
                      totalStructures={allBlueprints.length}
                      nextStructure={nextStructure}
                      prevUnlockSeconds={prevUnlockSeconds}
                      onOpenSubjects={() => setActiveTab('subjects')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Landmarks Roadmap Strip */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {activeSubject.name} · Level {viewingLevel} Blueprints
                  </h3>
                  <p className="text-xs text-slate-500">
                    Each 12-hour level constructs 16 landmarks (1 new structure every 45 minutes of focus).
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {unlockedStructures.length} of {allBlueprints.length} built
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {allBlueprints.map((bp) => {
                  const built = unlockedIds.has(bp.id);
                  const isSelected = selectedStructure?.id === bp.id;
                  const cumulativeSeconds =
                    (viewingLevel - 1) * LEVEL_DURATION_SECONDS + bp.unlockSeconds;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      disabled={!built}
                      onClick={() => setSelectedStructure(isSelected ? null : bp)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/60'
                          : built
                            ? 'border-slate-200 bg-white hover:border-slate-300'
                            : 'cursor-default border-slate-100 bg-slate-50 opacity-70'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {String(bp.index).padStart(2, '0')} · {formatReadableDuration(cumulativeSeconds)}
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs font-semibold text-slate-900">
                        {bp.name}
                      </span>
                      <span
                        className={`mt-auto pt-2 text-[11px] font-medium ${
                          built ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      >
                        {built ? 'Built' : 'Locked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'subjects' && (
          <SubjectsPanel
            subjects={account.subjects}
            activeSubjectId={activeSubject.id}
            sessions={account.sessions}
            isTimerRunning={isRunning}
            onSelectSubject={handleSelectSubject}
            onCreateSubject={handleCreateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeTab === 'environments' && (
          <EnvironmentsPanel
            totalStudySeconds={totalStudySeconds}
            selectedEnvironmentId={activeTheme.id}
            onSelectEnvironment={handleSelectEnvironment}
          />
        )}

        {activeTab === 'github' && <GitHubGuideView />}
      </main>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentAccount={account}
        allAccounts={allAccounts}
        onSwitchAccount={handleSwitchAccount}
        onCreateAccount={handleCreateAccount}
        onImportAccount={handleImportAccount}
      />
    </div>
  );
}
