export interface MetricTrend {
  value: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface ExecutiveSummary {
  dealsClosed: MetricTrend;
  avgDaysToClose: MetricTrend;
  atRiskDeals: MetricTrend;
  fallThroughRate: MetricTrend;
}

export interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface DealHealthDistribution {
  onTrack: number;
  needsAttention: number;
  atRisk: number;
}

export interface DelayFactor {
  factor: string;
  count: number;
  percentage: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  dealsClosed: number;
  avgCloseTime: number;
  atRiskDeals: number;
}

export interface NextActionInsight {
  action: string;
  frequency: number;
}

export interface ReportData {
  executiveSummary: ExecutiveSummary;
  pipelineDropOff: PipelineStage[];
  dealHealth: DealHealthDistribution;
  delayFactors: DelayFactor[];
  agentPerformance: AgentPerformance[];
  nextActionInsights: NextActionInsight[];
}

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface DrillDownDeal {
  id: string;
  address: string;
  stage: string;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  closingDate: string;
  daysInStage: number;
  nextAction: string;
}

export type DrillDownType =
  | 'deals-closed'
  | 'at-risk-deals'
  | 'on-track'
  | 'needs-attention'
  | 'at-risk-status'
  | 'delay-factor'
  | 'next-action';
