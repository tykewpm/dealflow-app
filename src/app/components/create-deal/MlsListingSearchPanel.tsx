import { useState } from 'react';
import { ArrowLeft, Hash, MapPin, Search } from 'lucide-react';
import type { MlsListingPreview } from '../../services/mls/mlsListingTypes';
import { getMlsListingProvider } from '../../services/mls/getMlsListingProvider';
import { Button } from '../ui/button';

type SearchTab = 'mls' | 'address';

interface MlsListingSearchPanelProps {
  onBack: () => void;
  onSelectListing: (listing: MlsListingPreview) => void;
}

const inputClass =
  'h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-text-primary placeholder:text-text-muted/70 focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function MlsListingSearchPanel({ onBack, onSelectListing }: MlsListingSearchPanelProps) {
  const [tab, setTab] = useState<SearchTab>('mls');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MlsListingPreview[]>([]);

  const runSearch = async () => {
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const provider = getMlsListingProvider();
      const params =
        tab === 'mls' ? { mlsNumber: query.trim() } : { addressQuery: query.trim() };
      const rows = await provider.searchListings(params);
      setResults(rows);
      if (rows.length === 0) {
        setError('No listings matched. Try OR-1001, Portland, or Seattle.');
      }
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>

      <div className="mb-8">
        <p className="mb-2 text-sm text-text-muted">MLS-assisted import</p>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">Find a listing</h1>
        <p className="text-text-secondary">Search by MLS number or by address (demo catalog).</p>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-border-subtle bg-bg-surface p-1">
        <button
          type="button"
          onClick={() => {
            setTab('mls');
            setResults([]);
            setError(null);
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'mls'
              ? 'bg-accent-blue-soft text-text-primary ring-1 ring-border-strong/50 dark:ring-accent-blue/20'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Hash className="size-3.5 opacity-70" aria-hidden />
            MLS number
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('address');
            setResults([]);
            setError(null);
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'address'
              ? 'bg-accent-blue-soft text-text-primary ring-1 ring-border-strong/50 dark:ring-accent-blue/20'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 opacity-70" aria-hidden />
            Address
          </span>
        </button>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="mls-query" className="mb-2 block text-sm font-medium text-text-primary">
            {tab === 'mls' ? 'MLS number' : 'Address or city'}
          </label>
          <input
            id="mls-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'mls' ? 'e.g. OR-1001' : 'e.g. Glisan Portland'}
            className={inputClass}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runSearch();
            }}
          />
        </div>
        <Button
          type="button"
          variant="accent"
          className="h-12 shrink-0 rounded-xl px-5"
          disabled={!query.trim() || loading}
          onClick={() => void runSearch()}
        >
          <span className="inline-flex items-center gap-2">
            <Search className="size-4" aria-hidden />
            {loading ? 'Searching…' : 'Search'}
          </span>
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-accent-amber">{error}</p> : null}

      {results.length > 0 ? (
        <ul className="space-y-2" aria-label="Search results">
          {results.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelectListing(row)}
                className="flex w-full flex-col rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 text-left transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {row.addressLine}, {row.city}, {row.state} {row.zip}
                  </p>
                  <p className="text-sm text-text-muted">
                    MLS {row.mlsNumber} · {row.listPriceDisplay} · {row.listingStatus}
                  </p>
                </div>
                <span className="mt-2 text-sm font-medium text-accent-blue sm:mt-0">Review</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
