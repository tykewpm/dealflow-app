import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import {
  assertCustomTemplateInWorkspace,
  getWorkspaceMembership,
  requireWorkspaceMember,
} from './workspaceAccess';

const templateCategory = v.union(
  v.literal('buyer-rep'),
  v.literal('seller-rep'),
  v.literal('dual-rep'),
  v.literal('commercial'),
);

const templateStage = v.union(
  v.literal('under-contract'),
  v.literal('due-diligence'),
  v.literal('financing'),
  v.literal('pre-closing'),
  v.literal('closing'),
);

const templateTask = v.object({
  id: v.string(),
  name: v.string(),
  stage: templateStage,
  daysFromClosing: v.number(),
  description: v.optional(v.string()),
});

const templateDocument = v.object({
  id: v.string(),
  name: v.string(),
  stage: templateStage,
  signatureRequired: v.boolean(),
  notes: v.optional(v.string()),
});

function toTransactionTemplate(doc: Doc<'customTransactionTemplates'>) {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    tasks: doc.tasks,
    documents: doc.documents,
    stages: doc.stages,
    usageCount: doc.usageCount,
    lastUsed: doc.lastUsed,
    createdAt: doc.createdAt,
  };
}

/** All custom templates for merging with built-ins on the client. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const m = await getWorkspaceMembership(ctx);
    if (!m) {
      return [];
    }
    const rows = await ctx.db
      .query('customTransactionTemplates')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', m.workspaceId))
      .collect();
    return rows.map(toTransactionTemplate);
  },
});

/** Load one custom template by Convex document id (string). */
export const getById = query({
  args: { templateId: v.string() },
  handler: async (ctx, { templateId }) => {
    const m = await getWorkspaceMembership(ctx);
    if (!m) {
      return null;
    }
    let doc: Doc<'customTransactionTemplates'> | null = null;
    try {
      doc = await ctx.db.get(templateId as Id<'customTransactionTemplates'>);
    } catch {
      return null;
    }
    if (!doc || doc.workspaceId !== m.workspaceId) {
      return null;
    }
    return toTransactionTemplate(doc);
  },
});

export const upsert = mutation({
  args: {
    templateId: v.optional(v.id('customTransactionTemplates')),
    name: v.string(),
    description: v.string(),
    category: templateCategory,
    tasks: v.array(templateTask),
    documents: v.array(templateDocument),
    stages: v.array(templateStage),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    const name = args.name.trim() || 'Untitled Template';
    if (args.templateId) {
      await assertCustomTemplateInWorkspace(ctx, args.templateId, workspaceId);
      await ctx.db.patch(args.templateId, {
        name,
        description: args.description,
        category: args.category,
        tasks: args.tasks,
        documents: args.documents,
        stages: args.stages,
      });
      return args.templateId;
    }

    const today = new Date().toISOString().slice(0, 10);
    const id = await ctx.db.insert('customTransactionTemplates', {
      workspaceId,
      name,
      description: args.description,
      category: args.category,
      tasks: args.tasks,
      documents: args.documents,
      stages: args.stages,
      usageCount: 0,
      createdAt: today,
    });
    return id;
  },
});

export const remove = mutation({
  args: { templateId: v.id('customTransactionTemplates') },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertCustomTemplateInWorkspace(ctx, args.templateId, workspaceId);
    await ctx.db.delete(args.templateId);
  },
});

export const duplicate = mutation({
  args: { templateId: v.id('customTransactionTemplates') },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertCustomTemplateInWorkspace(ctx, args.templateId, workspaceId);
    const src = await ctx.db.get(args.templateId);
    if (!src) {
      throw new Error('Template not found');
    }
    const today = new Date().toISOString().slice(0, 10);
    return await ctx.db.insert('customTransactionTemplates', {
      workspaceId,
      name: `${src.name} (Copy)`,
      description: src.description,
      category: src.category,
      tasks: src.tasks,
      documents: src.documents,
      stages: src.stages,
      usageCount: 0,
      createdAt: today,
    });
  },
});
