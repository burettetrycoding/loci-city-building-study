import { createStarterSubjects } from '../data/worldData';
import { UserAccount } from '../types/loci';

const ACCOUNTS_KEY = 'loci_accounts_v1';
const ACTIVE_ACCOUNT_ID_KEY = 'loci_active_account_id_v1';

export function hashPin(pin: string): string {
  // Simple deterministic client-side hash for optional local profile PINs
  let h = 2166136261;
  for (let i = 0; i < pin.length; i++) {
    h ^= pin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `pin_${(h >>> 0).toString(16)}`;
}

export function loadAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function getActiveAccountId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveAccountId(accountId: string | null): void {
  try {
    if (accountId) {
      localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, accountId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function createAccount(username: string, pin?: string): UserAccount {
  const subjects = createStarterSubjects();
  const cleanName = username.trim() || 'Scholar';
  const account: UserAccount = {
    id: `acct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username: cleanName,
    pinHash: pin && pin.trim().length > 0 ? hashPin(pin.trim()) : null,
    activeSubjectId: subjects[0].id,
    selectedEnvironmentId: 'meadow',
    soundEnabled: true,
    subjects,
    sessions: [],
    createdAt: new Date().toISOString(),
  };

  const accounts = loadAllAccounts();
  accounts.push(account);
  saveAllAccounts(accounts);
  setActiveAccountId(account.id);
  return account;
}

export function upsertAccount(updated: UserAccount): void {
  const accounts = loadAllAccounts();
  const idx = accounts.findIndex((a) => a.id === updated.id);
  if (idx >= 0) {
    accounts[idx] = updated;
  } else {
    accounts.push(updated);
  }
  saveAllAccounts(accounts);
}

export function ensureInitialAccount(): UserAccount {
  const accounts = loadAllAccounts();
  const activeId = getActiveAccountId();
  if (activeId) {
    const found = accounts.find((a) => a.id === activeId);
    if (found) return found;
  }
  if (accounts.length > 0) {
    setActiveAccountId(accounts[0].id);
    return accounts[0];
  }
  return createAccount('Scholar');
}

export function verifyAccountPin(account: UserAccount, pin: string): boolean {
  if (!account.pinHash) return true;
  return account.pinHash === hashPin(pin.trim());
}

export function exportAccountJson(account: UserAccount): string {
  return JSON.stringify(
    {
      format: 'loci-save-v1',
      exportedAt: new Date().toISOString(),
      account,
    },
    null,
    2
  );
}

export function parseImportedAccountJson(raw: string): UserAccount | null {
  try {
    const parsed = JSON.parse(raw);
    const candidate = parsed?.format === 'loci-save-v1' ? parsed.account : parsed;
    if (
      !candidate ||
      typeof candidate.username !== 'string' ||
      !Array.isArray(candidate.subjects) ||
      candidate.subjects.length === 0
    ) {
      return null;
    }
    const normalized: UserAccount = {
      id: `acct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      username: candidate.username.slice(0, 32),
      pinHash: typeof candidate.pinHash === 'string' ? candidate.pinHash : null,
      activeSubjectId:
        typeof candidate.activeSubjectId === 'string' &&
        candidate.subjects.some((s: { id: string }) => s.id === candidate.activeSubjectId)
          ? candidate.activeSubjectId
          : candidate.subjects[0].id,
      selectedEnvironmentId: candidate.selectedEnvironmentId || 'meadow',
      soundEnabled: typeof candidate.soundEnabled === 'boolean' ? candidate.soundEnabled : true,
      subjects: candidate.subjects,
      sessions: Array.isArray(candidate.sessions) ? candidate.sessions : [],
      createdAt: candidate.createdAt || new Date().toISOString(),
    };
    return normalized;
  } catch {
    return null;
  }
}
