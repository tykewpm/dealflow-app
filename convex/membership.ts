import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { getSingletonWorkspaceId, getWorkspaceMembership } from './workspaceAccess';

/**
 * Client session: auth + membership + roster id (replaces email-guessing for identity when `status` is `ok`).
 */
export const workspaceSession = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { status: 'unauthenticated' as const };
    }
    const user = await ctx.db.get(userId);
    const email = typeof user?.email === 'string' ? user.email.trim() : null;
    const m = await getWorkspaceMembership(ctx);
    if (!m) {
      return { status: 'needs_membership' as const, email };
    }
    return {
      status: 'ok' as const,
      email,
      workspaceId: m.workspaceId,
      rosterUserId: m.rosterUserId,
    };
  },
});

/**
 * If the signed-in user’s email matches a `workspacePeople` row in the default workspace, create membership.
 * No roles/invites — email must already exist on the roster (e.g. from seed or admin scripts).
 */
export const claimWorkspaceMembership = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Unauthorized');
    }
    const existing = await ctx.db
      .query('workspaceMemberships')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (existing) {
      return { outcome: 'already_member' as const, rosterUserId: existing.rosterUserId };
    }

    const authUser = await ctx.db.get(userId);
    const emailRaw = typeof authUser?.email === 'string' ? authUser.email.trim() : '';
    if (!emailRaw) {
      throw new Error('Your account has no email — cannot match roster.');
    }
    const emailLower = emailRaw.toLowerCase();

    const workspaceId = await getSingletonWorkspaceId(ctx);
    if (!workspaceId) {
      return {
        outcome: 'no_workspace' as const,
        hint: 'Run `npx convex run migrations:applyWorkspaceScope` then `npm run seed:dev` (dev) to create the default workspace and roster.',
      };
    }

    const people = await ctx.db
      .query('workspacePeople')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .collect();

    const match = people.find((p) => p.email.trim().toLowerCase() === emailLower);
    if (!match) {
      return {
        outcome: 'no_roster_match' as const,
        hint: 'Ask an admin to add your email to workspacePeople or create membership manually.',
      };
    }

    await ctx.db.insert('workspaceMemberships', {
      workspaceId,
      userId,
      rosterUserId: match.userId,
    });

    return { outcome: 'joined' as const, rosterUserId: match.userId };
  },
});
