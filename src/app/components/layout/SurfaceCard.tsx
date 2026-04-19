import type { ReactNode } from 'react';

import { cn } from '../ui/utils';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out dark:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  );
}
