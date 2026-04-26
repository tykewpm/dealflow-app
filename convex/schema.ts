import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

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

/** Task checklist section — drives auto `deal.pipelineStage` when set on tasks. */
const taskClosingPhase = v.union(
  v.literal('under-contract'),
  v.literal('inspection'),
  v.literal('financing'),
  v.literal('escrow'),
  v.literal('closing'),
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

/** Display-only grouping for roster / People (closing parties). */
const workspacePartyLabel = v.union(
  v.literal('buyer'),
  v.literal('seller'),
  v.literal('agent'),
  v.literal('lender'),
  v.literal('escrow'),
  v.literal('other'),
);

/** Workspace-wide permission tier (V1 — no per-deal ACL). */
const workspacePermissionRole = v.union(
  v.literal('owner'),
  v.literal('collaborator'),
  v.literal('viewer'),
);

/** Transaction Template Builder — custom templates only (built-ins stay in client `templateData.ts`). */
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

export default defineSchema({
  ...authTables,

  /** Single-tenant workspace root for Slice B — expand with slug/org later. */
  workspaces: defineTable({
    name: v.string(),
    createdAt: v.string(),
  }),

  /**
   * Links Convex Auth `users` to one workspace + roster id (`workspacePeople.userId`).
   */
  workspaceMemberships: defineTable({
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    rosterUserId: v.string(),
  })
    .index('by_userId', ['userId'])
    .index('by_workspace_user', ['workspaceId', 'userId']),

  deals: defineTable({
    workspaceId: v.optional(v.id('workspaces')),
    propertyAddress: v.string(),
    buyerName: v.string(),
    sellerName: v.string(),
    closingDate: v.string(),
    status: dealStatus,
    createdAt: v.string(),
    pipelineStage: pipelineStage,
    /** User-controlled hide from main lists — orthogonal to `status` (health / closed transaction). */
    archived: v.optional(v.boolean()),
  }).index('by_workspaceId', ['workspaceId']),

  tasks: defineTable({
    dealId: v.id('deals'),
    name: v.string(),
    dueDate: v.string(),
    status: taskStatus,
    assigneeId: v.optional(v.string()),
    phase: v.optional(taskClosingPhase),
    isGate: v.optional(v.boolean()),
  }).index('by_dealId', ['dealId']),

  dealDocuments: defineTable({
    dealId: v.id('deals'),
    name: v.string(),
    status: documentStatus,
    signatureStatus: signatureStatus,
    dueDate: v.optional(v.string()),
    referenceLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    /** V1 optional: link/file attachment vs legacy checklist row only. */
    attachmentKind: v.optional(v.union(v.literal('link'), v.literal('file'))),
    fileStorageId: v.optional(v.id('_storage')),
  }).index('by_dealId', ['dealId']),

  dealMessages: defineTable({
    dealId: v.id('deals'),
    senderId: v.string(),
    text: v.string(),
    createdAt: v.string(),
  }).index('by_dealId', ['dealId']),

  /** Workspace roster — stable `userId` strings match task.assigneeId / message.senderId (u1… until auth). */
  workspacePeople: defineTable({
    workspaceId: v.optional(v.id('workspaces')),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    partyLabel: v.optional(workspacePartyLabel),
    permissionRole: v.optional(workspacePermissionRole),
  })
    .index('by_userId', ['userId'])
    .index('by_workspaceId', ['workspaceId'])
    .index('by_workspace_rosterUserId', ['workspaceId', 'userId']),

  customTransactionTemplates: defineTable({
    workspaceId: v.optional(v.id('workspaces')),
    name: v.string(),
    description: v.string(),
    category: templateCategory,
    tasks: v.array(templateTask),
    documents: v.array(templateDocument),
    stages: v.array(templateStage),
    usageCount: v.number(),
    lastUsed: v.optional(v.string()),
    createdAt: v.string(),
  }).index('by_workspaceId', ['workspaceId']),
});
