import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
type OnboardingPhase = 'idle' | 'claiming' | 'ineligible' | 'settled';

export type MembershipBlockKind = 'roster' | 'no_workspace' | 'unknown';

/**
 * After login, automatically runs `claimWorkspaceMembership` once when the user has no membership
 * but the workspace snapshot is blocked for that reason. Surfaces UI phases for loading overlay
 * vs full “no roster match” gate.
 */
export function useWorkspaceMembershipOnboarding(enabled: boolean): {
  showClaimingOverlay: boolean;
  showNoAccessGate: boolean;
  /** When the gate is shown, why access failed (for copy / next steps). */
  membershipBlockKind: MembershipBlockKind;
  retry: () => void;
} {
  const session = useQuery(api.membership.workspaceSession, enabled ? {} : 'skip');
  const claim = useMutation(api.membership.claimWorkspaceMembership);
  const [phase, setPhase] = useState<OnboardingPhase>('idle');
  const [membershipBlockKind, setMembershipBlockKind] = useState<MembershipBlockKind>('roster');
  const [retryTick, setRetryTick] = useState(0);
  const attemptedForClaimCycle = useRef(false);

  /** After a prior `ok` session, `phase` can still be `settled` while the next sign-in is `needs_membership` — reset so we show the linking overlay and run claim again. */
  useEffect(() => {
    if (session?.status !== 'needs_membership') return;
    setPhase((p) => {
      if (p === 'settled') {
        attemptedForClaimCycle.current = false;
        return 'idle';
      }
      return p;
    });
  }, [session?.status]);

  const needsAutoClaim =
    enabled &&
    session !== undefined &&
    session.status === 'needs_membership';

  useEffect(() => {
    if (!needsAutoClaim) {
      if (session?.status === 'ok') {
        attemptedForClaimCycle.current = false;
        setPhase('settled');
      }
      return;
    }

    if (attemptedForClaimCycle.current) {
      return;
    }
    attemptedForClaimCycle.current = true;
    setPhase('claiming');

    void claim({})
      .then((r) => {
        if (r.outcome === 'no_roster_match') {
          setMembershipBlockKind('roster');
          setPhase('ineligible');
        } else if (r.outcome === 'no_workspace') {
          setMembershipBlockKind('no_workspace');
          setPhase('ineligible');
        } else {
          setPhase('settled');
        }
      })
      .catch(() => {
        setMembershipBlockKind('unknown');
        setPhase('ineligible');
      });
  }, [needsAutoClaim, session?.status, claim, retryTick]);

  const retry = () => {
    attemptedForClaimCycle.current = false;
    setPhase('idle');
    setMembershipBlockKind('roster');
    setRetryTick((n) => n + 1);
  };

  /** Keep the main shell hidden until claim finishes — avoids a one-frame render with empty roster / blank UI. */
  const showClaimingOverlay =
    enabled && needsAutoClaim && phase !== 'ineligible' && phase !== 'settled';

  const showNoAccessGate =
    enabled &&
    needsAutoClaim &&
    phase === 'ineligible';

  return { showClaimingOverlay, showNoAccessGate, membershipBlockKind, retry };
}
