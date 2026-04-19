import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

/**
 * Visual grouping for the mobile/tablet drawer — separates workflow nav (bottom bar)
 * from workspace/account affordances without heavy chrome.
 */
export function DrawerNavSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('px-3 pb-3 pt-5 first:pt-3', className)}>
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
