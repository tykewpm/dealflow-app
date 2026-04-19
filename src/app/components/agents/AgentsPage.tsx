import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Shield, Users, Briefcase, AlertCircle, Target } from 'lucide-react';
import type { Deal, DocumentItem, Task, User } from '../../types';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import {
  buildUserWorkloadDetail,
  countWorkspaceDealsAtRiskHealth,
  deriveAllUserWorkloads,
  listUnassignedOpenTasks,
  totalsAssignedIncomplete,
  type UserWorkloadDetail,
  type UserWorkloadRow,
} from '../../utils/agentWorkloadDerivation';
import { formatDate, formatRelativeDate } from '../../utils/dealUtils';
import { excludeArchivedDeals } from '../../utils/dealLifecycle';
import { useWorkspaceRelativeHref } from '../../context/WorkspaceLinkBaseContext';
import { TaskStatusBadge } from '../shared/TaskStatusBadge';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { StatCardGrid } from '../layout/StatCardGrid';
import { BlockingSection } from './BlockingSection';
import { AgentsTable } from './AgentsTable';
import { AgentDetailPanel } from './AgentDetailPanel';
import { Button } from '../ui/button';

const ASSIGN_FEEDBACK_MS = 1600;

export interface AgentsPageProps {
  deals: Deal[];
  tasks: Task[];
  documents: DocumentItem[];
  users: User[];
  workspaceLoading?: boolean;
  /** Inline assignee control for Unassigned open tasks (mock state or Convex mutation). */
  onWorkloadTaskAssigneeChange: (taskId: string, assigneeId: string | null) => void;
}

