import { Task, User, DocumentItem } from '../types';
import { ActionPriority } from '../components/shared/NextActionCard';
import { getDocumentNextAction, NextAction as DocumentNextAction } from './documentNextAction';

export interface TaskNextAction {
  task: Task;
  priority: ActionPriority;
  warningMessage?: string;
}

export interface CombinedNextAction {
  type: 'task' | 'document';
  id: string;
  primaryText: string;
  secondaryText?: string;
  dueDate?: string;
  priority: ActionPriority;
  warningMessage?: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

/**
 * Determine the next most important task action for a deal
 */
export function getTaskNextAction(tasks: Task[]): TaskNextAction | null {
  // Filter incomplete tasks
  const incompleteTasks = tasks.filter((task) => task.status !== 'complete');

  if (incompleteTasks.length === 0) return null;

  // Sort by urgency: overdue > at-risk > active > upcoming
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    const statusOrder = {
      'overdue': 0,
      'at-risk': 1,
      'active': 2,
      'upcoming': 3,
    };

    const aOrder = statusOrder[a.status] ?? 999;
    const bOrder = statusOrder[b.status] ?? 999;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // If same status, sort by due date (earliest first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const nextTask = sortedTasks[0];

  // Determine priority and warning message
  let priority: ActionPriority = 'on-track';
  let warningMessage: string | undefined;

  if (nextTask.status === 'overdue') {
    priority = 'overdue';
    warningMessage = 'This task is overdue and may delay closing';
  } else if (nextTask.status === 'at-risk') {
    priority = 'at-risk';
    warningMessage = 'This task is due soon';
  }

  return {
    task: nextTask,
    priority,
    warningMessage,
  };
}

/**
 * Get combined next action from both tasks and documents
 */
export function getCombinedNextAction(
  tasks: Task[],
  documents: DocumentItem[],
  closingDate: string
): CombinedNextAction | null {
  const taskAction = getTaskNextAction(tasks);
  const documentAction = getDocumentNextAction(documents, closingDate);

  // No actions at all
  if (!taskAction && !documentAction) return null;

  // Convert task action to combined format
  const taskCombined: CombinedNextAction | null = taskAction
    ? {
        type: 'task' as const,
        id: taskAction.task.id,
        primaryText: taskAction.task.name,
        dueDate: taskAction.task.dueDate,
        priority: taskAction.priority,
        warningMessage: taskAction.warningMessage,
        primaryButtonText: 'Mark Complete',
        secondaryButtonText: 'View Task',
      }
    : null;

  // Convert document action to combined format
  const docCombined: CombinedNextAction | null = documentAction
    ? {
        type: 'document' as const,
        id: documentAction.id,
        primaryText: documentAction.primaryText,
        secondaryText: documentAction.secondaryText,
        dueDate: documentAction.dueDate,
        priority: documentAction.priority,
        warningMessage: documentAction.warningText,
        primaryButtonText: documentAction.ctaPrimary,
        secondaryButtonText: documentAction.ctaSecondary,
      }
    : null;

  // Only one type of action
  if (!docCombined) return taskCombined;
  if (!taskCombined) return docCombined;

  // Both exist - prioritize by urgency
  const priorityOrder = { 'overdue': 3, 'at-risk': 2, 'on-track': 1 };

  const docPriority = priorityOrder[docCombined.priority];
  const taskPriority = priorityOrder[taskCombined.priority];

  return docPriority >= taskPriority ? docCombined : taskCombined;
}
