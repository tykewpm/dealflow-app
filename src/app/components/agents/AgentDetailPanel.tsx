import { Link } from 'react-router-dom';
import { X, Briefcase, AlertCircle, Clock, CheckCircle2, FileText } from 'lucide-react';
import { useWorkspaceRelativeHref } from '../../context/WorkspaceLinkBaseContext';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '../../types';
import type { UserWorkloadDetail } from '../../utils/agentWorkloadDerivation';

interface AgentDetailPanelProps {
  detail: UserWorkloadDetail | null;
  onClose: () => void;
  users: User[];
  onTaskAssigneeChange: (taskId: string, assigneeId: string | null) => void;
  /** Task ids showing brief “Saved” + highlight (Team Workload parent state). */
  feedbackTaskIds?: Record<string, boolean>;
}

export function AgentDetailPanel({
  detail,
  onClose,
  users,
  onTaskAssigneeChange,
  feedbackTaskIds = {},
}: AgentDetailPanelProps) {
  const dealHref = useWorkspaceRelativeHref();
  if (!detail) return null;

  const { row, incompleteTasks, touchedDeals } = detail;

  const statusConfig = {
    'on-track': {
      icon: CheckCircle2,
      color: 'text-accent-green',
      bg: 'bg-accent-green-soft border border-border-subtle',
    },
    'needs-attention': {
      icon: AlertCircle,
      color: 'text-accent-amber',
      bg: 'bg-accent-amber-soft border border-border-subtle',
    },
    'at-risk': {
      icon: AlertCircle,
      color: 'text-accent-red',
      bg: 'bg-accent-red-soft border border-border-subtle',
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] dark:bg-bg-app/80"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 right-0 top-0 flex w-full max-w-2xl flex-col overflow-y-auto border-l border-border-strong bg-bg-elevated [max-height:100dvh] touch-pan-y dark:shadow-none"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border-subtle bg-bg-elevated px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="mb-1 font-semibold text-text-primary">{row.name}</h2>
              <p className="break-words text-sm text-text-secondary">{row.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary touch-manipulation"
              aria-label="Close panel"
            >
              <X size={20} className="text-current" />
            </button>
          </div>

          <div className="border-b border-border-subtle bg-bg-app px-4 py-4 dark:bg-bg-surface/60 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
              <div className="min-w-0">
                <div className="mb-1 text-sm text-text-muted">Open tasks</div>
                <div className="text-2xl font-semibold text-text-primary">{row.openAssignedTasks}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-sm text-text-muted">Overdue</div>
                <div className="text-2xl font-semibold text-accent-red">{row.overdueTasks}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-sm text-text-muted">At-risk deals (derived)</div>
                <div className="text-2xl font-semibold text-text-primary">{row.dealsDerivedAtRiskHealth}</div>
              </div>
            </div>
          </div>

          <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Clock className="text-text-muted" size={18} aria-hidden />
              <h3 className="font-semibold text-text-primary">Assigned open tasks</h3>
              <span className="text-sm text-text-muted">({incompleteTasks.length})</span>
            </div>
            <div className="space-y-2">
              {incompleteTasks.length > 0 ? (
                incompleteTasks.map((task) => {
                  const selectValue = task.assigneeId?.trim() ?? '';
                  const orphanAssigneeId =
                    selectValue && !users.some((u) => u.id === selectValue) ? selectValue : null;
                  const showSavedFeedback = Boolean(feedbackTaskIds[task.id]);

                  return (
                    <div
                      key={task.id}
                      className={`rounded-lg border p-3 transition-[box-shadow,background-color] duration-300 ${
                        showSavedFeedback ? 'ring-2 ring-accent-green/40 ring-inset' : ''
                      } ${
                        task.status === 'overdue'
                          ? 'border-border-subtle bg-accent-red-soft'
                          : task.status === 'at-risk'
                            ? 'border-border-subtle bg-accent-amber-soft'
                            : 'border-border-subtle bg-bg-surface'
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-text-primary">{task.name}</div>
                        <span className="shrink-0 text-xs font-medium capitalize text-text-secondary">
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                        <span className="text-xs text-text-muted">Due {task.dueDate}</span>
                        <div className="flex shrink-0 flex-wrap items-end gap-2">
                          <div className="flex flex-col items-end gap-0.5">
                            {showSavedFeedback ? (
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wide text-accent-green"
                                role="status"
                              >
                                Saved
                              </span>
                            ) : null}
                            <label
                              htmlFor={`drawer-assign-${task.id}`}
                              className="px-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted"
                            >
                              Assignee
                            </label>
                            <select
                              id={`drawer-assign-${task.id}`}
                              aria-label={`Assign ${task.name}`}
                              value={
                                selectValue && users.some((u) => u.id === selectValue)
                                  ? selectValue
                                  : orphanAssigneeId
                                    ? orphanAssigneeId
                                    : ''
                              }
                              disabled={users.length === 0}
                              title={users.length === 0 ? 'No people on roster' : undefined}
                              onChange={(e) => {
                                const v = e.target.value;
                                onTaskAssigneeChange(task.id, v === '' ? null : v);
                              }}
                              onMouseDown={(ev) => ev.stopPropagation()}
                              onClick={(ev) => ev.stopPropagation()}
                              className="w-full max-w-full rounded-md border border-border-subtle bg-input-bg px-2 py-1.5 text-sm text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[min(220px,70vw)]"
                            >
                              <option value="">Unassigned</option>
                              {orphanAssigneeId ? (
                                <option value={orphanAssigneeId}>
                                  Unknown assignee ({orphanAssigneeId})
                                </option>
                              ) : null}
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Link
                            to={dealHref(`/deals/${task.dealId}`)}
                            className="pb-0.5 text-xs font-medium text-accent-blue hover:underline"
                          >
                            Open deal
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-lg border border-dashed border-border-subtle bg-bg-app px-3 py-6 text-center text-sm leading-relaxed text-text-secondary dark:bg-bg-surface/50">
                  Tasks move between teammates as you reassign them.
                </p>
              )}
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Briefcase className="text-text-muted" size={18} aria-hidden />
              <h3 className="font-semibold text-text-primary">Deals with your open work</h3>
              <span className="text-sm text-text-muted">({touchedDeals.length})</span>
            </div>
            <div className="space-y-3">
              {touchedDeals.map(({ deal, health, incompleteTaskCount, incompleteDocCount }) => {
                const statusInfo = statusConfig[health];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={deal.id}
                    className="rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <div className="min-w-0 font-medium text-text-primary">{deal.propertyAddress}</div>
                      <div className={`flex shrink-0 items-center gap-1.5 rounded px-2 py-1 ${statusInfo.bg}`}>
                        <StatusIcon size={14} className={statusInfo.color} />
                        <span className={`text-xs font-medium capitalize ${statusInfo.color}`}>
                          {health.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2 text-sm capitalize text-text-secondary">
                      Pipeline: {deal.pipelineStage.replace('-', ' ')}
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                      <span>Open tasks on deal: {incompleteTaskCount}</span>
                      <span className="inline-flex items-center gap-1">
                        <FileText size={12} />
                        Incomplete docs: {incompleteDocCount}
                      </span>
                    </div>
                    <Link
                      to={dealHref(`/deals/${deal.id}`)}
                      className="inline-block text-sm font-medium text-accent-blue hover:underline"
                    >
                      Open deal
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
