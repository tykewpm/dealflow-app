import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '../app/types';

/** Persisted workspace identity (who you act as); not authentication. */
export const WORKSPACE_CURRENT_USER_STORAGE_KEY = 'transactq_currentUserId';

function readStoredId(): string | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_CURRENT_USER_STORAGE_KEY);
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    return trimmed !== '' ? trimmed : null;
  } catch {
    return null;
  }
}

function writeStoredId(id: string): void {
  try {
    localStorage.setItem(WORKSPACE_CURRENT_USER_STORAGE_KEY, id);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Tracks which roster user the session acts as (localStorage-backed).
 * When `users` changes or the stored id is missing from the roster, resets to the first roster user.
 */
export function useWorkspaceCurrentUser(users: User[]): {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
} {
  const [selectedId, setSelectedId] = useState<string>(() => readStoredId() ?? '');

  useEffect(() => {
    if (users.length === 0) return;
    if (!selectedId || !users.some((u) => u.id === selectedId)) {
      const next = users[0].id;
      setSelectedId(next);
      writeStoredId(next);
    }
  }, [users, selectedId]);

  const currentUserId = useMemo(() => {
    if (users.length === 0) return '';
    if (selectedId && users.some((u) => u.id === selectedId)) return selectedId;
    return users[0].id;
  }, [users, selectedId]);

  const setCurrentUserId = useCallback((id: string) => {
    setSelectedId(id);
    writeStoredId(id);
  }, []);

  return { currentUserId, setCurrentUserId };
}
