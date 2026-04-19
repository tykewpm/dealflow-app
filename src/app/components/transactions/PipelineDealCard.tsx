import { Deal, DocumentItem, Message, Task } from '../../types';
import { calculateProgress, formatDate } from '../../utils/dealUtils';
import { computeDealNextAction } from '../../utils/dealNextActionEngine';
import { nextActionAccentDotClass } from '../../utils/nextActionDisplay';
import { getPipelineCardScanModel, type PipelineCardPrimaryKind } from '../../utils/pipelineBoardSignals';
import { cn } from '../ui/utils';
import { AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface PipelineDealCardProps {
  deal: Deal;
  tasks: Task[];
  documents: DocumentItem[];
  messages: Message[];
  onClick: () => void;
}

function primaryIcon(kind: PipelineCardPrimaryKind) {
  switch (kind) {
    case 'at-risk':
      return AlertCircle;
    case 'stalled':
    case 'needs-attention':
      return Clock;
    case 'closing-soon':
      return Calendar;
    default:
      return CheckCircle2;
  }
}

export function PipelineDealCard({ deal, tasks, documents, messages, onClick }: PipelineDealCardProps) {
  const progress = calculateProgress(tasks);
  const nextAction = computeDealNextAction(deal, tasks, documents, messages);
  const scan = getPipelineCardScanModel(deal, tasks, documents, messages);
  const PrimaryIcon = primaryIcon(scan.primaryKind);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-h-[280px] w-full cursor-pointer flex-col rounded-lg p-4 text-left transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:shadow-sm dark:shadow-none',
        scan.surfaceClassName,
      )}
    >
      <div className="flex min-h-[56px] shrink-0 flex-col justify-start">
        <h4 className="mb-1 line-clamp-1 font-semibold text-text-primary">{deal.propertyAddress}</h4>
        <p className="line-clamp-1 text-sm text-text-secondary">{deal.buyerName}</p>
      </div>

      {/* One primary status chip + optional supporting detail */}
      <div className="mt-3 flex min-h-[40px] shrink-0 flex-col gap-1" data-pipeline-primary={scan.primaryKind}>
        <div className={cn('inline-flex w-fit max-w-full items-center gap-1.5 rounded-md', scan.chipClassName)}>
          <PrimaryIcon size={14} className="shrink-0 opacity-90" aria-hidden />
          <span className="truncate">{scan.chipLabel}</span>
        </div>
        {scan.supportingText ? (
          <p className="text-[11px] leading-snug text-text-muted">{scan.supportingText}</p>
        ) : null}
      </div>

      {/* “What matters now” — next action block */}
      <div className="mt-3 flex min-h-[72px] shrink-0 flex-col justify-start">
        <div
          className="flex min-w-0 items-start gap-2 rounded-md border border-border-subtle bg-bg-elevated/40 p-2.5 dark:bg-bg-elevated/25"
          data-next-action-rule={nextAction.ruleKey}
        >
          <div
            className={cn(
              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
              nextActionAccentDotClass(nextAction.severity),
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <span className="block line-clamp-2 text-sm font-medium text-text-primary" title={nextAction.title}>
              {nextAction.title}
            </span>
            {nextAction.subtitle ? (
              <span className="mt-0.5 block line-clamp-1 text-xs text-text-muted" title={nextAction.subtitle}>
                {nextAction.subtitle}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {scan.positiveContextLine ? (
        <p className="mt-2 text-xs font-medium leading-snug text-teal-800/90 dark:text-teal-200/85">
          {scan.positiveContextLine}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 shrink" aria-hidden />

      <div className="mt-3 flex min-h-[48px] shrink-0 flex-col justify-end gap-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
            <span>Progress</span>
            <span className="font-medium tabular-nums text-text-secondary">{progress}%</span>
          </div>
          <div
            className={cn(
              'w-full overflow-hidden rounded-full',
              scan.progressBarHeightClass,
              scan.progressTrackClass,
            )}
          >
            <div className={cn('h-full rounded-full transition-all', scan.progressFillClass)} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar size={12} aria-hidden />
          <span>Closes {formatDate(deal.closingDate)}</span>
        </div>
      </div>
    </button>
  );
}
