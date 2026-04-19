import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  CalendarDays,
} from 'lucide-react';
import { mockReportData, mockDrillDownDeals } from '../../data/reportData';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { DateRange, DrillDownDeal } from '../../types/report';
import { PipelineDropOff } from './PipelineDropOff';
import { DealHealthChart } from './DealHealthChart';
import { DelayFactors } from './DelayFactors';
import { AgentPerformanceTable } from './AgentPerformanceTable';
import { NextActionInsights } from './NextActionInsights';
import { DrillDownModal } from './DrillDownModal';
import { exportToCSV, exportToPDF } from '../../utils/exportReports';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/button';

type ReportWorkspaceMetrics = {
  dealHealth: { onTrack: number; needsAttention: number; atRisk: number };
  pipelineDropOff: Array<{ stage: string; count: number; percentage: number }>;
  dealsClosedCount: number;
  closingSoonCount: number;
};

function ReportsPageDataWrapper() {
  const useConvexReports = shouldUseConvexWorkspaceReads();
  const workspaceMetrics = useQuery(
    api.reports.getWorkspaceReportMetrics,
    useConvexReports ? {} : 'skip',
  );
  return (
    <ReportsPageBody useConvexReports={useConvexReports} workspaceMetrics={workspaceMetrics} />
  );
}

export function ReportsPage() {
  if (!shouldUseConvexWorkspaceReads()) {
    return <ReportsPageBody useConvexReports={false} workspaceMetrics={undefined} />;
  }
  return <ReportsPageDataWrapper />;
}

