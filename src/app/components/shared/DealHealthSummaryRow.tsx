import { AlertTriangle, PenTool, Clock, User } from 'lucide-react';
import { DealHealthSummary } from '../../types/dealHealth';

interface DealHealthSummaryRowProps {
  summary: DealHealthSummary;
}

export function DealHealthSummaryRow({ summary }: DealHealthSummaryRowProps) {
  const items = [];

  // Issues detected
  if (summary.totalIssues > 0) {
    items.push({
      icon: AlertTriangle,
      iconColor: 'text-accent-red',
      bgColor: 'bg-accent-red-soft',
      label: `${summary.totalIssues} ${summary.totalIssues === 1 ? 'issue' : 'issues'} detected`,
    });
  }

  // Awaiting signature
  if (summary.awaitingSignature > 0) {
    items.push({
      icon: PenTool,
      iconColor: 'text-accent-blue',
      bgColor: 'bg-accent-blue-soft',
      label: `${summary.awaitingSignature} awaiting signature`,
    });
  }

  // Due soon
  if (summary.dueSoon > 0) {
    items.push({
      icon: Clock,
      iconColor: 'text-accent-amber',
      bgColor: 'bg-accent-amber-soft',
      label: `${summary.dueSoon} due soon`,
    });
  }

  // Waiting on
  if (summary.waitingOn) {
    items.push({
      icon: User,
      iconColor: 'text-accent-blue',
      bgColor: 'bg-accent-blue-soft',
      label: `Waiting on ${summary.waitingOn.name}`,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${item.bgColor} rounded-md text-xs font-medium text-text-primary`}
          >
            <Icon size={14} className={item.iconColor} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
