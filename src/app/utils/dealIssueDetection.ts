import type { Deal, DocumentItem, Task } from '../types';
import { isDocumentInSignatureWorkflow, isDocumentOverdue } from './documentHelpers';

/**
 * Rule-based deal issue detection (client-side, local state only).
 *
 * Server-side elevate-only `deal.status` alignment mirrors these rules in
 * `convex/dealDerivedHealth.ts` — keep thresholds and issue construction aligned.
 *
 * Keep thresholds in sync with `dealNextActionEngine` where concepts overlap:
 * - NEAR_CLOSING_SIGNATURE_DAYS = 14
 *
 * “Required” items: same assumption as the next-action engine — no explicit `required`
 * flag on Task/DocumentItem yet; incomplete checklist items count.
 *
 * Closing pressure is NOT a separate issue row (it would duplicate counts with granular
 * issues). Use `closingRisk` on the result + health derivation instead.
 */

const NEAR_CLOSING_SIGNATURE_DAYS = 14;
const CLOSING_RISK_NEAR_DAYS = 14;
const CLOSING_RISK_SEVERE_DAYS = 7;

/** Stable string values for row-level `DealIssue.kind` (explicit for downstream reuse). */
export const DEAL_ISSUE_KIND = {
  OVERDUE_DOCUMENT: 'overdue-document',
  OVERDUE_TASK: 'overdue-task',
  SIGNATURE_NEAR_CLOSING: 'signature-near-closing',
  INCOMPLETE_DOCUMENTS: 'incomplete-documents',
} as const;

export type DealIssueKind = (typeof DEAL_ISSUE_KIND)[keyof typeof DEAL_ISSUE_KIND];

export type DealHealthLevel = 'on-track' | 'needs-attention' | 'at-risk';

/** Aggregate closing pressure — never double-counted as `issues.length`. */
export type DealClosingRiskLevel = 'none' | 'elevated' | 'severe';

export interface DealIssue {
  /** Stable id for keys / analytics */
  id: string;
  kind: DealIssueKind;
  severity: 'high' | 'medium';
  title: string;
  detail?: string;
  sourceType?: 'task' | 'document' | 'deal';
  sourceId?: string;
}

export interface DealIssueDetectionResult {
  issues: DealIssue[];
  /** Same as `issues.length` — granular rows only (no synthetic closing-risk row). */
  issueCount: number;
  /** Overdue incomplete tasks + overdue incomplete documents (entity counts, not issue rows). */
  overdueCount: number;
  /** Documents still in signature workflow (`awaiting-signature` or signatureStatus requested / partial). */
  awaitingSignatureCount: number;
  health: DealHealthLevel;
  /** Near-close pressure with open work — influences `health`; see `deriveHealthWithClosingRisk`. */
  closingRisk: DealClosingRiskLevel;
}

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isIncompleteDoc(d: DocumentItem): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

function incompleteTasksList(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'complete');
}

function deriveClosingRisk(untilClose: number, hasBlockers: boolean): DealClosingRiskLevel {
  if (!hasBlockers || untilClose < 0 || untilClose > CLOSING_RISK_NEAR_DAYS) return 'none';
  if (untilClose <= CLOSING_RISK_SEVERE_DAYS) return 'severe';
  return 'elevated';
}

function deriveHealthFromIssues(issues: DealIssue[]): DealHealthLevel {
  if (issues.length === 0) return 'on-track';
  const hasHigh = issues.some((i) => i.severity === 'high');
  if (hasHigh) return 'at-risk';
  return 'needs-attention';
}

function mergeHealthWithClosingRisk(
  base: DealHealthLevel,
  closingRisk: DealClosingRiskLevel,
): DealHealthLevel {
  if (closingRisk === 'severe') return 'at-risk';
  if (closingRisk === 'elevated') {
    if (base === 'on-track') return 'needs-attention';
    return base;
  }
  return base;
}

/**
 * Detect actionable issues and overall health for a single deal.
 */
