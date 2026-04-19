import { internalMutation } from './_generated/server';
import type { Id } from './_generated/dataModel';

function assertDevMigrationAllowed(): void {
  if (process.env.ALLOW_CONVEX_DEV_SEED === 'true') return;
  const deployment = process.env.CONVEX_DEPLOYMENT ?? '';
  if (deployment.startsWith('prod:')) {
    throw new Error(
      'applyWorkspaceScope refused: production deployment. Set Convex env ALLOW_CONVEX_DEV_SEED=true to override.',
    );
  }
}

/**
 * Dev-oriented migration: creates one workspace and attaches existing deals / roster / templates.
 * Run after deploying Slice B schema: `npx convex run migrations:applyWorkspaceScope`
 */
export const applyWorkspaceScope = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertDevMigrationAllowed();

    let workspaceId: Id<'workspaces'>;
    const existingWs = await ctx.db.query('workspaces').collect();
    if (existingWs.length === 0) {
      const createdAt = new Date().toISOString();
      workspaceId = await ctx.db.insert('workspaces', {
        name: 'Default workspace',
        createdAt,
      });
    } else {
      workspaceId = existingWs[0]._id;
    }

    const deals = await ctx.db.query('deals').collect();
    let dealsPatched = 0;
    for (const d of deals) {
      if (d.workspaceId === undefined) {
        await ctx.db.patch(d._id, { workspaceId });
        dealsPatched++;
      }
    }

    const people = await ctx.db.query('workspacePeople').collect();
    let peoplePatched = 0;
    for (const p of people) {
      if (p.workspaceId === undefined) {
        await ctx.db.patch(p._id, { workspaceId });
        peoplePatched++;
      }
    }

    const templates = await ctx.db.query('customTransactionTemplates').collect();
    let templatesPatched = 0;
    for (const t of templates) {
      if (t.workspaceId === undefined) {
        await ctx.db.patch(t._id, { workspaceId });
        templatesPatched++;
      }
    }

    return {
      workspaceId,
      dealsPatched,
      peoplePatched,
      templatesPatched,
    };
  },
});
