import { getAuthUserId } from '@convex-dev/auth/server';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { seedStarterClosingIfEmpty } from './starterClosing';
import { getWorkspaceMembership } from './workspaceAccess';

function rosterUserIdForAuthUser(authUserId: Id<'users'>): string {
  const raw = String(authUserId).replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `u_${raw}`;
  return id.length <= 64 ? id : id.slice(0, 64);
}

function personalWorkspaceNameFromEmail(email: string): string {
  const local = email.includes('@') ? (email.split('@')[0] ?? '').trim() : email.trim();
  const label = local.length > 0 ? local : 'My';
  const name = `${label}'s Workspace`;
  return name.length > 120 ? `${name.slice(0, 117)}…` : name;
}

function rosterDisplayNameFromAuthUser(authUser: { email?: string | null; name?: string | null } | null, emailRaw: string): string {
  const n = typeof authUser?.name === 'string' ? authUser.name.trim() : '';
  if (n.length > 0) return n.length > 120 ? `${n.slice(0, 117)}…` : n;
  const local = emailRaw.includes('@') ? (emailRaw.split('@')[0] ?? '').trim() : emailRaw;
  return local.length > 0 ? local : 'Member';
}

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
 * Links the signed-in user to a workspace:
 * 1) If they already have `workspaceMemberships`, no-op.
 * 2) Else if any `workspacePeople` row matches their email (case-insensitive), join that workspace.
 * 3) Else create a personal workspace + roster row + membership (idempotent; safe for first-time signup).
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
      return {
        outcome: 'no_email' as const,
        hint: 'Your account has no email on file — add an email to your auth profile or use a provider that supplies one.',
      };
    }
    const emailLower = emailRaw.toLowerCase();

    const allPeople = await ctx.db.query('workspacePeople').collect();
    const match = allPeople.find(
      (p) => p.workspaceId !== undefined && p.email.trim().toLowerCase() === emailLower,
    );
    if (match && match.workspaceId) {
      const dup = await ctx.db
        .query('workspaceMemberships')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .first();
      if (dup) {
        return { outcome: 'already_member' as const, rosterUserId: dup.rosterUserId };
      }
      await ctx.db.insert('workspaceMemberships', {
        workspaceId: match.workspaceId,
        userId,
        rosterUserId: match.userId,
      });
      return { outcome: 'joined' as const, rosterUserId: match.userId };
    }

    const dupBeforeProvision = await ctx.db
      .query('workspaceMemberships')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (dupBeforeProvision) {
      return { outcome: 'already_member' as const, rosterUserId: dupBeforeProvision.rosterUserId };
    }

    const createdAt = new Date().toISOString();
    const workspaceName = personalWorkspaceNameFromEmail(emailRaw);
    const newWorkspaceId = await ctx.db.insert('workspaces', {
      name: workspaceName,
      createdAt,
    });

    const rosterUserId = rosterUserIdForAuthUser(userId);
    const displayName = rosterDisplayNameFromAuthUser(authUser, emailRaw);

    await ctx.db.insert('workspacePeople', {
      workspaceId: newWorkspaceId,
      userId: rosterUserId,
      name: displayName,
      email: emailRaw,
      partyLabel: 'agent',
      permissionRole: 'owner',
    });

    const dupBeforeMembership = await ctx.db
      .query('workspaceMemberships')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (dupBeforeMembership) {
      return { outcome: 'already_member' as const, rosterUserId: dupBeforeMembership.rosterUserId };
    }

    await ctx.db.insert('workspaceMemberships', {
      workspaceId: newWorkspaceId,
      userId,
      rosterUserId,
    });

    await seedStarterClosingIfEmpty(ctx, newWorkspaceId, rosterUserId);

    return { outcome: 'provisioned' as const, rosterUserId, workspaceId: newWorkspaceId };
  },
});
