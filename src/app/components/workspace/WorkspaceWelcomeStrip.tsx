import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Deal, Task, User } from '../../types';
import { excludeArchivedDeals } from '../../utils/dealLifecycle';

interface WorkspaceWelcomeStripProps {
  users: User[];
  currentUserId: string;
  deals: Deal[];
  tasks: Task[];
  onDismiss: () => void;
}

type WelcomeLink = { label: string; to: string };

/** Active pipeline deals — matches workload / dashboard “active” (not archived, not closed). */
function pipelineDeals(deals: Deal[]): Deal[] {
  return excludeArchivedDeals(deals).filter((d) => d.status !== 'complete');
}

function hasAssignedIncompleteOnPipeline(
  deals: Deal[],
  tasks: Task[],
  currentUserId: string,
): boolean {
  const ids = new Set(pipelineDeals(deals).map((d) => d.id));
  return tasks.some(
    (t) =>
      t.assigneeId === currentUserId &&
      t.status !== 'complete' &&
      ids.has(t.dealId),
  );
}

const LINK_CATALOG: WelcomeLink[] = [
  { label: 'Browse deals', to: '/' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Team workload', to: '/agents' },
  { label: 'Invite (roster)', to: '/workspace/roster' },
  { label: 'Create a deal', to: '/deals/new' },
];

function pickPrimaryAndSecondaries(
  deals: Deal[],
  tasks: Task[],
  users: User[],
  currentUserId: string,
): { primary: WelcomeLink; secondaries: WelcomeLink[] } {
  const active = pipelineDeals(deals);
  const rosterOthers = users.filter((u) => u.id !== currentUserId);

  if (hasAssignedIncompleteOnPipeline(deals, tasks, currentUserId)) {
    return pickSecondaries({ label: 'Review your tasks', to: '/agents' });
  }
  if (active.length === 0) {
    return pickSecondaries({ label: 'Create a deal', to: '/deals/new' });
  }
  if (rosterOthers.length === 0) {
    return pickSecondaries({ label: 'Invite a teammate', to: '/workspace/roster' });
  }
  return pickSecondaries({ label: 'Browse deals', to: '/' });
}

function pickSecondaries(primary: WelcomeLink): { primary: WelcomeLink; secondaries: WelcomeLink[] } {
  const secondaries = LINK_CATALOG.filter((l) => l.to !== primary.to).slice(0, 2);
  return { primary, secondaries };
}

function teammateSummary(users: User[], currentUserId: string): string {
  const others = users.filter((u) => u.id !== currentUserId);
  if (others.length === 0) {
    return "Right now you're the only teammate listed on the roster — invite others from Invite (roster) when you're ready.";
  }
  const shown = others.slice(0, 3).map((u) => u.name);
  const extra = others.length - shown.length;
  if (extra <= 0) {
    return `${shown.join(', ')} ${others.length === 1 ? 'is' : 'are'} here with you.`;
  }
  return `${shown.join(', ')}, and ${extra} more teammate${extra === 1 ? '' : 's'} are here with you.`;
}

const linkClass =
  'font-medium underline decoration-accent-green/50 underline-offset-2 hover:text-accent-blue';
const primaryLinkClass = `${linkClass} text-accent-green`;

/**
 * One-time-feeling welcome after workspace access — subtle, dismissible, points to real work.
 */
export function WorkspaceWelcomeStrip({
  users,
  currentUserId,
  deals,
  tasks,
  onDismiss,
}: WorkspaceWelcomeStripProps) {
  const summary = teammateSummary(users, currentUserId);
  const { primary, secondaries } = pickPrimaryAndSecondaries(deals, tasks, users, currentUserId);

  return (
    <div className="flex items-start gap-3 px-1 py-0.5">
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-text-primary">
        <p className="font-medium text-text-primary">You&apos;re in — welcome to the workspace.</p>
        <p className="mt-1 text-text-secondary">{summary}</p>
        <p className="mt-2 text-xs text-text-muted">
          <span className="font-medium text-text-primary">Suggested next step:</span>{' '}
          <Link to={primary.to} className={primaryLinkClass}>
            {primary.label}
          </Link>
          {secondaries.map((s) => (
            <span key={s.to}>
              <span className="mx-1.5 text-text-muted">·</span>
              <Link to={s.to} className={linkClass}>
                {s.label}
              </Link>
            </span>
          ))}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary"
        aria-label="Dismiss welcome message"
      >
        <X size={18} />
      </button>
    </div>
  );
}
