import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { elevateDealStatusIfDerivedAtRisk } from './dealDerivedHealth';
import { assertDealDocumentInWorkspace, assertDealInWorkspace, requireWorkspaceMember } from './workspaceAccess';

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

/** Insert a checklist row on an existing deal (Add Document modal). */
export const createDealDocument = mutation({
  args: {
    dealId: v.id('deals'),
    name: v.string(),
    status: documentStatus,
    signatureStatus: signatureStatus,
    dueDate: v.optional(v.string()),
    referenceLink: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealInWorkspace(ctx, args.dealId, workspaceId);
    await ctx.db.insert('dealDocuments', {
      dealId: args.dealId,
      name: args.name,
      status: args.status,
      signatureStatus: args.signatureStatus,
      ...(args.dueDate !== undefined ? { dueDate: args.dueDate } : {}),
      ...(args.referenceLink !== undefined ? { referenceLink: args.referenceLink } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
    });
    await elevateDealStatusIfDerivedAtRisk(ctx, args.dealId);
    return null;
  },
});

/** Persists document checklist fields (same unions as the app schema). */
export const updateDealDocument = mutation({
  args: {
    documentId: v.id('dealDocuments'),
    status: v.optional(documentStatus),
    signatureStatus: v.optional(signatureStatus),
    notes: v.optional(v.string()),
    referenceLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const hasPatch =
      args.status !== undefined ||
      args.signatureStatus !== undefined ||
      args.notes !== undefined ||
      args.referenceLink !== undefined;
    if (!hasPatch) {
      throw new Error('At least one field to update is required');
    }
    const { workspaceId } = await requireWorkspaceMember(ctx);
    await assertDealDocumentInWorkspace(ctx, args.documentId, workspaceId);
    const row = await ctx.db.get(args.documentId);
    if (!row) {
      throw new Error('Document not found');
    }
    await ctx.db.patch(args.documentId, {
      ...(args.status !== undefined ? { status: args.status } : {}),
      ...(args.signatureStatus !== undefined ? { signatureStatus: args.signatureStatus } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      ...(args.referenceLink !== undefined ? { referenceLink: args.referenceLink } : {}),
    });
    await elevateDealStatusIfDerivedAtRisk(ctx, row.dealId);
    return null;
  },
});
