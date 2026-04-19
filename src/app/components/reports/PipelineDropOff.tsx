import { PipelineStage } from '../../types/report';

interface PipelineDropOffProps {
  stages: PipelineStage[];
}

export function PipelineDropOff({ stages }: PipelineDropOffProps) {
  if (stages.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
        <h3 className="mb-5 font-semibold text-text-primary">Pipeline Drop-Off</h3>
        <p className="text-sm text-text-muted">Loading pipeline…</p>
      </div>
    );
  }

  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
      <h3 className="mb-5 font-semibold text-text-primary">Pipeline Drop-Off</h3>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const barWidth = (stage.count / maxCount) * 100;
          const dropOff = index > 0 ? stages[index - 1].count - stage.count : 0;

          return (
            <div key={stage.stage}>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="text-sm font-medium text-text-primary">{stage.stage}</span>
                  <span className="shrink-0 text-sm text-text-muted">{stage.count} deals</span>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  {index > 0 && dropOff > 0 && (
                    <span className="text-xs font-medium text-accent-red">-{dropOff}</span>
                  )}
                  <span className="min-w-[3rem] text-right text-sm font-semibold text-text-primary">
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-border-subtle/50">
                <div
                  className="h-3 rounded-full bg-accent-blue transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
