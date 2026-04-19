import type { Task } from '../types';

/**
 * Single definition of “due soon” for tasks on Deal Detail:
 * incomplete tasks whose due datetime falls between (today + 3 calendar days)
 * and (today + 7 calendar days), inclusive window ends — same filter historically
 * used by the header row via `getTasksDueSoon`.
 *
 * Note: This intentionally excludes tasks due in the next 0–2 days (those are
 * surfaced elsewhere as at-risk / overdue via task status).
 */
export const TASK_DUE_SOON_MIN_OFFSET_DAYS = 3;
export const TASK_DUE_SOON_MAX_OFFSET_DAYS = 7;

/**
 * True if the task should count toward “due soon” metrics and rule 5 of the next-action engine.
 */
export function isTaskInDueSoonWindow(task: Task): boolean {
  if (task.status === 'complete') return false;

  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + TASK_DUE_SOON_MIN_OFFSET_DAYS);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + TASK_DUE_SOON_MAX_OFFSET_DAYS);

  const dueDate = new Date(task.dueDate);
  return dueDate >= threeDaysFromNow && dueDate <= sevenDaysFromNow;
}

/**
 * Count of incomplete tasks in the due-soon window (see `isTaskInDueSoonWindow`).
 */
export function countTasksDueSoon(tasks: Task[]): number {
  return tasks.filter(isTaskInDueSoonWindow).length;
}