export function AgentsPage({
  deals,
  tasks,
  documents,
  users,
  workspaceLoading = false,
  onWorkloadTaskAssigneeChange,
}: AgentsPageProps) {
  const dealHref = useWorkspaceRelativeHref();
  const [selectedDetail, setSelectedDetail] = useState<UserWorkloadDetail | null>(null);
  /** Brief row highlight + drawer “Saved”; keys cleared after {@link ASSIGN_FEEDBACK_MS}. */
  const [taskAssigneeFeedback, setTaskAssigneeFeedback] = useState<Record<string, boolean>>({});
  /** Ephemeral line under Unassigned section header when assigning from that list. */
  const [unassignedAssignHint, setUnassignedAssignHint] = useState<string | null>(null);
  const useConvex = shouldUseConvexWorkspaceReads();

  const workloadDeals = useMemo(() => excludeArchivedDeals(deals), [deals]);

  const rows = useMemo(
    () => deriveAllUserWorkloads(users, workloadDeals, tasks, documents),
    [users, workloadDeals, tasks, documents],
  );

  const workspaceAtRiskDeals = useMemo(
    () => countWorkspaceDealsAtRiskHealth(workloadDeals, tasks, documents),
    [workloadDeals, tasks, documents],
  );

  const assignedTotals = useMemo(() => totalsAssignedIncomplete(tasks, workloadDeals), [tasks, workloadDeals]);

  const unassignedItems = useMemo(
    () => listUnassignedOpenTasks(workloadDeals, tasks),
    [workloadDeals, tasks],
  );
  const unassignedOpen = unassignedItems.length;

  const handleSelectRow = (row: UserWorkloadRow) => {
    setSelectedDetail(buildUserWorkloadDetail(row, workloadDeals, tasks, documents));
  };

  const flashTaskFeedback = useCallback((taskId: string) => {
    setTaskAssigneeFeedback((f) => ({ ...f, [taskId]: true }));
    window.setTimeout(() => {
      setTaskAssigneeFeedback((f) => {
        const next = { ...f };
        delete next[taskId];
        return next;
      });
    }, ASSIGN_FEEDBACK_MS);
  }, []);

  const handleDrawerAssigneeChange = useCallback(
    (taskId: string, assigneeId: string | null) => {
      flashTaskFeedback(taskId);
      onWorkloadTaskAssigneeChange(taskId, assigneeId);
    },
    [flashTaskFeedback, onWorkloadTaskAssigneeChange],
  );

  const handleUnassignedAssigneeChange = useCallback(
    (taskId: string, assigneeId: string | null) => {
      if (assigneeId) {
        const name = users.find((u) => u.id === assigneeId)?.name ?? 'Teammate';
        setUnassignedAssignHint(`Assigned to ${name}`);
        window.setTimeout(() => setUnassignedAssignHint(null), ASSIGN_FEEDBACK_MS);
      }
      flashTaskFeedback(taskId);
      onWorkloadTaskAssigneeChange(taskId, assigneeId);
    },
    [users, flashTaskFeedback, onWorkloadTaskAssigneeChange],
  );

  /** Keep drawer task lists and summary stats in sync after assignee updates (mock or Convex snapshot). */
  useEffect(() => {
    setSelectedDetail((prev) => {
      if (!prev) return prev;
      const freshRows = deriveAllUserWorkloads(users, workloadDeals, tasks, documents);
      const freshRow = freshRows.find((r) => r.userId === prev.row.userId);
      if (!freshRow) return null;
      return buildUserWorkloadDetail(freshRow, workloadDeals, tasks, documents);
    });
  }, [workloadDeals, tasks, documents, users]);

  const showWorkspaceLoading = workspaceLoading && useConvex;

  return (
    <PageContainer>
      <PageHeader
        title="Team workload"
        description="Live view of tasks and deals by assignee — derived from your workspace (read-only). Invites and roles are not available yet."
        actions={
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled
              title="Coming soon"
              className="flex min-h-[40px] w-full items-center justify-center gap-2 sm:w-auto sm:py-2"
            >
              <Shield size={16} aria-hidden />
              Manage roles
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled
              title="Coming soon"
              className="flex min-h-[40px] w-full items-center justify-center gap-2 sm:w-auto sm:py-2"
            >
              <UserPlus size={16} aria-hidden />
              Invite teammate
            </Button>
          </div>
        }
      />

        {showWorkspaceLoading ? (
          <div
            className="mb-8 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center shadow-sm dark:shadow-none sm:p-12"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-text-primary">Loading workspace…</p>
            <p className="mt-2 text-sm text-text-muted">
              Syncing people, deals, and tasks — numbers below update once ready.
            </p>
          </div>
        ) : (
          <>
            {unassignedOpen > 0 ? (
              <div
                className="mb-6 rounded-lg border border-border-subtle bg-accent-amber-soft px-4 py-3 text-sm text-text-primary"
                role="status"
              >
                {unassignedOpen} open task{unassignedOpen === 1 ? '' : 's'} ha{unassignedOpen === 1 ? 's' : 've'}{' '}
                no assignee — they won’t appear in anyone’s row below.
              </div>
            ) : null}

            {unassignedItems.length > 0 ? (
              <section
                className="mb-6 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface"
                aria-labelledby="unassigned-workload-heading"
              >
            <div className="border-b border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/30">
              <h2 id="unassigned-workload-heading" className="text-sm font-semibold text-text-primary">
                Unassigned open tasks
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Assign these on the deal so they roll up to someone’s workload below.
              </p>
              {unassignedAssignHint ? (
                <p className="mt-1.5 text-xs font-medium text-accent-green" role="status">
                  {unassignedAssignHint}
                </p>
              ) : null}
            </div>
            <ul className="divide-y divide-border-subtle">
              {unassignedItems.map(({ task, dealAddress }) => (
                <li
                  key={task.id}
                  className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 transition-[box-shadow,background-color] duration-300 ${
                    taskAssigneeFeedback[task.id]
                      ? 'bg-accent-green-soft ring-2 ring-accent-green/30 ring-inset'
                      : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{task.name}</span>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <p className="truncate text-xs text-text-secondary" title={dealAddress}>
                      {dealAddress}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Due {formatDate(task.dueDate)}{' '}
                      <span className="text-text-disabled">({formatRelativeDate(task.dueDate)})</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label
                        htmlFor={`workload-assign-${task.id}`}
                        className="px-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted"
                      >
                        Assignee
                      </label>
                      <select
                        id={`workload-assign-${task.id}`}
                        aria-label={`Assign ${task.name}`}
                        value=""
                        disabled={users.length === 0}
                        title={users.length === 0 ? 'No people on roster' : undefined}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleUnassignedAssigneeChange(task.id, v === '' ? null : v);
                        }}
                        onMouseDown={(ev) => ev.stopPropagation()}
                        onClick={(ev) => ev.stopPropagation()}
                        className="max-w-[min(220px,85vw)] rounded-md border border-border-subtle bg-input-bg px-2 py-1.5 text-sm text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Link
                      to={dealHref(`/deals/${task.dealId}`)}
                      className="self-end pb-0.5 text-sm font-medium text-accent-blue hover:underline"
                    >
                      Open deal
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
              </section>
            ) : null}

            {/* Summary Stats */}
            <StatCardGrid>
              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm dark:shadow-none sm:p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-soft">
                    <Users className="text-accent-blue" size={20} aria-hidden />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-text-primary">{users.length}</div>
                    <div className="text-sm text-text-muted">People in roster</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm dark:shadow-none sm:p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-soft">
                    <Briefcase className="text-accent-green" size={20} aria-hidden />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-text-primary">{assignedTotals.open}</div>
                    <div className="text-sm text-text-muted">Open assigned tasks</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm dark:shadow-none sm:p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-red-soft">
                    <AlertCircle className="text-accent-red" size={20} aria-hidden />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-text-primary">{assignedTotals.overdue}</div>
                    <div className="text-sm text-text-muted">Overdue assigned tasks</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm dark:shadow-none sm:p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated/80 ring-1 ring-border-subtle">
                    <Target className="text-accent-amber" size={20} aria-hidden />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-text-primary">{workspaceAtRiskDeals}</div>
                    <div className="text-sm text-text-muted">Deals at-risk (derived)</div>
                  </div>
                </div>
              </div>
            </StatCardGrid>

            <div className="mb-6">
              <BlockingSection rows={rows} onViewDetails={handleSelectRow} />
            </div>

            <div className="min-w-0">
              <div className="mb-4">
                <h2 className="font-semibold text-text-primary">By person</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Metrics use the same deal health rules as the dashboard (tasks + documents + closing
                  pressure).
                </p>
              </div>
              {rows.length === 0 ? (
                <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-secondary">
                  No people in roster.
                </div>
              ) : (
                <AgentsTable rows={rows} onSelectRow={handleSelectRow} />
              )}
            </div>
          </>
        )}

      <AgentDetailPanel
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        users={users}
        onTaskAssigneeChange={handleDrawerAssigneeChange}
        feedbackTaskIds={taskAssigneeFeedback}
      />
    </PageContainer>
  );
}
