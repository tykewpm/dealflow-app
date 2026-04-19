// Mock address data for autocomplete
export interface AddressSuggestion {
  id: string;
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const mockAddresses: AddressSuggestion[] = [
  {
    id: '1',
    fullAddress: '1234 Oak Street, San Francisco, CA 94102',
    street: '1234 Oak Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  },
  {
    id: '2',
    fullAddress: '1234 Oak Street, Oakland, CA 94607',
    street: '1234 Oak Street',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
  },
  {
    id: '3',
    fullAddress: '567 Pine Avenue, San Francisco, CA 94108',
    street: '567 Pine Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94108',
  },
  {
    id: '4',
    fullAddress: '890 Maple Drive, Berkeley, CA 94704',
    street: '890 Maple Drive',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94704',
  },
  {
    id: '5',
    fullAddress: '2345 Elm Court, San Jose, CA 95110',
    street: '2345 Elm Court',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110',
  },
  {
    id: '6',
    fullAddress: '456 Market Street, San Francisco, CA 94102',
    street: '456 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  },
  {
    id: '7',
    fullAddress: '789 Valencia Street, San Francisco, CA 94110',
    street: '789 Valencia Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94110',
  },
  {
    id: '8',
    fullAddress: '123 Broadway, Oakland, CA 94612',
    street: '123 Broadway',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94612',
  },
  {
    id: '9',
    fullAddress: '321 University Avenue, Palo Alto, CA 94301',
    street: '321 University Avenue',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
  },
  {
    id: '10',
    fullAddress: '555 California Street, San Francisco, CA 94104',
    street: '555 California Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
  },
];

/**
 * Search for addresses matching the query
 */
export function searchAddresses(query: string): AddressSuggestion[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();

  return mockAddresses.filter((address) => {
    return (
      address.fullAddress.toLowerCase().includes(searchTerm) ||
      address.street.toLowerCase().includes(searchTerm) ||
      address.city.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 5); // Limit to 5 results
}
