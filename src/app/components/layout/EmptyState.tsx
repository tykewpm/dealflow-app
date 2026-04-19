import type { ReactNode } from 'react';

import { SurfaceCard } from './SurfaceCard';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <SurfaceCard className="p-12 text-center">
      <div className="mb-4 text-text-muted">
        {icon ?? (
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>
      <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 text-sm text-text-muted">{description}</p>
    </SurfaceCard>
  );
}
