/**
 * Documents Tab Usage Examples
 *
 * This file demonstrates how to use the enhanced Documents components.
 */

import { useState } from 'react';
import { DocumentItem } from '../../types';
import { DocumentList } from './DocumentList';
import { DocumentRow } from './DocumentRow';
import { DocumentsSummaryBar } from './DocumentsSummaryBar';
import { getDocumentStats } from '../../utils/documentHelpers';

// Example 1: Basic DocumentList with all features
export function Example1_FullDocumentList() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc1',
      dealId: 'd1',
      name: 'Purchase Agreement',
      status: 'signed',
      signatureStatus: 'fully-signed',
      dueDate: '2026-04-05',
      referenceLink: 'https://docusign.example.com/doc1',
    },
    {
      id: 'doc2',
      dealId: 'd1',
      name: 'Inspection Report',
      status: 'uploaded',
      signatureStatus: 'not-required',
      dueDate: '2026-04-20',
    },
    {
      id: 'doc3',
      dealId: 'd1',
      name: 'Title Report',
      status: 'awaiting-signature',
      signatureStatus: 'requested',
      dueDate: '2026-04-30',
      referenceLink: 'https://dotloop.example.com/doc3',
      notes: 'Waiting on seller signature',
    },
  ]);

  return (
    <DocumentList
      documents={documents}
      onAddDocument={() => {
        console.log('Open add document modal');
      }}
      onAddLink={(docId) => {
        console.log('Add link to', docId);
      }}
      onAddNote={(docId) => {
        console.log('Add note to', docId);
      }}
      onMarkComplete={(docId) => {
        setDocuments(
          documents.map((doc) =>
            doc.id === docId ? { ...doc, status: 'completed' as const } : doc
          )
        );
      }}
    />
  );
}

// Example 2: Guided checklist (empty state)
export function Example2_GuidedChecklist() {
  return (
    <DocumentList
      documents={[]}
      onUseTemplate={() => {
        console.log('Use template - create all default documents');
      }}
      onAddDocument={() => {
        console.log('Add custom document');
      }}
    />
  );
}

// Example 3: Summary bar standalone
export function Example3_SummaryBarOnly() {
  const documents: DocumentItem[] = [
    /* ... your documents ... */
  ];

  const stats = getDocumentStats(documents);

  return (
    <DocumentsSummaryBar
      total={stats.total}
      awaitingSignature={stats.awaitingSignature}
      overdue={stats.overdue}
      completed={stats.completed}
    />
  );
}

// Example 4: Single document row
export function Example4_SingleRow() {
  const document: DocumentItem = {
    id: 'doc1',
    dealId: 'd1',
    name: 'Loan Application',
    status: 'awaiting-signature',
    signatureStatus: 'partially-signed',
    dueDate: '2026-04-18',
    referenceLink: 'https://docusign.example.com/loan',
    notes: 'Buyer signed, waiting on co-buyer',
  };

  return (
    <DocumentRow
      document={document}
      onAddLink={(docId) => console.log('Add link', docId)}
      onAddNote={(docId) => console.log('Add note', docId)}
      onMarkComplete={(docId) => console.log('Complete', docId)}
    />
  );
}

// Example 5: Custom integration with state management
export function Example5_WithStateManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  const handleAddDocument = () => {
    setIsAddingDocument(true);
    // Open your modal here
  };

  const handleAddLink = (documentId: string) => {
    const link = prompt('Enter document link:');
    if (link) {
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId ? { ...doc, referenceLink: link } : doc
        )
      );
    }
  };

  const handleAddNote = (documentId: string) => {
    const note = prompt('Enter note:');
    if (note) {
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId ? { ...doc, notes: note } : doc
        )
      );
    }
  };

  const handleMarkComplete = (documentId: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === documentId ? { ...doc, status: 'completed' as const } : doc
      )
    );
  };

  return (
    <DocumentList
      documents={documents}
      onAddDocument={handleAddDocument}
      onAddLink={handleAddLink}
      onAddNote={handleAddNote}
      onMarkComplete={handleMarkComplete}
    />
  );
}
