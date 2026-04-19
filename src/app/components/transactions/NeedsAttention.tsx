import { Deal, Task } from '../../types';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { countAtRiskItems } from '../../utils/dealUtils';
import { useState } from 'react';

interface NeedsAttentionProps {
  deals: Deal[];
  tasks: Task[];
  onViewDeal: (dealId: string) => void;
}

export function NeedsAttention({ deals, tasks, onViewDeal }: NeedsAttentionProps) {
  const [showAll, setShowAll] = useState(false);

  // Find deals that need attention
  const dealsNeedingAttention = deals
    .map(deal => {
      const dealTasks = tasks.filter(t => t.dealId === deal.id);
      const atRiskCount = countAtRiskItems(dealTasks);
      const overdueTasks = dealTasks.filter(t => t.status === 'overdue');

      let issue = '';
      let severity: 'high' | 'medium' = 'medium';

      if (overdueTasks.length > 0) {
        issue = `${overdueTasks.length} overdue ${overdueTasks.length === 1 ? 'task' : 'tasks'}`;
        severity = 'high';
      } else if (atRiskCount > 0) {
        issue = `${atRiskCount} ${atRiskCount === 1 ? 'task' : 'tasks'} at risk`;
        severity = 'medium';
      } else if (deal.status === 'at-risk') {
        issue = 'Deal marked at risk';
        severity = 'high';
      }

      return {
        deal,
        issue,
        severity,
        hasIssue: issue !== '',
      };
    })
    .filter(item => item.hasIssue)
    .sort((a, b) => {
      // Sort by severity (high first), then by deal name
      if (a.severity !== b.severity) {
        return a.severity === 'high' ? -1 : 1;
      }
      return a.deal.propertyAddress.localeCompare(b.deal.propertyAddress);
    });

  const displayedDeals = showAll ? dealsNeedingAttention : dealsNeedingAttention.slice(0, 3);

  if (dealsNeedingAttention.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-accent-amber-soft px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-accent-amber" size={20} />
            <h2 className="font-semibold text-text-primary">Needs Attention</h2>
            <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
              {dealsNeedingAttention.length}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-border-subtle">
          {displayedDeals.map(({ deal, issue, severity }) => (
            <button
              key={deal.id}
              onClick={() => onViewDeal(deal.id)}
              className="group flex w-full items-center justify-between px-4 py-4 text-left transition-[background-color] duration-150 ease-out hover:bg-bg-elevated/50 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <h3 className="truncate font-medium text-text-primary">
                    {deal.propertyAddress}
                  </h3>
                  {severity === 'high' && (
                    <span className="rounded border border-border-subtle bg-accent-red-soft px-2 py-0.5 text-xs font-medium text-accent-red dark:text-text-primary">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-secondary">{deal.buyerName}</span>
                  <span className="text-text-muted">•</span>
                  <span className={severity === 'high' ? 'text-accent-red' : 'text-accent-amber'}>
                    {issue}
                  </span>
                </div>
              </div>
              <ChevronRight className="flex-shrink-0 text-text-muted transition-colors duration-150 ease-out group-hover:text-text-secondary" size={20} />
            </button>
          ))}
        </div>

        {/* View All */}
        {dealsNeedingAttention.length > 3 && (
          <div className="border-t border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/30 sm:px-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-accent-blue transition-colors duration-150 ease-out hover:text-accent-blue-hover"
            >
              {showAll ? 'Show Less' : `View All ${dealsNeedingAttention.length} Items`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
