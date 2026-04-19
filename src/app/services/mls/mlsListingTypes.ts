/**
 * Provider-agnostic MLS listing shapes for import-assisted deal creation.
 * Swap `getMlsListingProvider()` later for a real RETS/RESO/Web API client.
 */

/** Compact row returned from search — enough to pick a listing. */
export interface MlsListingPreview {
  id: string;
  mlsNumber: string;
  /** Single line for display + default property address */
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  listPriceDisplay: string;
  listingStatus: string;
  /** When unknown at import, UI can default buyer to TBD */
  buyerNameHint?: string;
  sellerNameHint?: string;
  listingAgentName?: string;
  /** Suggested closing date (ISO yyyy-mm-dd); optional */
  estimatedCloseDate?: string;
}

export interface MlsSearchParams {
  /** Exact or partial MLS listing number */
  mlsNumber?: string;
  /** Street / city / ZIP free text */
  addressQuery?: string;
}

/** Future real providers implement this — no Convex/network in the mock path. */
export interface MlsListingProvider {
  searchListings(params: MlsSearchParams): Promise<MlsListingPreview[]>;
}

/** Maps a chosen listing into the same fields the create-deal flow already uses. */
export function mlsPreviewToDealBasics(preview: MlsListingPreview): {
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  closingDate: string;
} {
  const propertyAddress = [preview.addressLine, preview.city, preview.state, preview.zip]
    .filter(Boolean)
    .join(', ');

  const defaultClose = () => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  };

  return {
    propertyAddress,
    buyerName: preview.buyerNameHint?.trim() || 'Buyer TBD',
    sellerName: preview.sellerNameHint?.trim() || 'Seller (confirm)',
    closingDate: preview.estimatedCloseDate || defaultClose(),
  };
}
