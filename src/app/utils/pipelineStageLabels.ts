import type { DealPipelineStage } from '../types';

/** Guided closing labels — same order and copy as the deal detail phase `<select>`. */
export const PIPELINE_STAGE_SELECT_OPTIONS: { id: DealPipelineStage; label: string }[] = [
  { id: 'under-contract', label: 'Under Contract' },
  { id: 'due-diligence', label: 'Inspection' },
  { id: 'financing', label: 'Financing' },
  { id: 'pre-closing', label: 'Escrow' },
  { id: 'closing', label: 'Closing' },
];

export function pipelineStageDisplayLabel(stage: DealPipelineStage): string {
  return PIPELINE_STAGE_SELECT_OPTIONS.find((o) => o.id === stage)?.label ?? stage;
}
