import { useMemo, useState } from 'react';
import { Deal, DocumentItem, Message, Task } from '../../types';
import { SummaryStats } from './SummaryStats';
import { NeedsAttention } from './NeedsAttention';
import { TransactionsFilters } from './TransactionsFilters';
import { TransactionsTable } from './TransactionsTable';
import { PipelineView } from './PipelineView';
import { LayoutGrid, List } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/button';
import { excludeArchivedDeals } from '../../utils/dealLifecycle';
import { computeTransactionsAttentionInsights } from '../../utils/workspaceInsights';
import { FocusTodayStrip } from '../deals/FocusTodayStrip';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { useWorkspaceGo } from '../../context/WorkspaceLinkBaseContext';

interface TransactionsPageProps {
  workspaceLoading?: boolean;
  deals: Deal[];
  tasks: Task[];
  messages: Message[];
  documents: DocumentItem[];
  onCreateDeal: () => void;
  createDealDisabled?: boolean;
}

type ViewMode = 'table' | 'pipeline';

export function TransactionsPage({
  workspaceLoading = false,
  deals,
  tasks,
  messages,
  documents,
  onCreateDeal,
  createDealDisabled = false,
}: TransactionsPageProps) {
  const go = useWorkspaceGo();
  const showBackendLoadingGate = workspaceLoading && shouldUseConvexWorkspaceReads();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const openPipelineDeals = useMemo(() => excludeArchivedDeals(deals), [deals]);

  const filteredDeals = useMemo(
    () =>
      openPipelineDeals.filter((deal) => {
        const matchesSearch =
          deal.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
        const matchesStage = stageFilter === 'all' || deal.pipelineStage === stageFilter;

        return matchesSearch && matchesStatus && matchesStage;
      }),
    [openPipelineDeals, searchQuery, statusFilter, stageFilter],
  );

  const transactionsAttentionInsights = useMemo(
    () => computeTransactionsAttentionInsights(filteredDeals, tasks, documents, messages),
    [filteredDeals, tasks, documents, messages],
  );

  const handleDealClick = (dealId: string) => {
    go(`/deals/${dealId}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="Manage and track all deals across your pipeline"
        actions={
          <div className="flex w-full min-w-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <div className="flex w-full min-w-0 rounded-lg border border-border-subtle bg-bg-surface p-1 shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:w-auto sm:shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex min-h-[40px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color] duration-150 ease-out sm:flex-none sm:py-1.5 ${
                  viewMode === 'table'
                    ? 'bg-accent-blue-soft text-text-primary ring-1 ring-border-strong/50 dark:ring-accent-blue/20'
                    : 'text-text-muted hover:bg-bg-elevated/80 hover:text-text-primary'
                }`}
              >
                <List size={16} aria-hidden />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pipeline')}
                className={`flex min-h-[40px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color] duration-150 ease-out sm:flex-none sm:py-1.5 ${
                  viewMode === 'pipeline'
                    ? 'bg-accent-blue-soft text-text-primary ring-1 ring-border-strong/50 dark:ring-accent-blue/20'
                    : 'text-text-muted hover:bg-bg-elevated/80 hover:text-text-primary'
                }`}
              >
                <LayoutGrid size={16} aria-hidden />
                Pipeline
              </button>
            </div>

            <Button
              type="button"
              variant="accent"
              onClick={onCreateDeal}
              disabled={createDealDisabled || showBackendLoadingGate}
              title={
                createDealDisabled
                  ? 'Create deal is disabled while Convex workspace is read-only'
                  : undefined
              }
              className="w-full shrink-0 touch-manipulation sm:w-auto"
            >
              + New Deal
            </Button>
          </div>
        }
      />

      {showBackendLoadingGate ? (
        <div
          className="mb-8 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:p-12"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-text-primary">Loading transactions…</p>
          <p className="mt-2 text-sm text-text-muted">Fetching workspace data from the server.</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <SummaryStats deals={openPipelineDeals} tasks={tasks} />

          {/* Needs Attention - Only show in table view */}
          {viewMode === 'table' && (
            <NeedsAttention deals={openPipelineDeals} tasks={tasks} onViewDeal={handleDealClick} />
          )}

          {/* Filters - Only show in table view */}
          {viewMode === 'table' && (
            <TransactionsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              stageFilter={stageFilter}
              onStageFilterChange={setStageFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              agentFilter={agentFilter}
              onAgentFilterChange={setAgentFilter}
            />
          )}

          <FocusTodayStrip
            insights={transactionsAttentionInsights}
            heading="Needs attention"
            ariaLabel="Transactions attention"
          />

          {/* Content - Table or Pipeline */}
          {viewMode === 'table' ? (
            <TransactionsTable
              deals={filteredDeals}
              tasks={tasks}
              documents={documents}
              messages={messages}
              onDealClick={handleDealClick}
            />
          ) : (
            <PipelineView
              deals={filteredDeals}
              tasks={tasks}
              documents={documents}
              messages={messages}
              onDealClick={handleDealClick}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
