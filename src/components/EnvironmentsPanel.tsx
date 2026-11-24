import React from 'react';
import { Check, Lock } from 'lucide-react';
import {
  ENVIRONMENT_THEMES,
  formatReadableDuration,
  isEnvironmentUnlocked,
} from '../data/worldData';
import { EnvironmentId } from '../types/loci';

interface EnvironmentsPanelProps {
  totalStudySeconds: number;
  selectedEnvironmentId: EnvironmentId;
  onSelectEnvironment: (id: EnvironmentId) => void;
}

export const EnvironmentsPanel: React.FC<EnvironmentsPanelProps> = ({
  totalStudySeconds,
  selectedEnvironmentId,
  onSelectEnvironment,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Environment Levels &amp; Themes
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every 12 hours of total study time across all subjects unlocks a new atmospheric level.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Study Time</p>
          <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {formatReadableDuration(totalStudySeconds)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ENVIRONMENT_THEMES.map((theme) => {
          const unlocked = isEnvironmentUnlocked(theme, totalStudySeconds);
          const isSelected = theme.id === selectedEnvironmentId;
          const remaining = Math.max(0, theme.unlockSeconds - totalStudySeconds);

          return (
            <div
              key={theme.id}
              className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-slate-900 ${
                isSelected
                  ? 'border-teal-700 ring-1 ring-teal-700 dark:border-teal-500 dark:ring-teal-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Theme Palette Preview Banner */}
              <div
                className="relative h-28 w-full p-4"
                style={{
                  background: `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyBottom} 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      theme.isNight ? 'text-slate-100' : 'text-slate-800'
                    }`}
                  >
                    Level {theme.level}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.islandTop }}
                      title="Terrain"
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.roofPrimary }}
                      title="Rooftops"
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.waterColor }}
                      title="Water"
                    />
                  </div>
                </div>

                {/* Mini geometric horizon preview */}
                <div
                  className="absolute inset-x-0 bottom-0 h-8"
                  style={{ backgroundColor: theme.islandTop }}
                />
                <div
                  className="absolute bottom-4 left-6 h-8 w-8 rounded-sm shadow-xs"
                  style={{ backgroundColor: theme.wallLight }}
                />
                <div
                  className="absolute bottom-11 left-5 h-3 w-10 rounded-t-sm"
                  style={{ backgroundColor: theme.roofPrimary }}
                />
                <div
                  className="absolute bottom-6 right-8 h-9 w-9 rounded-full"
                  style={{ backgroundColor: theme.sunOrMoonColor }}
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {theme.unlockSeconds === 0
                        ? 'Starter Level'
                        : `Unlocks at ${formatReadableDuration(theme.unlockSeconds)}`}
                    </span>
                    {!unlocked && (
                      <span className="inline-flex items-center gap-1 font-mono text-amber-700 tabular-nums dark:text-amber-400">
                        <Lock className="h-3 w-3" />
                        <span>{formatReadableDuration(remaining)} left</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {theme.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{theme.subtitle}</p>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onSelectEnvironment(theme.id)}
                    className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : unlocked
                          ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                          : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-500'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Active Theme</span>
                      </>
                    ) : unlocked ? (
                      <span>Apply Theme</span>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Locked · Study More to Unlock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
