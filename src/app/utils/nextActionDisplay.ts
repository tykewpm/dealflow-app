import type { DealNextActionSeverity } from './dealNextActionEngine';

/**
 * Accent color for compact next-action rows (tables, pipeline cards later).
 * Uses severity from the engine — not title strings.
 */
export function nextActionAccentDotClass(severity: DealNextActionSeverity): string {
  switch (severity) {
    case 'overdue':
      return 'bg-accent-red';
    case 'at-risk':
      return 'bg-accent-amber';
    case 'on-track':
      return 'bg-accent-green';
    default:
      return 'bg-accent-blue';
  }
}
