import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { elevateDealStatusIfDerivedAtRisk } from './dealDerivedHealth';
import { syncDealPipelineStageFromTasksIfNeeded } from './dealPhaseSync';
import { assertCustomTemplateInWorkspace, assertDealInWorkspace, requireWorkspaceMember } from './workspaceAccess';

const taskStatus = v.union(
  v.literal('upcoming'),
  v.literal('active'),
  v.literal('at-risk'),
  v.literal('overdue'),
  v.literal('complete'),
);

const documentStatus = v.union(
  v.literal('not-started'),
  v.literal('requested'),
  v.literal('uploaded'),
  v.literal('awaiting-signature'),
  v.literal('signed'),
  v.literal('completed'),
);

const signatureStatus = v.union(
  v.literal('not-required'),
  v.literal('requested'),
  v.literal('partially-signed'),
  v.literal('fully-signed'),
);

/**
 * Appends tasks and/or documents to an existing deal (template apply).
 * Payload rows match createDeal inserts — client builds rows via appendTasksFromTemplate / appendDocumentsFromTemplate.
 * Optional `customTemplateId` bumps usage metadata only for Convex-backed custom templates after a successful apply.
 */
export const applyTemplateToDeal = mutation({
  args: {
    dealId: v.id('deals'),
    tasks: v.array(
      v.object({
        name: v.string(),
        dueDate: v.string(),
        status: taskStatus,
        assigneeId: v.optional(v.string()),
        phase: v.optional(
          v.union(
            v.literal('under-contract'),
            v.literal('inspection'),
            v.literal('financing'),
            v.literal('escrow'),
            v.literal('closing'),
          ),
        ),
        isGate: v.optional(v.boolean()),
      }),
    ),
    documents: v.array(
      v.object({
        name: v.string(),
        status: documentStatus,
        signatureStatus: signatureStatus,
        dueDate: v.optional(v.string()),
        referenceLink: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
    customTemplateId: v.optional(v.id('customTransactionTemplates')),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);

    if (args.customTemplateId) {
      await assertCustomTemplateInWorkspace(ctx, args.customTemplateId, workspaceId);
    }

    for (const t of args.tasks) {
      await ctx.db.insert('tasks', {
        dealId: args.dealId,
        name: t.name,
        dueDate: t.dueDate,
        status: t.status,
        ...(t.assigneeId !== undefined ? { assigneeId: t.assigneeId } : {}),
        ...(t.phase !== undefined ? { phase: t.phase } : {}),
        ...(t.isGate !== undefined ? { isGate: t.isGate } : {}),
      });
    }

    for (const d of args.documents) {
      await ctx.db.insert('dealDocuments', {
        dealId: args.dealId,
        name: d.name,
        status: d.status,
        signatureStatus: d.signatureStatus,
        ...(d.dueDate !== undefined ? { dueDate: d.dueDate } : {}),
        ...(d.referenceLink !== undefined ? { referenceLink: d.referenceLink } : {}),
        ...(d.notes !== undefined ? { notes: d.notes } : {}),
      });
    }

    await elevateDealStatusIfDerivedAtRisk(ctx, args.dealId);
    await syncDealPipelineStageFromTasksIfNeeded(ctx, args.dealId);

    if (args.customTemplateId) {
      const tmpl = await ctx.db.get(args.customTemplateId);
      if (tmpl && tmpl.workspaceId === workspaceId) {
        const today = new Date().toISOString().slice(0, 10);
        await ctx.db.patch(args.customTemplateId, {
          usageCount: tmpl.usageCount + 1,
          lastUsed: today,
        });
      }
    }

    return null;
  },
});
