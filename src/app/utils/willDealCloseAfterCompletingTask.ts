import type { Deal, Task } from '../types';
import { isDealWorkflowClosed } from './isDealWorkflowClosed';

/**
 * UI-only prediction: would marking this task complete close the workflow?
 * Keeps celebration intent aligned with the actual close transition (no stale primes).
 */
export function willDealCloseAfterCompletingTask(taskId: string, deal: Deal, tasks: Task[]): boolean {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || task.status === 'complete') return false;

  const simulated = tasks.map((t) =>
    t.id === taskId ? { ...t, status: 'complete' as const } : t,
  );
  return isDealWorkflowClosed(deal, simulated);
}
