import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Keeps card height stable between form / success states. */
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border-subtle bg-bg-elevated/95 p-8 shadow-sm backdrop-blur-sm dark:bg-bg-elevated/90 dark:shadow-none',
        className,
      )}
    >
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
