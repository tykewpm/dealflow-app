export type DealHealthStatus = 'on-track' | 'needs-attention' | 'at-risk';

export type RiskSeverity = 'critical' | 'warning' | 'info';

export type RiskType =
  | 'missing-document'
  | 'signature-delay'
  | 'overdue-task'
  | 'closing-risk'
  | 'deadline-approaching';

export interface DealHealthSummary {
  status: DealHealthStatus;
  totalIssues: number;
  awaitingSignature: number;
  dueSoon: number;
  waitingOn?: {
    name: string;
    role: string;
  };
}

export interface RiskAlert {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  explanation: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export type DocumentPriority = 'blocking' | 'needs-attention' | 'on-track';

export interface DocumentPriorityState {
  priority: DocumentPriority;
  subtext?: string;
}
