import { DocumentItem as DocumentItemType } from '../../types';
import { formatDate } from '../../utils/dealUtils';
import { isDocumentOverdue, getSourceLabel } from '../../utils/documentHelpers';
import { DocumentPriority } from '../../utils/documentNextAction';

interface DocumentRowProps {
  document: DocumentItemType;
  priority?: DocumentPriority;
  blockingReason?: string;
  onAddLink?: (documentId: string) => void;
  onAddNote?: (documentId: string) => void;
  onMarkComplete?: (documentId: string) => void;
}

export function DocumentRow({
  document,
  priority = 'normal',
  blockingReason,
  onAddLink,
  onAddNote,
  onMarkComplete,
}: DocumentRowProps) {
  const statusConfig = {
    'not-started': {
      label: 'Not Started',
      className: 'border-border-subtle bg-bg-elevated text-text-secondary',
    },
    'requested': {
      label: 'Requested',
      className: 'border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary',
    },
    'uploaded': {
      label: 'Uploaded',
      className: 'border-border-subtle bg-bg-elevated text-text-primary',
    },
    'awaiting-signature': {
      label: 'Awaiting Signature',
      className: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    'signed': {
      label: 'Signed',
      className: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
    'completed': {
      label: 'Completed',
      className: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
  };

  const signatureConfig = {
    'not-required': {
      label: 'Signature Not Required',
      className: 'text-text-muted',
      badgeClass: 'border-border-subtle bg-bg-elevated text-text-secondary',
    },
    'requested': {
      label: 'Signature Requested',
      className: 'text-accent-blue',
      badgeClass: 'border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary',
    },
    'partially-signed': {
      label: 'Partially Signed',
      className: 'text-accent-amber',
      badgeClass: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    'fully-signed': {
      label: 'Fully Signed',
      className: 'text-accent-green',
      badgeClass: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
  };

  const statusStyle = statusConfig[document.status];
  const signatureStyle = signatureConfig[document.signatureStatus];
  const isOverdue = isDocumentOverdue(document);
  const sourceLabel = getSourceLabel(document.referenceLink);

  // Priority styling
  const priorityConfig = {
    'blocking': {
      borderClass: 'border-accent-red/35 hover:border-accent-red/55',
      badgeClass: 'border-border-subtle bg-accent-red-soft text-accent-red dark:text-text-primary',
      label: 'Blocking',
    },
    'needs-attention': {
      borderClass: 'border-accent-amber/35 hover:border-accent-amber/55',
      badgeClass: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
      label: 'Needs Attention',
    },
    'normal': {
      borderClass: 'border-border-subtle hover:border-border-strong',
      badgeClass: '',
      label: '',
    },
  };

  const priorityStyle = priorityConfig[priority];

  return (
    <div
      className={`group cursor-pointer rounded-lg border bg-bg-surface p-5 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:bg-bg-elevated/25 dark:shadow-none ${priorityStyle.borderClass}`}
    >
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left: Document Name & Description (5 columns) */}
        <div className="col-span-5 min-w-0">
          {/* Priority Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="truncate text-base font-semibold text-text-primary">
              {document.name}
            </h4>
            {priority !== 'normal' && (
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex-shrink-0 ${priorityStyle.badgeClass}`}>
                {priorityStyle.label}
              </span>
            )}
          </div>

          {/* Blocking Reason */}
          {blockingReason && (
            <p className="mb-1 text-sm font-medium text-accent-red">
              {blockingReason}
            </p>
          )}

          {/* Description/Notes */}
          {document.notes && !blockingReason && (
            <p className="line-clamp-2 text-sm text-text-secondary">
              {document.notes}
            </p>
          )}

          {/* Source Link & Due Date (shown below name) */}
          <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
            {sourceLabel && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-medium text-accent-blue">{sourceLabel}</span>
              </div>
            )}

            {document.dueDate && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={isOverdue ? 'font-semibold text-accent-red' : 'text-text-secondary'}>
                  {formatDate(document.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Status & Signature (5 columns) */}
        <div className="col-span-5 flex flex-col gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="min-w-[60px] text-xs font-medium text-text-muted">Status:</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusStyle.className}`}>
              {statusStyle.label}
            </span>
            {isOverdue && (
              <span className="rounded-md border border-border-subtle bg-accent-red-soft px-2.5 py-1 text-xs font-semibold text-accent-red dark:text-text-primary">
                Overdue
              </span>
            )}
          </div>

          {/* Signature Status */}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className={`text-xs font-medium ${signatureStyle.className}`}>
              {signatureStyle.label}
            </span>
          </div>
        </div>

        {/* Right: Actions (2 columns) */}
        <div className="col-span-2 flex items-start justify-end gap-1">
          {/* Add/Edit Link */}
          {onAddLink && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddLink(document.id);
              }}
              className="rounded-lg p-2 text-text-muted opacity-0 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-accent-blue-soft hover:text-accent-blue group-hover:opacity-100"
              title="Add link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          )}

          {/* Add Note */}
          {onAddNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddNote(document.id);
              }}
              className="rounded-lg p-2 text-text-muted opacity-0 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-bg-elevated hover:text-text-primary group-hover:opacity-100"
              title="Add note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          )}

          {/* Mark Complete */}
          {onMarkComplete && document.status !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete(document.id);
              }}
              className="rounded-lg p-2 text-text-muted opacity-0 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-accent-green-soft hover:text-accent-green group-hover:opacity-100"
              title="Mark complete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
