import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { syncDealPipelineStageFromTasksIfNeeded } from './dealPhaseSync';
import { requireWorkspaceMember } from './workspaceAccess';

const dealStatus = v.union(
  v.literal('active'),
  v.literal('at-risk'),
  v.literal('overdue'),
  v.literal('complete'),
);

const pipelineStage = v.union(
  v.literal('under-contract'),
  v.literal('due-diligence'),
  v.literal('financing'),
  v.literal('pre-closing'),
  v.literal('closing'),
);

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
 * Atomically creates a deal and its initial tasks and checklist documents.
 * Task statuses are supplied by the client using the same rules as mock mode (`determineTaskStatus`).
 */
export const createDealWithWorkspace = mutation({
  args: {
    propertyAddress: v.string(),
    buyerName: v.string(),
    sellerName: v.string(),
    closingDate: v.string(),
    createdAt: v.string(),
    status: dealStatus,
    pipelineStage: pipelineStage,
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
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);

    const dealId = await ctx.db.insert('deals', {
      workspaceId,
      propertyAddress: args.propertyAddress,
      buyerName: args.buyerName,
      sellerName: args.sellerName,
      closingDate: args.closingDate,
      status: args.status,
      createdAt: args.createdAt,
      pipelineStage: args.pipelineStage,
      archived: false,
    });

    for (const t of args.tasks) {
      await ctx.db.insert('tasks', {
        dealId,
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
        dealId,
        name: d.name,
        status: d.status,
        signatureStatus: d.signatureStatus,
        ...(d.dueDate !== undefined ? { dueDate: d.dueDate } : {}),
        ...(d.referenceLink !== undefined ? { referenceLink: d.referenceLink } : {}),
        ...(d.notes !== undefined ? { notes: d.notes } : {}),
      });
    }

    await syncDealPipelineStageFromTasksIfNeeded(ctx, dealId);

    return { dealId };
  },
});
