import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useWorkspaceGo } from '../../context/WorkspaceLinkBaseContext';
import type { ClosingRole } from '../../utils/closingRoleParties';
import { CreateDealStartChoice } from '../create-deal/CreateDealStartChoice';
import { MlsListingSearchPanel } from '../create-deal/MlsListingSearchPanel';
import { MlsListingReviewPanel } from '../create-deal/MlsListingReviewPanel';
import type { MlsListingPreview } from '../../services/mls/mlsListingTypes';

export type CreateTransactionInput = {
  propertyAddress: string;
  role: ClosingRole;
  /** YYYY-MM-DD from `<input type="date" />`, or empty to use server/client default */
  closingDate?: string;
  /**
   * When both set (e.g. MLS import + confirm step), persisted instead of `mapClosingRoleToParties(role)`.
   * Role is still sent for workspace context; party labels win when present.
   */
  buyerName?: string;
  sellerName?: string;
};

type ModalStep = 'choose' | 'manual' | 'mls-search' | 'mls-review' | 'transition';

interface CreateTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persists transaction and returns id for navigation (Convex id string or mock id). */
  onCreateTransaction: (input: CreateTransactionInput) => Promise<string>;
  disabled?: boolean;
}

const ROLE_OPTIONS: { value: ClosingRole; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'agent', label: 'Agent' },
  { value: 'other', label: 'Other' },
];

