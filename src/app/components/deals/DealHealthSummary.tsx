import type { DealIssueDetectionResult } from '../../utils/dealIssueDetection';
import { healthChipClasses } from '../../utils/statusSurfaceTokens';
import { cn } from '../ui/utils';

interface DealHealthSummaryProps {
  detection: DealIssueDetectionResult;
  /** Extra classes for the outer wrapper (layout contexts may drop horizontal padding). */
  className?: string;
  /** Tighter typography for the operating summary bar (Deal Detail). */
  compact?: boolean;
}

/** Compact health strip for Deal Detail — paired with `detectDealIssues`. */
export function DealHealthSummary({ detection, className, compact = false }: DealHealthSummaryProps) {
  const { health, issueCount, overdueCount, awaitingSignatureCount } = detection;

  const badgeClass = healthChipClasses[health];

  const label = {
    'on-track': 'On Track',
    'needs-attention': 'Needs Attention',
    'at-risk': 'At Risk',
  }[health];

  return (
    <div className={cn('mt-3 border-t border-border-subtle pt-3', compact && 'mt-2 pt-2', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-y-2 text-text-secondary',
          compact ? 'gap-x-3 gap-y-1 text-xs' : 'gap-x-4 gap-y-2 text-sm',
        )}
      >
        <span
          className={cn(
            'inline-flex items-center rounded-md font-semibold',
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
            badgeClass,
          )}
        >
          {label}
        </span>
        <span>
          <span className="font-medium text-text-primary">{issueCount}</span>{' '}
          issue{issueCount === 1 ? '' : 's'} detected
        </span>
        <span className="hidden text-text-muted sm:inline">·</span>
        <span>
          <span className="font-medium text-text-primary">{awaitingSignatureCount}</span> awaiting signature
        </span>
        <span className="hidden text-text-muted sm:inline">·</span>
        <span>
          <span className="font-medium text-text-primary">{overdueCount}</span> overdue
        </span>
      </div>
      {detection.closingRisk !== 'none' && (
        <p
          className={cn(
            'rounded-md border border-border-subtle bg-accent-amber-soft text-xs text-text-primary',
            compact ? 'mt-1.5 px-2.5 py-1.5' : 'mt-2 px-3 py-2',
          )}
        >
          {detection.closingRisk === 'severe'
            ? 'Closing soon — clear overdue work and signatures first.'
            : 'Closing approaching — review open documents and tasks.'}
        </p>
      )}
    </div>
  );
}
