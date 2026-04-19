import { useState } from 'react';
import type { DashboardAttentionItem } from '../../utils/dashboardAttention';
import { healthChipClasses } from '../../utils/statusSurfaceTokens';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface DashboardAttentionProps {
  items: DashboardAttentionItem[];
  onSelectDeal: (dealId: string) => void;
}

const HEALTH_LABEL: Record<DashboardAttentionItem['health'], string> = {
  'at-risk': 'At risk',
  'needs-attention': 'Needs attention',
  'on-track': 'On track',
};

export function DashboardAttention({ items, onSelectDeal }: DashboardAttentionProps) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 5;
  const displayed = showAll ? items : items.slice(0, PREVIEW);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none">
        <div className="flex items-center justify-between border-b border-border-subtle bg-accent-amber-soft px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-accent-amber" size={20} aria-hidden />
            <h2 className="font-semibold text-text-primary">Needs attention</h2>
            <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
              {items.length}
            </span>
          </div>
          <span className="hidden text-xs text-text-muted sm:inline">From deal health &amp; next actions</span>
        </div>

        <div className="divide-y divide-border-subtle">
          {displayed.map((row) => (
            <button
              key={row.deal.id}
              type="button"
              onClick={() => onSelectDeal(row.deal.id)}
              className="group flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-[background-color] duration-150 ease-out hover:bg-bg-elevated/50 sm:gap-4 sm:px-6 sm:py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-text-primary">{row.deal.propertyAddress}</h3>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${healthChipClasses[row.health]}`}
                  >
                    {HEALTH_LABEL[row.health]}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-medium text-text-primary">{row.nextActionTitle}</p>
                {row.nextActionSubtitle ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{row.nextActionSubtitle}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
                  {row.issueCount > 0 ? (
                    <span>
                      {row.issueCount} issue{row.issueCount === 1 ? '' : 's'}
                    </span>
                  ) : null}
                  {row.overdueCount > 0 ? (
                    <span className="font-medium text-accent-red">
                      {row.overdueCount} overdue
                    </span>
                  ) : null}
                  {row.awaitingSignatureCount > 0 ? (
                    <span>{row.awaitingSignatureCount} awaiting signature</span>
                  ) : null}
                </div>
              </div>
              <ChevronRight
                className="mt-1 shrink-0 text-text-muted transition-colors duration-150 ease-out group-hover:text-text-secondary"
                size={20}
                aria-hidden
              />
            </button>
          ))}
        </div>

        {items.length > PREVIEW ? (
          <div className="border-t border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/30 sm:px-6">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-accent-blue transition-colors duration-150 ease-out hover:text-accent-blue-hover"
            >
              {showAll ? 'Show less' : `Show all ${items.length}`}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
