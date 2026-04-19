import { DealHealthSummary, RiskAlert } from '../types/dealHealth';

export const mockDealHealthSummary: DealHealthSummary = {
  status: 'needs-attention',
  totalIssues: 2,
  awaitingSignature: 1,
  dueSoon: 3,
  waitingOn: {
    name: 'Emily Rodriguez',
    role: 'Transaction Coordinator',
  },
};

export const mockRiskAlerts: RiskAlert[] = [
  {
    id: 'risk-1',
    type: 'signature-delay',
    severity: 'critical',
    title: 'Purchase Agreement Signature Overdue',
    explanation: 'Buyer signatures have been pending for 48 hours. This may delay closing if not resolved soon.',
    primaryAction: {
      label: 'Send Reminder',
      onClick: () => console.log('Send reminder clicked'),
    },
    secondaryAction: {
      label: 'View Document',
      onClick: () => console.log('View document clicked'),
    },
  },
  {
    id: 'risk-2',
    type: 'closing-risk',
    severity: 'warning',
    title: 'Appraisal Deadline Approaching',
    explanation: 'The appraisal contingency expires in 2 days. Appraisal has not been completed yet.',
    primaryAction: {
      label: 'Check Status',
      onClick: () => console.log('Check status clicked'),
    },
    secondaryAction: {
      label: 'Extend Deadline',
      onClick: () => console.log('Extend deadline clicked'),
    },
  },
  {
    id: 'risk-3',
    type: 'missing-document',
    severity: 'warning',
    title: 'Missing Required Documents',
    explanation: 'Home inspection report and seller disclosures have not been uploaded.',
    primaryAction: {
      label: 'Upload Documents',
      onClick: () => console.log('Upload documents clicked'),
    },
  },
  {
    id: 'risk-4',
    type: 'deadline-approaching',
    severity: 'info',
    title: 'Final Walkthrough Scheduled',
    explanation: 'Final walkthrough is scheduled for tomorrow at 2:00 PM. Make sure all parties are notified.',
    primaryAction: {
      label: 'Send Notifications',
      onClick: () => console.log('Send notifications clicked'),
    },
    secondaryAction: {
      label: 'View Details',
      onClick: () => console.log('View details clicked'),
    },
  },
];
