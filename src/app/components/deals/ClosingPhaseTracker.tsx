import type { DealPipelineStage } from '../../types';
import { cn } from '../ui/utils';

const PHASES: { stage: DealPipelineStage; label: string }[] = [
  { stage: 'under-contract', label: 'Under Contract' },
  { stage: 'due-diligence', label: 'Inspection' },
  { stage: 'financing', label: 'Financing' },
  { stage: 'pre-closing', label: 'Escrow' },
  { stage: 'closing', label: 'Closing' },
];

interface ClosingPhaseTrackerProps {
  currentStage: DealPipelineStage;
  /** Optional line under the stepper (e.g. auto vs manual override). */
  footnote?: string;
  className?: string;
}

/**
 * Presentation-only: maps a pipeline stage to five buyer-facing phases.
 * Pass the effective stage (often derived from checklist completion).
 */
export function ClosingPhaseTracker({ currentStage, footnote, className }: ClosingPhaseTrackerProps) {
  const currentIndex = Math.max(
    0,
    PHASES.findIndex((p) => p.stage === currentStage),
  );
  const currentPhase = PHASES[currentIndex] ?? PHASES[0];
  const nextPhase = currentIndex < PHASES.length - 1 ? PHASES[currentIndex + 1] : null;

  return (
    <nav
      className={cn('border-b border-border-subtle bg-bg-surface/80 px-4 py-4 sm:px-5', className)}
      aria-label="Closing workflow phases"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Your path to closing</p>
      <ol className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-2 md:gap-3">
        {PHASES.map((phase, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li
              key={phase.stage}
              className="flex flex-col items-center text-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums transition-colors',
                  isPast &&
                    'border-accent-green bg-accent-green-soft text-accent-green dark:bg-accent-green/15',
                  isCurrent &&
                    'border-accent-blue bg-accent-blue-soft text-accent-blue ring-2 ring-accent-blue/20 dark:bg-accent-blue/15',
                  isUpcoming && 'border-border-subtle bg-bg-app text-text-muted dark:bg-bg-elevated/50',
                )}
                aria-hidden
              >
                {isPast ? '✓' : index + 1}
              </span>
              <span
                className={cn(
                  'mt-2 text-[11px] font-medium leading-tight sm:text-xs',
                  isCurrent && 'text-text-primary',
                  isPast && 'text-text-secondary',
                  isUpcoming && 'text-text-muted',
                )}
              >
                {phase.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-text-secondary" aria-live="polite">
        {"You're in "}
        <span className="font-semibold text-text-primary">{currentPhase.label}</span>
        {nextPhase ? (
          <>
            {' '}
            — next: <span className="text-text-primary">{nextPhase.label}</span>
          </>
        ) : null}
        .
      </p>
      {footnote ? <p className="mt-2 text-[11px] leading-snug text-text-muted">{footnote}</p> : null}
    </nav>
  );
}
