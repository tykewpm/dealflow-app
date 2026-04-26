import { useMemo, useState } from 'react';
import type { Deal, DocumentItem, Message, Task } from '../../types';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { detectDealIssues } from '../../utils/dealIssueDetection';
import type { DealHealthLevel } from '../../utils/dealIssueDetection';
import { computeDealNextAction } from '../../utils/dealNextActionEngine';
import { healthChipClasses } from '../../utils/statusSurfaceTokens';

interface NeedsAttentionProps {
  deals: Deal[];
  tasks: Task[];
  documents?: DocumentItem[];
  messages?: Message[];
  onViewDeal: (dealId: string) => void;
}

const HEALTH_LABEL: Record<DealHealthLevel, string> = {
  'at-risk': 'At risk',
  'needs-attention': 'Needs attention',
  'on-track': 'On track',
};

function healthSortKey(h: DealHealthLevel): number {
  if (h === 'at-risk') return 0;
  if (h === 'needs-attention') return 1;
  return 2;
}

function issueSummary(
  overdueCount: number,
  issueCount: number,
  awaitingSignatureCount: number,
  nextTitle: string,
): string {
  if (overdueCount > 0) {
    return `${overdueCount} overdue`;
  }
  if (issueCount > 0) {
    return `${issueCount} open issue${issueCount === 1 ? '' : 's'}`;
  }
  if (awaitingSignatureCount > 0) {
    return `${awaitingSignatureCount} awaiting signature`;
  }
  return nextTitle;
}

export function NeedsAttention({
  deals,
  tasks,
  documents = [],
  messages = [],
  onViewDeal,
}: NeedsAttentionProps) {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const out: {
      deal: Deal;
      health: DealHealthLevel;
      issueLine: string;
      primaryActionLabel: string;
    }[] = [];

    for (const deal of deals) {
      const dealTasks = tasks.filter((t) => t.dealId === deal.id);
      const dealDocs = documents.filter((d) => d.dealId === deal.id);
      const detection = detectDealIssues(deal, dealTasks, dealDocs);
      if (detection.health === 'on-track') continue;

      const next = computeDealNextAction(deal, dealTasks, dealDocs, messages);
      out.push({
        deal,
        health: detection.health,
        issueLine: issueSummary(
          detection.overdueCount,
          detection.issueCount,
          detection.awaitingSignatureCount,
          next.title,
        ),
        primaryActionLabel: next.primaryCta.label,
      });
    }

    out.sort((a, b) => {
      const h = healthSortKey(a.health) - healthSortKey(b.health);
      if (h !== 0) return h;
      return a.deal.propertyAddress.localeCompare(b.deal.propertyAddress);
    });

    return out;
  }, [deals, tasks, documents, messages]);

  const displayed = showAll ? rows : rows.slice(0, 3);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-accent-amber-soft px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-accent-amber" size={20} aria-hidden />
            <h2 className="font-semibold text-text-primary">Closings that need attention</h2>
            <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
              {rows.length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {displayed.map(({ deal, health, issueLine, primaryActionLabel }) => (
            <button
              key={deal.id}
              type="button"
              onClick={() => onViewDeal(deal.id)}
              className="group flex w-full flex-col gap-3 px-4 py-4 text-left transition-[background-color] duration-150 ease-out hover:bg-bg-elevated/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-text-primary">{deal.propertyAddress}</h3>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${healthChipClasses[health]}`}
                  >
                    {HEALTH_LABEL[health]}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{issueLine}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-stretch sm:flex-col sm:items-end sm:gap-1">
                <span className="rounded-md border border-border-subtle bg-bg-app px-2.5 py-1 text-xs font-medium text-accent-blue dark:bg-bg-elevated/50">
                  {primaryActionLabel}
                </span>
                <ChevronRight
                  className="hidden text-text-muted transition-colors duration-150 ease-out group-hover:text-text-secondary sm:block"
                  size={18}
                  aria-hidden
                />
              </div>
            </button>
          ))}
        </div>

        {rows.length > 3 ? (
          <div className="border-t border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/30 sm:px-6">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-accent-blue transition-colors duration-150 ease-out hover:text-accent-blue-hover"
            >
              {showAll ? 'Show less' : `Show all ${rows.length}`}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
