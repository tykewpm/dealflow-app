import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TransactionTemplate } from '../../types/template';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { useWorkspaceRelativeHref } from '../../context/WorkspaceLinkBaseContext';
import { Deal } from '../../types';
import type { ApplyTemplateDealEmptyReason } from '../../utils/dealLifecycle';
import { X, Zap, CheckSquare, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface ApplyTemplateModalProps {
  template: TransactionTemplate;
  deals: Deal[];
  /** Convex: workspace snapshot still loading — avoid empty deal list looking like “no deals”. */
  dealsWorkspaceLoading?: boolean;
  /** When `deals` is empty and not loading — why (from full workspace + same loading flag). */
  applyDealEmptyReason?: ApplyTemplateDealEmptyReason;
  onClose: () => void;
  onApply: (dealId: string, options: { includeTasks: boolean; includeDocuments: boolean }) => void;
}

export function ApplyTemplateModal({
  template,
  deals,
  dealsWorkspaceLoading = false,
  applyDealEmptyReason,
  onClose,
  onApply,
}: ApplyTemplateModalProps) {
  const rel = useWorkspaceRelativeHref();
  const dealsLoadingFromBackend =
    dealsWorkspaceLoading && shouldUseConvexWorkspaceReads();
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);

  const handleApply = () => {
    if (!selectedDealId) return;
    onApply(selectedDealId, { includeTasks, includeDocuments });
  };

  const selectedDeal = deals.find(d => d.id === selectedDealId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-xl dark:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
          <div className="flex-1 pr-4">
            <h2 className="mb-1 font-semibold text-text-primary">Apply Template to Deal</h2>
            <p className="text-sm text-text-secondary">
              Add tasks and documents from "{template.name}" to an active pipeline deal (not closed or archived).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated/80 hover:text-text-primary"
          >
            <X size={20} className="text-current" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Select Deal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Select Deal</label>
            {dealsLoadingFromBackend ? (
              <p className="rounded-lg border border-border-subtle bg-accent-blue-soft px-3 py-2 text-sm text-text-primary">
                Loading deals from your workspace…
              </p>
            ) : deals.length === 0 ? (
              <div className="rounded-lg border border-border-subtle bg-bg-app px-3 py-3 text-sm text-text-secondary dark:bg-bg-elevated/30">
                {applyDealEmptyReason === 'all-complete' ? (
                  <>
                    <p className="mb-2">
                      Every non-archived deal is already closed (health status). Applying a template adds work to
                      active pipeline deals—create a new deal if you need to run another workflow.
                    </p>
                    <Link
                      to={rel('/deals/new')}
                      className="font-medium text-accent-blue hover:underline"
                      onClick={onClose}
                    >
                      Create a deal
                    </Link>
                  </>
                ) : applyDealEmptyReason === 'only-archived' ? (
                  <>
                    <p className="mb-2">
                      All deals are archived. Restore one from Dashboard → Archived, or create a new deal to apply
                      this template.
                    </p>
                    <Link
                      to={rel('/')}
                      className="font-medium text-accent-blue hover:underline"
                      onClick={onClose}
                    >
                      Open Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mb-2">No deals in this workspace yet.</p>
                    <Link
                      to={rel('/deals/new')}
                      className="font-medium text-accent-blue hover:underline"
                      onClick={onClose}
                    >
                      Create a deal
                    </Link>{' '}
                    first, then apply this template again.
                  </>
                )}
              </div>
            ) : (
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25"
              >
                <option value="">Choose a deal...</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.propertyAddress} - {deal.buyerName}
                  </option>
                ))}
              </select>
            )}
            {selectedDeal && (
              <div className="mt-2 rounded-lg border border-border-subtle bg-accent-blue-soft p-3">
                <div className="text-sm font-medium text-text-primary">{selectedDeal.propertyAddress}</div>
                <div className="mt-0.5 text-xs text-text-secondary">
                  Buyer: {selectedDeal.buyerName} • Closing: {selectedDeal.closingDate}
                </div>
              </div>
            )}
          </div>

          {/* Template Preview */}
          <div className="rounded-lg border border-border-subtle bg-bg-app p-4 dark:bg-bg-elevated/25">
            <div className="mb-3 text-sm font-medium text-text-primary">
              Template: {template.name}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-accent-blue" size={16} />
                <span className="text-sm text-text-secondary">
                  {template.tasks.length} tasks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-text-muted" size={16} />
                <span className="text-sm text-text-secondary">
                  {template.documents.length} documents
                </span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="mb-3 block text-sm font-medium text-text-primary">
              What to Include
            </label>
            <div className="space-y-3">
              {/* Include Tasks */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 transition-colors hover:bg-bg-elevated/40">
                <input
                  type="checkbox"
                  checked={includeTasks}
                  onChange={(e) => setIncludeTasks(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-border-subtle text-accent-blue focus:ring-accent-blue/30"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckSquare className="text-accent-blue" size={16} />
                    <span className="text-sm font-medium text-text-primary">Include Tasks</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Add {template.tasks.length} workflow tasks to this deal
                  </p>
                </div>
              </label>

              {/* Include Documents */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 transition-colors hover:bg-bg-elevated/40">
                <input
                  type="checkbox"
                  checked={includeDocuments}
                  onChange={(e) => setIncludeDocuments(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-border-subtle text-accent-blue focus:ring-accent-blue/30"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <FileText className="text-text-muted" size={16} />
                    <span className="text-sm font-medium text-text-primary">Include Documents</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Add {template.documents.length} required documents to this deal
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Warning if nothing selected */}
          {!includeTasks && !includeDocuments && (
            <div className="flex items-start gap-2 rounded-lg border border-border-subtle bg-accent-amber-soft p-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-text-primary">
                Please select at least one option to apply the template
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border-subtle bg-bg-app px-6 py-4 dark:bg-bg-elevated/20">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleApply}
            disabled={
              dealsWorkspaceLoading ||
              deals.length === 0 ||
              !selectedDealId ||
              (!includeTasks && !includeDocuments)
            }
            className="gap-2"
          >
            <Zap size={16} />
            Apply Template
          </Button>
        </div>
      </div>
    </div>
  );
}
