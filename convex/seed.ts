import { internalMutation } from './_generated/server';
import type { Id } from './_generated/dataModel';
import {
  SEED_DEALS_ORDERED,
  SEED_DOCUMENTS,
  SEED_TASKS,
  SEED_WORKSPACE_PEOPLE,
  type MockDealKey,
} from './seedData';

/**
 * Block obvious production deployments unless explicitly overridden.
 * This mutation is `internal` (never exposed to the browser); the guard only stops accidental
 * `npx convex run` against prod. Non-`prod:` deployments (local dev, preview, team dev) are allowed.
 * Set Convex env `ALLOW_CONVEX_DEV_SEED=true` to seed a prod deployment intentionally.
 */
function assertDevSeedAllowed(): void {
  if (process.env.ALLOW_CONVEX_DEV_SEED === 'true') return;
  const deployment = process.env.CONVEX_DEPLOYMENT ?? '';
  if (deployment.startsWith('prod:')) {
    throw new Error(
      'seedDevWorkspace refused: production deployment (CONVEX_DEPLOYMENT starts with prod:). ' +
        'Set Convex env ALLOW_CONVEX_DEV_SEED=true to override.',
    );
  }
}

/** Dev-only: replace all workspace rows with seed data mirroring mock fixtures. Not callable from the client. */
export const seedDevWorkspace = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertDevSeedAllowed();

    const existingMemberships = await ctx.db.query('workspaceMemberships').collect();
    for (const row of existingMemberships) {
      await ctx.db.delete(row._id);
    }

    const existingWs = await ctx.db.query('workspaces').collect();
    for (const w of existingWs) {
      await ctx.db.delete(w._id);
    }

    const createdAt = new Date().toISOString();
    const workspaceId = await ctx.db.insert('workspaces', {
      name: 'Default workspace',
      createdAt,
    });

    const existingPeople = await ctx.db.query('workspacePeople').collect();
    for (const p of existingPeople) {
      await ctx.db.delete(p._id);
    }
    for (const row of SEED_WORKSPACE_PEOPLE) {
      await ctx.db.insert('workspacePeople', {
        workspaceId,
        userId: row.userId,
        name: row.name,
        email: row.email,
      });
    }

    const existingDocs = await ctx.db.query('dealDocuments').collect();
    for (const doc of existingDocs) {
      await ctx.db.delete(doc._id);
    }
    const existingTasks = await ctx.db.query('tasks').collect();
    for (const t of existingTasks) {
      await ctx.db.delete(t._id);
    }
    const existingDeals = await ctx.db.query('deals').collect();
    for (const d of existingDeals) {
      await ctx.db.delete(d._id);
    }

    const dealIdByMock = new Map<MockDealKey, Id<'deals'>>();
    for (const { mockDealId, row } of SEED_DEALS_ORDERED) {
      const id = await ctx.db.insert('deals', { workspaceId, ...row });
      dealIdByMock.set(mockDealId, id);
    }

    for (const t of SEED_TASKS) {
      const dealId = dealIdByMock.get(t.mockDealId);
      if (!dealId) throw new Error(`Missing deal id for ${t.mockDealId}`);
      await ctx.db.insert('tasks', {
        dealId,
        name: t.name,
        dueDate: t.dueDate,
        status: t.status,
        ...(t.assigneeId !== undefined ? { assigneeId: t.assigneeId } : {}),
      });
    }

    for (const doc of SEED_DOCUMENTS) {
      const dealId = dealIdByMock.get(doc.mockDealId);
      if (!dealId) throw new Error(`Missing deal id for ${doc.mockDealId}`);
      await ctx.db.insert('dealDocuments', {
        dealId,
        name: doc.name,
        status: doc.status,
        signatureStatus: doc.signatureStatus,
        ...(doc.dueDate !== undefined ? { dueDate: doc.dueDate } : {}),
        ...(doc.referenceLink !== undefined ? { referenceLink: doc.referenceLink } : {}),
        ...(doc.notes !== undefined ? { notes: doc.notes } : {}),
      });
    }

    return {
      dealsInserted: SEED_DEALS_ORDERED.length,
      tasksInserted: SEED_TASKS.length,
      documentsInserted: SEED_DOCUMENTS.length,
    };
  },
});
