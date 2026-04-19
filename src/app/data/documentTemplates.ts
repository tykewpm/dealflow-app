/**
 * Document templates for real estate transactions
 */

import { DocumentTemplate, DocumentTemplateItem } from '../types/documentTemplates';

// Common document items
const commonDocuments: DocumentTemplateItem[] = [
  {
    name: 'Purchase Agreement',
    description: 'Main contract between buyer and seller',
    signatureRequired: true,
  },
  {
    name: 'Seller Disclosure',
    description: 'Property condition and defects disclosure',
    signatureRequired: true,
  },
  {
    name: 'Inspection Report',
    description: 'Professional home inspection findings',
    signatureRequired: false,
  },
  {
    name: 'Appraisal',
    description: 'Property valuation report',
    signatureRequired: false,
  },
  {
    name: 'Title Report',
    description: 'Property title search and insurance',
    signatureRequired: false,
  },
  {
    name: 'Loan Estimate',
    description: 'Lender loan terms and closing costs',
    signatureRequired: false,
  },
  {
    name: 'Closing Disclosure',
    description: 'Final closing costs and loan terms',
    signatureRequired: true,
  },
];

// Document templates
export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'default-residential',
    name: 'Default Residential Sale',
    description: 'Standard documents for traditional residential home sales with financing',
    documentCount: 8,
    tags: ['Residential', 'Financing'],
    isRecommended: true,
    documents: [
      ...commonDocuments,
      {
        name: 'HOA Documents',
        description: 'Homeowners association rules and financials',
        signatureRequired: false,
      },
    ],
    previewDocuments: ['Purchase Agreement', 'Seller Disclosure', 'Inspection Report'],
  },
  {
    id: 'condo-sale',
    name: 'Condo Sale',
    description: 'Documents specific to condominium sales including HOA requirements',
    documentCount: 9,
    tags: ['Condo', 'Residential'],
    documents: [
      ...commonDocuments,
      {
        name: 'HOA Documents',
        description: 'Homeowners association rules and financials',
        signatureRequired: false,
      },
      {
        name: 'CC&Rs',
        description: 'Covenants, Conditions & Restrictions',
        signatureRequired: false,
      },
    ],
    previewDocuments: ['Purchase Agreement', 'HOA Documents', 'CC&Rs'],
  },
  {
    id: 'cash-deal',
    name: 'Cash Deal',
    description: 'Simplified document set for all-cash purchases without financing',
    documentCount: 5,
    tags: ['Cash', 'Simplified'],
    documents: [
      {
        name: 'Purchase Agreement',
        description: 'Main contract between buyer and seller',
        signatureRequired: true,
      },
      {
        name: 'Seller Disclosure',
        description: 'Property condition and defects disclosure',
        signatureRequired: true,
      },
      {
        name: 'Inspection Report',
        description: 'Professional home inspection findings',
        signatureRequired: false,
      },
      {
        name: 'Title Report',
        description: 'Property title search and insurance',
        signatureRequired: false,
      },
      {
        name: 'Closing Disclosure',
        description: 'Final closing costs',
        signatureRequired: true,
      },
    ],
    previewDocuments: ['Purchase Agreement', 'Seller Disclosure', 'Title Report'],
  },
  {
    id: 'blank',
    name: 'Start Blank',
    description: 'Begin with no documents and add them manually',
    documentCount: 0,
    tags: ['Custom'],
    documents: [],
    previewDocuments: [],
  },
];

// Legacy export for backward compatibility
export const defaultDocumentChecklist = documentTemplates[0].documents;
