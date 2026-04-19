import type { MlsListingPreview, MlsListingProvider, MlsSearchParams } from './mlsListingTypes';

const MOCK: MlsListingPreview[] = [
  {
    id: 'mls-1001',
    mlsNumber: 'OR-1001',
    addressLine: '4521 NE Glisan St',
    city: 'Portland',
    state: 'OR',
    zip: '97213',
    listPriceDisplay: '$625,000',
    listingStatus: 'Active',
    buyerNameHint: '',
    sellerNameHint: 'Riverbend Trust',
    listingAgentName: 'Alex Morgan',
    estimatedCloseDate: '',
  },
  {
    id: 'mls-1002',
    mlsNumber: 'OR-2044',
    addressLine: '2200 SW Market St',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    listPriceDisplay: '$895,000',
    listingStatus: 'Pending',
    sellerNameHint: 'Market Holdings LLC',
    listingAgentName: 'Jordan Lee',
    estimatedCloseDate: '2026-06-15',
  },
  {
    id: 'mls-1003',
    mlsNumber: 'WA-8832',
    addressLine: '88 Lake Washington Blvd',
    city: 'Seattle',
    state: 'WA',
    zip: '98112',
    listPriceDisplay: '$1,150,000',
    listingStatus: 'Active',
    sellerNameHint: 'Northwest Estates',
    listingAgentName: 'Sam Rivera',
    estimatedCloseDate: '',
  },
];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export class MockMlsListingProvider implements MlsListingProvider {
  async searchListings(params: MlsSearchParams): Promise<MlsListingPreview[]> {
    const mls = params.mlsNumber?.trim();
    const addr = params.addressQuery?.trim();

    await new Promise((r) => setTimeout(r, 280));

    if (!mls && !addr) return [];

    return MOCK.filter((row) => {
      if (mls) {
        if (norm(row.mlsNumber).includes(norm(mls)) || norm(mls).includes(norm(row.mlsNumber))) {
          return true;
        }
      }
      if (addr) {
        const hay = norm(
          `${row.addressLine} ${row.city} ${row.state} ${row.zip} ${row.mlsNumber}`,
        );
        const needles = norm(addr).split(/\s+/).filter(Boolean);
        return needles.every((n) => hay.includes(n));
      }
      return false;
    });
  }
}
