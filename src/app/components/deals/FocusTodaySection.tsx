import type { MissionControlFocusCounts, MissionControlFocusKind } from '../../utils/workspaceInsights';
import { cn } from '../ui/utils';

type FocusRowConfig = {
  countKey: keyof MissionControlFocusCounts;
  kind: MissionControlFocusKind;
  /** e.g. "at risk" → "3 closings at risk" */
  predicate: string;
  actionLabel: string;
};

const FOCUS_ROWS: FocusRowConfig[] = [
  { countKey: 'closingsAtRisk', kind: 'at-risk', predicate: 'at risk', actionLabel: 'Review deadlines' },
  { countKey: 'closingsStalled', kind: 'stalled', predicate: 'stalled', actionLabel: 'Review activity' },
  { countKey: 'closingsReady', kind: 'ready', predicate: 'ready to close', actionLabel: 'Finalize documents' },
];

export interface FocusTodaySectionProps {
  counts: MissionControlFocusCounts;
  onMissionAction: (kind: MissionControlFocusKind) => void;
  className?: string;
}

export function FocusTodaySection({ counts, onMissionAction, className }: FocusTodaySectionProps) {
  const visible = FOCUS_ROWS.filter((r) => counts[r.countKey] > 0);
  if (visible.length === 0) return null;

  return (
    <section
      aria-labelledby="focus-today-heading"
      className={cn(
        'rounded-xl border border-border-subtle bg-bg-surface px-4 py-4 shadow-sm dark:shadow-none sm:px-5 sm:py-4',
        className,
      )}
    >
      <h2
        id="focus-today-heading"
        className="text-[11px] font-semibold uppercase tracking-wide text-text-muted"
      >
        Focus today
      </h2>
      <ul className="mt-3 space-y-3">
        {visible.map((row) => {
          const n = counts[row.countKey];
          const closingWord = n === 1 ? 'closing' : 'closings';
          return (
            <li
              key={row.kind}
              className="flex flex-col gap-2 border-b border-border-subtle/80 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <p className="min-w-0 text-sm leading-snug text-text-primary">
                <span className="font-semibold tabular-nums">{n}</span>{' '}
                <span className="text-text-secondary">
                  {closingWord} {row.predicate}
                </span>
              </p>
              <button
                type="button"
                onClick={() => onMissionAction(row.kind)}
                className="shrink-0 self-start rounded-md border border-border-subtle bg-bg-app px-3 py-1.5 text-left text-xs font-medium text-text-primary transition-[border-color,background-color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/80 dark:bg-bg-elevated/40 sm:self-auto sm:text-right"
              >
                {row.actionLabel}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
