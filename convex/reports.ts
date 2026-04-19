import { query } from './_generated/server';
import { getWorkspaceMembership } from './workspaceAccess';

const PIPELINE_STAGE_LABEL: Record<
  'under-contract' | 'due-diligence' | 'financing' | 'pre-closing' | 'closing',
  string
> = {
  'under-contract': 'Under Contract',
  'due-diligence': 'Due Diligence',
  financing: 'Financing',
  'pre-closing': 'Pre-Closing',
  closing: 'Closing',
};

const PIPELINE_ORDER = [
  'under-contract',
  'due-diligence',
  'financing',
  'pre-closing',
  'closing',
] as const;

/** Days from UTC calendar today to closing date (`YYYY-MM-DD`). Past dates negative. Invalid input → null. */
function calendarDaysUntilClosing(closingDateStr: string): number | null {
  const parts = closingDateStr.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const closingUtc = Date.UTC(y, m - 1, d);
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((closingUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

/**
 * Read-only workspace metrics for Reports (slice 1).
 * Counts only **non-archived** deals so live totals match the active workspace (archived is a list filter, not `status`).
 * Deal health buckets map from persisted `deals.status` (not task-derived).
 * Pipeline row % = share of all (non-archived) deals in that stage.
 */
export const getWorkspaceReportMetrics = query({
  args: {},
  handler: async (ctx) => {
    const membership = await getWorkspaceMembership(ctx);
    if (!membership) {
      return {
        dealHealth: { onTrack: 0, needsAttention: 0, atRisk: 0 },
        pipelineDropOff: PIPELINE_ORDER.map((stage) => ({
          stage: PIPELINE_STAGE_LABEL[stage],
          count: 0,
          percentage: 0,
        })),
        dealsClosedCount: 0,
        closingSoonCount: 0,
      };
    }
    const deals = await ctx.db
      .query('deals')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', membership.workspaceId))
      .collect();
    /** Align with Dashboard / Transactions: archived deals are out of the active workspace and must not skew live totals. */
    const workspaceDeals = deals.filter((d) => d.archived !== true);
    const n = workspaceDeals.length;

    const dealHealth = {
      onTrack: workspaceDeals.filter((d) => d.status === 'active').length,
      needsAttention: workspaceDeals.filter((d) => d.status === 'overdue').length,
      atRisk: workspaceDeals.filter((d) => d.status === 'at-risk').length,
    };

    const pipelineDropOff = PIPELINE_ORDER.map((stage) => {
      const count = workspaceDeals.filter((d) => d.pipelineStage === stage).length;
      const percentage = n === 0 ? 0 : Math.round((count / n) * 1000) / 10;
      return {
        stage: PIPELINE_STAGE_LABEL[stage],
        count,
        percentage,
      };
    });

    const dealsClosedCount = workspaceDeals.filter((d) => d.status === 'complete').length;

    /** Closing within the next 7 calendar days (inclusive), excluding completed deals. */
    const closingSoonCount = workspaceDeals.filter((d) => {
      if (d.status === 'complete') return false;
      const days = calendarDaysUntilClosing(d.closingDate);
      if (days === null) return false;
      return days >= 0 && days <= 7;
    }).length;

    return { dealHealth, pipelineDropOff, dealsClosedCount, closingSoonCount };
  },
});
