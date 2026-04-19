import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/datepicker.css';
import { AddressAutocomplete } from '../shared/AddressAutocomplete';
import { Button } from '../ui/button';

interface Step1BasicInfoProps {
  propertyAddress: string;
  closingDate: string;
  buyerName: string;
  sellerName: string;
  onPropertyAddressChange: (value: string) => void;
  onClosingDateChange: (value: string) => void;
  onBuyerNameChange: (value: string) => void;
  onSellerNameChange: (value: string) => void;
  onContinue: () => void;
}

const controlClass =
  'h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-text-primary focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function Step1BasicInfo({
  propertyAddress,
  closingDate,
  buyerName,
  sellerName,
  onPropertyAddressChange,
  onClosingDateChange,
  onBuyerNameChange,
  onSellerNameChange,
  onContinue,
}: Step1BasicInfoProps) {
  const isValid = propertyAddress && closingDate && buyerName && sellerName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onContinue();
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-sm text-text-muted">Step 1 of 4</p>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">Basic information</h1>
        <p className="text-text-secondary">Start with property, closing, and parties</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="propertyAddress" className="mb-2 block text-sm font-medium text-text-primary">
              Property Address
            </label>
            <AddressAutocomplete
              value={propertyAddress}
              onChange={onPropertyAddressChange}
              placeholder="Start typing address…"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="closingDate" className="mb-2 block text-sm font-medium text-text-primary">
              Closing Date
            </label>
            <DatePicker
              selected={closingDate ? new Date(closingDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  onClosingDateChange(date.toISOString().split('T')[0]);
                }
              }}
              dateFormat="MMM d, yyyy"
              placeholderText="Select closing date"
              className={controlClass}
              wrapperClassName="w-full"
              calendarClassName="shadow-lg dark:shadow-none"
              minDate={new Date()}
            />
          </div>

          <div />

          <div>
            <label htmlFor="buyerName" className="mb-2 block text-sm font-medium text-text-primary">
              Buyer Name
            </label>
            <input
              type="text"
              id="buyerName"
              required
              value={buyerName}
              onChange={(e) => onBuyerNameChange(e.target.value)}
              placeholder="John Smith"
              className={controlClass}
            />
          </div>

          <div>
            <label htmlFor="sellerName" className="mb-2 block text-sm font-medium text-text-primary">
              Seller Name
            </label>
            <input
              type="text"
              id="sellerName"
              required
              value={sellerName}
              onChange={(e) => onSellerNameChange(e.target.value)}
              placeholder="Jane Doe"
              className={controlClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="accent" disabled={!isValid} className="rounded-xl px-6 py-3">
            Continue →
          </Button>
        </div>
      </form>
    </div>
  );
}
