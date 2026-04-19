import { useState } from 'react';
import { DocumentTemplate } from '../../types/documentTemplates';
import { DocumentTemplateCard } from './DocumentTemplateCard';
import { documentTemplates } from '../../data/documentTemplates';

interface DocumentTemplatesSelectorProps {
  onUseTemplate: (template: DocumentTemplate) => void;
  onStartBlank?: () => void;
  onCancel?: () => void;
  onPreviewTemplate?: (template: DocumentTemplate) => void;
}

export function DocumentTemplatesSelector({
  onUseTemplate,
  onStartBlank,
  onCancel,
  onPreviewTemplate,
}: DocumentTemplatesSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    'default-residential'
  );

  const selectedTemplate = documentTemplates.find((t) => t.id === selectedTemplateId);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate);
    }
  };

  const handleStartBlank = () => {
    const blankTemplate = documentTemplates.find((t) => t.id === 'blank');
    if (blankTemplate) {
      if (onStartBlank) {
        onStartBlank();
      } else {
        onUseTemplate(blankTemplate);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-app py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-text-primary">
              Choose Document Template
            </h1>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 text-text-muted hover:text-text-secondary hover:bg-bg-elevated/40 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-text-secondary">
            Apply a template to quickly set up required documents for this deal
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {documentTemplates.map((template) => (
            <DocumentTemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => setSelectedTemplateId(template.id)}
              onPreview={
                onPreviewTemplate
                  ? () => onPreviewTemplate(template)
                  : undefined
              }
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          <button
            onClick={handleStartBlank}
            className="text-text-secondary hover:text-text-primary font-medium"
          >
            Start Blank
          </button>
          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-input-border text-text-secondary rounded-lg hover:bg-bg-app transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleUseTemplate}
              disabled={!selectedTemplateId}
              className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-hover disabled:bg-border-strong disabled:cursor-not-allowed transition-colors font-medium"
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
