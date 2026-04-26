import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { elevateDealStatusIfDerivedAtRisk } from './dealDerivedHealth';
import { syncDealPipelineStageFromTasksIfNeeded } from './dealPhaseSync';
import { assertTaskInWorkspace, requireWorkspaceMember } from './workspaceAccess';

const taskStatus = v.union(
  v.literal('upcoming'),
  v.literal('active'),
  v.literal('at-risk'),
  v.literal('overdue'),
  v.literal('complete'),
);

/** Persists task checklist state (same status union as the app). */
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id('tasks'),
    status: taskStatus,
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertTaskInWorkspace(ctx, args.taskId, workspaceId);
    const row = await ctx.db.get(args.taskId);
    if (!row) throw new Error('Task not found');
    await ctx.db.patch(args.taskId, { status: args.status });
    await elevateDealStatusIfDerivedAtRisk(ctx, row.dealId);
    await syncDealPipelineStageFromTasksIfNeeded(ctx, row.dealId);
    return null;
  },
});

/** Set or clear task assignee (`assigneeId` is optional on tasks; null clears). */
export const updateTaskAssignee = mutation({
  args: {
    taskId: v.id('tasks'),
    assigneeId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertTaskInWorkspace(ctx, args.taskId, workspaceId);
    const row = await ctx.db.get(args.taskId);
    if (!row) throw new Error('Task not found');
    if (args.assigneeId === null) {
      await ctx.db.patch(args.taskId, { assigneeId: undefined });
    } else {
      await ctx.db.patch(args.taskId, { assigneeId: args.assigneeId });
    }
    await elevateDealStatusIfDerivedAtRisk(ctx, row.dealId);
    return null;
  },
});
