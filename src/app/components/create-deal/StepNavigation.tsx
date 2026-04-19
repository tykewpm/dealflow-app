interface Step {
  number: number;
  title: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface StepNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onNavigateToStep: (step: number) => void;
}

export function StepNavigation({
  currentStep,
  completedSteps,
  onNavigateToStep,
}: StepNavigationProps) {
  const steps: Omit<Step, 'isComplete' | 'isCurrent'>[] = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Choose Template' },
    { number: 3, title: 'Review Checklist' },
    { number: 4, title: 'Create Deal' },
  ];

  const getStepStatus = (stepNumber: number): 'complete' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepNumber)) return 'complete';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const canNavigateToStep = (stepNumber: number): boolean => {
    return stepNumber <= currentStep;
  };

  return (
    <div className="h-full w-64 border-r border-border-subtle bg-bg-surface p-6">
      <div className="mb-8">
        <h2 className="font-semibold text-text-primary">Create Deal</h2>
      </div>

      <nav className="space-y-1">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const canNavigate = canNavigateToStep(step.number);

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => canNavigate && onNavigateToStep(step.number)}
              disabled={!canNavigate}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                status === 'current'
                  ? 'bg-accent-blue-soft text-accent-blue dark:text-text-primary'
                  : status === 'complete'
                    ? 'text-text-secondary hover:bg-bg-elevated/50'
                    : 'cursor-not-allowed text-text-disabled'
              }`}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  status === 'current'
                    ? 'bg-accent-blue text-white'
                    : status === 'complete'
                      ? 'bg-accent-green text-white'
                      : 'bg-border-subtle text-text-muted'
                }`}
              >
                {status === 'complete' ? (
                  <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              <span className="text-sm font-medium">{step.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
