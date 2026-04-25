interface WorkspaceLoadingPanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  /** When true, shows a calm inline spinner above the title. */
  showSpinner?: boolean;
}

/** Matches Dashboard / Transactions loading treatment for consistency across Convex surfaces. */
export function WorkspaceLoadingPanel({
  title = 'Loading workspace…',
  subtitle = 'Fetching data from the server.',
  className = '',
  showSpinner = false,
}: WorkspaceLoadingPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-bg-surface p-12 text-center shadow-sm dark:bg-bg-elevated/80 dark:shadow-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {showSpinner ? (
        <div className="mb-5 flex justify-center" aria-hidden>
          <div className="size-9 rounded-full border-2 border-border-subtle border-t-accent-blue animate-spin" />
        </div>
      ) : null}
      <p className="font-medium text-text-primary">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{subtitle}</p>
    </div>
  );
}
