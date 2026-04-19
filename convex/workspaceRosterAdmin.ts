import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getWorkspaceMembership, requireWorkspaceMember } from './workspaceAccess';

function newRosterUserId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) {
    return `u_${c.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Workspace members can list roster rows in their workspace (for admin UI). */
export const listRoster = query({
  args: {},
  handler: async (ctx) => {
    const m = await getWorkspaceMembership(ctx);
    if (!m) {
      return [];
    }
    const people = await ctx.db
      .query('workspacePeople')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', m.workspaceId))
      .collect();
    people.sort((a, b) => a.userId.localeCompare(b.userId));
    return people.map((p) => ({
      userId: p.userId,
      name: p.name,
      email: p.email,
    }));
  },
});

/**
 * Any authenticated workspace member may add a roster person (early-stage ops; replace with RBAC later).
 * Blocked users can retry auto-claim once their email appears here.
 */
export const addPersonToRoster = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    /** Optional stable id (e.g. `u4`). If omitted, a unique id is generated. */
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);

    const name = args.name.trim();
    const emailRaw = args.email.trim();
    if (!name || !emailRaw) {
      throw new Error('Name and email are required.');
    }
    const emailLower = emailRaw.toLowerCase();

    const people = await ctx.db
      .query('workspacePeople')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .collect();

    if (people.some((p) => p.email.trim().toLowerCase() === emailLower)) {
      throw new Error('That email is already on the workspace roster.');
    }

    let userId = args.userId?.trim() ?? '';
    if (userId.length > 0) {
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) {
        throw new Error('Roster id must be 1–64 characters: letters, numbers, underscore, hyphen.');
      }
      if (people.some((p) => p.userId === userId)) {
        throw new Error('That roster id is already in use.');
      }
    } else {
      let candidate = newRosterUserId();
      let guard = 0;
      while (people.some((p) => p.userId === candidate) && guard < 20) {
        candidate = newRosterUserId();
        guard++;
      }
      if (people.some((p) => p.userId === candidate)) {
        throw new Error('Could not allocate a unique roster id — try providing one explicitly.');
      }
      userId = candidate;
    }

    await ctx.db.insert('workspacePeople', {
      workspaceId,
      userId,
      name,
      email: emailRaw,
    });

    return { userId };
  },
});
