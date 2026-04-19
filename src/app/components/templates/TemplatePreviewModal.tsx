import { TransactionTemplate, TemplateStage } from '../../types/template';
import { X, CheckSquare, FileText, Zap, Calendar, PenTool } from 'lucide-react';
import { Button } from '../ui/button';

interface TemplatePreviewModalProps {
  template: TransactionTemplate;
  onClose: () => void;
  onApply: () => void;
  applyDisabled?: boolean;
  applyDisabledHint?: string;
}

export function TemplatePreviewModal({
  template,
  onClose,
  onApply,
  applyDisabled = false,
  applyDisabledHint,
}: TemplatePreviewModalProps) {
  const stageConfig: Record<TemplateStage, { label: string; color: string }> = {
    'under-contract': {
      label: 'Under Contract',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    'due-diligence': {
      label: 'Due Diligence',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    financing: {
      label: 'Financing',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    'pre-closing': {
      label: 'Pre-Closing',
      color: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    closing: {
      label: 'Closing',
      color: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-xl dark:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
          <div className="flex-1 pr-4">
            <h2 className="mb-1 font-semibold text-text-primary">{template.name}</h2>
            <p className="text-sm text-text-secondary">{template.description}</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border-subtle bg-bg-app p-4 dark:bg-bg-elevated/25">
                <div className="mb-1 flex items-center gap-2">
                  <CheckSquare className="text-accent-blue" size={18} />
                  <span className="font-semibold text-text-primary">{template.tasks.length}</span>
                </div>
                <div className="text-sm text-text-muted">Total Tasks</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-bg-app p-4 dark:bg-bg-elevated/25">
                <div className="mb-1 flex items-center gap-2">
                  <FileText className="text-text-muted" size={18} />
                  <span className="font-semibold text-text-primary">{template.documents.length}</span>
                </div>
                <div className="text-sm text-text-muted">Documents</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-bg-app p-4 dark:bg-bg-elevated/25">
                <div className="mb-1 flex items-center gap-2">
                  <PenTool className="text-accent-green" size={18} />
                  <span className="font-semibold text-text-primary">
                    {template.documents.filter(d => d.signatureRequired).length}
                  </span>
                </div>
                <div className="text-sm text-text-muted">Signatures</div>
              </div>
            </div>

            {/* Tasks Section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <CheckSquare className="text-text-secondary" size={20} />
                <h3 className="font-semibold text-text-primary">Tasks ({template.tasks.length})</h3>
              </div>

              <div className="space-y-6">
                {template.stages.map(stage => {
                  const stageTasks = tasksByStage[stage];
                  if (!stageTasks || stageTasks.length === 0) return null;

                  return (
                    <div key={stage}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded border px-2.5 py-1 text-xs font-medium ${stageConfig[stage].color}`}
                        >
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
                              className="flex items-start justify-between rounded-lg border border-border-subtle bg-bg-surface p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-border-subtle" />
                                <div>
                                  <div className="text-sm font-medium text-text-primary">{task.name}</div>
                                </div>
                              </div>
                              <div className="ml-4 flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
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
            <div>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="text-text-secondary" size={20} />
                <h3 className="font-semibold text-text-primary">Documents ({template.documents.length})</h3>
              </div>

              <div className="space-y-6">
                {template.stages.map(stage => {
                  const stageDocs = documentsByStage[stage];
                  if (!stageDocs || stageDocs.length === 0) return null;

                  return (
                    <div key={stage}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded border px-2.5 py-1 text-xs font-medium ${stageConfig[stage].color}`}
                        >
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
                            className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="text-text-muted" size={16} />
                              <div className="text-sm font-medium text-text-primary">{doc.name}</div>
                            </div>
                            {doc.signatureRequired && (
                              <div className="flex items-center gap-1.5 rounded border border-border-subtle bg-accent-green-soft px-2 py-1 text-xs font-medium text-accent-green dark:text-text-primary">
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

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border-subtle bg-bg-app px-6 py-4 dark:bg-bg-elevated/20">
          {applyDisabled && applyDisabledHint ? (
            <p className="text-xs text-text-secondary">{applyDisabledHint}</p>
          ) : null}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={onApply}
              disabled={applyDisabled}
              title={applyDisabled ? applyDisabledHint : undefined}
              className="gap-2"
            >
              <Zap size={16} />
              Apply to Deal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
