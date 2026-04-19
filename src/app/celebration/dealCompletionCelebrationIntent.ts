import type {
  DealCompletionAnchorRect,
  DealCompletionCelebrationTier,
} from './dealCompletionCelebrationTypes';

export type { DealCompletionAnchorRect, DealCompletionCelebrationTier };

export type DealCompletionCelebrationIntent = {
  tier: DealCompletionCelebrationTier;
  anchorRect: DealCompletionAnchorRect | null;
};

let pending: DealCompletionCelebrationIntent | null = null;

/**
 * Call synchronously before persisting a task toggle that will close the deal.
 * Consumed by {@link useDealCompletionCelebration} on the closed transition.
 */
export function primeDealCompletionCelebration(
  tier: DealCompletionCelebrationTier,
  anchorRect?: DOMRect | null,
): void {
  pending = {
    tier,
    anchorRect: anchorRect
      ? {
          left: anchorRect.left,
          top: anchorRect.top,
          width: anchorRect.width,
          height: anchorRect.height,
        }
      : null,
  };
}

export function consumeDealCompletionCelebrationIntent(): DealCompletionCelebrationIntent | null {
  const next = pending;
  pending = null;
  return next;
}
