import { useMemo, useState } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import type { TransactionTemplate, TemplateCategory } from '../../types/template';
import { isCustomTemplate } from '../../data/userTemplatesStorage';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { ShareTemplateModal } from './sharing/ShareTemplateModal';
import type { Deal } from '../../types';
import { EmptyState } from '../layout/EmptyState';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { SurfaceCard } from '../layout/SurfaceCard';
import { TEMPLATE_APPLY_PHASE2_HINT } from '../../dealDataSource';
import {
  dealsEligibleForTemplateApply,
  resolveApplyTemplateDealEmptyReason,
} from '../../utils/dealLifecycle';
import { useWorkspaceGo } from '../../context/WorkspaceLinkBaseContext';
import { Button } from '../ui/button';

export interface TemplatesPageProps {
  /** Convex snapshot loading — avoids empty deals list in Apply modal during hydration. */
  workspaceLoading?: boolean;
  deals: Deal[];
  onApplyTemplate: (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => void;
  templateApplyDisabled?: boolean;
}

type SortOption = 'most-used' | 'recently-used' | 'name';

export interface TemplatesWorkspaceBodyProps extends TemplatesPageProps {
  templates: TransactionTemplate[];
  /** Return true if the template was removed (modals close for that id). */
  onDeleteCustomRequest: (t: TransactionTemplate) => boolean | Promise<boolean>;
  onDuplicate: (t: TransactionTemplate) => void | Promise<void>;
}

/** Shared list / filters / modals — no Convex hooks (safe without ConvexProvider). */
export function TemplatesWorkspaceBody({
  workspaceLoading = false,
  deals,
  onApplyTemplate,
  templateApplyDisabled = false,
  templates,
  onDeleteCustomRequest,
  onDuplicate,
}: TemplatesWorkspaceBodyProps) {
  const go = useWorkspaceGo();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('most-used');
  const [previewTemplate, setPreviewTemplate] = useState<TransactionTemplate | null>(null);
  const [applyTemplate, setApplyTemplate] = useState<TransactionTemplate | null>(null);
  const [shareTemplate, setShareTemplate] = useState<TransactionTemplate | null>(null);

  const dealsForApply = useMemo(() => dealsEligibleForTemplateApply(deals), [deals]);
  const applyDealEmptyReason = useMemo(
    () => resolveApplyTemplateDealEmptyReason(deals, workspaceLoading),
    [deals, workspaceLoading],
  );

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((template) => {
        const matchesSearch =
          (template.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (template.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'most-used':
            return (b.usageCount ?? 0) - (a.usageCount ?? 0);
          case 'recently-used':
            return (b.lastUsed || '').localeCompare(a.lastUsed || '');
          case 'name':
            return (a.name ?? '').localeCompare(b.name ?? '');
          default:
            return 0;
        }
      });
  }, [templates, searchQuery, categoryFilter, sortBy]);

  const groupedTemplates = {
    'buyer-rep': filteredTemplates.filter((t) => t.category === 'buyer-rep'),
    'seller-rep': filteredTemplates.filter((t) => t.category === 'seller-rep'),
    'dual-rep': filteredTemplates.filter((t) => t.category === 'dual-rep'),
    'commercial': filteredTemplates.filter((t) => t.category === 'commercial'),
  };

  const categoryLabels: Record<TemplateCategory, string> = {
    'buyer-rep': 'Buyer Representation',
    'seller-rep': 'Seller Representation',
    'dual-rep': 'Dual Representation',
    'commercial': 'Commercial',
  };

  const handleDeleteClick = async (t: TransactionTemplate) => {
    const ok = await Promise.resolve(onDeleteCustomRequest(t));
    if (ok) {
      setPreviewTemplate((p) => (p?.id === t.id ? null : p));
      setApplyTemplate((p) => (p?.id === t.id ? null : p));
      setShareTemplate((p) => (p?.id === t.id ? null : p));
    }
  };

