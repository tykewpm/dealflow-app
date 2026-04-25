import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { getSingletonWorkspaceId } from './workspaceAccess';

/** Same guard as `seed:seedDevWorkspace` — never mutate roster via CLI on prod unless explicitly allowed. */
function assertDevRosterCliAllowed(): void {
  if (process.env.ALLOW_CONVEX_DEV_SEED === 'true') return;
  const deployment = process.env.CONVEX_DEPLOYMENT ?? '';
  if (deployment.startsWith('prod:')) {
    throw new Error(
      'addRosterPersonDev refused: production deployment. Set Convex env ALLOW_CONVEX_DEV_SEED=true to override.',
    );
  }
}

/**
 * Dev / CLI only: insert a `workspacePeople` row on the singleton workspace so a signed-in user can
 * `claimWorkspaceMembership` (email must match exactly, case-insensitive).
 *
 * From repo root (with Convex CLI pointed at this deployment):
 *   npx convex run devRoster:addRosterPersonDev '{"email":"you@example.com","name":"Your Name"}'
 *
 * Optional `userId` (e.g. `u4`) must be unique for that workspace.
 */
export const addRosterPersonDev = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertDevRosterCliAllowed();

    const workspaceId = await getSingletonWorkspaceId(ctx);
    if (!workspaceId) {
      throw new Error('No workspace — run `npm run seed:dev` first.');
    }

    const emailRaw = args.email.trim();
    const nameTrim = args.name.trim();
    if (!emailRaw || !nameTrim) {
      throw new Error('email and name are required (non-empty).');
    }
    const emailLower = emailRaw.toLowerCase();

    const people = await ctx.db
      .query('workspacePeople')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .collect();

    const existing = people.find((p) => p.email.trim().toLowerCase() === emailLower);
    if (existing) {
      return { ok: true as const, skipped: 'already_on_roster' as const, userId: existing.userId };
    }

    let userId = args.userId?.trim() ?? '';
    if (userId.length > 0) {
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) {
        throw new Error('userId must be 1–64 characters: letters, numbers, underscore, hyphen.');
      }
      if (people.some((p) => p.userId === userId)) {
        throw new Error('That userId is already on the roster.');
      }
    } else {
      let candidate = `u_${Date.now().toString(36)}`;
      let guard = 0;
      while (people.some((p) => p.userId === candidate) && guard < 50) {
        candidate = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        guard += 1;
      }
      if (people.some((p) => p.userId === candidate)) {
        throw new Error('Could not allocate a unique userId — pass userId explicitly.');
      }
      userId = candidate;
    }

    await ctx.db.insert('workspacePeople', {
      workspaceId,
      userId,
      name: nameTrim,
      email: emailRaw,
    });

    return { ok: true as const, skipped: null, userId };
  },
});
