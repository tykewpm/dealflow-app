import type { DealPipelineStage } from '../types';

/** Health row / pill — calm in dark via soft fills + semantic accents */
export const healthChipClasses = {
  'on-track':
    'border border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
  'needs-attention':
    'border border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
  'at-risk':
    'border border-border-subtle bg-accent-red-soft text-accent-red dark:text-text-primary',
} as const;

/** Pipeline column chips — surface + subtle hue on border only */
export const pipelineStageChipClasses: Record<DealPipelineStage, string> = {
  'under-contract':
    'border border-accent-blue/25 bg-bg-elevated/70 text-text-secondary dark:border-accent-blue/30 dark:bg-bg-elevated/50 dark:text-text-primary',
  'due-diligence':
    'border border-border-strong/60 bg-bg-elevated/70 text-text-secondary dark:border-border-strong dark:bg-bg-elevated/50 dark:text-text-primary',
  financing:
    'border border-border-strong/60 bg-bg-elevated/70 text-text-secondary dark:border-border-strong dark:bg-bg-elevated/50 dark:text-text-primary',
  'pre-closing':
    'border border-accent-amber/30 bg-bg-elevated/70 text-text-secondary dark:border-accent-amber/25 dark:bg-bg-elevated/50 dark:text-text-primary',
  closing:
    'border border-accent-green/30 bg-bg-elevated/70 text-text-secondary dark:border-accent-green/25 dark:bg-bg-elevated/50 dark:text-text-primary',
};
