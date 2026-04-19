export interface DocumentTemplateItem {
  name: string;
  description?: string;
  signatureRequired: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  tags?: string[];
  isRecommended?: boolean;
  documents: DocumentTemplateItem[];
  previewDocuments?: string[]; // First 2-3 document names to show in card
}
