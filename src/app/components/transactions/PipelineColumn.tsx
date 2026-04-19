import { Deal, DocumentItem, Message, Task } from '../../types';
import { PipelineDealCard } from './PipelineDealCard';
import { detectDealIssues } from '../../utils/dealIssueDetection';
import { getPipelineColumnSignal, type PipelineColumnSignalKind } from '../../utils/pipelineBoardSignals';
import { cn } from '../ui/utils';

interface PipelineColumnProps {
  label: string;
  deals: Deal[];
  tasks: Task[];
  documents: DocumentItem[];
  messages: Message[];
  onDealClick: (dealId: string) => void;
}

type PriorityGroup = 'at-risk' | 'needs-attention' | 'on-track';

const SIGNAL_LINE_CLASS: Record<PipelineColumnSignalKind, string> = {
  'at-risk': 'font-medium text-red-600 dark:text-red-400/95',
  stalled: 'font-medium text-amber-800 dark:text-amber-200/90',
  'closing-soon': 'font-medium text-teal-800 dark:text-teal-100/90',
  'on-track': 'text-text-muted',
  'no-deals': 'text-text-muted/80',
};

export function PipelineColumn({ label, deals, tasks, documents, messages, onDealClick }: PipelineColumnProps) {
  const categorizeDeals = () => {
    const categories: Record<PriorityGroup, Deal[]> = {
      'at-risk': [],
      'needs-attention': [],
      'on-track': [],
    };

    deals.forEach((deal) => {
      const dealTasks = tasks.filter((t) => t.dealId === deal.id);
      const dealDocuments = documents.filter((d) => d.dealId === deal.id);
      const { health } = detectDealIssues(deal, dealTasks, dealDocuments);
      categories[health].push(deal);
    });

    return categories;
  };

  const categorizedDeals = categorizeDeals();
  const columnSignal = getPipelineColumnSignal(deals, tasks, documents, messages);

  return (
    <div className="flex w-[320px] shrink-0 flex-col">
      {/* Header: title + count + single reserved status row (same height in every column) */}
      <div className="mb-4 flex min-h-[72px] flex-col justify-end">
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <h3 className="font-semibold text-text-primary">{label}</h3>
          <span className="rounded-full border border-border-subtle bg-bg-elevated/60 px-2 py-0.5 text-xs font-medium text-text-muted">
            {deals.length}
          </span>
        </div>
        <div
          className={cn(
            'flex h-[24px] shrink-0 items-center overflow-hidden text-xs leading-tight',
            SIGNAL_LINE_CLASS[columnSignal.kind],
          )}
        >
          <span className="line-clamp-1">{columnSignal.line}</span>
        </div>
      </div>

      {deals.length === 0 ? (
        <div
          className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-bg-surface/40 px-3 text-center"
          aria-label="Empty stage"
        >
          <span className="text-sm text-text-muted/50">—</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {categorizedDeals['at-risk'].length > 0 ? (
            <div className="space-y-3">
              {categorizedDeals['at-risk'].map((deal) => (
                <PipelineDealCard
                  key={deal.id}
                  deal={deal}
                  tasks={tasks.filter((t) => t.dealId === deal.id)}
                  documents={documents.filter((d) => d.dealId === deal.id)}
                  messages={messages}
                  onClick={() => onDealClick(deal.id)}
                />
              ))}
            </div>
          ) : null}

          {categorizedDeals['needs-attention'].length > 0 ? (
            <div className="space-y-3">
              {categorizedDeals['needs-attention'].map((deal) => (
                <PipelineDealCard
                  key={deal.id}
                  deal={deal}
                  tasks={tasks.filter((t) => t.dealId === deal.id)}
                  documents={documents.filter((d) => d.dealId === deal.id)}
                  messages={messages}
                  onClick={() => onDealClick(deal.id)}
                />
              ))}
            </div>
          ) : null}

          {categorizedDeals['on-track'].length > 0 ? (
            <div className="space-y-3">
              {categorizedDeals['on-track'].map((deal) => (
                <PipelineDealCard
                  key={deal.id}
                  deal={deal}
                  tasks={tasks.filter((t) => t.dealId === deal.id)}
                  documents={documents.filter((d) => d.dealId === deal.id)}
                  messages={messages}
                  onClick={() => onDealClick(deal.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
