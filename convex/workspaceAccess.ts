import { getAuthUserId } from '@convex-dev/auth/server';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

type Ctx = QueryCtx | MutationCtx;

/** First workspace document — single-tenant MVP. */
export async function getSingletonWorkspaceId(ctx: Ctx): Promise<Id<'workspaces'> | null> {
  const rows = await ctx.db.query('workspaces').collect();
  return rows.length > 0 ? rows[0]._id : null;
}

export async function requireWorkspaceMember(ctx: Ctx): Promise<{
  authUserId: Id<'users'>;
  workspaceId: Id<'workspaces'>;
  rosterUserId: string;
}> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) {
    throw new Error('Unauthorized');
  }
  const membership = await ctx.db
    .query('workspaceMemberships')
    .withIndex('by_userId', (q) => q.eq('userId', authUserId))
    .first();
  if (!membership) {
    throw new Error('Not a workspace member');
  }
  return {
    authUserId,
    workspaceId: membership.workspaceId,
    rosterUserId: membership.rosterUserId,
  };
}

/** Query-only: membership without throwing (for snapshot / session UI). */
export async function getWorkspaceMembership(ctx: Ctx): Promise<{
  authUserId: Id<'users'>;
  workspaceId: Id<'workspaces'>;
  rosterUserId: string;
} | null> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) {
    return null;
  }
  const membership = await ctx.db
    .query('workspaceMemberships')
    .withIndex('by_userId', (q) => q.eq('userId', authUserId))
    .first();
  if (!membership) {
    return null;
  }
  return { authUserId, workspaceId: membership.workspaceId, rosterUserId: membership.rosterUserId };
}

export async function assertDealInWorkspace(
  ctx: MutationCtx,
  dealId: Id<'deals'>,
  workspaceId: Id<'workspaces'>,
): Promise<void> {
  const deal = await ctx.db.get(dealId);
  if (!deal) {
    throw new Error('Deal not found');
  }
  if (deal.workspaceId === undefined) {
    throw new Error(
      'Workspace migration required — run `npx convex run migrations:applyWorkspaceScope` (dev) or patch deployment data.',
    );
  }
  if (deal.workspaceId !== workspaceId) {
    throw new Error('Deal not found');
  }
}

export async function assertTaskInWorkspace(
  ctx: MutationCtx,
  taskId: Id<'tasks'>,
  workspaceId: Id<'workspaces'>,
): Promise<void> {
  const task = await ctx.db.get(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  await assertDealInWorkspace(ctx, task.dealId, workspaceId);
}

export async function assertDealDocumentInWorkspace(
  ctx: MutationCtx,
  documentId: Id<'dealDocuments'>,
  workspaceId: Id<'workspaces'>,
): Promise<void> {
  const row = await ctx.db.get(documentId);
  if (!row) {
    throw new Error('Document not found');
  }
  await assertDealInWorkspace(ctx, row.dealId, workspaceId);
}

export async function assertCustomTemplateInWorkspace(
  ctx: MutationCtx,
  templateId: Id<'customTransactionTemplates'>,
  workspaceId: Id<'workspaces'>,
): Promise<void> {
  const row = await ctx.db.get(templateId);
  if (!row) {
    throw new Error('Template not found');
  }
  if (row.workspaceId === undefined || row.workspaceId !== workspaceId) {
    throw new Error('Template not found');
  }
}
