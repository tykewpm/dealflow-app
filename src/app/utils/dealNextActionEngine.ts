import type { Deal, DocumentItem, Message, Task } from '../types';
import { detectDealStall } from './dealStallDetection';
import { isDocumentInSignatureWorkflow, isDocumentOverdue } from './documentHelpers';
import {
  TASK_DUE_SOON_MAX_OFFSET_DAYS,
  TASK_DUE_SOON_MIN_OFFSET_DAYS,
  isTaskInDueSoonWindow,
} from './taskDueSoon';

/**
 * Deal Next Action engine (rule-based, client-side only).
 *
 * REQUIRED ITEMS — current product assumption:
 * There is no `required` flag on Task or DocumentItem yet. Until the schema adds one,
 * “required” means every incomplete checklist item counts: tasks with status !== complete,
 * documents not in terminal status (signed/completed). Optional/future tasks should be
 * modeled explicitly when types support it.
 */

/** Days before closing when signature-related documents are treated as “near closing”. */
const NEAR_CLOSING_SIGNATURE_DAYS = 14;

/** Stable discriminator for callers that should not rely on title/subtitle copy. */
export type DealNextActionRuleKey =
  | 'overdue-document'
  | 'signature-near-closing'
  | 'overdue-task'
  | 'incomplete-document'
  | 'task-due-soon'
  | 'next-task'
  | 'deal-stall-reengage'
  | 'deal-stall-watch'
  | 'deal-on-track';

export type DealNextActionSourceType = 'task' | 'document' | 'deal';

export type DealNextActionSeverity = 'overdue' | 'at-risk' | 'on-track';

export interface DealNextActionCta {
  label: string;
}

export interface DealNextAction {
  /** Which rule produced this action — stable for reuse (titles/CTAs may stay English copy for now). */
  ruleKey: DealNextActionRuleKey;
  title: string;
  subtitle?: string;
  severity: DealNextActionSeverity;
  sourceType: DealNextActionSourceType;
  sourceId: string;
  primaryCta: DealNextActionCta;
  secondaryCta?: DealNextActionCta;
  /** Optional contextual line shown by NextActionCard */
  warningMessage?: string;
  /** Due date for relative display when relevant */
  dueDate?: string;
}

export interface DealNextActionSummary {
  overdueCount: number;
  dueSoonCount: number;
  awaitingSignatureCount: number;
}

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Incomplete documents — treated as “required” until an explicit required flag exists (see file comment). */
function isIncompleteDoc(d: DocumentItem): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

/** Incomplete tasks — treated as “required” until an explicit required flag exists (see file comment). */
function incompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'complete');
}

function sortDocsByDueDate(a: DocumentItem, b: DocumentItem): number {
  const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
  const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
  if (ad !== bd) return ad - bd;
  return a.name.localeCompare(b.name);
}

function sortTasksByDueDate(a: Task, b: Task): number {
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
}

/**
 * Aggregate counts for the deal (tasks + documents where applicable).
 */
export function computeDealNextActionSummary(
  tasks: Task[],
  documents: DocumentItem[],
): DealNextActionSummary {
  const incomplete = incompleteTasks(tasks);

  const overdueTasks = incomplete.filter((t) => t.status === 'overdue').length;
  const overdueDocs = documents.filter((d) => isIncompleteDoc(d) && isDocumentOverdue(d)).length;

  const dueSoonTasks = incomplete.filter((t) => isTaskInDueSoonWindow(t)).length;

  const awaitingSignatureCount = documents.filter((d) => isDocumentInSignatureWorkflow(d)).length;

  return {
    overdueCount: overdueTasks + overdueDocs,
    dueSoonCount: dueSoonTasks,
    awaitingSignatureCount,
  };
}

function onTrackFallback(deal: Deal): DealNextAction {
  return {
    ruleKey: 'deal-on-track',
    title: 'Deal is on track',
    subtitle: 'No urgent tasks or documents need attention right now.',
    severity: 'on-track',
    sourceType: 'deal',
    sourceId: deal.id,
    primaryCta: { label: 'View tasks' },
    secondaryCta: { label: 'View documents' },
  };
}

/**
 * Rule-based primary next action for a single deal using in-memory tasks and documents.
 */
