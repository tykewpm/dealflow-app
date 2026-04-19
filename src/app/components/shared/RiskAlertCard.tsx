import { AlertTriangle, AlertCircle, FileX, Clock, PenTool, Calendar } from 'lucide-react';
import { RiskAlert, RiskType, RiskSeverity } from '../../types/dealHealth';

interface RiskAlertCardProps {
  alert: RiskAlert;
}

export function RiskAlertCard({ alert }: RiskAlertCardProps) {
  const typeConfig: Record<RiskType, { icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    'missing-document': { icon: FileX },
    'signature-delay': { icon: PenTool },
    'overdue-task': { icon: Clock },
    'closing-risk': { icon: AlertTriangle },
    'deadline-approaching': { icon: Calendar },
  };

  const severityConfig: Record<RiskSeverity, {
    bgColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
  }> = {
    critical: {
      bgColor: 'bg-accent-red-soft',
      borderColor: 'border-border-subtle',
      iconColor: 'text-accent-red',
      textColor: 'text-text-primary',
    },
    warning: {
      bgColor: 'bg-accent-amber-soft',
      borderColor: 'border-border-subtle',
      iconColor: 'text-accent-amber',
      textColor: 'text-text-primary',
    },
    info: {
      bgColor: 'bg-accent-blue-soft',
      borderColor: 'border-border-subtle',
      iconColor: 'text-accent-blue',
      textColor: 'text-text-primary',
    },
  };

  const Icon = typeConfig[alert.type].icon;
  const style = severityConfig[alert.severity];

  return (
    <div className={`${style.bgColor} border ${style.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${style.iconColor} mt-0.5`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${style.textColor} mb-1`}>
            {alert.title}
          </h4>
          <p className="text-sm text-text-secondary mb-3">
            {alert.explanation}
          </p>
          {(alert.primaryAction || alert.secondaryAction) && (
            <div className="flex items-center gap-2">
              {alert.primaryAction && (
                <button
                  onClick={alert.primaryAction.onClick}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    alert.severity === 'critical'
                      ? 'bg-accent-red text-white hover:brightness-110'
                      : alert.severity === 'warning'
                      ? 'bg-accent-amber text-text-primary hover:brightness-110'
                      : 'bg-accent-blue text-white hover:bg-accent-blue-hover'
                  }`}
                >
                  {alert.primaryAction.label}
                </button>
              )}
              {alert.secondaryAction && (
                <button
                  onClick={alert.secondaryAction.onClick}
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 rounded-lg transition-colors"
                >
                  {alert.secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
