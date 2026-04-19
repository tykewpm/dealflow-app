import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { CopyTextButton } from '../ui/CopyTextButton';
import { Button } from '../ui/button';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { mockUsers } from '../../data/mockData';

const inputClass =
  'mt-1 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary shadow-none placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

type LastInvite = { name: string; email: string; userId: string };

function buildInviteMessage(origin: string, invite: LastInvite): string {
  const signIn = `${origin}/login`;
  const signUp = `${origin}/signup`;
  return [
    `You're invited to join our workspace on TransactQ.`,
    ``,
    `1) Open: ${signIn}`,
    `2) Sign up (if needed: ${signUp}) or sign in using this exact email: ${invite.email}`,
    `3) If you see "Workspace access required", tap "Check again" — your email is on the team roster.`,
    ``,
    `Roster name: ${invite.name}`,
    `Roster id: ${invite.userId}`,
  ].join('\n');
}

function WorkspaceRosterDemoReadonly() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
      <PageHeader title="Invite (roster)" description="Offline demo — roster editing uses the signed-in workspace." />
      <p className="mt-4 text-sm text-text-secondary">
        This screen syncs with Convex in the real app. In the <strong>demo workspace</strong> you are viewing
        static mock people only.
      </p>
      <ul className="mt-6 divide-y divide-border-subtle rounded-lg border border-border-subtle bg-bg-surface">
        {mockUsers.map((u) => (
          <li key={u.id} className="flex flex-col gap-0.5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-text-primary">{u.name}</span>
            <span className="text-text-secondary">{u.email}</span>
            <span className="text-xs text-text-muted">Roster id: {u.id}</span>
          </li>
        ))}
      </ul>
      </div>
    </PageContainer>
  );
}

/**
 * Minimal roster + lightweight “invite” UX: after adding someone, operators get copy-ready text and links.
 */
export function WorkspaceRosterPage() {
  if (!shouldUseConvexWorkspaceReads()) {
    return <WorkspaceRosterDemoReadonly />;
  }
  return <WorkspaceRosterPageConvex />;
}

function WorkspaceRosterPageConvex() {
  const convex = shouldUseConvexWorkspaceReads();
  const roster = useQuery(api.workspaceRosterAdmin.listRoster, convex ? {} : 'skip');
  const addPerson = useMutation(api.workspaceRosterAdmin.addPersonToRoster);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastInvite, setLastInvite] = useState<LastInvite | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const inviteMessage = useMemo(
    () => (lastInvite && origin ? buildInviteMessage(origin, lastInvite) : ''),
    [lastInvite, origin],
  );

  if (!convex) {
    return (
      <PageContainer>
        <PageHeader
          title="Workspace roster"
          description="Roster management is only available when the app is connected to Convex."
        />
      </PageContainer>
    );
  }

  const isLoading = roster === undefined;
  const rows = roster ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    void (async () => {
      try {
        const savedName = name.trim();
        const savedEmail = email.trim();
        const r = await addPerson({
          name: savedName,
          email: savedEmail,
          ...(userId.trim() !== '' ? { userId: userId.trim() } : {}),
        });
        setLastInvite({ name: savedName, email: savedEmail, userId: r.userId });
        setName('');
        setEmail('');
        setUserId('');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Could not add person.');
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const signInUrl = `${origin}/login`;
  const signUpUrl = `${origin}/signup`;

  return (
    <PageContainer>
      <PageHeader
        title="Invite teammates (roster)"
        description="Add someone to the roster with the same email they will use to sign in. After they sign in, TransactQ links their account automatically when the email matches — no invite tokens yet."
      />

      <div className="mb-10 max-w-xl rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-sm dark:shadow-none">
        <h2 className="text-sm font-semibold text-text-primary">Add person to roster</h2>
        <p className="mt-1 text-xs text-text-muted">
          Use their real sign-in email (Gmail, company SSO email, etc.). Optional roster id defaults to a
          generated value for assignees and chat.
        </p>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          {formError ? (
            <div className="rounded-md border border-border-subtle bg-accent-red-soft px-3 py-2 text-sm text-text-primary">{formError}</div>
          ) : null}
          <div>
            <label htmlFor="roster-name" className="text-sm font-medium text-text-primary">
              Full name
            </label>
            <input
              id="roster-name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className={inputClass}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="roster-email" className="text-sm font-medium text-text-primary">
              Email they will sign in with
            </label>
            <input
              id="roster-email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={inputClass}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="roster-userid" className="text-sm font-medium text-text-primary">
              Roster id (optional)
            </label>
            <input
              id="roster-userid"
              value={userId}
              onChange={(ev) => setUserId(ev.target.value)}
              className={inputClass}
              placeholder="e.g. u4 — leave blank to auto-generate"
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="accent" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add to roster'}
          </Button>
        </form>
      </div>

      {lastInvite && origin ? (
        <div className="mb-10 max-w-2xl rounded-lg border border-border-subtle bg-accent-blue-soft p-6 shadow-sm dark:shadow-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Next: tell them how to join</h2>
              <p className="mt-1 text-xs text-text-secondary">
                They must use <span className="font-medium text-text-primary">{lastInvite.email}</span> when they
                create an account or sign in. After that, if they see an access screen, they tap{' '}
                <strong>Check again</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLastInvite(null)}
              className="shrink-0 text-xs font-medium text-accent-blue hover:underline"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyTextButton text={lastInvite.email} label="Copy email" />
            <CopyTextButton text={signInUrl} label="Copy sign-in link" />
            <CopyTextButton text={signUpUrl} label="Copy sign-up link" />
            <CopyTextButton text={inviteMessage} label="Copy invite message" copiedLabel="Message copied" />
          </div>
          <pre className="mt-4 max-h-48 overflow-auto rounded-md border border-border-subtle bg-bg-surface p-3 text-left text-xs text-text-secondary whitespace-pre-wrap">
            {inviteMessage}
          </pre>
        </div>
      ) : null}

      <div className="max-w-3xl overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm dark:shadow-none">
        <div className="border-b border-border-subtle bg-bg-app px-4 py-3 dark:bg-bg-elevated/30">
          <h2 className="text-sm font-semibold text-text-primary">Current roster</h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-text-muted">Loading roster…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">No roster rows or you do not have workspace access.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-app text-xs font-medium uppercase tracking-wide text-text-muted dark:bg-bg-elevated/30">
                <tr>
                  <th className="px-4 py-2">Roster id</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{row.userId}</td>
                    <td className="px-4 py-2.5 text-text-primary">{row.name}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
