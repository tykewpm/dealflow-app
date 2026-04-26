import { Task, User } from '../../types';
import { TaskItem } from './TaskItem';

const STATUS_ORDER: Record<Task['status'], number> = {
  overdue: 0,
  'at-risk': 1,
  active: 2,
  upcoming: 3,
  complete: 4,
};

function sortTasksByStatus(a: Task, b: Task): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
}

export type TaskListSectionGroup = { title: string; tasks: Task[] };

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onToggleComplete: (taskId: string) => void;
  readOnly?: boolean;
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void;
  /** When set (e.g. starter checklist), render grouped sections with headings instead of one flat list. */
  sectionGroups?: TaskListSectionGroup[];
}

function renderTaskBuckets(
  sortedTasks: Task[],
  getUserById: (userId?: string) => User | undefined,
  users: User[],
  onToggleComplete: (taskId: string) => void,
  onAssigneeChange: TaskListProps['onAssigneeChange'],
  readOnly: boolean,
  labels: { open: string; done: string },
) {
  const incompleteTasks = sortedTasks.filter((t) => t.status !== 'complete');
  const completedTasks = sortedTasks.filter((t) => t.status === 'complete');
  return (
    <>
      {incompleteTasks.length > 0 ? (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {labels.open} ({incompleteTasks.length})
          </h4>
          <div className="space-y-1.5">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                assignee={getUserById(task.assigneeId)}
                users={users}
                onToggleComplete={onToggleComplete}
                onAssigneeChange={onAssigneeChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ) : null}
      {completedTasks.length > 0 ? (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {labels.done} ({completedTasks.length})
          </h4>
          <div className="space-y-1.5">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                assignee={getUserById(task.assigneeId)}
                users={users}
                onToggleComplete={onToggleComplete}
                onAssigneeChange={onAssigneeChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TaskList({
  tasks,
  users,
  onToggleComplete,
  readOnly = false,
  onAssigneeChange,
  sectionGroups,
}: TaskListProps) {
  const getUserById = (userId?: string): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  if (sectionGroups && sectionGroups.length > 0) {
    return (
      <div className="space-y-6">
        {sectionGroups.map((group) => {
          const sorted = [...group.tasks].sort(sortTasksByStatus);
          return (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-primary">{group.title}</h3>
              <div className="space-y-3">
                {renderTaskBuckets(
                  sorted,
                  getUserById,
                  users,
                  onToggleComplete,
                  onAssigneeChange,
                  readOnly,
                  { open: 'To do', done: 'Done' },
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const sortedTasks = [...tasks].sort(sortTasksByStatus);

  const incompleteTasks = sortedTasks.filter((t) => t.status !== 'complete');
  const completedTasks = sortedTasks.filter((t) => t.status === 'complete');

  return (
    <div className="space-y-4">
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Active Tasks ({incompleteTasks.length})
          </h3>
          <div className="space-y-1.5">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                assignee={getUserById(task.assigneeId)}
                users={users}
                onToggleComplete={onToggleComplete}
                onAssigneeChange={onAssigneeChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-1.5">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                assignee={getUserById(task.assigneeId)}
                users={users}
                onToggleComplete={onToggleComplete}
                onAssigneeChange={onAssigneeChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border-subtle bg-bg-elevated/40 py-8 text-center transition-colors duration-150 dark:bg-bg-elevated/25">
          <div className="mb-2 text-text-muted">
            <svg className="mx-auto h-10 w-10 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary">No tasks yet</p>
          <p className="mt-1 text-xs text-text-muted">Tasks will show here as this deal moves forward.</p>
        </div>
      )}
    </div>
  );
}