export function detectDealIssues(deal: Deal, tasks: Task[], documents: DocumentItem[]): DealIssueDetectionResult {
  const issues: DealIssue[] = [];
  const untilClose = daysUntilClosing(deal.closingDate);

  const incompleteDocs = documents.filter(isIncompleteDoc);
  const incompleteTasks = incompleteTasksList(tasks);

  const overdueTasks = incompleteTasks.filter((t) => t.status === 'overdue');
  const overdueDocs = incompleteDocs.filter((d) => isDocumentOverdue(d));

  const overdueTaskCount = overdueTasks.length;
  const overdueDocCount = overdueDocs.length;
  const overdueCount = overdueTaskCount + overdueDocCount;

  const awaitingSignatureCount = documents.filter((d) => isDocumentInSignatureWorkflow(d)).length;

  const hasBlockers =
    overdueDocCount > 0 ||
    overdueTaskCount > 0 ||
    incompleteDocs.length > 0 ||
    awaitingSignatureCount > 0;

  const closingRisk = deriveClosingRisk(untilClose, hasBlockers);

  // 1. Overdue incomplete documents (one issue per doc)
  for (const doc of overdueDocs) {
    issues.push({
      id: `overdue-doc-${doc.id}`,
      kind: DEAL_ISSUE_KIND.OVERDUE_DOCUMENT,
      severity: 'high',
      title: `Overdue: ${doc.name}`,
      detail: doc.dueDate ? `Was due ${doc.dueDate}` : undefined,
      sourceType: 'document',
      sourceId: doc.id,
    });
  }

  // 2. Overdue tasks (one issue per task)
  for (const task of overdueTasks) {
    issues.push({
      id: `overdue-task-${task.id}`,
      kind: DEAL_ISSUE_KIND.OVERDUE_TASK,
      severity: 'high',
      title: `Overdue task: ${task.name}`,
      detail: `Due ${task.dueDate}`,
      sourceType: 'task',
      sourceId: task.id,
    });
  }

  // 3. Awaiting signature near closing (overdue docs are covered above)
  const sigNearClosingDocs = incompleteDocs.filter(
    (d) =>
      isDocumentInSignatureWorkflow(d) &&
      !isDocumentOverdue(d) &&
      untilClose <= NEAR_CLOSING_SIGNATURE_DAYS &&
      untilClose >= 0,
  );
  for (const doc of sigNearClosingDocs) {
    issues.push({
      id: `sig-near-${doc.id}`,
      kind: DEAL_ISSUE_KIND.SIGNATURE_NEAR_CLOSING,
      severity: untilClose <= CLOSING_RISK_SEVERE_DAYS ? 'high' : 'medium',
      title: `Signature needed: ${doc.name}`,
      detail: `Closing in ${untilClose} ${untilClose === 1 ? 'day' : 'days'}`,
      sourceType: 'document',
      sourceId: doc.id,
    });
  }

  // 4. Remaining incomplete documents (rolled up; overdue & sig-near rows excluded from rollup)
  const incompleteNotOverdue = incompleteDocs.filter((d) => !isDocumentOverdue(d));
  const sigIds = new Set(sigNearClosingDocs.map((d) => d.id));
  const rollupCandidates = incompleteNotOverdue.filter((d) => !sigIds.has(d.id));

  if (rollupCandidates.length > 0) {
    issues.push({
      id: `incomplete-docs-${deal.id}`,
      kind: DEAL_ISSUE_KIND.INCOMPLETE_DOCUMENTS,
      severity: 'medium',
      title: `${rollupCandidates.length} document${rollupCandidates.length === 1 ? '' : 's'} incomplete`,
      detail: 'Finish uploads, signatures, or reviews as needed',
      sourceType: 'deal',
      sourceId: deal.id,
    });
  }

  const baseHealth = deriveHealthFromIssues(issues);
  const health = mergeHealthWithClosingRisk(baseHealth, closingRisk);

  return {
    issues,
    issueCount: issues.length,
    overdueCount,
    awaitingSignatureCount,
    health,
    closingRisk,
  };
}
