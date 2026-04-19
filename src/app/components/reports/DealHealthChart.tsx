import { DealHealthDistribution } from '../../types/report';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

interface DealHealthChartProps {
  health: DealHealthDistribution;
  onDrillDown: (type: 'on-track' | 'needs-attention' | 'at-risk-status') => void;
  /** When false, legend rows are non-interactive (live data drill-down not wired yet). */
  drillDownEnabled?: boolean;
}

export function DealHealthChart({ health, onDrillDown, drillDownEnabled = true }: DealHealthChartProps) {
  const total = health.onTrack + health.needsAttention + health.atRisk;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
        <h3 className="mb-5 font-semibold text-text-primary">Deal Health Distribution</h3>
        <p className="text-sm text-text-muted">No deals in workspace yet.</p>
      </div>
    );
  }

  const segments = [
    {
      label: 'On Track',
      count: health.onTrack,
      percentage: (health.onTrack / total) * 100,
      color: 'bg-accent-green',
      icon: CheckCircle2,
      iconColor: 'text-accent-green',
      bgColor: 'bg-accent-green-soft border border-border-subtle',
      drillDownType: 'on-track' as const,
    },
    {
      label: 'Needs Attention',
      count: health.needsAttention,
      percentage: (health.needsAttention / total) * 100,
      color: 'bg-accent-amber',
      icon: AlertCircle,
      iconColor: 'text-accent-amber',
      bgColor: 'bg-accent-amber-soft border border-border-subtle',
      drillDownType: 'needs-attention' as const,
    },
    {
      label: 'At Risk',
      count: health.atRisk,
      percentage: (health.atRisk / total) * 100,
      color: 'bg-accent-red',
      icon: AlertTriangle,
      iconColor: 'text-accent-red',
      bgColor: 'bg-accent-red-soft border border-border-subtle',
      drillDownType: 'at-risk-status' as const,
    },
  ];

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 sm:p-5">
      <h3 className="mb-5 font-semibold text-text-primary">Deal Health Distribution</h3>

      {/* Stacked Bar */}
      <div className="mb-5 min-w-0">
        <div className="flex h-12 w-full min-w-0 overflow-hidden rounded-lg ring-1 ring-border-subtle">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={`${segment.color} flex min-w-0 items-center justify-center text-xs font-semibold text-white sm:text-sm`}
              style={{ width: `${segment.percentage}%` }}
            >
              {segment.percentage > 15 && segment.count}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {segments.map((segment) => {
          const Icon = segment.icon;
          const interactive = drillDownEnabled;
          const Wrapper: 'button' | 'div' = interactive ? 'button' : 'div';
          return (
            <Wrapper
              key={segment.label}
              {...(interactive
                ? { onClick: () => onDrillDown(segment.drillDownType), type: 'button' as const }
                : {})}
              className={`${segment.bgColor} rounded-lg p-3 text-left sm:p-4 ${
                interactive
                  ? 'cursor-pointer transition-[border-color,background-color] hover:border-border-strong'
                  : 'cursor-default'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon size={16} className={segment.iconColor} />
                <span className="text-xs text-text-secondary">{segment.label}</span>
              </div>
              <div className="mb-1 text-2xl font-semibold text-text-primary">
                {segment.count}
              </div>
              <div className="text-xs text-text-muted">
                {segment.percentage.toFixed(1)}% of deals
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
