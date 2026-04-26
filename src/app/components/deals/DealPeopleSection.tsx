import { useCallback, useState } from 'react';
import type { AddWorkspacePersonInput, User } from '../../types';
import {
  WORKSPACE_PARTY_ORDER,
  groupUsersByParty,
  partySectionTitle,
  permissionRoleHelperText,
  permissionRoleLabel,
} from '../../utils/workspacePermissions';
import { cn } from '../ui/utils';
import { AddPersonToClosingModal } from './AddPersonToClosingModal';

interface DealPeopleSectionProps {
  users: User[];
  currentUserId: string;
  /** Absolute URL for optional invite copy (workspace home). */
  inviteWorkspaceUrl: string;
  canAddPeople?: boolean;
  onAddWorkspacePerson?: (input: AddWorkspacePersonInput) => void | Promise<void>;
  className?: string;
}

export function DealPeopleSection({
  users,
  currentUserId,
  inviteWorkspaceUrl,
  canAddPeople = false,
  onAddWorkspacePerson,
  className,
}: DealPeopleSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const grouped = groupUsersByParty(users);

  const inviteLine =
    inviteWorkspaceUrl.length > 0
      ? `Join this closing workspace: ${inviteWorkspaceUrl}`
      : 'Join this closing workspace: [your app link will appear here when hosted]';

  const handleCopyInvite = useCallback(async () => {
    if (inviteWorkspaceUrl.length === 0) return;
    try {
      await navigator.clipboard.writeText(inviteLine);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [inviteLine, inviteWorkspaceUrl.length]);

  return (
    <>
      <section
        aria-labelledby="deal-people-heading"
        className={cn(
          'rounded-lg border border-border-subtle bg-bg-surface/90 shadow-sm transition-[box-shadow,border-color] duration-150 ease-out dark:shadow-none',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border-subtle px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <h2 id="deal-people-heading" className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              People on this closing
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-text-muted">
              Who is on the workspace roster for this deal — not a role admin matrix.
            </p>
          </div>
          {canAddPeople && onAddWorkspacePerson ? (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="shrink-0 rounded-md border border-border-subtle bg-bg-app/80 px-2 py-1 text-[11px] font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-bg-elevated dark:bg-bg-surface/60"
            >
              Add person
            </button>
          ) : null}
        </div>

        <div className="space-y-3 px-3 py-2.5 sm:px-4 sm:py-3">
          {WORKSPACE_PARTY_ORDER.map((party) => {
            const list = grouped.get(party) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={party}>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                  {partySectionTitle(party)}
                </p>
                <ul className="space-y-1">
                  {list.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-col gap-1 rounded-md border border-border-subtle/60 bg-bg-app/40 px-2.5 py-2 dark:bg-bg-surface/40 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                          <span className="text-sm font-medium text-text-primary">{u.name}</span>
                          {u.id === currentUserId ? (
                            <span className="text-[11px] font-medium text-accent-blue">You</span>
                          ) : null}
                        </div>
                        {u.email?.trim() ? (
                          <div className="mt-0.5 truncate text-xs text-text-muted">{u.email}</div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-0.5 sm:items-end sm:text-right">
                        <span className="inline-flex rounded-full border border-border-subtle bg-bg-elevated/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary dark:bg-bg-surface/80">
                          {permissionRoleLabel(u.permissionRole)}
                        </span>
                        <span className="max-w-[14rem] text-[10px] leading-snug text-text-muted sm:text-right">
                          {permissionRoleHelperText(u.permissionRole)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-subtle px-3 py-2.5 sm:px-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Invite (copy only)</p>
          <p className="mt-1 break-all font-mono text-[11px] leading-snug text-text-secondary">{inviteLine}</p>
          <button
            type="button"
            onClick={handleCopyInvite}
            disabled={inviteWorkspaceUrl.length === 0}
            className="mt-2 text-[11px] font-medium text-accent-blue hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {copyDone ? 'Copied' : 'Copy invite text'}
          </button>
        </div>
      </section>

      {canAddPeople && onAddWorkspacePerson ? (
        <AddPersonToClosingModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={onAddWorkspacePerson}
        />
      ) : null}
    </>
  );
}
