import { Deal, Task } from '../../types';
import { DealStatusBadge } from '../shared/DealStatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import { calculateProgress, countAtRiskItems, formatDate } from '../../utils/dealUtils';

interface DealCardProps {
  deal: Deal;
  tasks: Task[];
  onClick: () => void;
  /** Archive vs restore — footer action; omit to hide lifecycle controls. */
  archiveVariant?: 'archive' | 'restore';
  onArchiveAction?: () => void;
}

export function DealCard({
  deal,
  tasks,
  onClick,
  archiveVariant = 'archive',
  onArchiveAction,
}: DealCardProps) {
  const progress = calculateProgress(tasks);
  const atRiskCount = countAtRiskItems(tasks);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/30 dark:shadow-none sm:p-5"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-text-primary">
            {deal.propertyAddress}
          </h3>
          <p className="text-sm text-text-secondary">
            Buyer: {deal.buyerName}
          </p>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Closing Date</span>
          <span className="font-medium text-text-primary">
            {formatDate(deal.closingDate)}
          </span>
        </div>

        {atRiskCount > 0 && (
          <div className="flex items-center gap-2 rounded border border-border-subtle bg-accent-amber-soft px-3 py-2">
            <svg className="h-4 w-4 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-text-primary">
              {atRiskCount} {atRiskCount === 1 ? 'item' : 'items'} at risk
            </span>
          </div>
        )}
      </div>

      <ProgressBar progress={progress} />

      {onArchiveAction ? (
        <div
          className="mt-4 flex justify-end border-t border-border-subtle pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onArchiveAction}
            className="text-sm font-medium text-text-muted underline-offset-2 transition-colors duration-150 ease-out hover:text-text-primary hover:underline"
          >
            {archiveVariant === 'restore' ? 'Restore to pipeline' : 'Archive'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
