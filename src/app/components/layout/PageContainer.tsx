import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Siblings rendered after the centered column, still inside the gray shell (e.g. portaled modals). */
  after?: ReactNode;
}

export function PageContainer({ children, after }: PageContainerProps) {
  return (
    <div className="min-h-full bg-bg-app">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">{children}</div>
      {after}
    </div>
  );
}
