import { DocumentItem, Task } from '../types';
import { isDocumentOverdue } from './documentHelpers';
import { isAttachmentDocument } from './documentOpenUrl';

export type DocumentPriority = 'blocking' | 'needs-attention' | 'normal';
export type NextActionType = 'document' | 'task';

export interface DocumentWithPriority extends DocumentItem {
  priority: DocumentPriority;
  blockingReason?: string;
}

export interface NextAction {
  type: NextActionType;
  id: string;
  primaryText: string;
  secondaryText: string;
  warningText?: string;
  priority: 'on-track' | 'at-risk' | 'overdue';
  dueDate?: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

/**
 * Determine if a document is blocking progress
 */
export function isDocumentBlocking(document: DocumentItem, closingDate: string): boolean {
  if (isAttachmentDocument(document)) {
    return isDocumentOverdue(document);
  }

  const now = new Date();
  const closing = new Date(closingDate);
  const daysUntilClosing = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Critical documents that block closing
  const criticalDocNames = [
    'purchase agreement',
    'listing agreement',
    'offer',
    'contract',
    'addendum',
  ];

  const isCritical = criticalDocNames.some(name =>
    document.name.toLowerCase().includes(name)
  );

  // Blocking if:
  // 1. Critical document and not completed
  // 2. Overdue
  // 3. Awaiting signature within 7 days of closing
  const isOverdue = isDocumentOverdue(document);
  const isAwaitingSignature = document.status === 'awaiting-signature';
  const isNotCompleted = document.status !== 'signed' && document.status !== 'completed';

  if (isOverdue) return true;
  if (isCritical && isNotCompleted && daysUntilClosing <= 14) return true;
  if (isAwaitingSignature && daysUntilClosing <= 7) return true;

  return false;
}

/**
 * Calculate priority for a document
 */
export function getDocumentPriority(document: DocumentItem, closingDate: string): DocumentWithPriority {
  const isBlocking = isDocumentBlocking(document, closingDate);
  const isOverdue = isDocumentOverdue(document);
  const needsSignature = document.status === 'awaiting-signature';

  let priority: DocumentPriority = 'normal';
  let blockingReason: string | undefined;

  if (isBlocking) {
    priority = 'blocking';
    if (isOverdue) {
      blockingReason = 'This document is overdue and blocking closing';
    } else if (needsSignature) {
      blockingReason = 'Signature required to proceed';
    } else {
      blockingReason = 'Required for closing';
    }
  } else if (needsSignature || isOverdue) {
    priority = 'needs-attention';
  }

  return {
    ...document,
    priority,
    blockingReason,
  };
}

/**
 * Get all documents with priority calculated
 */
export function getDocumentsWithPriority(
  documents: DocumentItem[],
  closingDate: string
): DocumentWithPriority[] {
  return documents.map(doc => getDocumentPriority(doc, closingDate));
}

/**
 * Determine the most important next action from documents
 */
export function getDocumentNextAction(
  documents: DocumentItem[],
  closingDate: string
): NextAction | null {
  if (documents.length === 0) {
    return {
      type: 'document',
      id: 'add-first-document',
      primaryText: 'Add your first document',
      secondaryText: 'Start tracking documents for this deal',
      priority: 'on-track',
      ctaPrimary: 'Add Document',
      ctaSecondary: 'Use Template',
    };
  }

  const documentsWithPriority = getDocumentsWithPriority(documents, closingDate);

  // Find blocking documents first
  const blocking = documentsWithPriority.filter(d => d.priority === 'blocking');
  if (blocking.length > 0) {
    const doc = blocking[0];
    const isOverdue = isDocumentOverdue(doc);
    const needsSignature = doc.status === 'awaiting-signature';

    let primaryText = `${doc.name} needs attention`;
    let secondaryText = 'Action required';
    let warningText: string | undefined;
    let ctaPrimary = 'View Document';

    if (isOverdue) {
      primaryText = `${doc.name} is overdue`;
      secondaryText = doc.dueDate ? `Was due ${doc.dueDate}` : 'Overdue';
      warningText = '⚠️ This may delay closing';
      ctaPrimary = 'View Document';
    } else if (needsSignature) {
      primaryText = `${doc.name} needs signature`;

      // Determine who needs to sign
      if (doc.signatureStatus === 'requested') {
        secondaryText = 'Awaiting signatures';
      } else if (doc.signatureStatus === 'partially-signed') {
        secondaryText = 'Partially signed, awaiting remaining signatures';
      } else {
        secondaryText = 'Signature requested';
      }

      if (doc.dueDate) {
        const dueDate = new Date(doc.dueDate);
        const now = new Date();
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 3) {
          warningText = `⚠️ Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
        }
      }

      ctaPrimary = 'View Document';
    }

    return {
      type: 'document',
      id: doc.id,
      primaryText,
      secondaryText,
      warningText,
      priority: isOverdue ? 'overdue' : 'at-risk',
      dueDate: doc.dueDate,
      ctaPrimary,
      ctaSecondary: 'View Details',
    };
  }

  // Find documents needing attention
  const needsAttention = documentsWithPriority.filter(d => d.priority === 'needs-attention');
  if (needsAttention.length > 0) {
    const doc = needsAttention[0];
    const isOverdue = isDocumentOverdue(doc);

    if (isOverdue) {
      return {
        type: 'document',
        id: doc.id,
        primaryText: `${doc.name} is overdue`,
        secondaryText: doc.dueDate ? `Was due ${doc.dueDate}` : 'Overdue',
        priority: 'overdue',
        dueDate: doc.dueDate,
        ctaPrimary: 'View Document',
        ctaSecondary: 'View Details',
      };
    }

    if (doc.status === 'awaiting-signature') {
      return {
        type: 'document',
        id: doc.id,
        primaryText: `${doc.name} needs signature`,
        secondaryText: 'Awaiting signatures',
        priority: 'at-risk',
        dueDate: doc.dueDate,
        ctaPrimary: 'View Document',
        ctaSecondary: 'View Details',
      };
    }
  }

  // All documents on track
  const incomplete = documents.filter(d =>
    d.status !== 'signed' && d.status !== 'completed'
  );

  if (incomplete.length > 0) {
    const doc = incomplete[0];
    return {
      type: 'document',
      id: doc.id,
      primaryText: `Continue with ${doc.name}`,
      secondaryText: 'Next document to complete',
      priority: 'on-track',
      dueDate: doc.dueDate,
      ctaPrimary: 'View Document',
      ctaSecondary: 'View Details',
    };
  }

  // All documents complete
  return null;
}

/**
 * Get combined next action from both tasks and documents
 */
export function getCombinedNextAction(
  tasks: Task[],
  documents: DocumentItem[],
  closingDate: string,
  getTaskNextAction: (tasks: Task[]) => NextAction | null
): NextAction | null {
  const documentAction = getDocumentNextAction(documents, closingDate);
  const taskAction = getTaskNextAction(tasks);

  // No actions at all
  if (!documentAction && !taskAction) return null;

  // Only one type of action
  if (!documentAction) return taskAction;
  if (!taskAction) return documentAction;

  // Both exist - prioritize by urgency
  const priorityOrder = { 'overdue': 3, 'at-risk': 2, 'on-track': 1 };

  const docPriority = priorityOrder[documentAction.priority];
  const taskPriority = priorityOrder[taskAction.priority];

  return docPriority >= taskPriority ? documentAction : taskAction;
}
