/**
 * Complete Integration Example
 *
 * This shows how the Document Templates Selector integrates with the Documents tab
 */

import { useState } from 'react';
import { DocumentItem } from '../../types';
import { DocumentTemplate } from '../../types/documentTemplates';
import { DocumentList } from './DocumentList';
import { DocumentTemplatesSelector } from './DocumentTemplatesSelector';
import { DocumentTemplatePreviewModal } from './DocumentTemplatePreviewModal';

export function DocumentsTabWithTemplates() {
  const dealId = 'deal-123'; // Current deal ID

  // State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  // When "Use Template" is clicked from the guided checklist
  const handleUseTemplateClick = () => {
    setShowTemplateSelector(true);
  };

  // When a template is selected
  const handleApplyTemplate = (template: DocumentTemplate) => {
    // Convert template documents to DocumentItem[]
    const newDocuments: DocumentItem[] = template.documents.map((doc, index) => ({
      id: `doc-${Date.now()}-${index}`,
      dealId: dealId,
      name: doc.name,
      status: 'not-started',
      signatureStatus: doc.signatureRequired ? 'requested' : 'not-required',
    }));

    setDocuments(newDocuments);
    setShowTemplateSelector(false);
  };

  // When "Start Blank" is clicked
  const handleStartBlank = () => {
    setDocuments([]);
    setShowTemplateSelector(false);
  };

  // Template selector view
  if (showTemplateSelector) {
    return (
      <>
        <DocumentTemplatesSelector
          onUseTemplate={handleApplyTemplate}
          onStartBlank={handleStartBlank}
          onCancel={() => setShowTemplateSelector(false)}
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

  // Documents list view
  return (
    <DocumentList
      documents={documents}
      onUseTemplate={handleUseTemplateClick}
      onAddDocument={() => {
        console.log('Add single document');
        // Open add document modal
      }}
      onAddLink={(docId) => {
        console.log('Add link to', docId);
        // Open add link modal
      }}
      onAddNote={(docId) => {
        console.log('Add note to', docId);
        // Open add note modal
      }}
      onMarkComplete={(docId) => {
        // Mark document as complete
        setDocuments(
          documents.map((doc) =>
            doc.id === docId
              ? { ...doc, status: 'completed' as const }
              : doc
          )
        );
      }}
    />
  );
}

// Alternative: Template selector in a modal overlay
export function DocumentsTabWithModalTemplates() {
  const dealId = 'deal-123';
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleApplyTemplate = (template: DocumentTemplate) => {
    const newDocuments: DocumentItem[] = template.documents.map((doc, index) => ({
      id: `doc-${Date.now()}-${index}`,
      dealId: dealId,
      name: doc.name,
      status: 'not-started',
      signatureStatus: doc.signatureRequired ? 'requested' : 'not-required',
    }));

    setDocuments(newDocuments);
    setShowTemplateModal(false);
  };

  return (
    <>
      <DocumentList
        documents={documents}
        onUseTemplate={() => setShowTemplateModal(true)}
        onAddDocument={() => console.log('Add document')}
      />

      {/* Template Selector Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-bg-surface z-50 overflow-auto">
          <DocumentTemplatesSelector
            onUseTemplate={handleApplyTemplate}
            onCancel={() => setShowTemplateModal(false)}
          />
        </div>
      )}
    </>
  );
}

// Alternative: As a route with navigation
export function DocumentTemplatesPage() {
  const handleApplyTemplate = (template: DocumentTemplate) => {
    // Create documents in the deal
    console.log('Creating documents from template:', template.name);

    // Navigate back to deal documents tab
    // navigate(`/deals/${dealId}/documents`);
  };

  const handleCancel = () => {
    // Navigate back to documents tab
    // navigate(-1);
  };

  return (
    <DocumentTemplatesSelector
      onUseTemplate={handleApplyTemplate}
      onCancel={handleCancel}
    />
  );
}
