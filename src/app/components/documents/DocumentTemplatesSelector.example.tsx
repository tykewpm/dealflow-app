/**
 * Document Templates Selector Usage Examples
 *
 * This file demonstrates how to use the document template selection components.
 */

import { useState } from 'react';
import { DocumentTemplate } from '../../types/documentTemplates';
import { DocumentTemplatesSelector } from './DocumentTemplatesSelector';
import { DocumentTemplatePreviewModal } from './DocumentTemplatePreviewModal';
import { DocumentItem } from '../../types';

// Example 1: Basic usage - standalone selection
export function Example1_BasicSelection() {
  const handleUseTemplate = (template: DocumentTemplate) => {
    console.log('Selected template:', template);
    // Create documents from template
    const newDocuments = template.documents.map((doc, index) => ({
      id: `doc-${index}`,
      dealId: 'current-deal-id',
      name: doc.name,
      status: 'not-started' as const,
      signatureStatus: doc.signatureRequired ? ('requested' as const) : ('not-required' as const),
    }));
    console.log('Created documents:', newDocuments);
  };

  return (
    <DocumentTemplatesSelector
      onUseTemplate={handleUseTemplate}
      onStartBlank={() => console.log('Start with blank template')}
    />
  );
}

// Example 2: With preview modal
export function Example2_WithPreview() {
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  const handleUseTemplate = (template: DocumentTemplate) => {
    console.log('Using template:', template.name);
    // Apply template logic here
  };

  return (
    <>
      <DocumentTemplatesSelector
        onUseTemplate={handleUseTemplate}
        onPreviewTemplate={(template) => setPreviewTemplate(template)}
      />

      {previewTemplate && (
        <DocumentTemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </>
  );
}

// Example 3: In a modal workflow
export function Example3_ModalWorkflow() {
  const [isOpen, setIsOpen] = useState(false);

  const handleUseTemplate = (template: DocumentTemplate) => {
    // Create documents from template
    console.log('Creating documents from:', template.name);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent-blue text-white rounded-lg"
      >
        Choose Document Template
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-bg-surface z-50 overflow-auto">
          <DocumentTemplatesSelector
            onUseTemplate={handleUseTemplate}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}

// Example 4: Integration with state management
export function Example4_StateManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showSelector, setShowSelector] = useState(true);

  const handleUseTemplate = (template: DocumentTemplate) => {
    // Convert template documents to DocumentItem[]
    const newDocuments: DocumentItem[] = template.documents.map((doc, index) => ({
      id: `doc-${Date.now()}-${index}`,
      dealId: 'deal-123',
      name: doc.name,
      status: 'not-started',
      signatureStatus: doc.signatureRequired ? 'requested' : 'not-required',
    }));

    setDocuments(newDocuments);
    setShowSelector(false);
  };

  const handleStartBlank = () => {
    setDocuments([]);
    setShowSelector(false);
  };

  if (!showSelector) {
    return (
      <div>
        <h2>Documents Created: {documents.length}</h2>
        <button onClick={() => setShowSelector(true)}>
          Choose Different Template
        </button>
      </div>
    );
  }

  return (
    <DocumentTemplatesSelector
      onUseTemplate={handleUseTemplate}
      onStartBlank={handleStartBlank}
    />
  );
}

// Example 5: As a route/page
export function Example5_AsPage() {
  const handleUseTemplate = (template: DocumentTemplate) => {
    // Navigate to documents tab with new documents
    console.log('Redirecting to documents with template:', template.name);
    // In real app: navigate('/deals/:dealId/documents')
  };

  const handleCancel = () => {
    // Navigate back
    console.log('Canceling - go back');
    // In real app: navigate(-1)
  };

  return (
    <DocumentTemplatesSelector
      onUseTemplate={handleUseTemplate}
      onCancel={handleCancel}
    />
  );
}
