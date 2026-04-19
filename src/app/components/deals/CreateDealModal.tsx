import { useState } from 'react';
import { Button } from '../ui/button';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dealData: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
  }) => void;
}

const inputClass =
  'w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function CreateDealModal({ isOpen, onClose, onSubmit }: CreateDealModalProps) {
  const [propertyAddress, setPropertyAddress] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [closingDate, setClosingDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      propertyAddress,
      buyerName,
      sellerName,
      closingDate,
    });
    setPropertyAddress('');
    setBuyerName('');
    setSellerName('');
    setClosingDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] dark:bg-bg-app/80">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-xl dark:shadow-none">
        <div className="border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Create New Deal</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="propertyAddress" className="mb-1 block text-sm font-medium text-text-primary">
                Property Address *
              </label>
              <input
                type="text"
                id="propertyAddress"
                required
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="123 Main Street, San Francisco, CA 94102"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="buyerName" className="mb-1 block text-sm font-medium text-text-primary">
                Buyer Name *
              </label>
              <input
                type="text"
                id="buyerName"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="John Smith"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sellerName" className="mb-1 block text-sm font-medium text-text-primary">
                Seller Name *
              </label>
              <input
                type="text"
                id="sellerName"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="closingDate" className="mb-1 block text-sm font-medium text-text-primary">
                Closing Date *
              </label>
              <input
                type="date"
                id="closingDate"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Create Deal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
