import { Task, User } from '../../types';
import { TaskStatusBadge } from '../shared/TaskStatusBadge';
import { cn } from '../ui/utils';
import { formatDate, formatRelativeDate } from '../../utils/dealUtils';

interface TaskItemProps {
  task: Task;
  assignee?: User;
  users?: User[];
  onToggleComplete: (taskId: string) => void;
  /** When set, assignee row becomes a roster dropdown (+ Unassigned). */
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void;
  readOnly?: boolean;
}

function assigneeLabel(task: Task, assignee?: User): string {
  const id = task.assigneeId?.trim();
  if (!id) return 'Unassigned';
  if (assignee) return assignee.name;
  return 'Unknown assignee';
}

export function TaskItem({
  task,
  assignee,
  users = [],
  onToggleComplete,
  onAssigneeChange,
  readOnly = false,
}: TaskItemProps) {
  const isComplete = task.status === 'complete';
  const label = assigneeLabel(task, assignee);
  /** No roster match (missing or unknown assignee id) — surface ownership gaps. */
  const warnOwnership = !assignee;
  const assigneeEditable = Boolean(onAssigneeChange);

  const selectValue = task.assigneeId?.trim() ?? '';
  const orphanAssigneeId =
    selectValue && !users.some((u) => u.id === selectValue) ? selectValue : null;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-[background-color,border-color,box-shadow] duration-150 ease-out',
        isComplete
          ? 'border-border-subtle bg-bg-elevated/50 hover:border-border-strong hover:bg-bg-elevated/70 dark:shadow-none'
          : 'border-border-subtle bg-bg-surface shadow-sm hover:border-border-strong hover:bg-bg-elevated/35 dark:shadow-none',
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          disabled={readOnly}
          title={readOnly ? 'Task updates are disabled while Convex workspace is read-only' : undefined}
          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app ${
            readOnly ? 'cursor-not-allowed border-border-subtle opacity-50' : ''
          } ${
            isComplete
              ? 'border-accent-green bg-accent-green hover:border-accent-green hover:brightness-110'
              : 'border-border-strong hover:border-accent-blue'
          }`}
        >
          {isComplete && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <h4
              className={`text-[15px] font-medium leading-snug ${
                isComplete ? 'text-text-muted line-through' : 'text-text-primary'
              }`}
            >
              {task.name}
            </h4>
            <TaskStatusBadge status={task.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatDate(task.dueDate)}
                <span className="ml-1 text-text-muted">({formatRelativeDate(task.dueDate)})</span>
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 min-w-0"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="shrink-0 text-xs text-text-muted">Assignee</span>
              {assigneeEditable ? (
                <select
                  aria-label="Task assignee"
                  value={selectValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    onAssigneeChange?.(task.id, v === '' ? null : v);
                  }}
                  className="max-w-[220px] rounded-md border border-input-border bg-input-bg px-2 py-0.5 text-xs text-text-primary shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-border-strong focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--input-focus-ring)] dark:shadow-none"
                >
                  <option value="">Unassigned</option>
                  {orphanAssigneeId ? (
                    <option value={orphanAssigneeId}>Unknown assignee ({orphanAssigneeId})</option>
                  ) : null}
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={warnOwnership ? 'text-accent-amber' : ''}>{label}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
