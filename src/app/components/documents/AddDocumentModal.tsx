import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/datepicker.css';
import { DocumentStatus } from '../../types';
import { Button } from '../ui/button';

const controlClass =
  'h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (documentData: {
    name: string;
    status: DocumentStatus;
    signatureRequired: boolean;
    dueDate?: string;
    referenceLink?: string;
  }) => void;
}

export function AddDocumentModal({ isOpen, onClose, onAdd }: AddDocumentModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('not-started');
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [referenceLink, setReferenceLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      status,
      signatureRequired,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
      referenceLink: referenceLink.trim() || undefined,
    });

    // Reset form
    setName('');
    setStatus('not-started');
    setSignatureRequired(false);
    setDueDate(null);
    setReferenceLink('');
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setStatus('not-started');
    setSignatureRequired(false);
    setDueDate(null);
    setReferenceLink('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-bg-app/95 backdrop-blur-[1px] dark:bg-bg-app/90">
      {/* Close Button */}
      <div className="mx-auto max-w-3xl px-8 pb-2 pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-8 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Add Document</h1>
          <p className="text-text-secondary">Track a new document for this deal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Document Name - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="documentName" className="mb-2 block text-sm font-medium text-text-primary">
                Document Name
              </label>
              <input
                type="text"
                id="documentName"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Purchase Agreement"
                className={controlClass}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-text-primary">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className={controlClass}
              >
                <option value="not-started">Not Started</option>
                <option value="requested">Requested</option>
                <option value="uploaded">Uploaded</option>
                <option value="awaiting-signature">Awaiting Signature</option>
                <option value="signed">Signed</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="mb-2 block text-sm font-medium text-text-primary">
                Due Date (Optional)
              </label>
              <DatePicker
                selected={dueDate}
                onChange={(date: Date | null) => setDueDate(date)}
                dateFormat="MMM d, yyyy"
                placeholderText="Select due date"
                className={controlClass}
                wrapperClassName="w-full"
                isClearable
              />
            </div>

            {/* Signature Required Toggle - Full Width */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={signatureRequired}
                    onChange={(e) => setSignatureRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative h-6 w-11 rounded-full border border-border-subtle bg-border-subtle/80 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border-subtle after:bg-bg-surface after:transition-all after:content-[''] peer-checked:bg-accent-blue peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                </div>
                <span className="text-sm font-medium text-text-primary">Signature Required</span>
              </label>
            </div>

            {/* External Link - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="referenceLink" className="mb-2 block text-sm font-medium text-text-primary">
                External Link (Optional)
              </label>
              <input
                type="url"
                id="referenceLink"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="Paste DocuSign or Drive link"
                className={controlClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl px-6 py-3">
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={!name.trim()} className="rounded-xl px-6 py-3">
              Add Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
