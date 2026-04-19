interface WorkspaceLoadingPanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/** Matches Dashboard / Transactions loading treatment for consistency across Convex surfaces. */
export function WorkspaceLoadingPanel({
  title = 'Loading workspace…',
  subtitle = 'Fetching data from the server.',
  className = '',
}: WorkspaceLoadingPanelProps) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-bg-surface p-12 text-center shadow-sm dark:shadow-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <p className="font-medium text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}
