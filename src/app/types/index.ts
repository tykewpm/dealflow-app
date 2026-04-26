// Core type definitions for CloseFlow MVP

export type TaskStatus = 'upcoming' | 'active' | 'at-risk' | 'overdue' | 'complete';

/**
 * Closing section for checklist tasks — drives {@link computeDealPhase} when set.
 * Aligns with template `stage` / deal `pipelineStage` via mapping helpers in `dealPhaseFromTasks`.
 */
export type TaskClosingPhase =
  | 'under-contract'
  | 'inspection'
  | 'financing'
  | 'escrow'
  | 'closing';
export type DealStatus = 'active' | 'at-risk' | 'overdue' | 'complete';

/** Pipeline kanban columns — explicit user/data controlled; not derived from health. */
export type DealPipelineStage =
  | 'under-contract'
  | 'due-diligence'
  | 'financing'
  | 'pre-closing'
  | 'closing';
export type DocumentStatus = 'not-started' | 'requested' | 'uploaded' | 'awaiting-signature' | 'signed' | 'completed';
export type SignatureStatus = 'not-required' | 'requested' | 'partially-signed' | 'fully-signed';

/** V1: external link or uploaded file row vs legacy checklist-only row. */
export type DocumentAttachmentKind = 'link' | 'file';

/** Payload from Add Document modal (Deal detail) — upload or attach link. */
export type AddDealDocumentPayload =
  | { kind: 'link'; url: string; name?: string }
  | { kind: 'file'; file: File; name?: string };

/** Document placeholders applied with a workflow template at deal creation (local MVP). */
export interface WorkflowDocumentStub {
  name: string;
  signatureRequired?: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  isRecommended?: boolean;
  tasks: TaskTemplate[];
  /** Optional checklist items created on the deal when this workflow is chosen. */
  documents?: WorkflowDocumentStub[];
}

export interface TaskTemplate {
  name: string;
  daysFromClosing: number; // negative = days before closing
  assigneeRole?: string;
}

/** Workspace permission tier (V1 — applies workspace-wide, not per-deal). */
export type WorkspacePermissionRole = 'owner' | 'collaborator' | 'viewer';

/** Closing-side label for roster / People (display + grouping only). */
export type WorkspacePartyLabel = 'buyer' | 'seller' | 'agent' | 'lender' | 'escrow' | 'other';

/** Payload from “Add person” on deal detail — persisted to workspace roster (V1, not per-deal). */
export type AddWorkspacePersonInput = {
  name: string;
  email: string;
  partyLabel: WorkspacePartyLabel;
  permissionRole: WorkspacePermissionRole;
};

export interface User {
  id: string;
  name: string;
  email: string;
  partyLabel?: WorkspacePartyLabel;
  permissionRole?: WorkspacePermissionRole;
}

export interface Deal {
  id: string;
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  closingDate: string;
  status: DealStatus;
  createdAt: string;
  pipelineStage: DealPipelineStage;
  /** When true, deal appears only under Dashboard “Archived” — independent of `status` (health / closed). */
  archived?: boolean;
}

export interface Task {
  id: string;
  dealId: string;
  name: string;
  dueDate: string;
  status: TaskStatus;
  assigneeId?: string;
  /** When set (or inferable from starter titles), deal phase can be derived from task completion. */
  phase?: TaskClosingPhase;
  /** When true, only gate tasks must complete to leave this phase (non-gates optional). */
  isGate?: boolean;
}

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  dealId: string;
  name: string;
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
  dueDate?: string;
  referenceLink?: string;
  notes?: string;
  attachmentKind?: DocumentAttachmentKind;
  /** Convex `_storage` id (opaque string on the client). */
  fileStorageId?: string;
  /** Signed download URL (snapshot) or mock `URL.createObjectURL` for opening the file. */
  fileUrl?: string;
}
