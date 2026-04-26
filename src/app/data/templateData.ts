import { TransactionTemplate, TemplateTask, TemplateDocument } from '../types/template';

// Buyer Rep Templates
const buyerRepStandardTasks: TemplateTask[] = [
  { id: 'bt1', name: 'Schedule home inspection', stage: 'due-diligence', daysFromClosing: -30, isGate: true },
  { id: 'bt2', name: 'Review inspection report', stage: 'due-diligence', daysFromClosing: -28 },
  { id: 'bt3', name: 'Submit loan application', stage: 'financing', daysFromClosing: -25 },
  { id: 'bt4', name: 'Order appraisal', stage: 'financing', daysFromClosing: -23 },
  { id: 'bt5', name: 'Complete final walkthrough', stage: 'pre-closing', daysFromClosing: -2 },
  { id: 'bt6', name: 'Review closing disclosure', stage: 'closing', daysFromClosing: -3 },
  { id: 'bt7', name: 'Attend closing', stage: 'closing', daysFromClosing: 0 },
];

const buyerRepStandardDocs: TemplateDocument[] = [
  { id: 'bd1', name: 'Purchase Agreement', stage: 'under-contract', signatureRequired: true },
  { id: 'bd2', name: 'Inspection Report', stage: 'due-diligence', signatureRequired: false },
  { id: 'bd3', name: 'Loan Application', stage: 'financing', signatureRequired: true },
  { id: 'bd4', name: 'Appraisal Report', stage: 'financing', signatureRequired: false },
  { id: 'bd5', name: 'Closing Disclosure', stage: 'closing', signatureRequired: true },
];

// Seller Rep Templates
const sellerRepStandardTasks: TemplateTask[] = [
  { id: 'st1', name: 'Complete seller disclosure', stage: 'under-contract', daysFromClosing: -35 },
  { id: 'st2', name: 'Schedule pre-listing inspection', stage: 'under-contract', daysFromClosing: -32 },
  { id: 'st3', name: 'Coordinate buyer inspection', stage: 'due-diligence', daysFromClosing: -30 },
  { id: 'st4', name: 'Respond to repair requests', stage: 'due-diligence', daysFromClosing: -28 },
  { id: 'st5', name: 'Prepare for final walkthrough', stage: 'pre-closing', daysFromClosing: -3 },
  { id: 'st6', name: 'Review HUD-1 settlement', stage: 'closing', daysFromClosing: -2 },
];

const sellerRepStandardDocs: TemplateDocument[] = [
  { id: 'sd1', name: 'Seller Disclosure Form', stage: 'under-contract', signatureRequired: true },
  { id: 'sd2', name: 'Listing Agreement', stage: 'under-contract', signatureRequired: true },
  { id: 'sd3', name: 'Repair Addendum', stage: 'due-diligence', signatureRequired: true },
  { id: 'sd4', name: 'Transfer Disclosure Statement', stage: 'closing', signatureRequired: true },
];

