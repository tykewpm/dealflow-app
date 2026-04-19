import { formatRelativeDate } from '../../utils/dealUtils';
import { Button } from '../ui/button';

export type ActionPriority = 'on-track' | 'at-risk' | 'overdue';

interface NextActionCardProps {
  actionText: string;
  secondaryText?: string;
  dueDate?: string;
  priority: ActionPriority;
  warningMessage?: string;
  /** Legacy — prefer overdueCount when using deal summary metrics */
  atRiskCount?: number;
  overdueCount?: number;
  dueSoonCount?: number;
  awaitingSignatureCount?: number;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  /** When true, primary CTA is disabled (e.g. Convex read-only — cannot persist task toggle). */
  primaryDisabled?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  /** Compact workbench style: less padding, no deal summary chip row (avoids duplicating strip metrics). */
  variant?: 'default' | 'compact';
}

export function NextActionCard({
  actionText,
  secondaryText,
  dueDate,
  priority,
  warningMessage,
  atRiskCount,
  overdueCount,
  dueSoonCount,
  awaitingSignatureCount,
  primaryButtonText = 'Mark Complete',
  secondaryButtonText = 'View Details',
  primaryDisabled = false,
  onPrimaryAction,
  onSecondaryAction,
  variant = 'default',
}: NextActionCardProps) {
  const isCompact = variant === 'compact';
  const showDealSummaryRow =
    !isCompact &&
    overdueCount !== undefined &&
    ((overdueCount ?? 0) > 0 || (dueSoonCount ?? 0) > 0 || (awaitingSignatureCount ?? 0) > 0);
  const showLegacySummaryRow =
    !isCompact &&
    overdueCount === undefined &&
    ((atRiskCount ?? 0) > 0 || (dueSoonCount ?? 0) > 0);

  const priorityConfig = {
    'on-track': {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-green-soft',
      iconColor: 'text-accent-green',
      dueDateColor: 'text-text-secondary',
      labelColor: 'text-accent-green dark:text-text-secondary',
    },
    'at-risk': {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-amber-soft',
      iconColor: 'text-accent-amber',
      dueDateColor: 'text-text-secondary',
      labelColor: 'text-accent-amber dark:text-text-secondary',
    },
    overdue: {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-red-soft',
      iconColor: 'text-accent-red',
      dueDateColor: 'text-text-secondary',
      labelColor: 'text-accent-red dark:text-text-secondary',
    },
  };

  const config = priorityConfig[priority];
  const relativeDueDate = dueDate ? formatRelativeDate(dueDate) : null;

  const stripAccent = {
    'on-track': 'border-l-[3px] border-l-accent-green/70',
    'at-risk': 'border-l-[3px] border-l-accent-amber/80',
    overdue: 'border-l-[3px] border-l-accent-red/80',
  }[priority];

  if (isCompact) {
    return (
      <div
        className={`rounded-md border border-border-subtle bg-bg-surface shadow-sm transition-[box-shadow,border-color,background-color] duration-150 ease-out hover:border-border-strong dark:shadow-none ${stripAccent}`}
      >
        <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <svg className={`h-3.5 w-3.5 shrink-0 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.labelColor}`}>
                Next action
              </span>
            </div>
            <h3 className="text-sm font-semibold leading-snug text-text-primary">{actionText}</h3>
            {secondaryText && (
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-text-secondary">{secondaryText}</p>
            )}
            {relativeDueDate && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-xs font-medium ${config.dueDateColor}`}>{relativeDueDate}</span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={onPrimaryAction}
              disabled={primaryDisabled}
              title={
                primaryDisabled ? 'Editing is disabled while Convex workspace is read-only' : undefined
              }
              className="min-w-[7rem] flex-1 transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 sm:flex-initial"
            >
              {primaryButtonText}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryButtonText}
            </Button>
          </div>
        </div>
        {warningMessage && (
          <div className={`border-t border-border-subtle px-3 py-1.5 ${config.bgColor}`}>
            <div className="flex items-start gap-2">
              <svg
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${config.iconColor}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`text-xs font-medium leading-snug ${config.dueDateColor}`}>{warningMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const shellPad = 'p-5';

  return (
    <div
      className={`rounded-lg border border-border-subtle bg-bg-surface ${shellPad} shadow-sm transition-[box-shadow,border-color] duration-150 ease-out hover:border-border-strong dark:shadow-none`}
    >
      {/* Top Label */}
      <div className="mb-3 flex items-center gap-2">
        <svg className={`w-4 h-4 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`text-xs font-semibold uppercase tracking-wide ${config.labelColor}`}>Next Action</span>
      </div>

      {/* Main Content */}
      <div className="mb-3">
        <h3 className="mb-1 font-semibold text-text-primary">{actionText}</h3>
        {secondaryText && <p className="mb-1 text-sm text-text-secondary">{secondaryText}</p>}
        {relativeDueDate && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm font-medium ${config.dueDateColor}`}>{relativeDueDate}</span>
          </div>
        )}
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <div className={`${config.bgColor} mb-4 rounded-lg border border-border-subtle px-3 py-2`}>
          <div className="flex items-start gap-2">
            <svg className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className={`text-sm font-medium ${config.dueDateColor}`}>{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Secondary Info Row — omitted in compact variant to avoid duplicating deal summary strip */}
      {(showDealSummaryRow || showLegacySummaryRow) && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          {overdueCount !== undefined && overdueCount > 0 && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                {overdueCount} overdue {overdueCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}
          {atRiskCount !== undefined && atRiskCount > 0 && overdueCount === undefined && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{atRiskCount} {atRiskCount === 1 ? 'task' : 'tasks'} at risk</span>
            </div>
          )}
          {dueSoonCount !== undefined && dueSoonCount > 0 && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {dueSoonCount} {dueSoonCount === 1 ? 'task' : 'tasks'} due soon
              </span>
            </div>
          )}
          {awaitingSignatureCount !== undefined && awaitingSignatureCount > 0 && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>
                {awaitingSignatureCount} awaiting signature
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="accent"
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
          title={
            primaryDisabled
              ? 'Editing is disabled while Convex workspace is read-only'
              : undefined
          }
          className="min-w-[8rem] flex-1"
        >
          {primaryButtonText}
        </Button>
        <Button type="button" variant="secondary" onClick={onSecondaryAction} className="shrink-0">
          {secondaryButtonText}
        </Button>
      </div>
    </div>
  );
}
