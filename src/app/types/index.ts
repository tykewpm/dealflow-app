// Core type definitions for CloseFlow MVP

export type TaskStatus = 'upcoming' | 'active' | 'at-risk' | 'overdue' | 'complete';
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

export interface User {
  id: string;
  name: string;
  email: string;
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
}
