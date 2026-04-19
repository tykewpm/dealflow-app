import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { TransactionTemplate, TemplateStage } from '../../../types/template';
import { api } from '../../../../../convex/_generated/api';
import { mockTemplates } from '../../../data/templateData';
import { getTemplateById } from '../../../data/userTemplatesStorage';
import { CheckSquare, FileText, User, TrendingUp, Zap, Calendar, PenTool } from 'lucide-react';
import { Deal } from '../../../types';
import { ApplyTemplateModal } from '../ApplyTemplateModal';
import { WorkspaceLoadingPanel } from '../../layout/WorkspaceLoadingPanel';
import {
  isDemoRoutesIsolationActive,
  shouldUseConvexWorkspaceReads,
  TEMPLATE_APPLY_PHASE2_HINT,
} from '../../../dealDataSource';
import { useWorkspaceGo } from '../../../context/WorkspaceLinkBaseContext';
import {
  dealsEligibleForTemplateApply,
  resolveApplyTemplateDealEmptyReason,
} from '../../../utils/dealLifecycle';

interface SharedTemplateViewProps {
  workspaceLoading?: boolean;
  deals: Deal[];
  onApplyTemplate: (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => void;
  templateApplyDisabled?: boolean;
}

export function SharedTemplateView(props: SharedTemplateViewProps) {
  if (isDemoRoutesIsolationActive()) {
    return (
      <div className="min-h-full bg-bg-app flex flex-col items-center justify-center gap-3 p-8 text-center text-sm text-text-secondary">
        <p className="text-base font-medium text-text-primary">Shared template</p>
        <p className="max-w-md leading-relaxed">
          Shared template links load from your signed-in workspace. In this offline demo, open{' '}
          <strong>Templates &amp; Checklists</strong> in the sidebar instead.
        </p>
      </div>
    );
  }
  return <SharedTemplateViewInner {...props} />;
}

function SharedTemplateViewInner({
  workspaceLoading = false,
  deals,
  onApplyTemplate,
  templateApplyDisabled = false,
}: SharedTemplateViewProps) {
  const { templateId } = useParams<{ templateId: string }>();
  const go = useWorkspaceGo();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const dealsForApply = useMemo(() => dealsEligibleForTemplateApply(deals), [deals]);
  const applyDealEmptyReason = resolveApplyTemplateDealEmptyReason(deals, workspaceLoading);

  const useConvexTemplates = shouldUseConvexWorkspaceReads();
  const builtinTemplate = useMemo(
    () =>
      templateId !== undefined ? mockTemplates.find((t) => t.id === templateId) : undefined,
    [templateId],
  );
  const convexTemplate = useQuery(
    api.customTemplates.getById,
    useConvexTemplates && templateId && !builtinTemplate ? { templateId } : 'skip',
  );

  const template: TransactionTemplate | undefined = useMemo(() => {
    if (!templateId) return undefined;
    if (builtinTemplate) return builtinTemplate;
    if (useConvexTemplates) {
      return convexTemplate ?? undefined;
    }
    return getTemplateById(templateId);
  }, [templateId, builtinTemplate, useConvexTemplates, convexTemplate]);

  const loadingConvex =
    useConvexTemplates &&
    !!templateId &&
    !builtinTemplate &&
    convexTemplate === undefined;

  if (loadingConvex) {
    return (
      <div className="min-h-full bg-bg-app flex items-center justify-center p-6">
        <WorkspaceLoadingPanel
          title="Loading template…"
          subtitle="Fetching template details from your workspace."
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (!template) {
    const notFoundHint = useConvexTemplates
      ? 'If this link came from another app environment or deployment, or the template was deleted, it will not load here.'
      : 'Built-in templates use ids such as tmp1. Custom templates saved only in this browser cannot be opened from another device until they are stored in your workspace backend.';

    return (
      <div className="min-h-full bg-bg-app flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h2 className="font-semibold text-text-primary mb-2">Template not found</h2>
          <p className="text-text-secondary mb-3">
            This template may have been removed, or the link may be incorrect.
          </p>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">{notFoundHint}</p>
          <button
            onClick={() => go('/templates')}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-hover transition-colors font-medium"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  const stageConfig: Record<TemplateStage, { label: string; color: string }> = {
    'under-contract': { label: 'Under Contract', color: 'bg-accent-blue-soft text-accent-blue' },
    'due-diligence': { label: 'Due Diligence', color: 'bg-accent-green-soft text-accent-green' },
    'financing': { label: 'Financing', color: 'bg-accent-amber-soft text-accent-amber' },
    'pre-closing': { label: 'Pre-Closing', color: 'bg-bg-elevated/60 text-text-secondary border border-border-subtle' },
    'closing': { label: 'Closing', color: 'bg-accent-green-soft text-accent-green' },
  };

  // Group tasks by stage
  const tasksByStage = template.stages.reduce((acc, stage) => {
    acc[stage] = template.tasks.filter(t => t.stage === stage);
    return acc;
  }, {} as Record<TemplateStage, typeof template.tasks>);

  // Group documents by stage
  const documentsByStage = template.stages.reduce((acc, stage) => {
    acc[stage] = template.documents.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<TemplateStage, typeof template.documents>);

  return (
    <div className="min-h-full bg-bg-app">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 mb-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-text-primary mb-2">{template.name}</h1>
            <p className="text-text-secondary">{template.description}</p>
          </div>

          {/* Creator & Stats */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={16} />
              <span>Shared by TransactQ Team</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <TrendingUp size={16} />
              <span>Used {template.usageCount} times</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-accent-blue-soft border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="text-accent-blue" size={18} />
                <span className="font-semibold text-text-primary">{template.tasks.length}</span>
              </div>
              <div className="text-sm text-accent-blue">Workflow Tasks</div>
            </div>
            <div className="bg-accent-blue-soft border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="text-accent-blue" size={18} />
                <span className="font-semibold text-text-primary">{template.documents.length}</span>
              </div>
              <div className="text-sm text-accent-blue">Documents</div>
            </div>
            <div className="bg-accent-green-soft border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <PenTool className="text-accent-green" size={18} />
                <span className="font-semibold text-text-primary">
                  {template.documents.filter(d => d.signatureRequired).length}
                </span>
              </div>
              <div className="text-sm text-accent-green">Signatures</div>
            </div>
          </div>

          {templateApplyDisabled && (
            <p
              className="mb-4 rounded-lg border border-border-subtle bg-accent-amber-soft px-4 py-3 text-sm text-text-primary"
              role="status"
            >
              {TEMPLATE_APPLY_PHASE2_HINT}
            </p>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            disabled={templateApplyDisabled}
            title={templateApplyDisabled ? TEMPLATE_APPLY_PHASE2_HINT : undefined}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-hover transition-all shadow-sm hover:shadow font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-blue"
          >
            <Zap size={18} />
            Use This Template
          </button>
        </div>

        {/* Content Preview */}
        <div className="space-y-8">
          {/* Tasks Section */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="text-text-secondary" size={20} />
              <h2 className="font-semibold text-text-primary">Tasks ({template.tasks.length})</h2>
            </div>

            <div className="space-y-6">
              {template.stages.map(stage => {
                const stageTasks = tasksByStage[stage];
                if (!stageTasks || stageTasks.length === 0) return null;

                return (
                  <div key={stage}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium ${stageConfig[stage].color}`}>
                        {stageConfig[stage].label}
                      </span>
                      <span className="text-sm text-text-muted">
                        {stageTasks.length} {stageTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {stageTasks
                        .sort((a, b) => a.daysFromClosing - b.daysFromClosing)
                        .map(task => (
                          <div
                            key={task.id}
                            className="bg-bg-app border border-border-subtle rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded border-2 border-input-border" />
                              <div className="text-sm font-medium text-text-primary">{task.name}</div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                              <Calendar size={12} />
                              <span>
                                {task.daysFromClosing === 0
                                  ? 'Day of closing'
                                  : task.daysFromClosing < 0
                                  ? `${Math.abs(task.daysFromClosing)} days before`
                                  : `${task.daysFromClosing} days after`}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-text-secondary" size={20} />
              <h2 className="font-semibold text-text-primary">Documents ({template.documents.length})</h2>
            </div>

            <div className="space-y-6">
              {template.stages.map(stage => {
                const stageDocs = documentsByStage[stage];
                if (!stageDocs || stageDocs.length === 0) return null;

                return (
                  <div key={stage}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium ${stageConfig[stage].color}`}>
                        {stageConfig[stage].label}
                      </span>
                      <span className="text-sm text-text-muted">
                        {stageDocs.length} {stageDocs.length === 1 ? 'document' : 'documents'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {stageDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="bg-bg-app border border-border-subtle rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-accent-blue" size={16} />
                            <div className="text-sm font-medium text-text-primary">{doc.name}</div>
                          </div>
                          {doc.signatureRequired && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-blue-soft text-accent-blue rounded text-xs font-medium">
                              <PenTool size={12} />
                              <span>Signature Required</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Template Modal */}
      {showApplyModal && (
        <ApplyTemplateModal
          template={template}
          deals={dealsForApply}
          dealsWorkspaceLoading={workspaceLoading}
          applyDealEmptyReason={applyDealEmptyReason}
          onClose={() => setShowApplyModal(false)}
          onApply={(dealId, options) => {
            onApplyTemplate(template, dealId, options);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
