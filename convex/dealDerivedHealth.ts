/**
 * Server-side mirror of client `detectDealIssues` health derivation for elevate-only `deal.status`
 * alignment. Keep thresholds and rules in sync with `src/app/utils/dealIssueDetection.ts`.
 */
import type { MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

const NEAR_CLOSING_SIGNATURE_DAYS = 14;
const CLOSING_RISK_NEAR_DAYS = 14;
const CLOSING_RISK_SEVERE_DAYS = 7;

type DealHealthLevel = 'on-track' | 'needs-attention' | 'at-risk';
type DealClosingRiskLevel = 'none' | 'elevated' | 'severe';

type TaskLike = Pick<Doc<'tasks'>, '_id' | 'status' | 'dueDate' | 'name'>;
type DocLike = Pick<Doc<'dealDocuments'>, '_id' | 'status' | 'signatureStatus' | 'dueDate' | 'name'>;

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isIncompleteDoc(d: DocLike): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

function incompleteTasksList(tasks: TaskLike[]): TaskLike[] {
  return tasks.filter((t) => t.status !== 'complete');
}

function isDocumentInSignatureWorkflow(doc: DocLike): boolean {
  if (doc.status === 'signed' || doc.status === 'completed') return false;
  if (doc.signatureStatus === 'fully-signed') return false;
  if (doc.signatureStatus === 'not-required') return false;

  return (
    doc.status === 'awaiting-signature' ||
    doc.signatureStatus === 'requested' ||
    doc.signatureStatus === 'partially-signed'
  );
}

function isDocumentOverdue(document: DocLike): boolean {
  if (!document.dueDate) return false;
  if (document.status === 'signed' || document.status === 'completed') return false;

  const dueDate = new Date(document.dueDate);
  const now = new Date();
  return dueDate < now;
}

function deriveClosingRisk(untilClose: number, hasBlockers: boolean): DealClosingRiskLevel {
  if (!hasBlockers || untilClose < 0 || untilClose > CLOSING_RISK_NEAR_DAYS) return 'none';
  if (untilClose <= CLOSING_RISK_SEVERE_DAYS) return 'severe';
  return 'elevated';
}

type IssueSeverity = 'high' | 'medium';

function deriveHealthFromIssues(issueSeverities: IssueSeverity[]): DealHealthLevel {
  if (issueSeverities.length === 0) return 'on-track';
  const hasHigh = issueSeverities.some((s) => s === 'high');
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
 * Derived health tier for one deal — matches `detectDealIssues(...).health` when inputs match.
 */
export function computeDerivedHealthLevel(
  closingDate: string,
  tasks: TaskLike[],
  documents: DocLike[],
): DealHealthLevel {
  const untilClose = daysUntilClosing(closingDate);
  const incompleteDocs = documents.filter(isIncompleteDoc);
  const incompleteTasks = incompleteTasksList(tasks);

  const overdueTasks = incompleteTasks.filter((t) => t.status === 'overdue');
  const overdueDocs = incompleteDocs.filter((d) => isDocumentOverdue(d));

  const overdueTaskCount = overdueTasks.length;
  const overdueDocCount = overdueDocs.length;

  const awaitingSignatureCount = documents.filter((d) => isDocumentInSignatureWorkflow(d)).length;

  const hasBlockers =
    overdueDocCount > 0 ||
    overdueTaskCount > 0 ||
    incompleteDocs.length > 0 ||
    awaitingSignatureCount > 0;

  const closingRisk = deriveClosingRisk(untilClose, hasBlockers);

  const issueSeverities: IssueSeverity[] = [];

  for (const _doc of overdueDocs) {
    issueSeverities.push('high');
  }
  for (const _task of overdueTasks) {
    issueSeverities.push('high');
  }

  const sigNearClosingDocs = incompleteDocs.filter(
    (d) =>
      isDocumentInSignatureWorkflow(d) &&
      !isDocumentOverdue(d) &&
      untilClose <= NEAR_CLOSING_SIGNATURE_DAYS &&
      untilClose >= 0,
  );
  for (const _doc of sigNearClosingDocs) {
    issueSeverities.push(untilClose <= CLOSING_RISK_SEVERE_DAYS ? 'high' : 'medium');
  }

  const sigIds = new Set(sigNearClosingDocs.map((d) => d._id));
  const incompleteNotOverdue = incompleteDocs.filter((d) => !isDocumentOverdue(d));
  const rollupCandidates = incompleteNotOverdue.filter((d) => !sigIds.has(d._id));

  if (rollupCandidates.length > 0) {
    issueSeverities.push('medium');
  }

  const baseHealth = deriveHealthFromIssues(issueSeverities);
  return mergeHealthWithClosingRisk(baseHealth, closingRisk);
}

/**
 * Elevate-only: if derived health is `at-risk` and stored status is `active` or `overdue`,
 * set `deal.status` to `at-risk`. Never downgrades; never touches `complete` or `at-risk`.
 */
export async function elevateDealStatusIfDerivedAtRisk(
  ctx: MutationCtx,
  dealId: Id<'deals'>,
): Promise<void> {
  const deal = await ctx.db.get(dealId);
  if (!deal) return;
  if (deal.status === 'complete' || deal.status === 'at-risk') return;

  const taskRows = await ctx.db
    .query('tasks')
    .withIndex('by_dealId', (q) => q.eq('dealId', dealId))
    .collect();
  const docRows = await ctx.db
    .query('dealDocuments')
    .withIndex('by_dealId', (q) => q.eq('dealId', dealId))
    .collect();

  const health = computeDerivedHealthLevel(deal.closingDate, taskRows, docRows);

  if (health !== 'at-risk') return;
  if (deal.status !== 'active' && deal.status !== 'overdue') return;

  await ctx.db.patch(dealId, { status: 'at-risk' });
}
