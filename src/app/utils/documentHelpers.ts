import type { DocumentItem, DocumentStatus, SignatureStatus } from '../types';

/**
 * Checklist “mark complete” transition: completed status + fully-signed when signatures apply.
 * Used by mock state and Convex mutation payloads so behavior stays aligned.
 */
export function getMarkDocumentCompletePatch(doc: DocumentItem): {
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
} {
  return {
    status: 'completed',
    signatureStatus: doc.signatureStatus === 'not-required' ? 'not-required' : 'fully-signed',
  };
}

/**
 * Whether a document still belongs in “signature workflow” summaries.
 * Aligns checklist rows (`status` not-started / requested + `signatureStatus` requested) with
 * later pipeline stages (`awaiting-signature`) so counts match user intent without changing
 * the full document model.
 */
export function isDocumentInSignatureWorkflow(doc: DocumentItem): boolean {
  if (doc.status === 'signed' || doc.status === 'completed') return false;
  if (doc.signatureStatus === 'fully-signed') return false;
  if (doc.signatureStatus === 'not-required') return false;

  return (
    doc.status === 'awaiting-signature' ||
    doc.signatureStatus === 'requested' ||
    doc.signatureStatus === 'partially-signed'
  );
}

/**
 * Calculate document statistics for summary bar
 */
export function getDocumentStats(documents: DocumentItem[]) {
  const total = documents.length;

  const awaitingSignature = documents.filter((doc) => isDocumentInSignatureWorkflow(doc)).length;

  const overdue = documents.filter((doc) => {
    if (!doc.dueDate) return false;
    const dueDate = new Date(doc.dueDate);
    const now = new Date();
    return dueDate < now && doc.status !== 'signed' && doc.status !== 'completed';
  }).length;

  const completed = documents.filter(
    (doc) => doc.status === 'signed' || doc.status === 'completed'
  ).length;

  return {
    total,
    awaitingSignature,
    overdue,
    completed,
  };
}

/**
 * Check if document is overdue
 */
export function isDocumentOverdue(document: DocumentItem): boolean {
  if (!document.dueDate) return false;
  if (document.status === 'signed' || document.status === 'completed') return false;

  const dueDate = new Date(document.dueDate);
  const now = new Date();
  return dueDate < now;
}

/**
 * Get source label from reference link
 */
export function getSourceLabel(referenceLink?: string): string | null {
  if (!referenceLink) return null;

  const url = referenceLink.toLowerCase();

  if (url.includes('docusign')) return 'DocuSign';
  if (url.includes('dotloop')) return 'Dotloop';
  if (url.includes('drive.google')) return 'Google Drive';
  if (url.includes('dropbox')) return 'Dropbox';
  if (url.includes('box.com')) return 'Box';

  return 'External Link';
}
