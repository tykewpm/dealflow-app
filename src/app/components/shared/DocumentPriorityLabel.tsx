import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DocumentPriority } from '../../types/dealHealth';

interface DocumentPriorityLabelProps {
  priority: DocumentPriority;
  subtext?: string;
  compact?: boolean;
}

export function DocumentPriorityLabel({ priority, subtext, compact = false }: DocumentPriorityLabelProps) {
  const config = {
    blocking: {
      label: 'Blocking',
      icon: AlertTriangle,
      iconColor: 'text-accent-red',
      bgColor: 'bg-accent-red-soft',
      textColor: 'text-accent-red',
      borderColor: 'border-border-subtle',
      defaultSubtext: 'This document is blocking closing',
    },
    'needs-attention': {
      label: 'Needs Attention',
      icon: AlertCircle,
      iconColor: 'text-accent-amber',
      bgColor: 'bg-accent-amber-soft',
      textColor: 'text-accent-amber',
      borderColor: 'border-border-subtle',
      defaultSubtext: 'Action required soon',
    },
    'on-track': {
      label: 'On Track',
      icon: CheckCircle2,
      iconColor: 'text-accent-green',
      bgColor: 'bg-accent-green-soft',
      textColor: 'text-accent-green',
      borderColor: 'border-border-subtle',
      defaultSubtext: 'No issues detected',
    },
  };

  const style = config[priority];
  const Icon = style.icon;
  const displaySubtext = subtext || style.defaultSubtext;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${style.bgColor} border ${style.borderColor} rounded text-xs font-medium ${style.textColor}`}>
        <Icon size={12} className={style.iconColor} />
        <span>{style.label}</span>
      </div>
    );
  }

  return (
    <div className={`${style.bgColor} border ${style.borderColor} rounded-lg px-3 py-2`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={style.iconColor} />
        <span className={`text-xs font-semibold ${style.textColor}`}>
          {style.label}
        </span>
      </div>
      {displaySubtext && (
        <p className="text-xs text-text-secondary">
          {displaySubtext}
        </p>
      )}
    </div>
  );
}
