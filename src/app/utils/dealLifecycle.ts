import type { Deal } from '../types';

export type DashboardDealTab = 'active' | 'completed' | 'archived';

export function dealIsArchived(deal: Deal): boolean {
  return deal.archived === true;
}

/** Active (list) = in pipeline, not archived. Completed = closed transaction (`status`), not archived. */
export function dealsForDashboardTab(deals: Deal[], tab: DashboardDealTab): Deal[] {
  switch (tab) {
    case 'active':
      return deals.filter((d) => !dealIsArchived(d) && d.status !== 'complete');
    case 'completed':
      return deals.filter((d) => !dealIsArchived(d) && d.status === 'complete');
    case 'archived':
      return deals.filter(dealIsArchived);
  }
}

/** Transactions, templates, workload: hide archived rows from operational views. */
export function excludeArchivedDeals(deals: Deal[]): Deal[] {
  return deals.filter((d) => !dealIsArchived(d));
}

/** Template apply targets active pipeline work — not archived and not health-closed (`complete`). */
export function dealsEligibleForTemplateApply(deals: Deal[]): Deal[] {
  return excludeArchivedDeals(deals).filter((d) => d.status !== 'complete');
}

export type ApplyTemplateDealEmptyReason = 'workspace-empty' | 'only-archived' | 'all-complete';

/** When the apply modal’s eligible list is empty (caller passes `workspaceLoading` from the same moment). */
export function resolveApplyTemplateDealEmptyReason(
  allDeals: Deal[],
  workspaceLoading: boolean,
): ApplyTemplateDealEmptyReason | undefined {
  if (workspaceLoading) return undefined;
  if (dealsEligibleForTemplateApply(allDeals).length > 0) return undefined;

  if (allDeals.length === 0) return 'workspace-empty';

  const nonArchived = excludeArchivedDeals(allDeals);
  if (nonArchived.length === 0) return 'only-archived';
  if (nonArchived.every((d) => d.status === 'complete')) return 'all-complete';
  return 'workspace-empty';
}
