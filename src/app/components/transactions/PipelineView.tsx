import { Deal, DealPipelineStage, DocumentItem, Message, Task } from '../../types';
import { PipelineColumn } from './PipelineColumn';

interface PipelineViewProps {
  deals: Deal[];
  tasks: Task[];
  documents: DocumentItem[];
  messages: Message[];
  onDealClick: (dealId: string) => void;
}

/** Alias for `DealPipelineStage` — used by `PipelineColumn`. */
export type DealStage = DealPipelineStage;

export function PipelineView({ deals, tasks, documents, messages, onDealClick }: PipelineViewProps) {
  const stages: { id: DealPipelineStage; label: string }[] = [
    { id: 'under-contract', label: 'Under Contract' },
    { id: 'due-diligence', label: 'Due Diligence' },
    { id: 'financing', label: 'Financing' },
    { id: 'pre-closing', label: 'Pre-Closing' },
    { id: 'closing', label: 'Closing' },
  ];

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((deal) => deal.pipelineStage === stage.id);
    return acc;
  }, {} as Record<DealPipelineStage, Deal[]>);

  return (
    <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-lg border border-border-subtle bg-bg-app pb-4 pt-4 [-webkit-overflow-scrolling:touch]">
      <div className="flex min-w-max gap-4 px-1 pb-2 pt-1">
        {stages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            label={stage.label}
            deals={dealsByStage[stage.id]}
            tasks={tasks}
            documents={documents}
            messages={messages}
            onDealClick={onDealClick}
          />
        ))}
      </div>
    </div>
  );
}
