import { Button } from '../ui/button';

interface PhaseAdvanceSuggestionProps {
  headline: string;
  buttonLabel: string;
  onAdvance: () => void;
  disabled?: boolean;
}

/** Subtle prompt when all starter steps in the current phase are done — never auto-advances. */
export function PhaseAdvanceSuggestion({
  headline,
  buttonLabel,
  onAdvance,
  disabled = false,
}: PhaseAdvanceSuggestionProps) {
  return (
    <div
      className="rounded-xl border border-border-subtle bg-bg-surface/90 px-4 py-3 shadow-sm dark:bg-bg-elevated/60 dark:shadow-none sm:px-5"
      role="region"
      aria-label="Phase progression suggestion"
    >
      <p className="text-sm leading-snug text-text-secondary">{headline}</p>
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onAdvance}
          disabled={disabled}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
