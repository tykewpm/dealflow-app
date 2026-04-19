import { useState, useEffect, type FormEvent } from 'react';
import { Deal } from '../../types';
import { AddressAutocomplete } from '../shared/AddressAutocomplete';
import { Button } from '../ui/button';

interface EditDealMetadataModalProps {
  isOpen: boolean;
  deal: Deal;
  onClose: () => void;
  onSave: (fields: { propertyAddress: string; buyerName: string; sellerName: string }) => void;
}

const fieldClass =
  'w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function EditDealMetadataModal({
  isOpen,
  deal,
  onClose,
  onSave,
}: EditDealMetadataModalProps) {
  const [propertyAddress, setPropertyAddress] = useState(deal.propertyAddress);
  const [buyerName, setBuyerName] = useState(deal.buyerName);
  const [sellerName, setSellerName] = useState(deal.sellerName);

  useEffect(() => {
    if (!isOpen) return;
    setPropertyAddress(deal.propertyAddress);
    setBuyerName(deal.buyerName);
    setSellerName(deal.sellerName);
  }, [isOpen, deal.propertyAddress, deal.buyerName, deal.sellerName]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pa = propertyAddress.trim();
    const bn = buyerName.trim();
    const sn = sellerName.trim();
    if (!pa || !bn || !sn) return;
    onSave({ propertyAddress: pa, buyerName: bn, sellerName: sn });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] dark:bg-bg-app/80">
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-xl dark:shadow-none"
        role="dialog"
        aria-labelledby="edit-deal-metadata-title"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 id="edit-deal-metadata-title" className="font-semibold text-text-primary">
            Edit deal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="edit-property-address" className="mb-1 block text-sm font-medium text-text-primary">
              Property address
            </label>
            <AddressAutocomplete
              value={propertyAddress}
              onChange={setPropertyAddress}
              placeholder="Property address"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-buyer-name" className="mb-1 block text-sm font-medium text-text-primary">
              Buyer name
            </label>
            <input
              id="edit-buyer-name"
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="edit-seller-name" className="mb-1 block text-sm font-medium text-text-primary">
              Seller name
            </label>
            <input
              id="edit-seller-name"
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
