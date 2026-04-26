import { useEffect, useState } from 'react';
import type { AddDealDocumentPayload } from '../../types';
import { Button } from '../ui/button';
import { displayLabelFromUrl } from '../../utils/documentHelpers';
import { cn } from '../ui/utils';

const controlClass =
  'h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export type AddDocumentModalMode = 'upload' | 'link';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which tab is selected when the modal opens. */
  initialMode?: AddDocumentModalMode;
  onAdd: (documentData: AddDealDocumentPayload) => void | Promise<void>;
}

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function AddDocumentModal({ isOpen, onClose, initialMode = 'upload', onAdd }: AddDocumentModalProps) {
  const [mode, setMode] = useState<AddDocumentModalMode>(initialMode);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setLinkUrl('');
    setLinkName('');
    setFile(null);
    setFileName('');
    setSubmitting(false);
  }, [isOpen, initialMode]);

  const resetFields = () => {
    setLinkUrl('');
    setLinkName('');
    setFile(null);
    setFileName('');
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (mode === 'link') {
      const url = normalizeUrl(linkUrl);
      if (!url) return;
      try {
        // eslint-disable-next-line no-new
        new URL(url);
      } catch {
        return;
      }
      setSubmitting(true);
      try {
        await Promise.resolve(
          onAdd({
            kind: 'link',
            url,
            name: linkName.trim() || undefined,
          }),
        );
        resetFields();
        onClose();
      } catch (err) {
        console.error(err);
        window.alert('Could not add link. Try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!file) return;
    setSubmitting(true);
    try {
      await Promise.resolve(
        onAdd({
          kind: 'file',
          file,
          name: fileName.trim() || undefined,
        }),
      );
      resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      window.alert('Could not upload file. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const linkPreviewName =
    linkName.trim() || (linkUrl.trim() ? displayLabelFromUrl(normalizeUrl(linkUrl)) : '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-bg-app/95 backdrop-blur-[1px] dark:bg-bg-app/90">
      <div className="mx-auto max-w-3xl px-8 pb-2 pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetFields();
              onClose();
            }}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Add to library</h1>
          <p className="text-text-secondary">Upload a file or attach an external link for this transaction.</p>
        </div>

        <div className="mb-6 flex rounded-xl border border-border-subtle bg-bg-elevated/40 p-1 dark:bg-bg-elevated/25">
          {(['upload', 'link'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors duration-150',
                mode === m
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              {m === 'upload' ? 'Upload file' : 'Add link'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'link' ? (
            <div className="mb-8 space-y-6">
              <div>
                <label htmlFor="docLinkUrl" className="mb-2 block text-sm font-medium text-text-primary">
                  URL
                </label>
                <input
                  type="url"
                  id="docLinkUrl"
                  required
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  className={controlClass}
                />
              </div>
              <div>
                <label htmlFor="docLinkName" className="mb-2 block text-sm font-medium text-text-primary">
                  Name <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  id="docLinkName"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder={linkPreviewName || 'e.g., Purchase agreement (DocuSign)'}
                  className={controlClass}
                />
              </div>
            </div>
          ) : (
            <div className="mb-8 space-y-6">
              <div>
                <label htmlFor="docFile" className="mb-2 block text-sm font-medium text-text-primary">
                  File
                </label>
                <input
                  id="docFile"
                  type="file"
                  required
                  className={cn(
                    controlClass,
                    'h-auto py-3 file:mr-4 file:rounded-md file:border-0 file:bg-accent-blue-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-blue',
                  )}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (f && !fileName.trim()) {
                      setFileName(f.name);
                    }
                  }}
                />
              </div>
              <div>
                <label htmlFor="docFileName" className="mb-2 block text-sm font-medium text-text-primary">
                  Name <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  id="docFileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={file?.name ?? 'Display name'}
                  className={controlClass}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetFields();
                onClose();
              }}
              className="rounded-xl px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={submitting || (mode === 'link' ? !linkUrl.trim() : !file)}
              className="rounded-xl px-6 py-3"
            >
              {submitting ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
