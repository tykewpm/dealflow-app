import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { User } from '../app/types';
import { shouldUseConvexWorkspaceReads } from '../app/dealDataSource';
import { useWorkspaceCurrentUser } from './useWorkspaceCurrentUser';

export type WorkspaceIdentityMode =
  | 'demo'
  | 'session'
  | 'session-fallback'
  /** Signed in but no `workspaceMemberships` row — do not use email-based roster impersonation. */
  | 'awaiting-membership';

/**
 * Convex: `workspaceSession.status === 'ok'` → roster id from membership (primary path).
 * `needs_membership` → locked identity (no acting-as picker; wait for claim / gate).
 * Otherwise optional email→roster fallback for legacy migration edge cases only.
 */
export function useWorkspaceIdentity(users: User[]): {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  /** Signed-in email from Convex Auth when available */
  sessionEmail: string | undefined;
  identityMode: WorkspaceIdentityMode;
  /** False when identity is pinned to roster (membership) — picker hidden */
  showRosterPicker: boolean;
} {
  const convexMode = shouldUseConvexWorkspaceReads();
  const profile = useQuery(api.viewer.loggedInProfile, convexMode ? {} : 'skip');
  const workspaceSession = useQuery(api.membership.workspaceSession, convexMode ? {} : 'skip');
  const demo = useWorkspaceCurrentUser(users);

  return useMemo(() => {
    if (!convexMode) {
      return {
        currentUserId: demo.currentUserId,
        setCurrentUserId: demo.setCurrentUserId,
        sessionEmail: undefined,
        identityMode: 'demo' as const,
        showRosterPicker: true,
      };
    }

    if (workspaceSession === undefined || profile === undefined) {
      return {
        currentUserId: demo.currentUserId,
        setCurrentUserId: demo.setCurrentUserId,
        sessionEmail: undefined,
        identityMode: 'session-fallback' as const,
        showRosterPicker: true,
      };
    }

    if (workspaceSession.status === 'ok') {
      const email =
        workspaceSession.email && workspaceSession.email.trim() !== ''
          ? workspaceSession.email.trim()
          : undefined;
      return {
        currentUserId: workspaceSession.rosterUserId,
        setCurrentUserId: demo.setCurrentUserId,
        sessionEmail: email,
        identityMode: 'session' as const,
        showRosterPicker: false,
      };
    }

    if (workspaceSession.status === 'needs_membership') {
      const email =
        workspaceSession.email && workspaceSession.email.trim() !== ''
          ? workspaceSession.email.trim()
          : undefined;
      return {
        currentUserId: demo.currentUserId,
        setCurrentUserId: demo.setCurrentUserId,
        sessionEmail: email,
        identityMode: 'awaiting-membership' as const,
        showRosterPicker: false,
      };
    }

    if (profile === null) {
      return {
        currentUserId: demo.currentUserId,
        setCurrentUserId: demo.setCurrentUserId,
        sessionEmail: undefined,
        identityMode: 'session-fallback' as const,
        showRosterPicker: true,
      };
    }

    const email =
      typeof profile.email === 'string' && profile.email.trim() !== ''
        ? profile.email.trim()
        : undefined;

    const match =
      email !== undefined
        ? users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        : undefined;

    const currentUserId =
      match?.id ?? (users.length > 0 ? users[0].id : demo.currentUserId);

    return {
      currentUserId,
      setCurrentUserId: demo.setCurrentUserId,
      sessionEmail: email,
      identityMode: match ? ('session' as const) : ('session-fallback' as const),
      showRosterPicker: !match,
    };
  }, [convexMode, demo, profile, users, workspaceSession]);
}
