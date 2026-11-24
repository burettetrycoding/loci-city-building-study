import React, { useRef, useState } from 'react';
import { Download, LogIn, Moon, Sun, Upload, UserPlus, X } from 'lucide-react';
import { formatReadableDuration, getTotalStudySeconds } from '../data/worldData';
import { ColorMode, UserAccount } from '../types/loci';
import {
  exportAccountJson,
  parseImportedAccountJson,
  verifyAccountPin,
} from '../utils/storage';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: UserAccount;
  allAccounts: UserAccount[];
  colorMode: ColorMode;
  onChangeColorMode: (mode: ColorMode) => void;
  onSwitchAccount: (account: UserAccount) => void;
  onCreateAccount: (username: string, pin?: string) => void;
  onImportAccount: (account: UserAccount) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  allAccounts,
  colorMode,
  onChangeColorMode,
  onSwitchAccount,
  onCreateAccount,
  onImportAccount,
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinPromptForId, setPinPromptForId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setError('Please enter a username.');
      return;
    }
    if (allAccounts.some((a) => a.username.toLowerCase() === trimmed.toLowerCase())) {
      setError('An account with that username already exists on this browser.');
      return;
    }
    onCreateAccount(trimmed, newPin);
    setNewUsername('');
    setNewPin('');
    setError('');
    onClose();
  };

  const handleSelectAccount = (acct: UserAccount) => {
    if (acct.id === currentAccount.id) {
      onClose();
      return;
    }
    if (acct.pinHash) {
      setPinPromptForId(acct.id);
      setEnteredPin('');
      setError('');
      return;
    }
    onSwitchAccount(acct);
    onClose();
  };

  const handleVerifyPin = (e: React.FormEvent, acct: UserAccount) => {
    e.preventDefault();
    if (!verifyAccountPin(acct, enteredPin)) {
      setError('Incorrect PIN. Try again.');
      return;
    }
    setPinPromptForId(null);
    setEnteredPin('');
    setError('');
    onSwitchAccount(acct);
    onClose();
  };

  const handleDownloadBackup = () => {
    const json = exportAccountJson(currentAccount);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loci-${currentAccount.username.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-save.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Save file downloaded. You can import it anytime on any browser.');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedAccountJson(text);
      if (!parsed) {
        setError('Invalid Loci save file.');
        return;
      }
      onImportAccount(parsed);
      setError('');
      setStatusMessage(`Loaded save profile "${parsed.username}".`);
      onClose();
    } catch {
      setError('Could not read the selected file.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="account-modal-title" className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Scholar Accounts &amp; Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Your cities and timer progress save automatically. Log into an existing profile, switch themes, or export a backup file.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Appearance Preference */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Appearance</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose Light or Dark interface mode</p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onChangeColorMode('light')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                colorMode === 'light'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeColorMode('dark')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                colorMode === 'dark'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Saved Browser Accounts */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Profiles</h3>
          <div className="mt-2.5 space-y-2.5">
            {allAccounts.map((acct) => {
              const isCurrent = acct.id === currentAccount.id;
              const total = getTotalStudySeconds(acct.subjects);
              const askingPin = pinPromptForId === acct.id;

              return (
                <div
                  key={acct.id}
                  className={`rounded-xl border p-3.5 ${
                    isCurrent
                      ? 'border-teal-700 bg-teal-50/40 dark:border-teal-500 dark:bg-teal-950/30'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {acct.username}
                        {acct.pinHash ? ' · PIN protected' : ''}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {acct.subjects.length} subjects · {formatReadableDuration(total)} studied
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectAccount(acct)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                      }`}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>{isCurrent ? 'Signed In' : 'Log In'}</span>
                    </button>
                  </div>

                  {askingPin && (
                    <form
                      onSubmit={(e) => handleVerifyPin(e, acct)}
                      className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
                    >
                      <input
                        type="password"
                        value={enteredPin}
                        onChange={(e) => setEnteredPin(e.target.value)}
                        placeholder="Enter profile PIN"
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                      >
                        Unlock
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create New Profile */}
        <form onSubmit={handleCreate} className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create New Profile</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              maxLength={32}
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="Username (e.g. Alex)"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <input
              type="password"
              maxLength={16}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Optional PIN"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create &amp; Sign In</span>
          </button>
        </form>

        {/* Portable Save Backup */}
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Portable Save Backup</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Export your save file to back up your cities or log in on another device (ideal when hosting on GitHub Pages).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Save (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Save (.json)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {statusMessage && (
          <p className="mt-4 text-xs font-medium text-teal-700 dark:text-teal-400">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};
