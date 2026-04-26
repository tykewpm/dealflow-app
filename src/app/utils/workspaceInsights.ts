import type { Deal, DocumentItem, Message, Task } from '../types';
import { detectDealIssues } from './dealIssueDetection';
import { STALL_MESSAGE_IDLE_DAYS, isDealStallElevated } from './dealStallDetection';

/** Aligns with first idle tier in `detectDealStall` (copy + thresholds). */
export const WORKSPACE_STALL_IDLE_DAYS = STALL_MESSAGE_IDLE_DAYS;

export {
  STALL_MESSAGE_IDLE_DAYS,
  dealActivityAnchorMs,
  detectDealStall,
  isDealStallElevated,
} from './dealStallDetection';
export type { StallDetection, StallLevel } from './dealStallDetection';

/** Calendar-only “closing soon” window for workspace summaries (not health engine state). */
export const WORKSPACE_CLOSING_SOON_DAYS = 14;

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Deal shows elevated stall concern (watch or stalled) from the rules-first stall model.
 * Pass per-deal `tasks` / `documents` slices for accurate scoring.
 */
export function isDealStalledByActivity(
  deal: Deal,
  messages: Message[],
  tasks: Task[],
  documents: DocumentItem[],
): boolean {
  return isDealStallElevated(deal, tasks, documents, messages);
}

/** Active pipeline deal with closing date in [0, maxDays] (inclusive). */
export function isDealClosingSoon(deal: Deal, maxDays = WORKSPACE_CLOSING_SOON_DAYS): boolean {
  if (deal.archived || deal.status === 'complete') return false;
  const d = daysUntilClosing(deal.closingDate);
  return d >= 0 && d <= maxDays;
}

/** Dashboard “Focus today” strip — one row per cross-deal signal (max 4). */
export type FocusInsightSeverity = 'high' | 'medium' | 'low';

export interface FocusInsight {
  id: string;
  count: number;
  /** Shown after count + “deal(s)”, e.g. `at risk` → “3 deals at risk”. */
  label: string;
  action: string;
  severity?: FocusInsightSeverity;
}

function countActiveBuckets(
  activeDeals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): {
  atRiskCount: number;
  stalledCount: number;
  readyToCloseCount: number;
  closingSoonCount: number;
} {
  let atRiskCount = 0;
  let stalledCount = 0;
  let readyToCloseCount = 0;
  let closingSoonCount = 0;

  for (const deal of activeDeals) {
    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const dealDocs = documents.filter((d) => d.dealId === deal.id);
    const detection = detectDealIssues(deal, dealTasks, dealDocs);

    if (detection.health === 'at-risk' || deal.status === 'at-risk') {
      atRiskCount++;
    }

    if (isDealStallElevated(deal, dealTasks, dealDocs, messages)) {
      stalledCount++;
    }

    if (deal.pipelineStage === 'closing' && detection.health === 'on-track' && deal.status !== 'complete') {
      readyToCloseCount++;
    }

    if (isDealClosingSoon(deal)) {
      closingSoonCount++;
    }
  }

  return { atRiskCount, stalledCount, readyToCloseCount, closingSoonCount };
}

/** Dashboard mission-control row — same buckets as {@link computeFocusTodayInsights}. */
export type MissionControlFocusCounts = {
  closingsAtRisk: number;
  closingsStalled: number;
  closingsReady: number;
};

export function computeMissionControlFocusCounts(
  activeDeals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): MissionControlFocusCounts {
  const b = countActiveBuckets(activeDeals, tasks, documents, messages);
  return {
    closingsAtRisk: b.atRiskCount,
    closingsStalled: b.stalledCount,
    closingsReady: b.readyToCloseCount,
  };
}

export type MissionControlFocusKind = 'at-risk' | 'stalled' | 'ready';

/** First deal id matching the mission-control bucket (stable iteration order). */
export function findFirstDealIdForMissionControlFocus(
  kind: MissionControlFocusKind,
  activeDeals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): string | undefined {
  for (const deal of activeDeals) {
    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const dealDocs = documents.filter((d) => d.dealId === deal.id);
    const detection = detectDealIssues(deal, dealTasks, dealDocs);
    if (kind === 'at-risk') {
      if (detection.health === 'at-risk' || deal.status === 'at-risk') return deal.id;
    }
    if (kind === 'stalled') {
      if (isDealStallElevated(deal, dealTasks, dealDocs, messages)) return deal.id;
    }
    if (kind === 'ready') {
      if (
        deal.pipelineStage === 'closing' &&
        detection.health === 'on-track' &&
        deal.status !== 'complete'
      ) {
        return deal.id;
      }
    }
  }
  return undefined;
}

/**
 * 2–4 concise insights for the Focus today strip (active deals only).
 */
export function computeFocusTodayInsights(
  activeDeals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): FocusInsight[] {
  const { atRiskCount, stalledCount, readyToCloseCount, closingSoonCount } = countActiveBuckets(
    activeDeals,
    tasks,
    documents,
    messages,
  );

  const insights: FocusInsight[] = [];

  if (atRiskCount > 0) {
    insights.push({
      id: 'at-risk',
      count: atRiskCount,
      label: 'at risk',
      action: 'review deadlines',
      severity: 'high',
    });
  }
  if (stalledCount > 0) {
    insights.push({
      id: 'stalled',
      count: stalledCount,
      label: 'stalled',
      action: 'follow up with clients',
      severity: 'high',
    });
  }
  if (readyToCloseCount > 0) {
    insights.push({
      id: 'ready-to-close',
      count: readyToCloseCount,
      label: 'ready to close',
      action: 'finalize documents',
      severity: 'medium',
    });
  }
  if (insights.length < 4 && closingSoonCount > 0) {
    insights.push({
      id: 'closing-soon',
      count: closingSoonCount,
      label: 'closing within two weeks',
      action: 'confirm dates and open work',
      severity: 'low',
    });
  }

  return insights.slice(0, 4);
}

/**
 * Transactions / pipeline attention strip — respects the current deal list (e.g. filters).
 * Same `FocusInsight` shape as the dashboard strip; copy tuned for this surface.
 */
export function computeTransactionsAttentionInsights(
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
  _idleDays = WORKSPACE_STALL_IDLE_DAYS,
): FocusInsight[] {
  let idleCount = 0;
  let atRiskCount = 0;
  let closingSoonCount = 0;

  for (const deal of deals) {
    if (deal.archived || deal.status === 'complete') continue;
    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const dealDocs = documents.filter((d) => d.dealId === deal.id);
    const detection = detectDealIssues(deal, dealTasks, dealDocs);

    if (isDealStallElevated(deal, dealTasks, dealDocs, messages)) idleCount++;
    if (detection.health === 'at-risk' || deal.status === 'at-risk') atRiskCount++;
    if (isDealClosingSoon(deal)) closingSoonCount++;
  }

  const insights: FocusInsight[] = [];

  if (idleCount > 0) {
    insights.push({
      id: 'idle',
      count: idleCount,
      label: 'with quiet activity',
      action: 'follow up',
      severity: 'medium',
    });
  }
  if (atRiskCount > 0) {
    insights.push({
      id: 'at-risk',
      count: atRiskCount,
      label: 'are at risk',
      action: 'review blockers',
      severity: 'high',
    });
  }
  if (closingSoonCount > 0) {
    insights.push({
      id: 'closing-soon',
      count: closingSoonCount,
      label: closingSoonCount === 1 ? 'is closing soon' : 'are closing soon',
      action: 'finalize documents',
      severity: 'low',
    });
  }

  return insights.slice(0, 4);
}
