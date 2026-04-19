import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { getWorkspaceMembership } from './workspaceAccess';

function mapWorkspacePerson(doc: Doc<'workspacePeople'>): {
  id: string;
  name: string;
  email: string;
} {
  return {
    id: doc.userId,
    name: doc.name,
    email: doc.email,
  };
}

/** Maps Convex deals row → app `Deal` shape (`id` is string `_id`). */
function mapDeal(doc: Doc<'deals'>): {
  id: string;
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  closingDate: string;
  status: 'active' | 'at-risk' | 'overdue' | 'complete';
  createdAt: string;
  pipelineStage:
    | 'under-contract'
    | 'due-diligence'
    | 'financing'
    | 'pre-closing'
    | 'closing';
  archived?: boolean;
} {
  return {
    id: doc._id,
    propertyAddress: doc.propertyAddress,
    buyerName: doc.buyerName,
    sellerName: doc.sellerName,
    closingDate: doc.closingDate,
    status: doc.status,
    createdAt: doc.createdAt,
    pipelineStage: doc.pipelineStage,
    ...(doc.archived === true ? { archived: true } : {}),
  };
}

function mapTask(doc: Doc<'tasks'>): {
  id: string;
  dealId: string;
  name: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'at-risk' | 'overdue' | 'complete';
  assigneeId?: string;
} {
  return {
    id: doc._id,
    dealId: doc.dealId as string,
    name: doc.name,
    dueDate: doc.dueDate,
    status: doc.status,
    ...(doc.assigneeId !== undefined ? { assigneeId: doc.assigneeId } : {}),
  };
}

function mapDealMessage(doc: Doc<'dealMessages'>): {
  id: string;
  dealId: string;
  senderId: string;
  text: string;
  createdAt: string;
} {
  return {
    id: doc._id,
    dealId: doc.dealId as string,
    senderId: doc.senderId,
    text: doc.text,
    createdAt: doc.createdAt,
  };
}

function mapDealDocument(doc: Doc<'dealDocuments'>): {
  id: string;
  dealId: string;
  name: string;
  status:
    | 'not-started'
    | 'requested'
    | 'uploaded'
    | 'awaiting-signature'
    | 'signed'
    | 'completed';
  signatureStatus: 'not-required' | 'requested' | 'partially-signed' | 'fully-signed';
  dueDate?: string;
  referenceLink?: string;
  notes?: string;
} {
  const base = {
    id: doc._id,
    dealId: doc.dealId as string,
    name: doc.name,
    status: doc.status,
    signatureStatus: doc.signatureStatus,
  };
  return {
    ...base,
    ...(doc.dueDate !== undefined ? { dueDate: doc.dueDate } : {}),
    ...(doc.referenceLink !== undefined ? { referenceLink: doc.referenceLink } : {}),
    ...(doc.notes !== undefined ? { notes: doc.notes } : {}),
  };
}

/** Workspace snapshot scoped to authenticated membership (Slice B). */
export const getWorkspaceSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const blockedBase = {
      deals: [] as ReturnType<typeof mapDeal>[],
      tasks: [] as ReturnType<typeof mapTask>[],
      documents: [] as ReturnType<typeof mapDealDocument>[],
      messages: [] as ReturnType<typeof mapDealMessage>[],
      users: [] as ReturnType<typeof mapWorkspacePerson>[],
    };

    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      return {
        workspaceAccess: 'blocked' as const,
        workspaceAccessReason: 'unauthenticated' as const,
        ...blockedBase,
      };
    }

    const membership = await getWorkspaceMembership(ctx);
    if (!membership) {
      return {
        workspaceAccess: 'blocked' as const,
        workspaceAccessReason: 'no_membership' as const,
        ...blockedBase,
      };
    }

    const wsId = membership.workspaceId;

    const dealDocs = await ctx.db
      .query('deals')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', wsId))
      .collect();

    const dealIds = new Set(dealDocs.map((d) => d._id as string));

    const taskDocs = await ctx.db.query('tasks').collect();
    const tasksScoped = taskDocs.filter((t) => dealIds.has(t.dealId as string));

    const documentDocs = await ctx.db.query('dealDocuments').collect();
    const documentsScoped = documentDocs.filter((d) => dealIds.has(d.dealId as string));

    const messageDocs = await ctx.db.query('dealMessages').collect();
    const messagesScoped = messageDocs.filter((m) => dealIds.has(m.dealId as string));
    messagesScoped.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const peopleDocs = await ctx.db
      .query('workspacePeople')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', wsId))
      .collect();
    peopleDocs.sort((a, b) => a.userId.localeCompare(b.userId));

    return {
      workspaceAccess: 'ok' as const,
      workspaceAccessReason: null,
      deals: dealDocs.map(mapDeal),
      tasks: tasksScoped.map(mapTask),
      documents: documentsScoped.map(mapDealDocument),
      messages: messagesScoped.map(mapDealMessage),
      users: peopleDocs.map(mapWorkspacePerson),
    };
  },
});
