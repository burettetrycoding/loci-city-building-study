import React from 'react';
import { Pause, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { formatClock, formatReadableDuration } from '../data/worldData';
import {
  EnvironmentTheme,
  StructureBlueprint,
  SubjectCity,
  TimerMode,
} from '../types/loci';

interface TimerControlsProps {
  subject: SubjectCity;
  theme: EnvironmentTheme;
  isRunning: boolean;
  sessionSeconds: number;
  timerMode: TimerMode;
  onChangeMode: (mode: TimerMode) => void;
  onStart: () => void;
  onPause: () => void;
  onStopAndSave: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  subjectLevel: number;
  secondsInLevel: number;
  unlockedCount: number;
  totalStructures: number;
  nextStructure: StructureBlueprint | null;
  prevUnlockSeconds: number;
  onOpenSubjects: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  subject,
  theme,
  isRunning,
  sessionSeconds,
  timerMode,
  onChangeMode,
  onStart,
  onPause,
  onStopAndSave,
  soundEnabled,
  onToggleSound,
  subjectLevel,
  secondsInLevel,
  unlockedCount,
  totalStructures,
  nextStructure,
  prevUnlockSeconds,
  onOpenSubjects,
}) => {
  const goalSeconds = timerMode === '25m' ? 25 * 60 : timerMode === '50m' ? 50 * 60 : null;
  const remainingGoal = goalSeconds ? Math.max(0, goalSeconds - sessionSeconds) : null;
  const displaySeconds =
    timerMode === 'free' ? sessionSeconds : remainingGoal !== null ? remainingGoal : sessionSeconds;

  const liveSubjectTotal = subject.totalSeconds;
  const nextRemaining = nextStructure
    ? Math.max(0, nextStructure.unlockSeconds - secondsInLevel)
    : 0;
  const progressPercent = nextStructure
    ? Math.min(
        100,
        Math.max(
          0,
          ((secondsInLevel - prevUnlockSeconds) /
            Math.max(1, nextStructure.unlockSeconds - prevUnlockSeconds)) *
            100
        )
      )
    : 100;

  const styleLabel =
    subject.style === 'city' ? 'Civic City' : subject.style === 'village' ? 'Cozy Village' : 'Botanical Park';

  return (
    <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        {/* Subject header & quiet metadata */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>{styleLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Level {theme.level}: {theme.name}</span>
            </div>
            <h2 className="mt-1 truncate font-display text-2xl font-semibold text-slate-900">
              {subject.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenSubjects}
            className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Switch Subject
          </button>
        </div>

        {/* Timer Mode Segmented Selector */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="inline-flex rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Focus timer mode"
          >
            {(
              [
                { id: 'free', label: 'Free Focus' },
                { id: '25m', label: '25m Goal' },
                { id: '50m', label: '50m Goal' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeMode(opt.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  timerMode === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound chimes' : 'Enable sound chimes'}
            title={soundEnabled ? 'Sound chimes on' : 'Sound chimes muted'}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        {/* Main Focus Clock */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
          <p className="text-xs font-medium text-slate-500">
            {isRunning
              ? 'Focusing now · Progress saves automatically'
              : sessionSeconds > 0
                ? 'Paused · Ready to resume or save'
                : timerMode === 'free'
                  ? 'Start and stop whenever you want'
                  : `${timerMode === '25m' ? '25-minute' : '50-minute'} target session`}
          </p>

          <div className="mt-2 font-mono text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {formatClock(displaySeconds)}
          </div>

          {timerMode !== 'free' && sessionSeconds > 0 && (
            <p className="mt-1.5 font-mono text-xs text-slate-500 tabular-nums">
              Elapsed this session: {formatClock(sessionSeconds)}
            </p>
          )}
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{sessionSeconds > 0 ? 'Resume Focus' : 'Start Focus'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Pause className="h-4 w-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {sessionSeconds > 0 && (
            <button
              type="button"
              onClick={onStopAndSave}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Finish Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Construction Progress & Subject Total */}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-slate-700">
            {nextStructure ? `Next: ${nextStructure.name}` : 'All landmarks built'}
          </span>
          <span className="font-mono text-slate-500 tabular-nums">
            {nextStructure ? `${formatReadableDuration(nextRemaining)} left` : '16 / 16 complete'}
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-700 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Subject Total</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
              {formatReadableDuration(liveSubjectTotal)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Level {subjectLevel} Built</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
              {unlockedCount} / {totalStructures}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
