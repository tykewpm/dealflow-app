import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/datepicker.css';
import { ArrowLeft } from 'lucide-react';
import type { MlsListingPreview } from '../../services/mls/mlsListingTypes';
import { mlsPreviewToDealBasics } from '../../services/mls/mlsListingTypes';
import { AddressAutocomplete } from '../shared/AddressAutocomplete';
import { Button } from '../ui/button';

interface MlsListingReviewPanelProps {
  listing: MlsListingPreview;
  onBack: () => void;
  onApply: (draft: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
  }) => void;
  /** Wizard continues to templates; quick transaction creates a deal from the modal. */
  flowContext?: 'wizard' | 'quick-transaction';
  /** Primary submit control label */
  submitButtonLabel?: string;
}

const controlClass =
  'h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function MlsListingReviewPanel({
  listing,
  onBack,
  onApply,
  flowContext = 'wizard',
  submitButtonLabel,
}: MlsListingReviewPanelProps) {
  const seeded = mlsPreviewToDealBasics(listing);
  const [propertyAddress, setPropertyAddress] = useState(seeded.propertyAddress);
  const [buyerName, setBuyerName] = useState(seeded.buyerName);
  const [sellerName, setSellerName] = useState(seeded.sellerName);
  const [closingDate, setClosingDate] = useState(seeded.closingDate);

  useEffect(() => {
    const next = mlsPreviewToDealBasics(listing);
    setPropertyAddress(next.propertyAddress);
    setBuyerName(next.buyerName);
    setSellerName(next.sellerName);
    setClosingDate(next.closingDate);
  }, [listing]);

  const valid = Boolean(propertyAddress.trim() && closingDate && buyerName.trim() && sellerName.trim());

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to results
      </button>

      <div className="mb-8">
        <p className="mb-2 text-sm text-text-muted">Review import</p>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">Confirm deal basics</h1>
        <p className="text-text-secondary">
          {flowContext === 'quick-transaction'
            ? 'We prefilled fields from the listing. Adjust anything, then you will confirm your role and create the transaction.'
            : 'We prefilled fields from the listing. Adjust anything before continuing to templates — this is the same information as Step 1.'}
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-border-subtle bg-bg-surface/60 px-4 py-3 text-sm text-text-secondary dark:bg-bg-elevated/30">
        <p className="font-medium text-text-primary">Listing</p>
        <p className="mt-1">
          MLS {listing.mlsNumber} · {listing.listPriceDisplay} · {listing.listingStatus}
          {listing.listingAgentName ? ` · Agent ${listing.listingAgentName}` : null}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) {
            onApply({
              propertyAddress: propertyAddress.trim(),
              buyerName: buyerName.trim(),
              sellerName: sellerName.trim(),
              closingDate,
            });
          }
        }}
        className="space-y-6"
      >
        <div>
          <label htmlFor="mls-prop" className="mb-2 block text-sm font-medium text-text-primary">
            Property address
          </label>
          <AddressAutocomplete
            value={propertyAddress}
            onChange={setPropertyAddress}
            placeholder="Property address"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="mls-buyer" className="mb-2 block text-sm font-medium text-text-primary">
              Buyer name
            </label>
            <input
              id="mls-buyer"
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className={controlClass}
              required
            />
          </div>
          <div>
            <label htmlFor="mls-seller" className="mb-2 block text-sm font-medium text-text-primary">
              Seller name
            </label>
            <input
              id="mls-seller"
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className={controlClass}
              required
            />
          </div>
        </div>

        <div className="max-w-md">
          <label htmlFor="mls-close" className="mb-2 block text-sm font-medium text-text-primary">
            Closing date
          </label>
          <DatePicker
            selected={closingDate ? new Date(closingDate) : null}
            onChange={(date: Date | null) => {
              if (date) setClosingDate(date.toISOString().split('T')[0]);
            }}
            dateFormat="MMM d, yyyy"
            placeholderText="Select closing date"
            className={controlClass}
            wrapperClassName="w-full"
            calendarClassName="shadow-lg dark:shadow-none"
            minDate={new Date()}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="accent" disabled={!valid} className="rounded-xl px-6 py-3">
            {submitButtonLabel ?? 'Use listing & continue →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
