/**
 * AddDocumentModal Usage Examples
 */

import { useState } from 'react';
import { DocumentItem } from '../../types';
import { AddDocumentModal } from './AddDocumentModal';

// Example 1: Basic usage
export function Example1_BasicUsage() {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const handleAddDocument = (documentData: {
    name: string;
    status: any;
    signatureRequired: boolean;
    dueDate?: string;
    referenceLink?: string;
  }) => {
    const newDocument: DocumentItem = {
      id: `doc-${Date.now()}`,
      dealId: 'current-deal-id',
      name: documentData.name,
      status: documentData.status,
      signatureStatus: documentData.signatureRequired ? 'requested' : 'not-required',
      dueDate: documentData.dueDate,
      referenceLink: documentData.referenceLink,
    };

    setDocuments([...documents, newDocument]);
    setIsOpen(false);

    console.log('Document added:', newDocument);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent-blue text-white rounded-lg"
      >
        Add Document
      </button>

      <AddDocumentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={handleAddDocument}
      />

      {/* Display added documents */}
      <div className="mt-4">
        <h3>Documents: {documents.length}</h3>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>{doc.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

// Example 2: With validation and error handling
export function Example2_WithValidation() {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddDocument = (documentData: any) => {
    // Validate URL if provided
    if (documentData.referenceLink) {
      try {
        new URL(documentData.referenceLink);
      } catch (error) {
        alert('Invalid URL format');
        return;
      }
    }

    // Check for duplicate document names
    // if (documents.some(doc => doc.name === documentData.name)) {
    //   alert('Document with this name already exists');
    //   return;
    // }

    console.log('Valid document data:', documentData);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Document</button>

      <AddDocumentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={handleAddDocument}
      />
    </>
  );
}

// Example 3: Integration with DocumentList
export function Example3_IntegrationWithList() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddDocument = (documentData: any) => {
    const newDocument: DocumentItem = {
      id: `doc-${Date.now()}`,
      dealId: 'deal-123',
      name: documentData.name,
      status: documentData.status,
      signatureStatus: documentData.signatureRequired ? 'requested' : 'not-required',
      dueDate: documentData.dueDate,
      referenceLink: documentData.referenceLink,
    };

    setDocuments([...documents, newDocument]);
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Trigger from DocumentList or anywhere */}
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Document
      </button>

      <AddDocumentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDocument}
      />

      {/* Display documents */}
      <div className="mt-4 space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="p-3 border rounded">
            <h4 className="font-medium">{doc.name}</h4>
            <p className="text-sm text-text-secondary">Status: {doc.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Pre-filled values (for editing)
export function Example4_PrefilledValues() {
  const [isOpen, setIsOpen] = useState(true);

  // You could extend the modal to accept initial values
  // for an "Edit Document" use case

  return (
    <AddDocumentModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onAdd={(data) => console.log('Updated document:', data)}
    />
  );
}

// Example 5: With success feedback
export function Example5_WithFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddDocument = (documentData: any) => {
    console.log('Adding document:', documentData);
    setIsOpen(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Document</button>

      <AddDocumentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={handleAddDocument}
      />

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-accent-green text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Document added successfully
        </div>
      )}
    </>
  );
}
