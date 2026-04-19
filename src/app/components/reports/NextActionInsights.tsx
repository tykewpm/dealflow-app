import { NextActionInsight } from '../../types/report';

interface NextActionInsightsProps {
  insights: NextActionInsight[];
}

export function NextActionInsights({ insights }: NextActionInsightsProps) {
  const maxFrequency = Math.max(...insights.map((i) => i.frequency));

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
      <h3 className="mb-5 font-semibold text-text-primary">Most Common Next Actions</h3>

      <div className="space-y-3">
        {insights.map((insight) => {
          const barWidth = (insight.frequency / maxFrequency) * 100;

          return (
            <div key={insight.action} className="flex min-w-0 items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="min-w-0 text-sm font-medium text-text-primary">{insight.action}</span>
                  <span className="shrink-0 text-sm font-semibold text-text-primary">{insight.frequency}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border-subtle/50">
                  <div
                    className="h-2 rounded-full bg-accent-blue transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-border-subtle pt-4">
        <p className="text-sm text-text-secondary">
          Total active next actions:{' '}
          <span className="font-semibold text-text-primary">
            {insights.reduce((sum, i) => sum + i.frequency, 0)}
          </span>
        </p>
      </div>
    </div>
  );
}
