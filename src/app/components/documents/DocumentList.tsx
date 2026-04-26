import { DocumentItem as DocumentItemType } from '../../types';
import { DocumentRow } from './DocumentRow';
import { DocumentsSummaryBar } from './DocumentsSummaryBar';
import { getDocumentStats } from '../../utils/documentHelpers';
import { getDocumentsWithPriority } from '../../utils/documentNextAction';
import { defaultDocumentChecklist } from '../../data/documentTemplates';
import { Button } from '../ui/button';

interface DocumentListProps {
  documents: DocumentItemType[];
  closingDate: string;
  /** Opens add flow focused on file upload (same modal as link). */
  onOpenAddDocumentUpload?: () => void;
  /** Opens add flow focused on external link. */
  onOpenAddDocumentLink?: () => void;
  /** @deprecated Prefer `onOpenAddDocumentUpload` / `onOpenAddDocumentLink` for deal detail. */
  onAddDocument?: () => void;
  onUseTemplate?: () => void;
  /** Add or edit reference link on an existing checklist row */
  onAddLink?: (documentId: string) => void;
  onAddNote?: (documentId: string) => void;
  onMarkComplete?: (documentId: string) => void;
}

export function DocumentList({
  documents,
  closingDate,
  onOpenAddDocumentUpload,
  onOpenAddDocumentLink,
  onAddDocument,
  onUseTemplate,
  onAddLink,
  onAddNote,
  onMarkComplete,
}: DocumentListProps) {
  const stats = getDocumentStats(documents);
  const documentsWithPriority = getDocumentsWithPriority(documents, closingDate);

  const sortedDocuments = [...documentsWithPriority].sort((a, b) => {
    const priorityOrder = { blocking: 0, 'needs-attention': 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const openUpload = onOpenAddDocumentUpload ?? onAddDocument;
  const openLink = onOpenAddDocumentLink ?? onAddDocument;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Documents & Signatures</h2>
        {(openUpload || openLink) && (
          <div className="flex flex-wrap gap-2">
            {openUpload ? (
              <Button type="button" variant="accent" onClick={openUpload} className="gap-2">
                <span className="text-base" aria-hidden>
                  📄
                </span>
                Upload file
              </Button>
            ) : null}
            {openLink ? (
              <Button
                type="button"
                variant="outline"
                onClick={openLink}
                className="gap-2 border-border-strong"
              >
                <span className="text-base" aria-hidden>
                  🔗
                </span>
                Add link
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {documents.length > 0 ? (
        <>
          <DocumentsSummaryBar
            total={stats.total}
            awaitingSignature={stats.awaitingSignature}
            overdue={stats.overdue}
            completed={stats.completed}
          />

          <div className="mt-6 space-y-3">
            {sortedDocuments.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                priority={doc.priority}
                blockingReason={doc.blockingReason}
                onAddLink={onAddLink}
                onAddNote={onAddNote}
                onMarkComplete={onMarkComplete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-8">
          <div className="mb-8 text-center">
            <p className="text-text-secondary">Track required documents and signatures for this deal</p>
          </div>

          <div className="mb-8 space-y-2">
            {defaultDocumentChecklist.map((template, index) => (
              <div
                key={index}
                className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-4 dark:bg-bg-elevated/25"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h4 className="font-medium text-text-primary">{template.name}</h4>
                      <span className="rounded border border-border-subtle bg-bg-surface px-2 py-0.5 text-xs font-medium text-text-muted">
                        Not Started
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-text-secondary">{template.description}</p>
                    )}
                  </div>
                  {template.signatureRequired && (
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        <span>Signature required</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {onUseTemplate && (
              <Button type="button" variant="accent" size="lg" onClick={onUseTemplate} className="gap-2 px-6">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Use Template
              </Button>
            )}
            {openUpload ? (
              <Button type="button" variant="outline" size="lg" onClick={openUpload} className="gap-2 px-6">
                <span aria-hidden>📄</span>
                Upload file
              </Button>
            ) : null}
            {openLink ? (
              <Button type="button" variant="outline" size="lg" onClick={openLink} className="gap-2 px-6">
                <span aria-hidden>🔗</span>
                Add link
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
