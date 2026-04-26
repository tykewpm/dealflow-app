import { Deal, DocumentItem, Message, Task } from '../../types';
import { DealStatusBadge } from '../shared/DealStatusBadge';
import { formatDate } from '../../utils/dealUtils';
import { computeDealNextAction } from '../../utils/dealNextActionEngine';
import { pipelineStageDisplayLabel } from '../../utils/pipelineStageLabels';

interface DealCardProps {
  deal: Deal;
  tasks: Task[];
  /** For next-best-step; defaults to empty when omitted. */
  documents?: DocumentItem[];
  messages?: Message[];
  onClick: () => void;
  /** Archive vs restore — footer action; omit to hide lifecycle controls. */
  archiveVariant?: 'archive' | 'restore';
  onArchiveAction?: () => void;
}

export function DealCard({
  deal,
  tasks,
  documents = [],
  messages = [],
  onClick,
  archiveVariant = 'archive',
  onArchiveAction,
}: DealCardProps) {
  const dealDocs = documents.filter((d) => d.dealId === deal.id);
  const next = computeDealNextAction(deal, tasks, dealDocs, messages);
  const phaseLabel = pipelineStageDisplayLabel(deal.pipelineStage);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/30 dark:shadow-none sm:p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug text-text-primary">{deal.propertyAddress}</h3>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="shrink-0 text-text-muted">Closing</dt>
          <dd className="truncate font-medium text-text-primary">{formatDate(deal.closingDate)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="shrink-0 text-text-muted">Phase</dt>
          <dd className="truncate text-right font-medium text-text-primary">{phaseLabel}</dd>
        </div>
        <div className="border-t border-border-subtle pt-2">
          <dt className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Next step</dt>
          <dd className="line-clamp-2 text-sm leading-snug text-text-secondary">{next.title}</dd>
        </div>
      </dl>

      {onArchiveAction ? (
        <div
          className="mt-4 flex justify-end border-t border-border-subtle pt-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
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
