import type { Deal, DocumentItem, Message, Task } from '../types';
import { calculateProgress } from './dealUtils';
import { detectDealIssues } from './dealIssueDetection';
import { detectDealStall, isDealStallElevated } from './dealStallDetection';
import { isDealClosingSoon, WORKSPACE_CLOSING_SOON_DAYS, WORKSPACE_STALL_IDLE_DAYS } from './workspaceInsights';

/** Single prioritized column headline (scan order: at risk → stalled → closing soon → on track → empty). */
export type PipelineColumnSignalKind = 'at-risk' | 'stalled' | 'closing-soon' | 'on-track' | 'no-deals';

export interface PipelineColumnSignal {
  kind: PipelineColumnSignalKind;
  /** One line for the reserved status row */
  line: string;
}

function isHealthAtRisk(deal: Deal, tasks: Task[], documents: DocumentItem[]): boolean {
  const { health } = detectDealIssues(deal, tasks, documents);
  return health === 'at-risk' || deal.status === 'at-risk';
}

/**
 * Aggregates deals in one pipeline column into one primary status line.
 */
export function getPipelineColumnSignal(
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): PipelineColumnSignal {
  if (deals.length === 0) {
    return { kind: 'no-deals', line: 'No deals in this stage' };
  }

  let atRisk = 0;
  let stalled = 0;
  let closingSoon = 0;

  for (const deal of deals) {
    if (deal.archived || deal.status === 'complete') continue;
    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const dealDocs = documents.filter((d) => d.dealId === deal.id);

    if (isHealthAtRisk(deal, dealTasks, dealDocs)) {
      atRisk++;
      continue;
    }
    if (isDealStallElevated(deal, dealTasks, dealDocs, messages)) {
      stalled++;
      continue;
    }
    if (isDealClosingSoon(deal)) {
      closingSoon++;
    }
  }

  if (atRisk > 0) {
    return {
      kind: 'at-risk',
      line: `${atRisk} ${atRisk === 1 ? 'deal' : 'deals'} at risk`,
    };
  }
  if (stalled > 0) {
    return {
      kind: 'stalled',
      line: `${stalled} ${stalled === 1 ? 'deal' : 'deals'} need follow-up on activity`,
    };
  }
  if (closingSoon > 0) {
    return {
      kind: 'closing-soon',
      line: `${closingSoon} closing within two weeks`,
    };
  }
  return { kind: 'on-track', line: 'On track' };
}

export type PipelineCardPrimaryKind = 'at-risk' | 'stalled' | 'closing-soon' | 'needs-attention' | 'on-track';

export interface PipelineCardScanModel {
  primaryKind: PipelineCardPrimaryKind;
  chipLabel: string;
  chipClassName: string;
  /** Muted detail under the chip (issue counts, etc.) */
  supportingText: string | null;
  /** Closing-soon only — short positive operational line */
  positiveContextLine: string | null;
  surfaceClassName: string;
  progressTrackClass: string;
  progressFillClass: string;
  progressBarHeightClass: string;
}

function isIncompleteDoc(d: DocumentItem): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

function closingSoonContextLine(deal: Deal, tasks: Task[], documents: DocumentItem[]): string {
  const progress = calculateProgress(tasks);
  const incompleteDocs = documents.filter(isIncompleteDoc);
  if (tasks.length > 0 && progress >= 100) {
    return 'All major tasks complete';
  }
  if (incompleteDocs.length > 0) {
    return 'Final documents remain';
  }
  return 'Ready for closing review';
}

/**
 * One primary surface + chip + progress treatment per card (priority: at risk → stalled → closing soon → needs attention → on track).
 */