function ReportsPageBody({
  useConvexReports,
  workspaceMetrics,
}: {
  useConvexReports: boolean;
  workspaceMetrics: ReportWorkspaceMetrics | undefined;
}) {
  /** Convex: until the query resolves, avoid zero-filled live metrics and Deal Health empty-state copy. */
  const reportsWorkspaceLoading = useConvexReports && workspaceMetrics === undefined;

  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [drillDownData, setDrillDownData] = useState<{
    title: string;
    deals: DrillDownDeal[];
  } | null>(null);

  const reportData = mockReportData;

  const dealHealth = useConvexReports
    ? (workspaceMetrics?.dealHealth ?? { onTrack: 0, needsAttention: 0, atRisk: 0 })
    : mockReportData.dealHealth;

  const pipelineDropOff = useConvexReports
    ? (workspaceMetrics?.pipelineDropOff ?? [])
    : mockReportData.pipelineDropOff;

  const dealsClosedCount =
    useConvexReports && workspaceMetrics !== undefined
      ? workspaceMetrics.dealsClosedCount
      : null;

  /** Same count as Deal Health "At Risk" segment: `deals.status === 'at-risk'`. */
  const atRiskDealsCount =
    useConvexReports && workspaceMetrics !== undefined
      ? workspaceMetrics.dealHealth.atRisk
      : null;

  const closingSoonCount =
    useConvexReports && workspaceMetrics !== undefined ? workspaceMetrics.closingSoonCount : null;

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
  ];

  const handleExportCSV = () => {
    exportToCSV(reportData, dateRangeOptions.find(o => o.value === dateRange)?.label || dateRange);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(reportData, dateRangeOptions.find(o => o.value === dateRange)?.label || dateRange);
    setShowExportMenu(false);
  };

  const handleDrillDown = (type: string, title: string) => {
    const deals = mockDrillDownDeals[type] || [];
    setDrillDownData({ title, deals });
  };

  const renderTrendIndicator = (direction: 'up' | 'down' | 'neutral', changePercent: number, isPositive: boolean) => {
    if (direction === 'neutral') return null;

    const Icon = direction === 'up' ? TrendingUp : TrendingDown;
    const colorClass = isPositive
      ? 'text-accent-green bg-accent-green-soft border border-border-subtle'
      : 'text-accent-red bg-accent-red-soft border border-border-subtle';

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        <Icon size={12} />
        <span>{Math.abs(changePercent).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Track performance, identify bottlenecks, and improve deal execution"
        actions={
          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:max-w-xl sm:flex-row sm:flex-wrap sm:items-start sm:justify-end sm:gap-3 lg:max-w-none">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              aria-describedby={useConvexReports ? 'reports-date-range-hint' : undefined}
              className="min-h-[40px] w-full rounded-lg border border-border-subtle bg-input-bg py-2 pl-4 pr-10 text-sm font-medium text-text-primary transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25 sm:w-auto sm:min-w-[200px] touch-manipulation"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {useConvexReports && (
              <span
                id="reports-date-range-hint"
                className="text-xs leading-snug text-text-muted sm:max-w-[220px] sm:text-right"
              >
                Applies to demo sections & export labels only; live metrics stay unfiltered.
              </span>
            )}

            <div className="relative w-full sm:w-auto">
              <Button
                type="button"
                variant={useConvexReports ? 'secondary' : 'accent'}
                onClick={() => !useConvexReports && setShowExportMenu(!showExportMenu)}
                disabled={useConvexReports}
                title={
                  useConvexReports
                    ? 'Export uses demo sample data only — disabled while viewing live workspace metrics.'
                    : undefined
                }
                className={`flex min-h-[40px] w-full items-center justify-center gap-2 sm:w-auto sm:py-2 touch-manipulation ${
                  useConvexReports ? 'cursor-not-allowed shadow-none' : ''
                }`}
              >
                <Download size={16} aria-hidden />
                Export
                <ChevronDown size={14} aria-hidden />
              </Button>

              {!useConvexReports && showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-lg dark:shadow-none sm:left-auto sm:right-0 sm:w-48">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-bg-surface/80"
                    >
                      <FileSpreadsheet size={16} className="text-text-muted" aria-hidden />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="flex w-full items-center gap-3 border-t border-border-subtle px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-bg-surface/80"
                    >
                      <FileText size={16} className="text-text-muted" aria-hidden />
                      <span>Export as PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

        {reportsWorkspaceLoading ? (
          <div
            className="mb-8 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center shadow-sm dark:shadow-none sm:p-12"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-text-primary">Loading workspace metrics…</p>
            <p className="mt-2 text-sm text-text-muted">Fetching report totals from the server.</p>
          </div>
        ) : (
          <>
        {useConvexReports && (
          <div
            className="mb-6 rounded-lg border border-border-subtle bg-accent-blue-soft px-4 py-3 text-sm leading-relaxed text-text-primary"
            role="status"
          >
            <p className="mb-1 font-medium text-text-primary">Live workspace vs demo on this page</p>
            <ul className="list-inside list-disc space-y-0.5 text-text-secondary">
              <li>
                <strong>Live</strong> (Convex): Deals Closed, Closing Soon, At Risk counts, Pipeline
                distribution, and Deal Health chart — current totals from your workspace. They are{' '}
                <strong>not filtered</strong> by the date range yet.
              </li>
              <li>
                <strong>Demo / placeholder</strong>: Average days and fall-through in the summary row,
                Delay factors, Next actions, and Agent performance use sample data.
              </li>
              <li>
                Export downloads the <strong>demo report snapshot</strong>; it is disabled in live mode to
                avoid mixing sample exports with live headline metrics.
              </li>
            </ul>
          </div>
        )}

        {/* Executive Summary — Convex uses 5 cards; mock uses 4 (intentional grid split) */}
        <div
          className={
            useConvexReports
              ? 'mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              : 'mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'
          }
        >
          {useConvexReports ? (
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Deals Closed</span>
                <div className="w-10 h-10 bg-accent-green-soft rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-accent-green" size={20} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mb-2">
                {dealsClosedCount ?? '—'}
              </div>
              <p className="text-xs text-text-muted">
                Deals with status &quot;complete&quot; in your workspace. Period trends not applied yet.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleDrillDown('deals-closed', 'Deals Closed')}
              className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5 hover:border-border-strong transition-[border-color,box-shadow] dark:hover:shadow-none text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Deals Closed</span>
                <div className="w-10 h-10 bg-accent-green-soft rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-accent-green" size={20} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mb-2">
                {reportData.executiveSummary.dealsClosed.value}
              </div>
              <div className="flex items-center gap-2">
                {renderTrendIndicator(
                  reportData.executiveSummary.dealsClosed.direction,
                  reportData.executiveSummary.dealsClosed.changePercent,
                  true,
                )}
                <span className="text-xs text-text-muted">vs previous period</span>
              </div>
            </button>
          )}

          {useConvexReports && (
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Closing Soon</span>
                <div className="w-10 h-10 bg-accent-blue-soft rounded-lg flex items-center justify-center">
                  <CalendarDays className="text-accent-blue" size={20} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mb-2">
                {closingSoonCount ?? '—'}
              </div>
              <p className="text-xs text-text-muted">
                Deals not complete with closing date in the next 7 calendar days (UTC). Period trends not
                applied yet.
              </p>
            </div>
          )}

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Avg Days to Close</span>
              <div className="w-10 h-10 bg-accent-blue-soft rounded-lg flex items-center justify-center">
                <Clock className="text-accent-blue" size={20} />
              </div>
            </div>
            <div className="text-3xl font-semibold text-text-primary mb-2">
              {reportData.executiveSummary.avgDaysToClose.value}
            </div>
            <div className="flex items-center gap-2">
              {renderTrendIndicator(
                reportData.executiveSummary.avgDaysToClose.direction,
                reportData.executiveSummary.avgDaysToClose.changePercent,
                reportData.executiveSummary.avgDaysToClose.direction === 'down'
              )}
              <span className="text-xs text-text-muted">vs previous period</span>
            </div>
            {useConvexReports && (
              <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border-subtle">
                Demo placeholder — not loaded from your workspace.
              </p>
            )}
          </div>

          {useConvexReports ? (
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">At Risk Deals</span>
                <div className="w-10 h-10 bg-accent-red-soft rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-accent-red" size={20} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mb-2">
                {atRiskDealsCount ?? '—'}
              </div>
              <p className="text-xs text-text-muted">
                Deals with status &quot;at-risk&quot; (matches At Risk in deal health below). Period trends
                not applied yet.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleDrillDown('at-risk-deals', 'At Risk Deals')}
              className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5 hover:border-border-strong transition-[border-color,box-shadow] dark:hover:shadow-none text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">At Risk Deals</span>
                <div className="w-10 h-10 bg-accent-red-soft rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-accent-red" size={20} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mb-2">
                {reportData.executiveSummary.atRiskDeals.value}
              </div>
              <div className="flex items-center gap-2">
                {renderTrendIndicator(
                  reportData.executiveSummary.atRiskDeals.direction,
                  reportData.executiveSummary.atRiskDeals.changePercent,
                  reportData.executiveSummary.atRiskDeals.direction === 'down',
                )}
                <span className="text-xs text-text-muted">vs previous period</span>
              </div>
            </button>
          )}

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Fall Through Rate</span>
              <div className="w-10 h-10 bg-accent-amber-soft rounded-lg flex items-center justify-center">
                <TrendingDown className="text-accent-amber" size={20} />
              </div>
            </div>
            <div className="text-3xl font-semibold text-text-primary mb-2">
              {reportData.executiveSummary.fallThroughRate.value}%
            </div>
            <div className="flex items-center gap-2">
              {renderTrendIndicator(
                reportData.executiveSummary.fallThroughRate.direction,
                reportData.executiveSummary.fallThroughRate.changePercent,
                reportData.executiveSummary.fallThroughRate.direction === 'down'
              )}
              <span className="text-xs text-text-muted">vs previous period</span>
            </div>
            {useConvexReports && (
              <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border-subtle">
                Demo placeholder — not loaded from your workspace.
              </p>
            )}
          </div>
        </div>

        {/* Pipeline and Deal Health Row — live Convex counts when workspace mode is convex */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          <div>
            {useConvexReports && (
              <p className="text-xs text-text-muted mb-2">
                Pipeline distribution reflects current deals in your workspace.
              </p>
            )}
            <PipelineDropOff stages={pipelineDropOff} />
          </div>
          <div>
            {useConvexReports && (
              <p className="text-xs text-text-muted mb-2">
                Health buckets use each deal&apos;s saved status (active, overdue, at-risk).
              </p>
            )}
            <DealHealthChart
              health={dealHealth}
              drillDownEnabled={!useConvexReports}
              onDrillDown={(type) => {
                const titles = {
                  'on-track': 'On Track Deals',
                  'needs-attention': 'Deals Needing Attention',
                  'at-risk-status': 'At Risk Deals',
                };
                handleDrillDown(type, titles[type]);
              }}
            />
          </div>
        </div>

        {/* Delay Factors and Next Actions Row */}
        <div className="mb-6">
          {useConvexReports && (
            <p className="text-xs font-medium text-text-secondary mb-2">
              Sample insights — not loaded from your workspace
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
            <DelayFactors
              factors={reportData.delayFactors}
              drillDownEnabled={!useConvexReports}
              onDrillDown={(factor) => handleDrillDown(factor, `Deals with ${factor.replace(/-/g, ' ')}`)}
            />
            <NextActionInsights insights={reportData.nextActionInsights} />
          </div>
        </div>

        {/* Agent Performance Table */}
        <div>
          {useConvexReports && (
            <p className="text-xs font-medium text-text-secondary mb-2">
              Sample agent metrics — not loaded from your workspace
            </p>
          )}
          <AgentPerformanceTable agents={reportData.agentPerformance} />
        </div>
          </>
        )}

      {/* Drill-Down Modal */}
      {drillDownData && (
        <DrillDownModal
          title={drillDownData.title}
          deals={drillDownData.deals}
          onClose={() => setDrillDownData(null)}
        />
      )}
    </PageContainer>
  );
}
