import { Deal, Task } from '../../types';
import { TrendingUp, Clock, AlertTriangle, PlusCircle } from 'lucide-react';
import { StatCardGrid } from '../layout/StatCardGrid';

interface SummaryStatsProps {
  deals: Deal[];
  tasks: Task[];
}

export function SummaryStats({ deals, tasks }: SummaryStatsProps) {
  const activeDeals = deals.filter(d => d.status === 'active').length;

  // Deals closing this week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const closingThisWeek = deals.filter(d => {
    const closingDate = new Date(d.closingDate);
    return closingDate >= today && closingDate <= nextWeek;
  }).length;

  const atRiskDeals = deals.filter(d => d.status === 'at-risk').length;

  // New deals (created in last 7 days)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newDeals = deals.filter(d => {
    const createdDate = new Date(d.createdAt);
    return createdDate >= weekAgo;
  }).length;

  const stats = [
    {
      label: 'Total Active',
      value: activeDeals,
      icon: TrendingUp,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue-soft',
    },
    {
      label: 'Closing This Week',
      value: closingThisWeek,
      icon: Clock,
      color: 'text-text-secondary',
      bgColor: 'bg-bg-elevated/70 dark:bg-bg-elevated/40',
    },
    {
      label: 'At Risk',
      value: atRiskDeals,
      icon: AlertTriangle,
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber-soft',
    },
    {
      label: 'New Deals',
      value: newDeals,
      icon: PlusCircle,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green-soft',
    },
  ];

  return (
    <StatCardGrid>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border-subtle bg-bg-surface p-4 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <Icon className={stat.color} size={20} />
              </div>
            </div>
            <div className="mb-1 font-semibold tabular-nums text-text-primary">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </div>
        );
      })}
    </StatCardGrid>
  );
}
