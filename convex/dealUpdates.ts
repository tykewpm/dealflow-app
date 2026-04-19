import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { assertDealInWorkspace, requireWorkspaceMember } from './workspaceAccess';

const pipelineStage = v.union(
  v.literal('under-contract'),
  v.literal('due-diligence'),
  v.literal('financing'),
  v.literal('pre-closing'),
  v.literal('closing'),
);

/** Patch address and party names only (not closing date or status). */
export const updateDealMetadata = mutation({
  args: {
    dealId: v.id('deals'),
    propertyAddress: v.string(),
    buyerName: v.string(),
    sellerName: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);
    await ctx.db.patch(args.dealId, {
      propertyAddress: args.propertyAddress.trim(),
      buyerName: args.buyerName.trim(),
      sellerName: args.sellerName.trim(),
    });
    return null;
  },
});

/** Updates deal kanban column — independent of deal health / status. */
export const updateDealPipelineStage = mutation({
  args: {
    dealId: v.id('deals'),
    pipelineStage,
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);
    await ctx.db.patch(args.dealId, { pipelineStage: args.pipelineStage });
    return null;
  },
});

/** Hide from Active/Completed lists without deleting — restore sets `archived: false`. */
export const setDealArchived = mutation({
  args: {
    dealId: v.id('deals'),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);
    await ctx.db.patch(args.dealId, { archived: args.archived });
    return null;
  },
});
