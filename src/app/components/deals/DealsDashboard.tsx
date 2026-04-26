import { useMemo, useState, useCallback } from 'react';
import { Deal, DocumentItem, Message, Task } from '../../types';
import { DealCard } from './DealCard';
import { DashboardAttention } from './DashboardAttention';
import { FocusTodaySection } from './FocusTodaySection';
import { getDashboardAttentionItems } from '../../utils/dashboardAttention';
import {
  type DashboardDealTab,
  dealsForDashboardTab,
  excludeArchivedDeals,
} from '../../utils/dealLifecycle';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/button';
import {
  computeMissionControlFocusCounts,
  findFirstDealIdForMissionControlFocus,
  type MissionControlFocusKind,
} from '../../utils/workspaceInsights';

interface DealsDashboardProps {
  /** When true, list data is not ready — show loading instead of empty stats. */
  workspaceLoading?: boolean;
  deals: Deal[];
  tasks: Task[];
  messages: Message[];
  documents: DocumentItem[];
  onSelectDeal: (dealId: string) => void;
  /** Opens quick-create transaction modal. */
  onStartNewClosing: () => void;
  /** Opens create flow for MLS-assisted import (`/deals/new`). */
  onImportFromMls?: () => void;
  /** Convex read-only mode — creation is not persisted yet */
  createDealDisabled?: boolean;
  /** Persist archive flag (Convex) or mock state — omit to hide archive actions. */
  onSetDealArchived?: (dealId: string, archived: boolean) => void;
}

function formatOverviewLine(tab: DashboardDealTab, deals: Deal[]): string | null {
  if (deals.length === 0) return null;
  if (tab === 'active') {
    const onTrack = deals.filter((d) => d.status === 'active').length;
    const atRisky = deals.filter((d) => d.status === 'at-risk' || d.status === 'overdue').length;
    return `${deals.length} active · ${onTrack} on track · ${atRisky} at risk`;
  }
  if (tab === 'completed') {
    return `${deals.length} completed`;
  }
  return `${deals.length} archived`;
}

