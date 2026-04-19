import type { Deal, Task } from '../types';
import { determineDealStatus } from './dealUtils';

/**
 * Whether the deal reads as “closed” for UX: persisted status or all tasks complete
 * (same task-derived rule as {@link determineDealStatus}).
 */
export function isDealWorkflowClosed(deal: Deal, tasks: Task[]): boolean {
  if (deal.status === 'complete') return true;
  if (tasks.length === 0) return false;
  return determineDealStatus(tasks) === 'complete';
}
