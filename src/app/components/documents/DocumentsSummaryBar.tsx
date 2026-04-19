interface DocumentsSummaryBarProps {
  total: number;
  awaitingSignature: number;
  overdue: number;
  completed: number;
}

export function DocumentsSummaryBar({
  total,
  awaitingSignature,
  overdue,
  completed,
}: DocumentsSummaryBarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-subtle bg-bg-elevated/40 p-4 transition-[background-color,border-color] duration-150 ease-out dark:bg-bg-elevated/25">
      <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
        {/* Total Documents */}
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-text-secondary">
            <span className="font-semibold text-text-primary">{total}</span> total {total === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border-subtle" />

        {/* Awaiting Signature */}
        {awaitingSignature > 0 && (
          <>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-text-primary">
                <span className="font-semibold">{awaitingSignature}</span> awaiting signature
              </span>
            </div>
            <div className="h-4 w-px bg-border-subtle" />
          </>
        )}

        {/* Overdue */}
        {overdue > 0 && (
          <>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-text-primary">
                <span className="font-semibold text-accent-red">{overdue}</span> overdue
              </span>
            </div>
            <div className="h-4 w-px bg-border-subtle" />
          </>
        )}

        {/* Completed */}
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-text-secondary">
            <span className="font-semibold text-text-primary">{completed}</span> completed
          </span>
        </div>
      </div>
    </div>
  );
}
