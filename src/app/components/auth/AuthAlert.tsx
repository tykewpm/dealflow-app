import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

type AuthAlertVariant = 'error' | 'success' | 'info';

const variantClass: Record<AuthAlertVariant, string> = {
  error:
    'border-red-500/15 bg-accent-red-soft text-text-primary dark:border-red-500/25',
  success:
    'border-border-subtle bg-bg-surface text-text-primary dark:border-border-subtle dark:bg-bg-surface/80',
  info: 'border-border-subtle bg-bg-app text-text-secondary dark:bg-bg-surface/60',
};

export function AuthAlert({
  variant,
  children,
  id,
  className,
}: {
  variant: AuthAlertVariant;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn('mb-4 rounded-xl border px-3 py-3 text-sm leading-relaxed', variantClass[variant], className)}
    >
      {children}
    </div>
  );
}