  const handleDuplicateClick = (t: TransactionTemplate) => {
    void Promise.resolve(onDuplicate(t));
  };

  return (
    <PageContainer
      after={
        <>
          {previewTemplate && (
            <TemplatePreviewModal
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
              onApply={() => {
                setApplyTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}
              applyDisabled={templateApplyDisabled}
              applyDisabledHint={templateApplyDisabled ? TEMPLATE_APPLY_PHASE2_HINT : undefined}
            />
          )}

          {applyTemplate && (
            <ApplyTemplateModal
              template={applyTemplate}
              deals={dealsForApply}
              dealsWorkspaceLoading={workspaceLoading}
              applyDealEmptyReason={applyDealEmptyReason}
              onClose={() => setApplyTemplate(null)}
              onApply={(dealId, options) => {
                onApplyTemplate(applyTemplate, dealId, options);
                setApplyTemplate(null);
              }}
            />
          )}

          {shareTemplate && (
            <ShareTemplateModal template={shareTemplate} onClose={() => setShareTemplate(null)} />
          )}
        </>
      }
    >
      <PageHeader
        title="Templates & Checklists"
        description="Reusable workflows for every transaction type"
        actions={
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex min-h-[40px] w-full touch-manipulation items-center justify-center gap-2 sm:w-auto"
            >
              <Upload size={16} aria-hidden />
              Import Template
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => go('/templates/new')}
              className="flex min-h-[40px] w-full touch-manipulation items-center justify-center gap-2 sm:w-auto"
            >
              <Plus size={16} aria-hidden />
              New Template
            </Button>
          </div>
        }
      />

      {templateApplyDisabled && (
        <div
          className="mb-6 rounded-lg border border-border-subtle bg-accent-amber-soft px-4 py-3 text-sm text-text-primary"
          role="status"
        >
          {TEMPLATE_APPLY_PHASE2_HINT}
        </div>
      )}

      <SurfaceCard className="mb-8 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-10 pr-4 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
              />
            </div>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
              className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
            >
              <option value="all">All Categories</option>
              <option value="buyer-rep">Buyer Representation</option>
              <option value="seller-rep">Seller Representation</option>
              <option value="dual-rep">Dual Representation</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 ease-out focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] dark:shadow-none"
            >
              <option value="most-used">Most Used</option>
              <option value="recently-used">Recently Used</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </SurfaceCard>

      <div className="space-y-8">
        {(Object.entries(groupedTemplates) as [TemplateCategory, TransactionTemplate[]][]).map(
          ([category, categoryTemplates]) => {
            if (categoryTemplates.length === 0 && categoryFilter !== 'all') return null;
            if (categoryTemplates.length === 0) return null;

            return (
              <div key={category}>
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <h2 className="font-semibold text-text-primary">{categoryLabels[category]}</h2>
                  <span className="shrink-0 text-sm text-text-muted">
                    {categoryTemplates.length}{' '}
                    {categoryTemplates.length === 1 ? 'template' : 'templates'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      origin={isCustomTemplate(template.id) ? 'custom' : 'built-in'}
                      onPreview={() => setPreviewTemplate(template)}
                      onEdit={() => go(`/templates/${template.id}/edit`)}
                      onApply={() => setApplyTemplate(template)}
                      applyDisabled={templateApplyDisabled}
                      applyDisabledTitle={templateApplyDisabled ? TEMPLATE_APPLY_PHASE2_HINT : undefined}
                      onShare={() => setShareTemplate(template)}
                      onDuplicate={() => handleDuplicateClick(template)}
                      onDelete={
                        isCustomTemplate(template.id)
                          ? () => void handleDeleteClick(template)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            );
          },
        )}
      </div>

      {filteredTemplates.length === 0 && (
        <EmptyState title="No templates found" description="Try adjusting your search or filters" />
      )}
    </PageContainer>
  );
}
