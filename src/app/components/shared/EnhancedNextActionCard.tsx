import { Zap, AlertTriangle, Clock, FileText, User } from 'lucide-react';

export type NextActionSeverity = 'normal' | 'warning' | 'critical';

interface SecondarySignal {
  type: 'overdue' | 'due-soon' | 'awaiting-signature' | 'waiting-on';
  count?: number;
  personName?: string;
}

interface NextActionCardProps {
  // Main content
  title: string;
  subtitle?: string;
  urgencyNote?: string;

  // Severity
  severity?: NextActionSeverity;

  // Secondary signals
  signals?: SecondarySignal[];

  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EnhancedNextActionCard({
  title,
  subtitle,
  urgencyNote,
  severity = 'normal',
  signals = [],
  primaryAction,
  secondaryAction,
}: NextActionCardProps) {
  const severityConfig = {
    normal: {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-blue-soft',
      labelColor: 'text-accent-blue',
      iconColor: 'text-accent-blue',
      urgencyBg: 'bg-accent-blue-soft',
      urgencyText: 'text-text-primary',
    },
    warning: {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-amber-soft',
      labelColor: 'text-accent-amber',
      iconColor: 'text-accent-amber',
      urgencyBg: 'bg-accent-amber-soft',
      urgencyText: 'text-text-primary',
    },
    critical: {
      borderColor: 'border-border-subtle',
      bgColor: 'bg-accent-red-soft',
      labelColor: 'text-accent-red',
      iconColor: 'text-accent-red',
      urgencyBg: 'bg-accent-red-soft',
      urgencyText: 'text-text-primary',
    },
  };

  const config = severityConfig[severity];

  const renderSignalIcon = (type: SecondarySignal['type']) => {
    const iconProps = { size: 14, className: 'flex-shrink-0' };
    switch (type) {
      case 'overdue':
        return <AlertTriangle {...iconProps} className="text-accent-red" />;
      case 'due-soon':
        return <Clock {...iconProps} className="text-accent-amber" />;
      case 'awaiting-signature':
        return <FileText {...iconProps} className="text-accent-blue" />;
      case 'waiting-on':
        return <User {...iconProps} className="text-text-muted" />;
    }
  };

  const renderSignalText = (signal: SecondarySignal) => {
    switch (signal.type) {
      case 'overdue':
        return `${signal.count} overdue`;
      case 'due-soon':
        return `${signal.count} due soon`;
      case 'awaiting-signature':
        return `${signal.count} awaiting signature`;
      case 'waiting-on':
        return `Waiting on: ${signal.personName}`;
    }
  };

  const getSignalColor = (type: SecondarySignal['type']) => {
    switch (type) {
      case 'overdue':
        return 'text-accent-red';
      case 'due-soon':
        return 'text-accent-amber';
      case 'awaiting-signature':
        return 'text-accent-blue';
      case 'waiting-on':
        return 'text-text-secondary';
    }
  };

  return (
    <div className={`bg-bg-surface border-2 ${config.borderColor} rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden`}>
      {/* Top Label */}
      <div className={`${config.bgColor} px-5 py-3 border-b ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <Zap className={config.iconColor} size={16} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${config.labelColor}`}>
            Next Action
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Main Content */}
        <div className="mb-4">
          <h3 className="font-semibold text-text-primary mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>

        {/* Urgency Note */}
        {urgencyNote && (
          <div className={`${config.urgencyBg} rounded-lg px-3 py-2.5 mb-4`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={16} />
              <p className={`text-sm font-medium ${config.urgencyText}`}>
                {urgencyNote}
              </p>
            </div>
          </div>
        )}

        {/* Secondary Signals Row */}
        {signals.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
            {signals.map((signal, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {renderSignalIcon(signal.type)}
                <span className={`text-sm font-medium ${getSignalColor(signal.type)}`}>
                  {renderSignalText(signal)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex gap-3">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex-1 px-4 py-2.5 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-hover transition-all shadow-sm hover:shadow font-medium text-sm"
              >
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-4 py-2.5 bg-bg-surface border border-input-border text-text-secondary rounded-lg hover:bg-bg-app transition-colors font-medium text-sm"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
