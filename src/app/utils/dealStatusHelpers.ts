import { Task, User } from '../types';
import { countTasksDueSoon } from './taskDueSoon';

/**
 * Count of incomplete tasks whose due date falls in the 3–7 day “due soon” window.
 * Delegates to `taskDueSoon` so the definition stays aligned with the Next Action engine.
 */
export function getTasksDueSoon(tasks: Task[]): number {
  return countTasksDueSoon(tasks);
}

/**
 * Get the assignee who has the most urgent incomplete task
 */
export function getWaitingOnAssignee(tasks: Task[], users: User[]): User | null {
  // Filter incomplete tasks with assignees
  const incompleteTasks = tasks.filter(
    (task) => task.status !== 'complete' && task.assigneeId
  );

  if (incompleteTasks.length === 0) return null;

  // Sort by due date (earliest first)
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Get the assignee of the most urgent task
  const mostUrgentTask = sortedTasks[0];
  return users.find((u) => u.id === mostUrgentTask.assigneeId) || null;
}

/** Who “waiting on” reflects — most urgent incomplete task overall (includes unassigned). */
export type WaitingOnResolution =
  | { kind: 'assigned'; user: User }
  | { kind: 'unassigned' }
  | { kind: 'unknownAssignee'; assigneeId: string };

export function resolveWaitingOn(tasks: Task[], users: User[]): WaitingOnResolution | null {
  const incompleteTasks = tasks.filter((task) => task.status !== 'complete');
  if (incompleteTasks.length === 0) return null;

  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const mostUrgentTask = sortedTasks[0];
  const id = mostUrgentTask.assigneeId?.trim();
  if (!id) return { kind: 'unassigned' };

  const user = users.find((u) => u.id === id);
  if (!user) return { kind: 'unknownAssignee', assigneeId: id };
  return { kind: 'assigned', user };
}
