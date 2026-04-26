import { Building2, PenLine } from 'lucide-react';
import { cn } from '../ui/utils';

interface CreateDealStartChoiceProps {
  onChooseMls: () => void;
  onChooseManual: () => void;
  /** `dialog` — compact copy for the quick “Start new closing” modal. */
  variant?: 'page' | 'dialog';
}

export function CreateDealStartChoice({
  onChooseMls,
  onChooseManual,
  variant = 'page',
}: CreateDealStartChoiceProps) {
  const isDialog = variant === 'dialog';

  return (
    <div className={cn('mx-auto', isDialog ? 'max-w-none' : 'max-w-3xl')}>
      <div className={cn(isDialog ? 'mb-5' : 'mb-8')}>
        {!isDialog ? <p className="mb-2 text-sm text-text-muted">New deal</p> : null}
        <h1
          className={cn(
            'mb-2 font-bold text-text-primary',
            isDialog ? 'text-xl sm:text-2xl' : 'text-3xl',
          )}
        >
          How would you like to start?
        </h1>
        <p className={cn('text-text-secondary', isDialog ? 'text-sm' : '')}>
          {isDialog
            ? 'Import listing fields from the demo MLS catalog, or enter address and role yourself.'
            : 'Import key fields from a listing to save time, or enter everything manually.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onChooseMls}
          className="group flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 text-left shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-border-strong hover:shadow-md dark:shadow-none"
        >
          <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-accent-blue-soft text-accent-blue">
            <Building2 className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-text-primary">Start from MLS</h2>
          <p className="mb-6 text-sm text-text-muted">
            Search by MLS number or address, review listing data, then edit parties and closing before
            templates.
          </p>
          <span className="mt-auto text-sm font-medium text-accent-blue group-hover:underline">Continue with MLS</span>
        </button>

        <button
          type="button"
          onClick={onChooseManual}
          className="group flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 text-left shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-border-strong hover:shadow-md dark:shadow-none"
        >
          <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-bg-elevated/80 text-text-secondary">
            <PenLine className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-text-primary">
            {isDialog ? 'Start manually' : 'Enter manually'}
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            {isDialog
              ? 'Property address, your role, and optional closing date — then open your guided checklist.'
              : 'Same 4-step flow as today — property, template, checklist, and confirm.'}
          </p>
          <span className="mt-auto inline-flex h-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated/50 px-4 text-sm font-medium text-text-primary sm:w-auto">
            {isDialog ? 'Continue' : 'Start blank'}
          </span>
        </button>
      </div>

      <p className={cn('text-center text-xs text-text-muted/90', isDialog ? 'mt-5' : 'mt-8')}>
        MLS import uses demo data for now. No live MLS connection.
      </p>
    </div>
  );
}
