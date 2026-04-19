import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-elevated p-8 shadow-sm dark:shadow-none">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
