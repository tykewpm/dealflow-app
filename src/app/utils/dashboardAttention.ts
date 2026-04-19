import type { Deal, DocumentItem, Message, Task } from '../types';
import type { DealHealthLevel } from './dealIssueDetection';
import { detectDealIssues } from './dealIssueDetection';
import { computeDealNextAction } from './dealNextActionEngine';

export interface DashboardAttentionItem {
  deal: Deal;
  health: DealHealthLevel;
  issueCount: number;
  overdueCount: number;
  awaitingSignatureCount: number;
  nextActionTitle: string;
  nextActionSubtitle?: string;
}

function healthSortKey(h: DealHealthLevel): number {
  if (h === 'at-risk') return 0;
  if (h === 'needs-attention') return 1;
  return 2;
}

/**
 * Deals worth surfacing on the Dashboard using the same detection + next-action engines
 * as Deal Detail / Transactions — no duplicated business rules.
 */
export function getDashboardAttentionItems(
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
  options?: { limit?: number; messages?: Message[] },
): DashboardAttentionItem[] {
  const limit = options?.limit ?? 40;
  const messages = options?.messages ?? [];
  const rows: DashboardAttentionItem[] = [];

  for (const deal of deals) {
    if (deal.archived) continue;
    if (deal.status === 'complete') continue;

    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const dealDocs = documents.filter((d) => d.dealId === deal.id);
    const detection = detectDealIssues(deal, dealTasks, dealDocs);

    if (detection.health === 'on-track') continue;

    const next = computeDealNextAction(deal, dealTasks, dealDocs, messages);

    rows.push({
      deal,
      health: detection.health,
      issueCount: detection.issueCount,
      overdueCount: detection.overdueCount,
      awaitingSignatureCount: detection.awaitingSignatureCount,
      nextActionTitle: next.title,
      nextActionSubtitle: next.subtitle,
    });
  }

  rows.sort((a, b) => {
    const h = healthSortKey(a.health) - healthSortKey(b.health);
    if (h !== 0) return h;
    return b.issueCount - a.issueCount;
  });

  return rows.slice(0, limit);
}
