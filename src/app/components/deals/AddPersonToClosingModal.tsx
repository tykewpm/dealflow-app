import { useEffect, useState, type FormEvent } from 'react';
import type { AddWorkspacePersonInput, WorkspacePartyLabel, WorkspacePermissionRole } from '../../types';
import { WORKSPACE_PARTY_ORDER, partySectionTitle, permissionRoleLabel } from '../../utils/workspacePermissions';
import { Button } from '../ui/button';

export interface AddPersonToClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AddWorkspacePersonInput) => void | Promise<void>;
}

const fieldClass =
  'w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

const PARTY_OPTIONS = WORKSPACE_PARTY_ORDER;

const ROLE_OPTIONS: WorkspacePermissionRole[] = ['owner', 'collaborator', 'viewer'];

export function AddPersonToClosingModal({ isOpen, onClose, onSubmit }: AddPersonToClosingModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [partyLabel, setPartyLabel] = useState<WorkspacePartyLabel>('other');
  const [permissionRole, setPermissionRole] = useState<WorkspacePermissionRole>('viewer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setEmail('');
    setPartyLabel('other');
    setPermissionRole('viewer');
    setSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    if (!n || !em) return;
    setSubmitting(true);
    try {
      await Promise.resolve(
        onSubmit({
          name: n,
          email: em,
          partyLabel,
          permissionRole,
        }),
      );
      onClose();
    } catch {
      /* parent may alert; keep modal open */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] dark:bg-bg-app/80">
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-xl dark:shadow-none"
        role="dialog"
        aria-labelledby="add-person-closing-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <h2 id="add-person-closing-title" className="text-sm font-semibold text-text-primary">
            Add person
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="add-person-name" className="mb-1 block text-xs font-medium text-text-primary">
              Name
            </label>
            <input
              id="add-person-name"
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className={fieldClass}
              placeholder="Full name"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="add-person-email" className="mb-1 block text-xs font-medium text-text-primary">
              Email
            </label>
            <input
              id="add-person-email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={fieldClass}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="add-person-party" className="mb-1 block text-xs font-medium text-text-primary">
              Closing party
            </label>
            <select
              id="add-person-party"
              value={partyLabel}
              onChange={(ev) => setPartyLabel(ev.target.value as WorkspacePartyLabel)}
              className={fieldClass}
            >
              {PARTY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {partySectionTitle(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="add-person-role" className="mb-1 block text-xs font-medium text-text-primary">
              Permission
            </label>
            <select
              id="add-person-role"
              value={permissionRole}
              onChange={(ev) => setPermissionRole(ev.target.value as WorkspacePermissionRole)}
              className={fieldClass}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {permissionRoleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !name.trim() || !email.trim()}>
              {submitting ? 'Adding…' : 'Add to closing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
