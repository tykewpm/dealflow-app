import { useMemo, type ReactNode } from 'react';
import transactqLogo from '../../../imports/logo.svg';
import type { MembershipBlockKind } from '../../../hooks/useWorkspaceMembershipOnboarding';
import { CopyTextButton } from '../ui/CopyTextButton';
import { Button } from '../ui/button';

interface WorkspaceMembershipGateProps {
  /** Signed-in email from auth (may help user see mismatch vs roster). */
  email?: string | null;
  onRetry: () => void;
  onSignOut: () => void;
  /** Optional extra detail (e.g. server hint). */
  detail?: ReactNode;
  /** Why access failed — changes headline and body copy. */
  blockKind?: MembershipBlockKind;
}

/**
 * Strong blocked state when the user is authenticated but cannot be linked to the workspace roster.
 */
export function WorkspaceMembershipGate({
  email,
  onRetry,
  onSignOut,
  detail,
  blockKind = 'roster',
}: WorkspaceMembershipGateProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rosterUrl = origin ? `${origin}/workspace/roster` : '';
  const askAdminSnippet = useMemo(() => {
    if (blockKind !== 'roster' || !email || !origin) {
      return '';
    }
    return [
      `Hi — I need access to our TransactQ workspace.`,
      ``,
      `My sign-in email is: ${email}`,
      ``,
      `Please add that email under "Invite (roster)" in the TransactQ sidebar (or Team roster), then tell me to tap "Check again" on the access screen.`,
      ``,
      `App: ${origin}`,
      rosterUrl ? `Roster page: ${rosterUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }, [blockKind, email, origin, rosterUrl]);

  const title =
    blockKind === 'no_workspace'
      ? 'Workspace not provisioned'
      : blockKind === 'unknown'
        ? 'Could not finish sign-in'
        : 'Workspace access required';

  const body =
    blockKind === 'no_workspace' ? (
      <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
        The backend has no default workspace yet (common right after a fresh Convex deploy or DB reset).
        From the project root, run:
      </p>
    ) : blockKind === 'unknown' ? (
      <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
        Something went wrong while linking your account. You can try again or sign out and sign back in.
      </p>
    ) : (
      <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
        Your account is signed in, but it is not linked to this workspace. We could not match your
        sign-in email to anyone on the team roster.
      </p>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-app px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-elevated p-8 shadow-sm dark:shadow-none">
        <div className="mb-6 flex justify-center">
          <img src={transactqLogo} alt="" className="h-10 w-auto" />
        </div>
        <h1 className="text-center text-lg font-semibold text-text-primary">{title}</h1>
        {body}
        {blockKind === 'no_workspace' ? (
          <div className="mt-4 space-y-2 rounded-md border border-border-strong bg-bg-surface px-3 py-3 text-left font-mono text-xs text-text-primary">
            <p className="whitespace-pre-wrap">npx convex run migrations:applyWorkspaceScope</p>
            <p className="whitespace-pre-wrap">npm run seed:dev</p>
          </div>
        ) : null}
        {email ? (
          <p className="mt-4 rounded-md border border-border-subtle bg-bg-app px-3 py-2 text-center text-xs text-text-secondary dark:bg-bg-surface/50">
            Signed in as <span className="font-medium">{email}</span>
          </p>
        ) : null}
        {detail ? <div className="mt-4 text-center text-sm text-text-secondary">{detail}</div> : null}
        {askAdminSnippet ? (
          <div className="mt-6 rounded-lg border border-border-subtle bg-bg-app px-4 py-3 text-left dark:bg-bg-surface/50">
            <p className="text-xs font-medium text-text-primary">Message for your teammate (copy and send)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <CopyTextButton text={askAdminSnippet} label="Copy request for teammate" copiedLabel="Copied" />
              {email ? <CopyTextButton text={email} label="Copy my email only" /> : null}
              {rosterUrl ? <CopyTextButton text={rosterUrl} label="Copy roster page link" /> : null}
            </div>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" variant="accent" onClick={onRetry}>
            Check again
          </Button>
          <Button type="button" variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
        {blockKind === 'roster' ? (
          <p className="mt-6 text-center text-xs text-text-muted">
            Ask someone who is already signed in to open <strong>Invite (roster)</strong> in the sidebar, add your
            email there, then return here and use <strong>Check again</strong>.
          </p>
        ) : blockKind === 'no_workspace' ? (
          <p className="mt-6 text-center text-xs text-text-muted">
            Then reload this page or tap <strong>Check again</strong>.
          </p>
        ) : null}
      </div>
    </div>
  );
}
