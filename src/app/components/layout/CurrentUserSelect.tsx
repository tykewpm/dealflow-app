import type { User } from '../../types';

interface CurrentUserSelectProps {
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  /** Hide label and tighten layout when sidebar is collapsed. */
  compact?: boolean;
  /** When set with a roster match, label becomes “Signed in as” and the dropdown can be hidden. */
  sessionEmail?: string | null;
  /** Hide roster dropdown (session email matched a workspace person). */
  hidePicker?: boolean;
}

/** Roster-backed workspace actor; with Convex Auth, optionally reflects the signed-in account. */
export function CurrentUserSelect({
  users,
  value,
  onChange,
  compact,
  sessionEmail,
  hidePicker,
}: CurrentUserSelectProps) {
  if (users.length === 0) return null;

  const effective =
    value && users.some((u) => u.id === value) ? value : users[0].id;
  const chosen = users.find((u) => u.id === effective);
  const sessionMatched =
    sessionEmail &&
    users.some((u) => u.email.toLowerCase() === sessionEmail.trim().toLowerCase());

  const label =
    sessionEmail && sessionMatched ? 'Signed in as' : sessionEmail ? 'Workspace identity' : 'Acting as';

  if (hidePicker && chosen) {
    return (
      <div>
        {!compact ? (
          <div className="mb-1.5 block px-1 text-xs font-medium text-text-muted">{label}</div>
        ) : null}
        <div
          title={chosen ? `${chosen.name} — ${chosen.email}` : undefined}
          className={`w-full rounded-md border border-border-subtle bg-bg-elevated text-sm text-text-primary transition-[background-color,border-color,color] duration-150 ease-out ${
            compact ? 'px-1 py-1.5 text-xs' : 'px-2 py-2'
          }`}
        >
          <span className="block truncate">
            {chosen.name}{' '}
            <span className="text-text-muted">({chosen.email})</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!compact ? (
        <label htmlFor="workspace-current-user" className="mb-1.5 block px-1 text-xs font-medium text-text-muted">
          {label}
        </label>
      ) : null}
      <select
        id="workspace-current-user"
        value={effective}
        onChange={(e) => onChange(e.target.value)}
        title={chosen ? `${chosen.name} — ${chosen.email}` : undefined}
        aria-label="Current workspace member"
        className={`w-full rounded-md border border-input-border bg-input-bg text-sm text-text-primary shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-[color:var(--input-focus-ring)] ${
          compact ? 'px-1 py-1.5 text-xs' : 'px-2 py-2'
        }`}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
    </div>
  );
}
