import { DocumentItem as DocumentItemType } from '../../types';
import { formatDate } from '../../utils/dealUtils';

interface DocumentItemProps {
  document: DocumentItemType;
}

export function DocumentItem({ document }: DocumentItemProps) {
  const statusConfig = {
    'not-started': {
      label: 'Not Started',
      className: 'bg-bg-elevated/40 text-text-secondary border-border-subtle',
    },
    'requested': {
      label: 'Requested',
      className: 'bg-accent-blue-soft text-accent-blue border-border-subtle',
    },
    'uploaded': {
      label: 'Uploaded',
      className: 'bg-accent-blue-soft text-accent-blue border-border-subtle',
    },
    'awaiting-signature': {
      label: 'Awaiting Signature',
      className: 'bg-accent-amber-soft text-accent-amber border-border-subtle',
    },
    'signed': {
      label: 'Signed',
      className: 'bg-accent-green-soft text-accent-green border-border-subtle',
    },
    'completed': {
      label: 'Completed',
      className: 'bg-accent-green-soft text-accent-green border-border-subtle',
    },
  };

  const signatureConfig = {
    'not-required': { label: 'Not Required', className: 'text-text-secondary' },
    'requested': { label: 'Requested', className: 'text-accent-blue' },
    'partially-signed': { label: 'Partially Signed', className: 'text-accent-amber' },
    'fully-signed': { label: 'Fully Signed', className: 'text-accent-green' },
  };

  const statusStyle = statusConfig[document.status];
  const signatureStyle = signatureConfig[document.signatureStatus];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 hover:border-input-border transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-text-primary mb-1">{document.name}</h4>
          {document.dueDate && (
            <p className="text-sm text-text-secondary">
              Due: {formatDate(document.dueDate)}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      <div className="space-y-2">
        {/* Signature Status */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-text-secondary">Signature:</span>
          <span className={`font-medium ${signatureStyle.className}`}>
            {signatureStyle.label}
          </span>
        </div>

        {/* Reference Link */}
        {document.referenceLink && (
          <a
            href={document.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Document
          </a>
        )}

        {/* Notes */}
        {document.notes && (
          <p className="text-sm text-text-secondary italic bg-bg-app p-2 rounded">
            {document.notes}
          </p>
        )}
      </div>
    </div>
  );
}
