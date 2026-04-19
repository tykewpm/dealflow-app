import type { MlsListingProvider } from './mlsListingTypes';
import { MockMlsListingProvider } from './mockMlsListingProvider';

/** Single switch point when wiring a real MLS / RESO adapter. */
export function getMlsListingProvider(): MlsListingProvider {
  return new MockMlsListingProvider();
}