export function getPipelineCardScanModel(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): PipelineCardScanModel {
  const detection = detectDealIssues(deal, tasks, documents);
  const progress = calculateProgress(tasks);
  const atRisk = isHealthAtRisk(deal, tasks, documents);
  const stall = detectDealStall(deal, tasks, documents, messages);
  const stallElevated = !atRisk && !deal.archived && deal.status !== 'complete' && stall.level !== 'none';
  const closingSoon =
    !atRisk &&
    !stallElevated &&
    !deal.archived &&
    deal.status !== 'complete' &&
    isDealClosingSoon(deal, WORKSPACE_CLOSING_SOON_DAYS);

  const defaultSurface = 'border border-border-subtle bg-bg-surface hover:border-border-strong';
  const defaultProgressTrack = 'bg-border-subtle/90 dark:bg-bg-elevated';
  const defaultProgressFill = 'bg-accent-blue';
  const defaultBarH = 'h-1.5';

  if (atRisk) {
    return {
      primaryKind: 'at-risk',
      chipLabel: 'At risk',
      chipClassName:
        'border-0 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 dark:text-red-400/90',
      supportingText: detection.issueCount > 0 ? `${detection.issueCount} open items` : null,
      positiveContextLine: null,
      surfaceClassName:
        'border border-border-subtle border-l-2 border-l-red-500 bg-red-500/5 hover:border-border-strong hover:border-l-red-500 dark:bg-red-500/[0.06]',
      progressTrackClass: defaultProgressTrack,
      progressFillClass: defaultProgressFill,
      progressBarHeightClass: defaultBarH,
    };
  }

  if (stallElevated) {
    return {
      primaryKind: 'stalled',
      chipLabel:
        stall.level === 'stalled'
          ? `Quiet ${WORKSPACE_STALL_IDLE_DAYS}+ days — re-engage`
          : 'Activity trailing — check in',
      chipClassName:
        'border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-950/90 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100/85',
      supportingText: stall.reasons[0] ?? null,
      positiveContextLine: null,
      surfaceClassName:
        'border border-border-subtle border-l-2 border-l-amber-500/50 bg-amber-500/[0.03] hover:border-border-strong dark:bg-amber-500/[0.05]',
      progressTrackClass: defaultProgressTrack,
      progressFillClass: defaultProgressFill,
      progressBarHeightClass: defaultBarH,
    };
  }

  if (closingSoon) {
    return {
      primaryKind: 'closing-soon',
      chipLabel: 'Closing soon',
      chipClassName:
        'border border-teal-600/20 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-900/90 dark:border-teal-400/25 dark:bg-teal-500/15 dark:text-teal-100/90',
      supportingText: null,
      positiveContextLine: closingSoonContextLine(deal, tasks, documents),
      surfaceClassName:
        'border border-border-subtle border-l-2 border-l-teal-500/45 bg-teal-500/[0.04] hover:border-border-strong dark:border-l-teal-400/40 dark:bg-teal-500/[0.06]',
      progressTrackClass: 'bg-teal-500/15 dark:bg-teal-500/10',
      progressFillClass: 'bg-gradient-to-r from-sky-500/85 to-teal-500/80',
      progressBarHeightClass: 'h-2',
    };
  }

  if (detection.health === 'needs-attention') {
    return {
      primaryKind: 'needs-attention',
      chipLabel: 'Needs attention',
      chipClassName:
        'border border-border-subtle bg-accent-amber-soft px-2.5 py-1 text-xs font-medium text-accent-amber dark:text-text-primary',
      supportingText: detection.issueCount > 0 ? `${detection.issueCount} open items` : null,
      positiveContextLine: null,
      surfaceClassName:
        'border border-accent-amber/30 bg-accent-amber-soft/50 hover:border-accent-amber/45 dark:bg-accent-amber-soft/25',
      progressTrackClass: defaultProgressTrack,
      progressFillClass: defaultProgressFill,
      progressBarHeightClass: defaultBarH,
    };
  }

  return {
    primaryKind: 'on-track',
    chipLabel: 'On track',
    chipClassName:
      'border border-border-subtle bg-bg-elevated/60 px-2.5 py-1 text-xs font-medium text-text-secondary dark:bg-bg-elevated/40 dark:text-text-muted',
    supportingText: null,
    positiveContextLine: null,
    surfaceClassName: defaultSurface,
    progressTrackClass: defaultProgressTrack,
    progressFillClass: defaultProgressFill,
    progressBarHeightClass: defaultBarH,
  };
}
