import { useEffect, useMemo, useRef, useState } from 'react';
import type { Deal, Task } from '../types';
import { isDealWorkflowClosed } from '../utils/isDealWorkflowClosed';
import { runDealCompletionCelebration } from '../celebration/runDealCompletionCelebration';
import { consumeDealCompletionCelebrationIntent } from '../celebration/dealCompletionCelebrationIntent';
import type { DealCompletionCelebrationTier } from '../celebration/dealCompletionCelebrationTypes';
import { toast } from 'sonner';

const TOAST_TITLE = 'Deal closed';
const TOAST_DESCRIPTION = 'Nice work — this transaction is complete.';

const PULSE_MS = 1250;

const CELEBRATION_SESSION_PREFIX = 'tq_deal_close_celebrated:';

function sessionCelebrationKey(dealId: string): string {
  return `${CELEBRATION_SESSION_PREFIX}${dealId}`;
}

/**
 * Fires a one-time celebration when this deal crosses into “closed” while on the detail screen.
 * Skips initial mount for already-closed deals; skips archived deals.
 * Uses sessionStorage so revisiting or refreshing on a completed deal doesn’t replay the burst.
 */
export function useDealCompletionCelebration(dealId: string, deal: Deal, tasks: Task[]) {
  const isClosed = useMemo(
    () => isDealWorkflowClosed(deal, tasks),
    [deal.id, deal.status, tasks],
  );

  const prevClosedRef = useRef<boolean | null>(null);
  const dealIdRef = useRef(dealId);
  const [dealSummaryCompletionPulse, setDealSummaryCompletionPulse] = useState(false);

  useEffect(() => {
    if (dealIdRef.current !== dealId) {
      dealIdRef.current = dealId;
      prevClosedRef.current = null;
    }

    if (deal.archived) {
      prevClosedRef.current = isClosed;
      return;
    }

    if (prevClosedRef.current === null) {
      prevClosedRef.current = isClosed;
      return;
    }

    if (prevClosedRef.current && !isClosed) {
      sessionStorage.removeItem(sessionCelebrationKey(dealId));
    }

    if (!prevClosedRef.current && isClosed) {
      const alreadyCelebrated = sessionStorage.getItem(sessionCelebrationKey(dealId)) === '1';

      if (alreadyCelebrated) {
        consumeDealCompletionCelebrationIntent();
      } else {
        sessionStorage.setItem(sessionCelebrationKey(dealId), '1');

        const intent = consumeDealCompletionCelebrationIntent();
        const tier: DealCompletionCelebrationTier = intent?.tier ?? 'task_list';
        const anchorRect = intent?.anchorRect ?? null;

        runDealCompletionCelebration({ tier, anchorRect });

        toast.success(TOAST_TITLE, {
          description: TOAST_DESCRIPTION,
          duration: 4200,
        });

        setDealSummaryCompletionPulse(true);
        const t = window.setTimeout(() => setDealSummaryCompletionPulse(false), PULSE_MS);
        prevClosedRef.current = isClosed;
        return () => window.clearTimeout(t);
      }
    }

    prevClosedRef.current = isClosed;
  }, [dealId, deal.archived, isClosed]);

  return { dealSummaryCompletionPulse };
}
