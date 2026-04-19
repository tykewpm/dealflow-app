import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h1 className="mb-1 text-text-primary">{title}</h1>
        {description != null && <p className="text-text-secondary">{description}</p>}
      </div>
      {actions != null ? (
        <div className="flex w-full min-w-0 shrink-0 flex-col flex-wrap items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
