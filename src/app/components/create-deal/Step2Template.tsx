import { WorkflowTemplate } from '../../types';

interface Step2TemplateProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2Template({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onContinue,
  onBack,
}: Step2TemplateProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-2">Step 2 of 4</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Choose a template</h1>
        <p className="text-text-secondary">Pre-built tasks and document checklist for your workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`relative p-6 text-left border-2 rounded-xl transition-all ${
              selectedTemplateId === template.id
                ? 'border-accent-blue bg-accent-blue-soft shadow-md dark:shadow-none'
                : 'border-border-subtle bg-bg-surface hover:border-input-border hover:shadow-sm'
            }`}
          >
            {/* Recommended Badge */}
            {template.isRecommended && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-accent-blue text-white text-xs font-medium rounded-md">
                  Recommended
                </span>
              </div>
            )}

            {/* Template Info */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-text-secondary">{template.description}</p>
            </div>

            <div className="flex flex-col gap-1 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>
                  {template.taskCount === 0
                    ? 'No tasks'
                    : `${template.taskCount} task${template.taskCount === 1 ? '' : 's'}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <span>
                  {(template.documents?.length ?? 0) === 0
                    ? 'No documents'
                    : `${template.documents?.length ?? 0} document${(template.documents?.length ?? 0) === 1 ? '' : 's'}`
                  }
                </span>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTemplateId === template.id && (
              <div className="absolute top-4 left-4">
                <div className="w-5 h-5 bg-accent-blue rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-text-secondary hover:bg-bg-elevated/50 rounded-xl transition-colors font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedTemplateId}
          className="px-6 py-3 bg-accent-blue text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
