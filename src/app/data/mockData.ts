import { User, Deal, Task, Message, DocumentItem } from '../types';

// Mock users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Martinez', email: 'sarah@closeflow.com' },
  { id: 'u2', name: 'John Smith', email: 'john@realty.com' },
  { id: 'u3', name: 'Emily Chen', email: 'emily@homes.com' },
];

// Mock deals
export const mockDeals: Deal[] = [
  {
    id: 'd1',
    propertyAddress: '1234 Oak Street, San Francisco, CA 94102',
    buyerName: 'Michael Johnson',
    sellerName: 'Patricia Davis',
    closingDate: '2026-05-15',
    status: 'active',
    createdAt: '2026-04-01',
    pipelineStage: 'under-contract',
    archived: false,
  },
  {
    id: 'd2',
    propertyAddress: '567 Pine Avenue, Oakland, CA 94607',
    buyerName: 'Jennifer Williams',
    sellerName: 'Robert Brown',
    closingDate: '2026-04-25',
    status: 'at-risk',
    createdAt: '2026-03-20',
    pipelineStage: 'due-diligence',
    archived: false,
  },
  {
    id: 'd3',
    propertyAddress: '890 Maple Drive, Berkeley, CA 94704',
    buyerName: 'David Lee',
    sellerName: 'Lisa Anderson',
    closingDate: '2026-05-30',
    status: 'active',
    createdAt: '2026-04-10',
    pipelineStage: 'financing',
    archived: false,
  },
  {
    id: 'd4',
    propertyAddress: '100 Cedar Court, Palo Alto, CA 94301',
    buyerName: 'Alex Kim',
    sellerName: 'Jordan Taylor',
    closingDate: '2026-03-01',
    status: 'complete',
    createdAt: '2026-02-01',
    pipelineStage: 'closing',
    archived: false,
  },
];

// Mock tasks
export const mockTasks: Task[] = [
  // Deal 1 tasks
  {
    id: 't1',
    dealId: 'd1',
    name: 'Initial deposit due',
    dueDate: '2026-04-20',
    status: 'complete',
    assigneeId: 'u1',
  },
  {
    id: 't2',
    dealId: 'd1',
    name: 'Home inspection scheduled',
    dueDate: '2026-04-18',
    status: 'at-risk',
    assigneeId: 'u2',
  },
  {
    id: 't3',
    dealId: 'd1',
    name: 'Appraisal ordered',
    dueDate: '2026-04-22',
    status: 'active',
    assigneeId: 'u1',
  },
  {
    id: 't4',
    dealId: 'd1',
    name: 'Title search completed',
    dueDate: '2026-04-28',
    status: 'upcoming',
  },
  {
    id: 't5',
    dealId: 'd1',
    name: 'Final walkthrough',
    dueDate: '2026-05-14',
    status: 'upcoming',
  },
  // Deal 2 tasks
  {
    id: 't6',
    dealId: 'd2',
    name: 'Contingency removal deadline',
    dueDate: '2026-04-14',
    status: 'overdue',
    assigneeId: 'u3',
  },
  {
    id: 't7',
    dealId: 'd2',
    name: 'Loan approval pending',
    dueDate: '2026-04-16',
    status: 'at-risk',
    assigneeId: 'u2',
  },
  {
    id: 't8',
    dealId: 'd2',
    name: 'Insurance binder required',
    dueDate: '2026-04-23',
    status: 'active',
  },
  // Deal 3 tasks
  {
    id: 't9',
    dealId: 'd3',
    name: 'Disclosure review',
    dueDate: '2026-04-20',
    status: 'active',
    assigneeId: 'u1',
  },
  {
    id: 't10',
    dealId: 'd3',
    name: 'HOA documents requested',
    dueDate: '2026-04-25',
    status: 'upcoming',
  },
  {
    id: 't11',
    dealId: 'd4',
    name: 'Closing checklist signed off',
    dueDate: '2026-03-01',
    status: 'complete',
    assigneeId: 'u1',
  },
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: 'm1',
    dealId: 'd1',
    senderId: 'u1',
    text: 'Just confirmed the inspection appointment for Thursday at 2pm.',
    createdAt: '2026-04-15T10:30:00Z',
  },
  {
    id: 'm2',
    dealId: 'd1',
    senderId: 'u2',
    text: "Perfect! I'll make sure the buyers are available.",
    createdAt: '2026-04-15T11:15:00Z',
  },
  {
    id: 'm3',
    dealId: 'd1',
    senderId: 'u1',
    text: 'The appraisal company needs access next week. Can we coordinate a time?',
    createdAt: '2026-04-15T14:22:00Z',
  },
  {
    id: 'm4',
    dealId: 'd2',
    senderId: 'u3',
    text: "We need to address the contingency removal ASAP - it's overdue.",
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'm5',
    dealId: 'd2',
    senderId: 'u2',
    text: 'Loan officer says we should have approval by end of day tomorrow.',
    createdAt: '2026-04-15T13:45:00Z',
  },
];

// Mock documents
export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc1',
    dealId: 'd1',
    name: 'Purchase Agreement',
    status: 'signed',
    signatureStatus: 'fully-signed',
    dueDate: '2026-04-05',
    referenceLink: 'https://docusign.example.com/doc1',
  },
  {
    id: 'doc2',
    dealId: 'd1',
    name: 'Inspection Report',
    status: 'uploaded',
    signatureStatus: 'not-required',
    dueDate: '2026-04-20',
  },
  {
    id: 'doc3',
    dealId: 'd1',
    name: 'Appraisal',
    status: 'requested',
    signatureStatus: 'not-required',
    dueDate: '2026-04-25',
  },
  {
    id: 'doc4',
    dealId: 'd1',
    name: 'Addendum to Purchase Agreement',
    status: 'awaiting-signature',
    signatureStatus: 'requested',
    dueDate: '2026-04-10',
    referenceLink: 'https://docusign.example.com/doc4',
    notes: 'Counter-offer terms need both buyer and seller signatures',
  },
  {
    id: 'doc7',
    dealId: 'd1',
    name: 'Title Report',
    status: 'requested',
    signatureStatus: 'not-required',
    dueDate: '2026-04-30',
    referenceLink: 'https://dotloop.example.com/doc7',
  },
  {
    id: 'doc5',
    dealId: 'd2',
    name: 'Disclosure Package',
    status: 'signed',
    signatureStatus: 'fully-signed',
    dueDate: '2026-03-25',
  },
  {
    id: 'doc6',
    dealId: 'd2',
    name: 'Loan Estimate',
    status: 'awaiting-signature',
    signatureStatus: 'partially-signed',
    dueDate: '2026-04-16',
    notes: 'Buyer signed, waiting on co-buyer',
  },
];
