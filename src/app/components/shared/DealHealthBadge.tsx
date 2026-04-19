import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { DealHealthStatus } from '../../types/dealHealth';

interface DealHealthBadgeProps {
  status: DealHealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function DealHealthBadge({ status, size = 'md', showIcon = true }: DealHealthBadgeProps) {
  const config = {
    'on-track': {
      label: 'On Track',
      icon: CheckCircle2,
      iconColor: 'text-accent-green',
      bgColor: 'bg-accent-green-soft',
      textColor: 'text-accent-green',
      borderColor: 'border-border-subtle',
    },
    'needs-attention': {
      label: 'Needs Attention',
      icon: AlertCircle,
      iconColor: 'text-accent-amber',
      bgColor: 'bg-accent-amber-soft',
      textColor: 'text-accent-amber',
      borderColor: 'border-border-subtle',
    },
    'at-risk': {
      label: 'At Risk',
      icon: AlertTriangle,
      iconColor: 'text-accent-red',
      bgColor: 'bg-accent-red-soft',
      textColor: 'text-accent-red',
      borderColor: 'border-border-subtle',
    },
  };

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      iconSize: 12,
      gap: 'gap-1',
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-xs',
      iconSize: 14,
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      iconSize: 16,
      gap: 'gap-2',
    },
  };

  const style = config[status];
  const sizing = sizeConfig[size];
  const Icon = style.icon;

  return (
    <div
      className={`inline-flex items-center ${sizing.gap} ${sizing.padding} ${style.bgColor} ${style.textColor} border ${style.borderColor} rounded-md font-medium ${sizing.text}`}
    >
      {showIcon && <Icon size={sizing.iconSize} className={style.iconColor} />}
      <span>{style.label}</span>
    </div>
  );
}