export function computeDealNextAction(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[] = [],
): DealNextAction {
  const incompleteDocs = documents.filter(isIncompleteDoc).sort(sortDocsByDueDate);
  const incompleteTaskList = incompleteTasks(tasks).sort(sortTasksByDueDate);

  const untilClose = daysUntilClosing(deal.closingDate);

  // 1. Overdue required document
  const overdueDocs = incompleteDocs.filter((d) => isDocumentOverdue(d));
  if (overdueDocs.length > 0) {
    const doc = overdueDocs.sort(sortDocsByDueDate)[0];
    return {
      ruleKey: 'overdue-document',
      title: `${doc.name} is overdue`,
      subtitle: 'Required document past due date',
      severity: 'overdue',
      sourceType: 'document',
      sourceId: doc.id,
      primaryCta: { label: 'Open documents' },
      secondaryCta: { label: 'View tasks' },
      warningMessage: 'This may delay closing if not resolved.',
      dueDate: doc.dueDate,
    };
  }

  // 2. Required document awaiting signature near closing
  const sigNearClosing = incompleteDocs.filter(
    (d) =>
      isDocumentInSignatureWorkflow(d) &&
      untilClose <= NEAR_CLOSING_SIGNATURE_DAYS &&
      untilClose >= 0,
  );
  if (sigNearClosing.length > 0) {
    const doc = sigNearClosing.sort(sortDocsByDueDate)[0];
    return {
      ruleKey: 'signature-near-closing',
      title: `${doc.name} needs signature`,
      subtitle: `Closing in ${untilClose} ${untilClose === 1 ? 'day' : 'days'} — signatures outstanding`,
      severity: 'at-risk',
      sourceType: 'document',
      sourceId: doc.id,
      primaryCta: { label: 'Open documents' },
      secondaryCta: { label: 'View tasks' },
      warningMessage: 'Finalize signatures before closing.',
      dueDate: doc.dueDate,
    };
  }

  // 3. Overdue required task
  const overdueTasks = incompleteTaskList.filter((t) => t.status === 'overdue');
  if (overdueTasks.length > 0) {
    const task = overdueTasks.sort(sortTasksByDueDate)[0];
    return {
      ruleKey: 'overdue-task',
      title: task.name,
      subtitle: 'Required task is overdue',
      severity: 'overdue',
      sourceType: 'task',
      sourceId: task.id,
      primaryCta: { label: 'Mark complete' },
      secondaryCta: { label: 'Open documents' },
      warningMessage: 'Complete or reschedule to stay on track.',
      dueDate: task.dueDate,
    };
  }

  // 4. Missing / incomplete required document
  if (incompleteDocs.length > 0) {
    const doc = incompleteDocs[0];
    return {
      ruleKey: 'incomplete-document',
      title: `Finish ${doc.name}`,
      subtitle: 'Required document not complete',
      severity: 'at-risk',
      sourceType: 'document',
      sourceId: doc.id,
      primaryCta: { label: 'Open documents' },
      secondaryCta: { label: 'View tasks' },
      dueDate: doc.dueDate,
    };
  }

  // 5. Required task due soon
  const dueSoon = incompleteTaskList.filter((t) => isTaskInDueSoonWindow(t)).sort(sortTasksByDueDate);
  if (dueSoon.length > 0) {
    const task = dueSoon[0];
    return {
      ruleKey: 'task-due-soon',
      title: task.name,
      subtitle: `Due in ${TASK_DUE_SOON_MIN_OFFSET_DAYS}–${TASK_DUE_SOON_MAX_OFFSET_DAYS} days`,
      severity: 'at-risk',
      sourceType: 'task',
      sourceId: task.id,
      primaryCta: { label: 'Mark complete' },
      secondaryCta: { label: 'Open documents' },
      dueDate: task.dueDate,
    };
  }

  // 6. Earliest upcoming required task
  if (incompleteTaskList.length > 0) {
    const task = incompleteTaskList[0];
    return {
      ruleKey: 'next-task',
      title: task.name,
      subtitle: 'Next task on your timeline',
      severity: 'on-track',
      sourceType: 'task',
      sourceId: task.id,
      primaryCta: { label: 'Mark complete' },
      secondaryCta: { label: 'Open documents' },
      dueDate: task.dueDate,
    };
  }

  // 7. Quiet deal — rules-first stall model (no open checklist items surfaced above)
  const stall = detectDealStall(deal, tasks, documents, messages);
  if (stall.level === 'stalled') {
    const detail =
      stall.reasons.length > 0 ? stall.reasons.slice(0, 2).join(' · ') : 'Multiple quiet signals combined.';
    return {
      ruleKey: 'deal-stall-reengage',
      title: 'Re-engage the deal room',
      subtitle:
        stall.daysSinceActivity != null
          ? `Last activity ~${stall.daysSinceActivity}d ago — ${detail}`
          : detail,
      severity: 'at-risk',
      sourceType: 'deal',
      sourceId: deal.id,
      primaryCta: { label: 'Log an update' },
      secondaryCta: { label: 'View tasks' },
    };
  }
  if (stall.level === 'watch') {
    const tail = stall.reasons[0] ? ` ${stall.reasons[0]}` : '';
    return {
      ruleKey: 'deal-stall-watch',
      title: 'Touch base this week',
      subtitle:
        stall.daysSinceActivity != null
          ? `Activity is light (~${stall.daysSinceActivity}d since last message).${tail}`.trim()
          : (stall.reasons[0] ?? 'A few signals suggest catching up soon.'),
      severity: 'on-track',
      sourceType: 'deal',
      sourceId: deal.id,
      primaryCta: { label: 'Add update' },
      secondaryCta: { label: 'View tasks' },
    };
  }

  // 8. Fallback — on track
  return onTrackFallback(deal);
}
