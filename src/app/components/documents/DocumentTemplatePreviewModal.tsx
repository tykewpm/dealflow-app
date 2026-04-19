import { DocumentTemplate } from '../../types/documentTemplates';
import { Button } from '../ui/button';

interface DocumentTemplatePreviewModalProps {
  template: DocumentTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentTemplatePreviewModal({
  template,
  isOpen,
  onClose,
}: DocumentTemplatePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] dark:bg-bg-app/80">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated shadow-xl dark:shadow-none">
        <div className="flex-shrink-0 border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{template.name}</h2>
              <p className="mt-1 text-sm text-text-secondary">{template.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {template.documents.length > 0 ? (
            <div className="space-y-3">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Documents ({template.documentCount})
              </h3>
              {template.documents.map((doc, index) => (
                <div key={index} className="rounded-lg border border-border-subtle bg-bg-app p-4 dark:bg-bg-surface/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1 font-medium text-text-primary">{doc.name}</h4>
                      {doc.description && <p className="text-sm text-text-secondary">{doc.description}</p>}
                    </div>
                    {doc.signatureRequired && (
                      <div className="ml-4 shrink-0">
                        <div className="flex items-center gap-1.5 text-sm text-accent-blue">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          <span className="text-xs font-medium">Signature</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-text-secondary">This template has no predefined documents</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border-subtle px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
