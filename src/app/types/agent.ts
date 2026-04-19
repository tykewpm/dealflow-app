export type AgentRole = 'broker' | 'agent' | 'transaction-coordinator' | 'admin';
export type WorkloadLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  activeDeals: number;
  atRiskDeals: number;
  workloadLevel: WorkloadLevel;
  nextAction?: {
    title: string;
    dealId: string;
    dealAddress: string;
  };
  isBlocking?: boolean;
  blockingReason?: string;
}

export interface AgentDetail extends Agent {
  deals: {
    id: string;
    address: string;
    stage: string;
    status: 'on-track' | 'at-risk' | 'overdue';
    closingDate: string;
    nextAction: string;
  }[];
  upcomingTasks: {
    id: string;
    title: string;
    dealAddress: string;
    dueDate: string;
    isOverdue: boolean;
  }[];
}
