import confetti from 'canvas-confetti';
import type { DealCompletionAnchorRect, DealCompletionCelebrationTier } from './dealCompletionCelebrationTypes';

export type { DealCompletionCelebrationTier };

const PALETTE = ['#4F8CFF', '#8B7CFF', '#31C48D', '#E5E7EB'] as const;

const CELEBRATION_Z_INDEX = 260;

function normalizeOrigin(
  anchor: DealCompletionAnchorRect | null | undefined,
  fallback: { x: number; y: number },
): { x: number; y: number } {
  if (typeof window === 'undefined') return fallback;
  if (!anchor || anchor.width <= 0 || anchor.height <= 0) return fallback;
  const cx = anchor.left + anchor.width / 2;
  const cy = anchor.top + anchor.height / 2;
  return {
    x: Math.min(1, Math.max(0, cx / window.innerWidth)),
    y: Math.min(1, Math.max(0, cy / window.innerHeight)),
  };
}

export interface RunDealCompletionCelebrationOptions {
  tier: DealCompletionCelebrationTier;
  /** Origin for explicit tier; task_list uses bottom-center when null */
  anchorRect?: DealCompletionAnchorRect | null;
}

/**
 * Short, restrained burst — premium palette, tiered intensity, safe z-index.
 * Respects prefers-reduced-motion via canvas-confetti.
 */
export function runDealCompletionCelebration(options: RunDealCompletionCelebrationOptions): void {
  if (typeof window === 'undefined') return;

  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const { tier, anchorRect } = options;

  const fallbackOrigin =
    tier === 'explicit'
      ? { x: 0.5, y: 0.92 }
      : { x: 0.5, y: 0.94 };

  const origin = normalizeOrigin(anchorRect ?? null, fallbackOrigin);

  const explicit = tier === 'explicit';

  const particleCount = narrow
    ? explicit
      ? 26
      : 16
    : explicit
      ? 48
      : 30;

  const ticks = narrow ? (explicit ? 72 : 52) : explicit ? 95 : 68;

  void confetti({
    particleCount,
    spread: explicit ? (narrow ? 58 : 64) : narrow ? 48 : 54,
    startVelocity: explicit ? (narrow ? 34 : 40) : narrow ? 28 : 34,
    ticks,
    gravity: 1.04,
    decay: 0.91,
    scalar: narrow ? 0.82 : 0.95,
    origin,
    angle: 90,
    zIndex: CELEBRATION_Z_INDEX,
    disableForReducedMotion: true,
    colors: [...PALETTE],
  });
}

/** @deprecated Use {@link runDealCompletionCelebration} */
export function runDealClosedConfetti(): void {
  runDealCompletionCelebration({ tier: 'task_list', anchorRect: null });
}
