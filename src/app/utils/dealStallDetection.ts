import type { Deal, DocumentItem, Message, Task } from '../types';
import { isDocumentInSignatureWorkflow } from './documentHelpers';

const MS_DAY = 86400000;

/** Used in product copy; aligns with first message-idle tier. */
export const STALL_MESSAGE_IDLE_DAYS = 5;
const STALL_MESSAGE_IDLE_STRONG_DAYS = 7;
const STALL_ACTIVITY_FOLLOW_UP_DAYS = 4;
const STALL_CLOSING_WINDOW_DAYS = 14;

export type StallLevel = 'none' | 'watch' | 'stalled';

export type StallDetection = {
  isStalled: boolean;
  level: StallLevel;
  score: number;
  reasons: string[];
  daysSinceActivity?: number;
};

/** Latest activity: most recent deal message, or deal creation if there are no messages. */
export function dealActivityAnchorMs(deal: Deal, messages: Message[]): number {
  const forDeal = messages.filter((m) => m.dealId === deal.id);
  if (forDeal.length === 0) return new Date(deal.createdAt).getTime();
  return Math.max(...forDeal.map((m) => new Date(m.createdAt).getTime()));
}

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function incompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'complete');
}

function isIncompleteDoc(d: DocumentItem): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

/**
 * Waiting-style checklist work: signature pipeline, requested/uploaded docs, or tasks not yet in motion.
 */
function hasWaitingDependency(documents: DocumentItem[], openTasks: Task[]): boolean {
  const waitingDoc = documents.some(
    (d) =>
      isIncompleteDoc(d) &&
      (isDocumentInSignatureWorkflow(d) || d.status === 'requested' || d.status === 'uploaded'),
  );
  const waitingTask = openTasks.some((t) => t.status === 'upcoming' || t.status === 'active');
  return waitingDoc || waitingTask;
}

function pushReason(reasons: string[], seen: Set<string>, text: string): void {
  if (seen.has(text)) return;
  seen.add(text);
  reasons.push(text);
}

/**
 * Rules-first stall model: additive score with human-readable reasons.
 * Thresholds: 0–1 none, 2 watch, 3+ stalled (`isStalled` is true only when level is stalled).
 */
export function detectDealStall(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): StallDetection {
  if (deal.archived || deal.status === 'complete') {
    return { isStalled: false, level: 'none', score: 0, reasons: [] };
  }

  const now = Date.now();
  const anchor = dealActivityAnchorMs(deal, messages);
  const daysSinceActivity = Math.floor((now - anchor) / MS_DAY);

  let score = 0;
  const reasons: string[] = [];
  const seen = new Set<string>();

  if (daysSinceActivity >= STALL_MESSAGE_IDLE_STRONG_DAYS) {
    score += 2;
    pushReason(reasons, seen, `No deal messages or updates in ${STALL_MESSAGE_IDLE_STRONG_DAYS}+ days`);
  } else if (daysSinceActivity >= STALL_MESSAGE_IDLE_DAYS) {
    score += 1;
    pushReason(reasons, seen, `No deal messages or updates in ${STALL_MESSAGE_IDLE_DAYS}+ days`);
  }

  const openTasks = incompleteTasks(tasks);
  if (openTasks.length > 0 && daysSinceActivity >= STALL_ACTIVITY_FOLLOW_UP_DAYS) {
    score += 1;
    pushReason(reasons, seen, 'Open tasks with no recent deal activity');
  }

  if (openTasks.some((t) => t.status === 'overdue')) {
    score += 1;
    pushReason(reasons, seen, 'Overdue open task');
  }

  const untilClose = daysUntilClosing(deal.closingDate);
  if (untilClose >= 0 && untilClose <= STALL_CLOSING_WINDOW_DAYS && daysSinceActivity >= STALL_MESSAGE_IDLE_DAYS) {
    score += 2;
    pushReason(reasons, seen, 'Closing within two weeks with quiet deal activity');
  }

  if (hasWaitingDependency(documents, openTasks) && daysSinceActivity >= STALL_ACTIVITY_FOLLOW_UP_DAYS) {
    score += 1;
    pushReason(reasons, seen, 'Pending signatures or dependencies with no recent follow-up');
  }

  let level: StallLevel;
  if (score >= 3) level = 'stalled';
  else if (score === 2) level = 'watch';
  else level = 'none';

  return {
    isStalled: level === 'stalled',
    level,
    score,
    reasons,
    daysSinceActivity,
  };
}

/** True when stall model says watch or stalled (surface “quiet deal” treatments). */
export function isDealStallElevated(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): boolean {
  return detectDealStall(deal, tasks, documents, messages).level !== 'none';
}
