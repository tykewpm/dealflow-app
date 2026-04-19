/**
 * Literal copy of `src/app/data/mockData.ts` workspace fields for dev seeding.
 * Kept in `convex/` so the backend bundle does not depend on `src/`.
 */

/** Mirrors `mockUsers` — stable ids align with SEED_TASKS assigneeId and chat senderId. */
export const SEED_WORKSPACE_PEOPLE = [
  { userId: 'u1', name: 'Sarah Martinez', email: 'sarah@closeflow.com' },
  { userId: 'u2', name: 'John Smith', email: 'john@realty.com' },
  { userId: 'u3', name: 'Emily Chen', email: 'emily@homes.com' },
] as const;

export type MockDealKey = 'd1' | 'd2' | 'd3';

/** Insert shape for `deals` — order matches mock d1 → d3. */
export const SEED_DEALS_ORDERED: Array<{
  mockDealId: MockDealKey;
  row: {
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
  };
}> = [
  {
    mockDealId: 'd1',
    row: {
      propertyAddress: '1234 Oak Street, San Francisco, CA 94102',
      buyerName: 'Michael Johnson',
      sellerName: 'Patricia Davis',
      closingDate: '2026-05-15',
      status: 'active',
      createdAt: '2026-04-01',
      pipelineStage: 'under-contract',
    },
  },
  {
    mockDealId: 'd2',
    row: {
      propertyAddress: '567 Pine Avenue, Oakland, CA 94607',
      buyerName: 'Jennifer Williams',
      sellerName: 'Robert Brown',
      closingDate: '2026-04-25',
      status: 'at-risk',
      createdAt: '2026-03-20',
      pipelineStage: 'due-diligence',
    },
  },
  {
    mockDealId: 'd3',
    row: {
      propertyAddress: '890 Maple Drive, Berkeley, CA 94704',
      buyerName: 'David Lee',
      sellerName: 'Lisa Anderson',
      closingDate: '2026-05-30',
      status: 'active',
      createdAt: '2026-04-10',
      pipelineStage: 'financing',
    },
  },
];

export const SEED_TASKS: Array<{
  mockDealId: MockDealKey;
  name: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'at-risk' | 'overdue' | 'complete';
  assigneeId?: string;
}> = [
  { mockDealId: 'd1', name: 'Initial deposit due', dueDate: '2026-04-20', status: 'complete', assigneeId: 'u1' },
  { mockDealId: 'd1', name: 'Home inspection scheduled', dueDate: '2026-04-18', status: 'at-risk', assigneeId: 'u2' },
  { mockDealId: 'd1', name: 'Appraisal ordered', dueDate: '2026-04-22', status: 'active', assigneeId: 'u1' },
  { mockDealId: 'd1', name: 'Title search completed', dueDate: '2026-04-28', status: 'upcoming' },
  { mockDealId: 'd1', name: 'Final walkthrough', dueDate: '2026-05-14', status: 'upcoming' },
  { mockDealId: 'd2', name: 'Contingency removal deadline', dueDate: '2026-04-14', status: 'overdue', assigneeId: 'u3' },
  { mockDealId: 'd2', name: 'Loan approval pending', dueDate: '2026-04-16', status: 'at-risk', assigneeId: 'u2' },
  { mockDealId: 'd2', name: 'Insurance binder required', dueDate: '2026-04-23', status: 'active' },
  { mockDealId: 'd3', name: 'Disclosure review', dueDate: '2026-04-20', status: 'active', assigneeId: 'u1' },
  { mockDealId: 'd3', name: 'HOA documents requested', dueDate: '2026-04-25', status: 'upcoming' },
];

export const SEED_DOCUMENTS: Array<{
  mockDealId: MockDealKey;
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
}> = [
  {
    mockDealId: 'd1',
    name: 'Purchase Agreement',
    status: 'signed',
    signatureStatus: 'fully-signed',
    dueDate: '2026-04-05',
    referenceLink: 'https://docusign.example.com/doc1',
  },
  {
    mockDealId: 'd1',
    name: 'Inspection Report',
    status: 'uploaded',
    signatureStatus: 'not-required',
    dueDate: '2026-04-20',
  },
  {
    mockDealId: 'd1',
    name: 'Appraisal',
    status: 'requested',
    signatureStatus: 'not-required',
    dueDate: '2026-04-25',
  },
  {
    mockDealId: 'd1',
    name: 'Addendum to Purchase Agreement',
    status: 'awaiting-signature',
    signatureStatus: 'requested',
    dueDate: '2026-04-10',
    referenceLink: 'https://docusign.example.com/doc4',
    notes: 'Counter-offer terms need both buyer and seller signatures',
  },
  {
    mockDealId: 'd1',
    name: 'Title Report',
    status: 'requested',
    signatureStatus: 'not-required',
    dueDate: '2026-04-30',
    referenceLink: 'https://dotloop.example.com/doc7',
  },
  {
    mockDealId: 'd2',
    name: 'Disclosure Package',
    status: 'signed',
    signatureStatus: 'fully-signed',
    dueDate: '2026-03-25',
  },
  {
    mockDealId: 'd2',
    name: 'Loan Estimate',
    status: 'awaiting-signature',
    signatureStatus: 'partially-signed',
    dueDate: '2026-04-16',
    notes: 'Buyer signed, waiting on co-buyer',
  },
];
