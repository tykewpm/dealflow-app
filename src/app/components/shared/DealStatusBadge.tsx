import { DealStatus } from '../../types';

interface DealStatusBadgeProps {
  status: DealStatus;
}

export function DealStatusBadge({ status }: DealStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Active',
      className:
        'border border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary',
    },
    'at-risk': {
      label: 'At Risk',
      className:
        'border border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    overdue: {
      label: 'Overdue',
      className:
        'border border-border-subtle bg-accent-red-soft text-accent-red dark:text-text-primary',
    },
    complete: {
      label: 'Complete',
      className:
        'border border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`rounded border px-2 py-1 text-xs font-medium transition-colors duration-500 ease-out motion-reduce:duration-150 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