export function DealsDashboard({
  workspaceLoading = false,
  deals,
  tasks,
  messages,
  documents,
  onSelectDeal,
  onStartNewClosing,
  onImportFromMls,
  createDealDisabled = false,
  onSetDealArchived,
}: DealsDashboardProps) {
  const [dashboardTab, setDashboardTab] = useState<DashboardDealTab>('active');
  const showBackendLoadingGate = workspaceLoading && shouldUseConvexWorkspaceReads();

  const hasClosings = deals.length > 0;

  const visibleDeals = useMemo(
    () => dealsForDashboardTab(deals, dashboardTab),
    [deals, dashboardTab],
  );

  const activePipelineDeals = useMemo(() => dealsForDashboardTab(deals, 'active'), [deals]);

  const dealsForAttention = useMemo(() => excludeArchivedDeals(deals), [deals]);
  const attentionItems = useMemo(
    () =>
      dashboardTab === 'active'
        ? getDashboardAttentionItems(dealsForAttention, tasks, documents, { messages })
        : [],
    [dashboardTab, dealsForAttention, tasks, documents, messages],
  );

  const missionFocusCounts = useMemo(
    () =>
      dashboardTab === 'active'
        ? computeMissionControlFocusCounts(activePipelineDeals, tasks, documents, messages)
        : { closingsAtRisk: 0, closingsStalled: 0, closingsReady: 0 },
    [dashboardTab, activePipelineDeals, tasks, documents, messages],
  );

  const handleMissionFocusAction = useCallback(
    (kind: MissionControlFocusKind) => {
      const id = findFirstDealIdForMissionControlFocus(
        kind,
        activePipelineDeals,
        tasks,
        documents,
        messages,
      );
      if (id) onSelectDeal(id);
    },
    [activePipelineDeals, tasks, documents, messages, onSelectDeal],
  );

  const getTasksForDeal = (dealId: string) => tasks.filter((task) => task.dealId === dealId);

  const tabButtons: { id: DashboardDealTab; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'archived', label: 'Archived' },
  ];

  const emptyCopy = (): { title: string; description: string; showCreate: boolean } => {
    if (deals.length === 0) {
      return {
        title: 'Close your home with confidence',
        description: 'Track documents, tasks, and deadlines to close on time.',
        showCreate: true,
      };
    }
    switch (dashboardTab) {
      case 'active':
        return {
          title: 'No active transactions',
          description:
            'Completed closings appear here when marked complete; archived transactions stay out of this list.',
          showCreate: true,
        };
      case 'completed':
        return {
          title: 'No completed closings yet',
          description: 'When a transaction reaches a closed state, it appears in this list.',
          showCreate: false,
        };
      case 'archived':
        return {
          title: 'Nothing archived',
          description: 'Archive hides a transaction from active lists without deleting it.',
          showCreate: false,
        };
      default:
        return { title: 'No transactions', description: '', showCreate: false };
    }
  };

  const empty = emptyCopy();
  const overviewLine = formatOverviewLine(dashboardTab, visibleDeals);

  const headerActions = hasClosings ? (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      {onImportFromMls ? (
        <Button
          type="button"
          variant="outline"
          onClick={onImportFromMls}
          disabled={createDealDisabled || showBackendLoadingGate}
          className="min-h-10 w-full shrink-0 sm:w-auto"
          title={
            createDealDisabled ? 'Creating a transaction is disabled while the workspace is read-only.' : undefined
          }
        >
          Import from MLS
        </Button>
      ) : null}
      <Button
        type="button"
        variant="accent"
        onClick={onStartNewClosing}
        disabled={createDealDisabled || showBackendLoadingGate}
        title={
          createDealDisabled ? 'Creating a transaction is disabled while the workspace is read-only.' : undefined
        }
        className="min-h-10 w-full shrink-0 sm:w-auto"
      >
        Start new closing
      </Button>
    </div>
  ) : (
    <Button
      type="button"
      variant="accent"
      onClick={onStartNewClosing}
      disabled={createDealDisabled || showBackendLoadingGate}
      title={
        createDealDisabled ? 'Creating a transaction is disabled while the workspace is read-only.' : undefined
      }
      className="min-h-10 w-full shrink-0 sm:w-auto"
    >
      Start new closing
    </Button>
  );

  /** Zero transactions — calm hero + single path forward (no tabs or stats). */
  if (!showBackendLoadingGate && !hasClosings) {
    return (
      <PageContainer>
        <PageHeader
          title="Mission control"
          description="A clear view of what needs you today — and what can wait."
          actions={headerActions}
        />

        <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-border-subtle bg-bg-surface px-8 py-14 text-center shadow-sm dark:bg-bg-elevated/50 dark:shadow-none sm:px-10 sm:py-16">
          <h2 className="text-pretty text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Close your home with confidence
          </h2>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-text-secondary">
            Track documents, tasks, and deadlines to close on time.
          </p>
          <ul className="mt-8 w-full max-w-xs space-y-2.5 text-left text-sm text-text-secondary">
            {(['Documents', 'Closing steps', 'Deadlines'] as const).map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="font-medium text-accent-blue" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="accent"
            className="mt-10 w-full max-w-xs min-h-10"
            onClick={onStartNewClosing}
            disabled={createDealDisabled}
            title={
              createDealDisabled ? 'Creating a transaction is disabled while the workspace is read-only.' : undefined
            }
          >
            Start new closing
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mission control"
        description="What to do next across your closings."
        actions={headerActions}
      />

      {!showBackendLoadingGate && dashboardTab === 'active' && activePipelineDeals.length > 0 ? (
        <FocusTodaySection counts={missionFocusCounts} onMissionAction={handleMissionFocusAction} className="mb-8" />
      ) : null}

      <div
        className="mb-6 flex w-full max-w-full rounded-lg border border-border-subtle bg-bg-surface p-1 shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:inline-flex sm:w-auto"
        role="tablist"
        aria-label="Transaction lifecycle"
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
          <p className="font-medium text-text-primary">Loading your dashboard…</p>
          <p className="mt-2 text-sm text-text-muted">Fetching your transactions.</p>
        </div>
      ) : (
        <>
          <DashboardAttention items={attentionItems} onSelectDeal={onSelectDeal} />

          {overviewLine ? (
            <p className="mb-6 text-sm font-medium tabular-nums text-text-secondary">{overviewLine}</p>
          ) : null}

          {visibleDeals.length > 0 ? (
            <div className="mb-2">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Your closings</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    tasks={getTasksForDeal(deal.id)}
                    documents={documents}
                    messages={messages}
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
                  onClick={onStartNewClosing}
                  disabled={createDealDisabled}
                  className="min-h-10"
                  title={
                    createDealDisabled
                      ? 'Creating a transaction is disabled while the workspace is read-only'
                      : undefined
                  }
                >
                  Start new closing
                </Button>
              ) : null}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
