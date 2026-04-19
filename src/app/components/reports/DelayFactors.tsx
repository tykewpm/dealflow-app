import { DelayFactor } from '../../types/report';

interface DelayFactorsProps {
  factors: DelayFactor[];
  onDrillDown: (factor: string) => void;
  /** When false, rows are not clickable (e.g. live Convex mode where drill-down uses mock deals only). */
  drillDownEnabled?: boolean;
}

export function DelayFactors({ factors, onDrillDown, drillDownEnabled = true }: DelayFactorsProps) {
  const maxCount = Math.max(...factors.map((f) => f.count));

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
      <h3 className="mb-5 font-semibold text-text-primary">Top Delay Factors</h3>

      <div className="space-y-3">
        {factors.map((factor, index) => {
          const barWidth = (factor.count / maxCount) * 100;

          const rowInner = (
            <>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-app text-xs font-semibold text-text-secondary dark:bg-bg-elevated/50">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="min-w-0 text-left text-sm font-medium text-text-primary">{factor.factor}</span>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm text-text-secondary">{factor.count} deals</span>
                    <span className="min-w-[3rem] text-right text-sm font-semibold text-text-primary">
                      {factor.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-border-subtle/50">
                  <div
                    className="h-2 rounded-full bg-accent-amber transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </>
          );

          if (!drillDownEnabled) {
            return (
              <div
                key={factor.factor}
                className="-m-2 flex w-full cursor-default items-start gap-3 rounded-lg p-2 sm:gap-4"
              >
                {rowInner}
              </div>
            );
          }

          return (
            <button
              key={factor.factor}
              type="button"
              onClick={() => onDrillDown(factor.factor.toLowerCase().replace(/\s+/g, '-'))}
              className="-m-2 flex w-full cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-bg-elevated/40 sm:gap-4"
            >
              {rowInner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
