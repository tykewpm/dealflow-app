import { AgentPerformance } from '../../types/report';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { ParityTable, ParityTbody } from '../ui/verbatim-table';

interface AgentPerformanceTableProps {
  agents: AgentPerformance[];
}

export function AgentPerformanceTable({ agents }: AgentPerformanceTableProps) {
  const avgCloseTime = agents.reduce((sum, a) => sum + a.avgCloseTime, 0) / agents.length;

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
      <div className="border-b border-border-subtle px-4 py-4 sm:px-5">
        <h3 className="font-semibold text-text-primary">Agent Performance</h3>
      </div>

      <div className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <ParityTable className="min-w-[520px]">
          <thead className="border-b border-border-subtle bg-bg-app dark:bg-bg-elevated/40">
            <tr>
            <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Agent
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Deals Closed
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Avg Close Time
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              At Risk
            </th>
          </tr>
        </thead>
        <ParityTbody>
          {agents.map((agent) => {
            const isFasterThanAvg = agent.avgCloseTime < avgCloseTime;

            return (
              <tr key={agent.agentId} className="transition-colors hover:bg-bg-elevated/40">
                <td className="px-3 py-4 sm:px-5">
                  <span className="font-medium text-text-primary">{agent.agentName}</span>
                </td>
                <td className="px-3 py-4 text-center sm:px-5">
                  <span className="text-sm font-semibold text-text-primary">
                    {agent.dealsClosed}
                  </span>
                </td>
                <td className="px-3 py-4 sm:px-5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {agent.avgCloseTime}d
                    </span>
                    {isFasterThanAvg ? (
                      <TrendingDown size={14} className="text-accent-green" aria-hidden />
                    ) : (
                      <TrendingUp size={14} className="text-accent-amber" aria-hidden />
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-center sm:px-5">
                  {agent.atRiskDeals > 0 ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-accent-red-soft text-xs font-semibold text-accent-red dark:text-text-primary">
                      {agent.atRiskDeals}
                    </span>
                  ) : (
                    <span className="text-sm text-text-disabled">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </ParityTbody>
        </ParityTable>
      </div>
    </div>
  );
}
