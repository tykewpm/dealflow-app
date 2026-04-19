import { Search } from 'lucide-react';

import { SurfaceCard } from '../layout/SurfaceCard';

interface TransactionsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: string;
  onStageFilterChange: (stage: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  agentFilter: string;
  onAgentFilterChange: (agent: string) => void;
}

export function TransactionsFilters({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  statusFilter,
  onStatusFilterChange,
  agentFilter,
  onAgentFilterChange,
}: TransactionsFiltersProps) {
  return (
    <SurfaceCard className="mb-6 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by address or buyer name..."
              className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-10 pr-4 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
            />
          </div>
        </div>

        {/* Stage Filter */}
        <div>
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
          >
            <option value="all">All Stages</option>
            <option value="under-contract">Under Contract</option>
            <option value="due-diligence">Due Diligence</option>
            <option value="financing">Financing</option>
            <option value="pre-closing">Pre-Closing</option>
            <option value="closing">Closing</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>
    </SurfaceCard>
  );
}
