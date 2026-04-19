import { Deal, DealPipelineStage, DocumentItem, Message, Task } from '../../types';
import { ProgressBar } from '../shared/ProgressBar';
import { calculateProgress, formatDate } from '../../utils/dealUtils';
import { computeDealNextAction } from '../../utils/dealNextActionEngine';
import { detectDealIssues } from '../../utils/dealIssueDetection';
import { nextActionAccentDotClass } from '../../utils/nextActionDisplay';
import { isDealClosingSoon, isDealStalledByActivity } from '../../utils/workspaceInsights';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

import { ParityTable, ParityTbody } from '../ui/verbatim-table';
import { cn } from '../ui/utils';
import { healthChipClasses, pipelineStageChipClasses } from '../../utils/statusSurfaceTokens';

/** Persisted pipeline stage — same labels as Deal Detail (not derived from deal.status). */
const PIPELINE_STAGE_LABEL: Record<DealPipelineStage, string> = {
  'under-contract': 'Under Contract',
  'due-diligence': 'Due Diligence',
  financing: 'Financing',
  'pre-closing': 'Pre-Closing',
  closing: 'Closing',
};

interface TransactionsTableProps {
  deals: Deal[];
  tasks: Task[];
  documents: DocumentItem[];
  messages: Message[];
  onDealClick: (dealId: string) => void;
}

export function TransactionsTable({ deals, tasks, documents, messages, onDealClick }: TransactionsTableProps) {
  const healthDisplay = (detection: ReturnType<typeof detectDealIssues>) => {
    const { health, issueCount } = detection;
    const row = {
      'on-track': {
        label: 'On Track',
        icon: CheckCircle2,
        className: healthChipClasses['on-track'],
      },
      'needs-attention': {
        label: 'Needs Attention',
        icon: Clock,
        className: healthChipClasses['needs-attention'],
      },
      'at-risk': {
        label: 'At Risk',
        icon: AlertCircle,
        className: healthChipClasses['at-risk'],
      },
    }[health];
    return { ...row, issueCount };
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-12 text-center shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none">
        <div className="mb-4 text-text-muted/40">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mb-2 font-semibold text-text-primary">No transactions found</h3>
        <p className="text-sm text-text-muted">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <ParityTable className="min-w-[680px]">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-elevated/40 dark:bg-bg-elevated/25">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:px-6 sm:text-xs">
                Property
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:px-6 sm:text-xs">
                Pipeline
              </th>
              <th className="min-w-[220px] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:min-w-[280px] sm:px-6 sm:text-xs">
                Next Action
              </th>
              <th
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:px-6 sm:text-xs"
                title="Detected from checklist and closing signals — not pipeline or record status"
              >
                Risk
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:px-6 sm:text-xs">
                Progress
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:px-6 sm:text-xs">
                Closing Date
              </th>
              <th className="px-2 py-3 sm:px-4" aria-hidden />
            </tr>
          </thead>
          <ParityTbody>
            {deals.map(deal => {
              const dealTasks = tasks.filter(t => t.dealId === deal.id);
              const dealDocuments = documents.filter((d) => d.dealId === deal.id);
              const progress = calculateProgress(dealTasks);
              const nextAction = computeDealNextAction(deal, dealTasks, dealDocuments, messages);
              const detection = detectDealIssues(deal, dealTasks, dealDocuments);
              const riskStatus = healthDisplay(detection);
              const pipelineLabel = PIPELINE_STAGE_LABEL[deal.pipelineStage];
              const pipelinePillClass =
                pipelineStageChipClasses[deal.pipelineStage] ??
                'border border-border-subtle bg-bg-elevated/60 text-text-secondary';
              const RiskIcon = riskStatus.icon;

              const surfaceRow =
                detection.health !== 'on-track' ||
                isDealStalledByActivity(deal, messages, dealTasks, dealDocuments) ||
                isDealClosingSoon(deal);

              return (
                <tr
                  key={deal.id}
                  onClick={() => onDealClick(deal.id)}
                  className={cn(
                    'cursor-pointer transition-[background-color] duration-150 ease-out hover:bg-bg-elevated/40',
                    surfaceRow && 'bg-accent-amber-soft/[0.08] dark:bg-accent-amber-soft/[0.06]',
                  )}
                >
                  {/* Property */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="mb-0.5 font-medium text-text-primary">
                      {deal.propertyAddress}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {deal.buyerName}
                    </div>
                  </td>

                  {/* Pipeline — persisted deal.pipelineStage */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${pipelinePillClass}`}
                      title="Pipeline stage saved on the deal — not health"
                    >
                      {pipelineLabel}
                    </span>
                  </td>

                  {/* Next Action — compact display from dealNextActionEngine */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div
                      className="flex items-start gap-2 min-w-0"
                      data-next-action-rule={nextAction.ruleKey}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${nextActionAccentDotClass(nextAction.severity)}`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-text-primary" title={nextAction.title}>
                          {nextAction.title}
                        </div>
                        {nextAction.subtitle ? (
                          <div className="mt-0.5 truncate text-xs text-text-muted" title={nextAction.subtitle}>
                            {nextAction.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Risk — dealIssueDetection */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4" data-deal-health={detection.health}>
                    <div className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${riskStatus.className}`}>
                      <RiskIcon size={14} />
                      <span>{riskStatus.label}</span>
                      {riskStatus.issueCount > 0 ? (
                        <span className="font-normal opacity-90 tabular-nums">({riskStatus.issueCount})</span>
                      ) : null}
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[80px]">
                        <ProgressBar progress={progress} />
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium text-text-muted">
                        {progress}%
                      </span>
                    </div>
                  </td>

                  {/* Closing Date */}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <span className="text-sm text-text-primary">
                      {formatDate(deal.closingDate)}
                    </span>
                  </td>

                  {/* Arrow */}
                  <td className="px-2 py-3 sm:px-4 sm:py-4">
                    <ChevronRight className="text-text-muted" size={20} />
                  </td>
                </tr>
              );
            })}
          </ParityTbody>
        </ParityTable>
      </div>

      {/* Table Footer */}
      <div className="border-t border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/25 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Showing {deals.length} {deals.length === 1 ? 'transaction' : 'transactions'}</span>
        </div>
      </div>
    </div>
  );
}