export const mockTemplates: TransactionTemplate[] = [
  {
    id: 'tmp1',
    name: 'Standard Buyer Representation',
    description: 'Complete workflow for representing buyers in residential transactions',
    category: 'buyer-rep',
    tasks: buyerRepStandardTasks,
    documents: buyerRepStandardDocs,
    usageCount: 47,
    lastUsed: '2026-04-10',
    createdAt: '2025-01-15',
    stages: ['under-contract', 'due-diligence', 'financing', 'pre-closing', 'closing'],
  },
  {
    id: 'tmp2',
    name: 'First-Time Buyer',
    description: 'Extended support workflow for first-time homebuyers with additional guidance',
    category: 'buyer-rep',
    tasks: [
      ...buyerRepStandardTasks,
      { id: 'bt8', name: 'First-time buyer orientation', stage: 'under-contract', daysFromClosing: -35 },
      { id: 'bt9', name: 'Mortgage pre-approval review', stage: 'financing', daysFromClosing: -27 },
    ],
    documents: [
      ...buyerRepStandardDocs,
      { id: 'bd6', name: 'First-Time Buyer Guide', stage: 'under-contract', signatureRequired: false },
    ],
    usageCount: 23,
    lastUsed: '2026-04-08',
    createdAt: '2025-02-01',
    stages: ['under-contract', 'due-diligence', 'financing', 'pre-closing', 'closing'],
  },
  {
    id: 'tmp3',
    name: 'Standard Seller Representation',
    description: 'Complete workflow for representing sellers in residential transactions',
    category: 'seller-rep',
    tasks: sellerRepStandardTasks,
    documents: sellerRepStandardDocs,
    usageCount: 38,
    lastUsed: '2026-04-12',
    createdAt: '2025-01-20',
    stages: ['under-contract', 'due-diligence', 'pre-closing', 'closing'],
  },
  {
    id: 'tmp4',
    name: 'Dual Agency Standard',
    description: 'Workflow for representing both buyer and seller in the same transaction',
    category: 'dual-rep',
    tasks: [
      { id: 'dt1', name: 'Dual agency disclosure', stage: 'under-contract', daysFromClosing: -35 },
      ...buyerRepStandardTasks.slice(0, 4),
      ...sellerRepStandardTasks.slice(0, 3),
    ],
    documents: [
      { id: 'dd1', name: 'Dual Agency Consent', stage: 'under-contract', signatureRequired: true },
      ...buyerRepStandardDocs.slice(0, 3),
      ...sellerRepStandardDocs.slice(0, 2),
    ],
    usageCount: 12,
    lastUsed: '2026-03-28',
    createdAt: '2025-03-10',
    stages: ['under-contract', 'due-diligence', 'financing', 'closing'],
  },
  {
    id: 'tmp5',
    name: 'Commercial Real Estate',
    description: 'Complete workflow for commercial property transactions',
    category: 'commercial',
    tasks: [
      { id: 'ct1', name: 'Property zoning verification', stage: 'due-diligence', daysFromClosing: -40 },
      { id: 'ct2', name: 'Environmental assessment', stage: 'due-diligence', daysFromClosing: -38 },
      { id: 'ct3', name: 'Title search and survey', stage: 'due-diligence', daysFromClosing: -35 },
      { id: 'ct4', name: 'Lease audit review', stage: 'due-diligence', daysFromClosing: -30 },
      { id: 'ct5', name: 'Secure financing commitment', stage: 'financing', daysFromClosing: -25 },
      { id: 'ct6', name: 'Final title review', stage: 'closing', daysFromClosing: -5 },
    ],
    documents: [
      { id: 'cd1', name: 'Letter of Intent', stage: 'under-contract', signatureRequired: true },
      { id: 'cd2', name: 'Purchase and Sale Agreement', stage: 'under-contract', signatureRequired: true },
      { id: 'cd3', name: 'Phase I Environmental Report', stage: 'due-diligence', signatureRequired: false },
      { id: 'cd4', name: 'Property Survey', stage: 'due-diligence', signatureRequired: false },
      { id: 'cd5', name: 'Lease Assignments', stage: 'closing', signatureRequired: true },
    ],
    usageCount: 8,
    lastUsed: '2026-04-05',
    createdAt: '2025-02-15',
    stages: ['under-contract', 'due-diligence', 'financing', 'closing'],
  },
  {
    id: 'tmp6',
    name: 'Cash Buyer Express',
    description: 'Streamlined workflow for all-cash purchases',
    category: 'buyer-rep',
    tasks: [
      { id: 'cbt1', name: 'Verify proof of funds', stage: 'under-contract', daysFromClosing: -20 },
      { id: 'cbt2', name: 'Schedule inspection', stage: 'due-diligence', daysFromClosing: -18 },
      { id: 'cbt3', name: 'Final walkthrough', stage: 'pre-closing', daysFromClosing: -2 },
      { id: 'cbt4', name: 'Close transaction', stage: 'closing', daysFromClosing: 0 },
    ],
    documents: [
      { id: 'cbd1', name: 'Proof of Funds', stage: 'under-contract', signatureRequired: false },
      { id: 'cbd2', name: 'Purchase Agreement', stage: 'under-contract', signatureRequired: true },
      { id: 'cbd3', name: 'Final Closing Statement', stage: 'closing', signatureRequired: true },
    ],
    usageCount: 15,
    lastUsed: '2026-04-14',
    createdAt: '2025-03-01',
    stages: ['under-contract', 'due-diligence', 'pre-closing', 'closing'],
  },
];

/** Built-in template ids (`tmp1` …) — custom templates use Convex ids or localStorage `user-*` ids. */
export function isBuiltInTemplateId(id: string): boolean {
  return mockTemplates.some((t) => t.id === id);
}
