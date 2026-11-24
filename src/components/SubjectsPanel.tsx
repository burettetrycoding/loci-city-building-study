import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import {
  formatReadableDuration,
  getBlueprintsForStyle,
  getSubjectLevelNumber,
  getUnlockedStructures,
} from '../data/worldData';
import { SettlementStyle, StudySession, SubjectCity } from '../types/loci';

interface SubjectsPanelProps {
  subjects: SubjectCity[];
  activeSubjectId: string;
  sessions: StudySession[];
  isTimerRunning: boolean;
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject: (name: string, style: SettlementStyle) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const STYLE_OPTIONS: Array<{
  id: SettlementStyle;
  label: string;
  description: string;
}> = [
  {
    id: 'city',
    label: 'Civic City',
    description: 'Libraries, cafés, clocktowers, and stone plazas',
  },
  {
    id: 'village',
    label: 'Cozy Village',
    description: 'Timber cottages, windmills, bakeries, and stone wells',
  },
  {
    id: 'park',
    label: 'Botanical Park',
    description: 'Koi ponds, cedar groves, gazebos, and conservatories',
  },
];

export const SubjectsPanel: React.FC<SubjectsPanelProps> = ({
  subjects,
  activeSubjectId,
  sessions,
  isTimerRunning,
  onSelectSubject,
  onCreateSubject,
  onDeleteSubject,
}) => {
  const [name, setName] = useState('');
  const [style, setStyle] = useState<SettlementStyle>('city');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a subject name first.');
      return;
    }
    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That subject already exists.');
      return;
    }
    onCreateSubject(trimmed, style);
    setName('');
    setError('');
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Subject Cities List */}
      <div className="space-y-6 lg:col-span-7">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            Your Study Subjects
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Each subject grows its own persistent settlement. Select a subject to load and build its world.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subjects.map((sub) => {
            const isActive = sub.id === activeSubjectId;
            const totalBlueprints = getBlueprintsForStyle(sub.style).length;
            const subLevel = getSubjectLevelNumber(sub.totalSeconds);
            const builtCount = getUnlockedStructures(sub.style, sub.totalSeconds, subLevel).length;
            const styleTitle =
              sub.style === 'city'
                ? 'Civic City'
                : sub.style === 'village'
                  ? 'Cozy Village'
                  : 'Botanical Park';

            return (
              <div
                key={sub.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-colors ${
                  isActive
                    ? 'border-teal-700 bg-teal-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{styleTitle} · Level {subLevel}</span>
                    <span className="font-mono tabular-nums">
                      {builtCount}/{totalBlueprints} built
                    </span>
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-semibold text-slate-900">
                    {sub.name}
                  </h3>

                  <p className="mt-1 font-mono text-sm text-slate-600 tabular-nums">
                    {formatReadableDuration(sub.totalSeconds)} studied
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectSubject(sub.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isActive && <Check className="h-3.5 w-3.5" />}
                    <span>{isActive ? 'Active City' : 'Study This Subject'}</span>
                  </button>

                  {subjects.length > 1 && (
                    <button
                      type="button"
                      disabled={isActive && isTimerRunning}
                      onClick={() => onDeleteSubject(sub.id)}
                      title={
                        isActive && isTimerRunning
                          ? 'Pause the timer before removing the active subject'
                          : `Delete ${sub.name}`
                      }
                      aria-label={`Delete ${sub.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Sessions Log */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            Recent Focus Sessions
          </h3>
          {sessions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No completed sessions logged yet. Start the timer on the City Stage to record your first study block.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {sessions.slice(0, 6).map((sess) => (
                <div
                  key={sess.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">{sess.subjectName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(sess.endedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-medium text-teal-700 tabular-nums">
                    +{formatReadableDuration(sess.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Subject Form */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <h3 className="font-display text-xl font-semibold text-slate-900">
            Add New Subject City
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Pick a subject and choose what kind of world your study hours will build.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="subject-name-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Subject Name
              </label>
              <input
                id="subject-name-input"
                type="text"
                maxLength={40}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Organic Chemistry, Economics, Spanish"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">
                Settlement Archetype
              </span>
              <div className="mt-2 space-y-2.5">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                      style === opt.id
                        ? 'border-teal-700 bg-teal-50/50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                      {style === opt.id && (
                        <span className="text-xs font-medium text-teal-700">Selected</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Subject World</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
