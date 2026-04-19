/**
 * Developer-only mapping: intended conceptual equivalence between
 * Create Deal workflow presets (`workflowTemplates` in `workflowTemplates.ts`)
 * and library entries (`mockTemplates` in `templateData.ts`).
 *
 * - This module is NOT imported by Create Deal, Templates, or Apply flows.
 * - Content parity is approximate; IDs and task/document lists still differ by design.
 * - Use when aligning copy, QA, or future consolidation — not for runtime routing.
 */

/** Keys must match `WorkflowTemplate.id` in `workflowTemplates.ts`. */
export type WorkflowTemplateId = 'default-residential' | 'condo-sale' | 'cash-deal' | 'blank';

/** Values are `TransactionTemplate.id` from `mockTemplates`, or null when no library twin is intended. */
export const WORKFLOW_TEMPLATE_TO_TRANSACTION_TEMPLATE_ID: Record<
  WorkflowTemplateId,
  string | null
> = {
  /** General residential buyer-side workflow → closest generic buyer-rep library template. */
  'default-residential': 'tmp1',

  /** Condo-specific wizard; library has no dedicated condo preset — nearest buyer workflow. */
  'condo-sale': 'tmp1',

  /** Cash / simplified purchase → cash-oriented library template. */
  'cash-deal': 'tmp6',

  /** Empty preset — no library equivalent. */
  blank: null,
};

/** Human-readable notes for reviewers (optional cross-links). */
export const WORKFLOW_TEMPLATE_EQUIVALENCE_NOTES: Record<WorkflowTemplateId, string> = {
  'default-residential':
    'Wizard uses `WorkflowTemplate` tasks/docs; library `tmp1` differs in names, counts, and stages.',
  'condo-sale':
    'HOA-heavy wizard vs generic buyer library — equivalence is thematic only.',
  'cash-deal':
    'Aligns most closely with `Cash Buyer Express` (`tmp6`); timelines still differ.',
  blank: 'No TransactionTemplate counterpart by design.',
};
