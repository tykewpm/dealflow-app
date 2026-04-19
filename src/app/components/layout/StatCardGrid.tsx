import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

/**
 * Responsive KPI/stat row: 2×2 on phones, four columns from `lg` (aligns with app shell breakpoints).
 */
export function StatCardGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
