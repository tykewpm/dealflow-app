import type { UserWorkloadRow } from '../../utils/agentWorkloadDerivation';
import type { WorkloadLevel } from '../../types/agent';
import { ParityTable, ParityTbody } from '../ui/verbatim-table';

interface AgentsTableProps {
  rows: UserWorkloadRow[];
  onSelectRow: (row: UserWorkloadRow) => void;
}

export function AgentsTable({ rows, onSelectRow }: AgentsTableProps) {
  const workloadConfig: Record<WorkloadLevel, { label: string; color: string; width: string }> = {
    light: { label: 'Light', color: 'bg-accent-green', width: 'w-1/4' },
    normal: { label: 'Normal', color: 'bg-accent-blue', width: 'w-1/2' },
    heavy: { label: 'Heavy', color: 'bg-accent-amber', width: 'w-3/4' },
    overloaded: { label: 'Overloaded', color: 'bg-accent-red', width: 'w-full' },
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <ParityTable className="min-w-[880px]">
          <thead className="border-b border-border-subtle bg-bg-app dark:bg-bg-elevated/40">
            <tr>
            <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Team member
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Active deals
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Open tasks
            </th>
            <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Next task
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Overdue
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              At-risk deals
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Docs open
            </th>
            <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-text-muted sm:px-5 sm:text-xs">
              Load
            </th>
          </tr>
        </thead>
        <ParityTbody>
          {rows.map((row) => {
            const workload = workloadConfig[row.workloadLevel];

            return (
              <tr
                key={row.userId}
                onClick={() => onSelectRow(row)}
                className="cursor-pointer transition-colors hover:bg-bg-elevated/50"
              >
                <td className="px-3 py-3 sm:px-5 sm:py-4">
                  <div className="font-medium text-text-primary">{row.name}</div>
                  <div className="text-sm text-text-muted">{row.email}</div>
                </td>
                <td className="px-3 py-3 text-center sm:px-5 sm:py-4">
                  <span className="text-sm font-semibold text-text-primary">{row.activeDealsTouched}</span>
                </td>
                <td className="px-3 py-3 text-center sm:px-5 sm:py-4">
                  <span className="text-sm font-semibold text-text-primary">{row.openAssignedTasks}</span>
                </td>
                <td className="px-3 py-3 sm:px-5 sm:py-4">
                  {row.nextUrgent ? (
                    <div className="min-w-0 max-w-[220px] sm:max-w-none">
                      <div className="mb-0.5 text-sm font-medium text-text-primary">{row.nextUrgent.title}</div>
                      <div className="text-xs text-text-muted">{row.nextUrgent.dealAddress}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-text-disabled">No assigned open tasks</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center sm:px-5 sm:py-4">
                  {row.overdueTasks > 0 ? (
                    <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-border-subtle bg-accent-red-soft px-1.5 text-xs font-semibold text-accent-red dark:text-text-primary">
                      {row.overdueTasks}
                    </span>
                  ) : (
                    <span className="text-sm text-text-disabled">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center sm:px-5 sm:py-4">
                  {row.dealsDerivedAtRiskHealth > 0 ? (
                    <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-border-subtle bg-accent-amber-soft px-1.5 text-xs font-semibold text-accent-amber dark:text-text-primary">
                      {row.dealsDerivedAtRiskHealth}
                    </span>
                  ) : (
                    <span className="text-sm text-text-disabled">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center sm:px-5 sm:py-4">
                  <span className="text-sm text-text-secondary">{row.incompleteDocumentsOnWorkloadDeals}</span>
                </td>
                <td className="px-3 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-2 max-w-[100px] flex-1 rounded-full bg-border-subtle/50 sm:max-w-[120px]">
                      <div className={`h-2 rounded-full ${workload.color} ${workload.width}`} />
                    </div>
                    <span className="min-w-[68px] text-xs text-text-secondary sm:min-w-[72px]">{workload.label}</span>
                  </div>
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
