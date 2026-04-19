import { DocumentTemplate } from '../../types/documentTemplates';

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}

export function DocumentTemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
}: DocumentTemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-6 text-left border-2 rounded-xl transition-all ${
        isSelected
          ? 'border-accent-blue bg-accent-blue-soft shadow-md'
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2 pr-20">
          {template.name}
        </h3>
        <p className="text-sm text-text-secondary mb-3">{template.description}</p>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-bg-elevated/40 text-text-secondary text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Document Count */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>
            {template.documentCount === 0
              ? 'No documents'
              : `${template.documentCount} document${template.documentCount === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {/* Preview Documents */}
      {template.previewDocuments && template.previewDocuments.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Includes:
          </div>
          <ul className="space-y-1">
            {template.previewDocuments.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-3 h-3 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Link */}
      {onPreview && template.documentCount > 0 && (
        <div className="border-t border-border-subtle pt-3 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="text-sm text-accent-blue hover:text-accent-blue font-medium"
          >
            Preview all documents →
          </button>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 left-4">
          <div className="w-5 h-5 bg-accent-blue rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
