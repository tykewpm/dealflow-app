import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { assertDealInWorkspace, requireWorkspaceMember } from './workspaceAccess';

/** Append a deal chat row; `senderId` is the member’s roster id (not client-supplied). */
export const createDealMessage = mutation({
  args: {
    dealId: v.id('deals'),
    text: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspaceId, rosterUserId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);
    await ctx.db.insert('dealMessages', {
      dealId: args.dealId,
      senderId: rosterUserId,
      text: args.text,
      createdAt: args.createdAt,
    });
    return null;
  },
});
