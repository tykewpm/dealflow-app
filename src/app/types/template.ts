export type TemplateCategory = 'buyer-rep' | 'seller-rep' | 'dual-rep' | 'commercial';
export type TemplateStage = 'under-contract' | 'due-diligence' | 'financing' | 'pre-closing' | 'closing';

export interface TemplateTask {
  id: string;
  name: string;
  stage: TemplateStage;
  daysFromClosing: number; // Negative for before closing, positive for after
  description?: string;
  /** When true, phase advances only once this task is complete (with other gates in the same phase). */
  isGate?: boolean;
}

export interface TemplateDocument {
  id: string;
  name: string;
  stage: TemplateStage;
  signatureRequired: boolean;
  notes?: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tasks: TemplateTask[];
  documents: TemplateDocument[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  stages: TemplateStage[];
}
