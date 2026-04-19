import { TaskStatus } from '../../types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const statusConfig = {
    upcoming: {
      label: 'Upcoming',
      className: 'border-border-subtle bg-bg-elevated text-text-secondary',
    },
    active: {
      label: 'Active',
      className: 'border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary',
    },
    'at-risk': {
      label: 'At Risk',
      className: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    overdue: {
      label: 'Overdue',
      className: 'border-border-subtle bg-accent-red-soft text-accent-red dark:text-text-primary',
    },
    complete: {
      label: 'Complete',
      className: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors duration-150 ease-out ${config.className}`}
    >
      {config.label}
    </span>
  );
}
