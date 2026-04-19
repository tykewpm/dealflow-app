import { AlertTriangle } from 'lucide-react';
import type { UserWorkloadRow } from '../../utils/agentWorkloadDerivation';
import { workloadAttentionReason } from '../../utils/agentWorkloadDerivation';

interface BlockingSectionProps {
  rows: UserWorkloadRow[];
  onViewDetails: (row: UserWorkloadRow) => void;
}

export function BlockingSection({ rows, onViewDetails }: BlockingSectionProps) {
  const blockingRows = rows.filter((r) => workloadAttentionReason(r) !== undefined);

  if (blockingRows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-accent-amber-soft p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle className="shrink-0 text-accent-amber" size={18} aria-hidden />
          <h2 className="font-semibold text-text-primary">Needs attention</h2>
        </div>
        <span className="text-sm text-text-secondary">
          {blockingRows.length} {blockingRows.length === 1 ? 'person' : 'people'} with overdue work or
          at-risk deals
        </span>
      </div>

      <div className="space-y-3">
        {blockingRows.map((row) => (
          <div
            key={row.userId}
            className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="mb-1 font-medium text-text-primary">{row.name}</div>
              <div className="text-sm text-text-secondary">{workloadAttentionReason(row)}</div>
            </div>
            <button
              type="button"
              onClick={() => onViewDetails(row)}
              className="w-full shrink-0 rounded-lg border border-border-subtle bg-bg-app px-3 py-2.5 text-center text-sm font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-bg-elevated/60 sm:w-auto sm:py-1.5 touch-manipulation dark:bg-bg-elevated/30"
            >
              View details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
