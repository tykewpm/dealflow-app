import { useMemo, useState } from 'react';
import { Deal, DocumentItem, Message, Task } from '../../types';
import { DealCard } from './DealCard';
import { DashboardAttention } from './DashboardAttention';
import { getDashboardAttentionItems } from '../../utils/dashboardAttention';
import {
  type DashboardDealTab,
  dealsForDashboardTab,
  excludeArchivedDeals,
} from '../../utils/dealLifecycle';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { StatCardGrid } from '../layout/StatCardGrid';
import { Button } from '../ui/button';
import { computeFocusTodayInsights } from '../../utils/workspaceInsights';
import { FocusTodayStrip } from './FocusTodayStrip';

interface DealsDashboardProps {
  /** When true, list data is not ready — show loading instead of empty stats. */
  workspaceLoading?: boolean;
  deals: Deal[];
  tasks: Task[];
  messages: Message[];
  documents: DocumentItem[];
  onSelectDeal: (dealId: string) => void;
  onCreateDeal: () => void;
  /** Convex read-only mode — creation is not persisted yet */
  createDealDisabled?: boolean;
  /** Persist archive flag (Convex) or mock state — omit to hide archive actions. */
  onSetDealArchived?: (dealId: string, archived: boolean) => void;
}

export function DealsDashboard({
  workspaceLoading = false,
  deals,
  tasks,
  messages,
  documents,
  onSelectDeal,
  onCreateDeal,
  createDealDisabled = false,
  onSetDealArchived,
}: DealsDashboardProps) {
  const [dashboardTab, setDashboardTab] = useState<DashboardDealTab>('active');
  const showBackendLoadingGate = workspaceLoading && shouldUseConvexWorkspaceReads();

  const visibleDeals = useMemo(
    () => dealsForDashboardTab(deals, dashboardTab),
    [deals, dashboardTab],
  );

  const dealsForAttention = useMemo(() => excludeArchivedDeals(deals), [deals]);
  const attentionItems = useMemo(
    () =>
      dashboardTab === 'active'
        ? getDashboardAttentionItems(dealsForAttention, tasks, documents, { messages })
        : [],
    [dashboardTab, dealsForAttention, tasks, documents],
  );

  const focusTodayInsights = useMemo(() => {
    if (dashboardTab !== 'active') return null;
    const active = dealsForDashboardTab(deals, 'active');
    return computeFocusTodayInsights(active, tasks, documents, messages);
  }, [dashboardTab, deals, tasks, documents, messages]);

  const getTasksForDeal = (dealId: string) => {
    return tasks.filter((task) => task.dealId === dealId);
  };

  const tabButtons: { id: DashboardDealTab; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'archived', label: 'Archived' },
  ];

  const emptyCopy = (): { title: string; description: string; showCreate: boolean } => {
    if (deals.length === 0) {
      return {
        title: 'No deals yet',
        description: 'Get started by creating your first deal.',
        showCreate: true,
      };
    }
    switch (dashboardTab) {
      case 'active':
        return {
          title: 'No open deals',
          description:
            'Closed transactions appear under Completed; removed-from-view deals appear under Archived.',
          showCreate: true,
        };
      case 'completed':
        return {
          title: 'No closed deals',
          description: 'When a deal’s health status is Closed (transaction complete), it appears here.',
          showCreate: false,
        };
      case 'archived':
        return {
          title: 'Nothing archived',
          description: 'Archive hides a deal from Active and Completed without deleting it.',
          showCreate: false,
        };
      default:
        return { title: 'No deals', description: '', showCreate: false };
    }
  };

  const empty = emptyCopy();

  const newDealButton = (
    <Button
      type="button"
      variant="accent"
      onClick={onCreateDeal}
      disabled={createDealDisabled || showBackendLoadingGate}
      title={
        createDealDisabled ? 'Create deal is disabled while Convex workspace is read-only' : undefined
      }
      className="w-full shrink-0 sm:w-auto"
    >
      + New Deal
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Open pipeline, closed transactions, and archived deals — archive keeps history without cluttering your main lists."
        actions={newDealButton}
      />

      {!showBackendLoadingGate && focusTodayInsights && focusTodayInsights.length > 0 ? (
        <FocusTodayStrip insights={focusTodayInsights} />
      ) : null}

      {/* Lifecycle tabs — equal-width cells on narrow viewports, compact pill from sm */}
      <div
        className="mb-6 flex w-full max-w-full rounded-lg border border-border-subtle bg-bg-surface p-1 shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:inline-flex sm:w-auto"
        role="tablist"
        aria-label="Deal lifecycle"
      >
        {tabButtons.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={dashboardTab === id}
            onClick={() => setDashboardTab(id)}
            className={`min-w-0 flex-1 rounded-md px-2 py-2 text-sm font-medium transition-[color,background-color,border-color] duration-150 ease-out sm:flex-none sm:px-4 ${
              dashboardTab === id
                ? 'bg-accent-blue-soft text-text-primary ring-1 ring-border-strong/60 dark:ring-accent-blue/20'
                : 'text-text-muted hover:bg-bg-elevated/80 hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showBackendLoadingGate ? (
        <div
          className="rounded-lg border border-border-subtle bg-bg-surface p-10 text-center shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:p-12"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-text-primary">Loading workspace…</p>
          <p className="mt-2 text-sm text-text-muted">Fetching deals from the server.</p>
        </div>
      ) : (
        <>
          <DashboardAttention items={attentionItems} onSelectDeal={onSelectDeal} />

          <StatCardGrid>
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none sm:p-5">
              <div className="mb-1.5 text-sm text-text-muted">In this view</div>
              <div className="font-semibold text-text-primary tabular-nums">{visibleDeals.length}</div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none sm:p-5">
              <div className="mb-1.5 text-sm text-text-muted">On track</div>
              <div className="font-semibold tabular-nums text-accent-blue">
                {visibleDeals.filter((d) => d.status === 'active').length}
              </div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none sm:p-5">
              <div className="mb-1.5 text-sm text-text-muted">At risk</div>
              <div className="font-semibold tabular-nums text-accent-amber">
                {visibleDeals.filter((d) => d.status === 'at-risk').length}
              </div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none sm:p-5">
              <div className="mb-1.5 text-sm text-text-muted">Closed</div>
              <div className="font-semibold tabular-nums text-accent-green">
                {visibleDeals.filter((d) => d.status === 'complete').length}
              </div>
            </div>
          </StatCardGrid>

          {visibleDeals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  tasks={getTasksForDeal(deal.id)}
                  onClick={() => onSelectDeal(deal.id)}
                  archiveVariant={dashboardTab === 'archived' ? 'restore' : 'archive'}
                  onArchiveAction={
                    onSetDealArchived
                      ? () => onSetDealArchived(deal.id, dashboardTab === 'archived' ? false : true)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center sm:py-20">
              <div className="mb-4 text-text-muted/40">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-text-primary">{empty.title}</h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-text-muted">{empty.description}</p>
              {empty.showCreate ? (
                <Button
                  type="button"
                  variant="accent"
                  onClick={onCreateDeal}
                  disabled={createDealDisabled}
                  title={
                    createDealDisabled
                      ? 'Create deal is disabled while Convex workspace is read-only'
                      : undefined
                  }
                >
                  Create Deal
                </Button>
              ) : null}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