export function CreateTransactionModal({
  open,
  onOpenChange,
  onCreateTransaction,
  disabled = false,
}: CreateTransactionModalProps) {
  const go = useWorkspaceGo();
  const [step, setStep] = useState<ModalStep>('choose');
  const [mlsPick, setMlsPick] = useState<MlsListingPreview | null>(null);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [buyerNameImported, setBuyerNameImported] = useState('');
  const [sellerNameImported, setSellerNameImported] = useState('');
  const [useImportedParties, setUseImportedParties] = useState(false);
  const [role, setRole] = useState<ClosingRole>('buyer');
  const [closingDate, setClosingDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep('choose');
    setMlsPick(null);
    setPropertyAddress('');
    setBuyerNameImported('');
    setSellerNameImported('');
    setUseImportedParties(false);
    setRole('buyer');
    setClosingDate('');
    setError(null);
  };

  useEffect(() => {
    if (open) {
      setStep('choose');
      setMlsPick(null);
      setPropertyAddress('');
      setBuyerNameImported('');
      setSellerNameImported('');
      setUseImportedParties(false);
      setRole('buyer');
      setClosingDate('');
      setError(null);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next && step !== 'transition') {
      reset();
    }
    onOpenChange(next);
  };

  const runCreate = (input: CreateTransactionInput) => {
    setStep('transition');
    setError(null);
    void (async () => {
      try {
        await new Promise((r) => window.setTimeout(r, 450));
        const id = await onCreateTransaction(input);
        handleOpenChange(false);
        reset();
        go(`/deals/${id}`);
      } catch (err) {
        console.error(err);
        setStep('manual');
        setError('Could not create your transaction. Try again.');
      }
    })();
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = propertyAddress.trim();
    if (!trimmed) {
      setError('Enter a property address.');
      return;
    }
    if (useImportedParties) {
      if (!buyerNameImported.trim() || !sellerNameImported.trim()) {
        setError('Enter buyer and seller names.');
        return;
      }
    }
    setError(null);
    runCreate({
      propertyAddress: trimmed,
      role,
      closingDate: closingDate.trim() || undefined,
      ...(useImportedParties
        ? { buyerName: buyerNameImported.trim(), sellerName: sellerNameImported.trim() }
        : {}),
    });
  };

  const dialogWide = step === 'mls-search' || step === 'mls-review';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={
          dialogWide
            ? 'max-h-[min(90vh,720px)] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl'
            : 'max-w-md gap-0 overflow-hidden p-0 sm:max-w-md'
        }
        onPointerDownOutside={(e) => {
          if (step === 'transition') e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (step === 'transition') e.preventDefault();
        }}
      >
        {step === 'transition' ? (
          <div className="flex flex-col items-center px-6 py-14" role="status" aria-live="polite">
            <div
              className="mb-4 size-9 rounded-full border-2 border-border-subtle border-t-accent-blue animate-spin"
              aria-hidden
            />
            <p className="text-center text-sm font-medium text-text-primary">Setting up your closing…</p>
            <p className="mt-1 text-center text-xs text-text-muted">Taking you to your checklist.</p>
          </div>
        ) : null}

        {step === 'choose' ? (
          <div className="flex max-h-[min(90vh,720px)] flex-col">
            <DialogHeader className="shrink-0 border-b border-border-subtle px-6 py-5 text-left">
              <DialogTitle>Start new closing</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Import from MLS (demo catalog) or enter the basics manually. For templates and a longer
                checklist, use the full create flow.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <CreateDealStartChoice
                variant="dialog"
                onChooseMls={() => {
                  setError(null);
                  setStep('mls-search');
                }}
                onChooseManual={() => {
                  setMlsPick(null);
                  setUseImportedParties(false);
                  setBuyerNameImported('');
                  setSellerNameImported('');
                  setPropertyAddress('');
                  setClosingDate('');
                  setError(null);
                  setStep('manual');
                }}
              />
              <div className="mt-6 border-t border-border-subtle pt-4 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-accent-blue underline-offset-2 hover:underline"
                  onClick={() => {
                    handleOpenChange(false);
                    go('/deals/new');
                  }}
                >
                  Full create flow — templates and checklist
                </button>
              </div>
            </div>
            <DialogFooter className="shrink-0 border-t border-border-subtle bg-bg-surface/50 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {step === 'mls-search' ? (
          <div className="flex max-h-[min(90vh,720px)] flex-col">
            <DialogHeader className="shrink-0 border-b border-border-subtle px-6 py-4 text-left">
              <DialogTitle className="text-lg">Import listing</DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">
                Demo MLS catalog — swap the provider later for live data.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
              <MlsListingSearchPanel
                onBack={() => {
                  setError(null);
                  setStep('choose');
                }}
                onSelectListing={(listing) => {
                  setMlsPick(listing);
                  setStep('mls-review');
                }}
              />
            </div>
          </div>
        ) : null}

        {step === 'mls-review' && mlsPick ? (
          <div className="flex max-h-[min(90vh,720px)] flex-col">
            <DialogHeader className="shrink-0 border-b border-border-subtle px-6 py-4 text-left">
              <DialogTitle className="text-lg">Review import</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
              <MlsListingReviewPanel
                listing={mlsPick}
                flowContext="quick-transaction"
                submitButtonLabel="Import listing details"
                onBack={() => {
                  setMlsPick(null);
                  setStep('mls-search');
                }}
                onApply={(draft) => {
                  setPropertyAddress(draft.propertyAddress);
                  setBuyerNameImported(draft.buyerName);
                  setSellerNameImported(draft.sellerName);
                  setClosingDate(draft.closingDate);
                  setUseImportedParties(true);
                  setError(null);
                  setStep('manual');
                }}
              />
            </div>
          </div>
        ) : null}

        {step === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="flex max-h-[min(90vh,720px)] flex-col">
            <DialogHeader className="shrink-0 border-b border-border-subtle px-6 py-5 text-left">
              <DialogTitle>{useImportedParties ? 'Confirm & create' : 'Start manually'}</DialogTitle>
              <DialogDescription className="text-text-secondary">
                {useImportedParties
                  ? 'Listing fields are below — adjust parties or closing, then create.'
                  : 'Add the basics — you can refine everything on the next screen.'}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {error ? (
                <p className="rounded-lg border border-border-subtle bg-accent-red-soft px-3 py-2 text-sm text-text-primary">
                  {error}
                </p>
              ) : null}

              <div>
                <label htmlFor="quick-tx-address" className="text-sm font-medium text-text-primary">
                  Property address <span className="text-accent-red">*</span>
                </label>
                <input
                  id="quick-tx-address"
                  name="propertyAddress"
                  type="text"
                  required
                  autoComplete="street-address"
                  value={propertyAddress}
                  onChange={(e) => {
                    setPropertyAddress(e.target.value);
                    setError(null);
                  }}
                  disabled={disabled}
                  placeholder="123 Main St, City, ST"
                  className="mt-1.5 w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:opacity-60"
                />
              </div>

              {useImportedParties ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quick-tx-buyer" className="text-sm font-medium text-text-primary">
                      Buyer name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      id="quick-tx-buyer"
                      type="text"
                      required
                      value={buyerNameImported}
                      onChange={(e) => {
                        setBuyerNameImported(e.target.value);
                        setError(null);
                      }}
                      disabled={disabled}
                      className="mt-1.5 w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label htmlFor="quick-tx-seller" className="text-sm font-medium text-text-primary">
                      Seller name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      id="quick-tx-seller"
                      type="text"
                      required
                      value={sellerNameImported}
                      onChange={(e) => {
                        setSellerNameImported(e.target.value);
                        setError(null);
                      }}
                      disabled={disabled}
                      className="mt-1.5 w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:opacity-60"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <span id="quick-tx-role-label" className="text-sm font-medium text-text-primary">
                  Your role
                </span>
                <div
                  className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
                  role="group"
                  aria-labelledby="quick-tx-role-label"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        role === opt.value
                          ? 'border-accent-blue bg-accent-blue-soft text-text-primary'
                          : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong'
                      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => setRole(opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="quick-tx-closing" className="text-sm font-medium text-text-primary">
                  Target closing date <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  id="quick-tx-closing"
                  name="closingDate"
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  disabled={disabled}
                  className="mt-1.5 w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:opacity-60"
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border-subtle bg-bg-surface/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  if (useImportedParties && mlsPick) {
                    setStep('mls-review');
                  } else {
                    setMlsPick(null);
                    setStep('choose');
                  }
                }}
                disabled={disabled}
              >
                Back
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={disabled}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={disabled}>
                Create &amp; open
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
