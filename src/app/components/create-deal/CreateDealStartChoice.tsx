import { Building2, PenLine } from 'lucide-react';

interface CreateDealStartChoiceProps {
  onChooseMls: () => void;
  onChooseManual: () => void;
}

export function CreateDealStartChoice({ onChooseMls, onChooseManual }: CreateDealStartChoiceProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-sm text-text-muted">New deal</p>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">How would you like to start?</h1>
        <p className="text-text-secondary">
          Import key fields from a listing to save time, or enter everything manually.
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
          <h2 className="mb-1 text-lg font-semibold text-text-primary">Enter manually</h2>
          <p className="mb-6 text-sm text-text-muted">
            Same 4-step flow as today — property, template, checklist, and confirm.
          </p>
          <span className="mt-auto inline-flex h-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated/50 px-4 text-sm font-medium text-text-primary sm:w-auto">
            Start blank
          </span>
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-text-muted/90">
        MLS import uses demo data for now. No live MLS connection.
      </p>
    </div>
  );
}
