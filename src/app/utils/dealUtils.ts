import { Deal, Task, TaskStatus, DealStatus } from '../types';

/**
 * Calculate progress percentage based on completed tasks
 */
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'complete').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

/**
 * Determine task status based on due date and current status
 * At Risk = due within 48 hours and incomplete
 * Overdue = past due date
 */
export function determineTaskStatus(task: Task): TaskStatus {
  if (task.status === 'complete') return 'complete';

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return 'overdue';
  if (hoursUntilDue <= 48) return 'at-risk';
  if (hoursUntilDue <= 168) return 'active'; // within 7 days
  return 'upcoming';
}

/**
 * Count at-risk items for a deal
 */
export function countAtRiskItems(tasks: Task[]): number {
  return tasks.filter(t => t.status === 'at-risk' || t.status === 'overdue').length;
}

/**
 * Determine overall deal status based on tasks
 */
export function determineDealStatus(tasks: Task[]): DealStatus {
  const hasOverdue = tasks.some(t => t.status === 'overdue');
  const hasAtRisk = tasks.some(t => t.status === 'at-risk');
  const allComplete = tasks.every(t => t.status === 'complete');

  if (allComplete) return 'complete';
  if (hasOverdue) return 'overdue';
  if (hasAtRisk) return 'at-risk';
  return 'active';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format relative date (e.g., "in 3 days", "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}
