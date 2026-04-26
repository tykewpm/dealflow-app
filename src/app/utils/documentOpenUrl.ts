import type { DocumentItem } from '../types';

/** Resolved URL to open an attachment row (link or uploaded file). */
export function getDocumentOpenHref(doc: DocumentItem): string | null {
  if (doc.attachmentKind === 'link' && doc.referenceLink?.trim()) {
    return doc.referenceLink.trim();
  }
  if (doc.attachmentKind === 'file' && doc.fileUrl?.trim()) {
    return doc.fileUrl.trim();
  }
  return null;
}

export function isAttachmentDocument(doc: DocumentItem): boolean {
  return doc.attachmentKind === 'link' || doc.attachmentKind === 'file';
}
