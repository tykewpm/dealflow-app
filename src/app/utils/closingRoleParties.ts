export type ClosingRole = 'buyer' | 'seller' | 'agent' | 'other';

/** Maps quick-create role to persisted party labels (no schema change). */
export function mapClosingRoleToParties(role: ClosingRole): { buyerName: string; sellerName: string } {
  switch (role) {
    case 'buyer':
      return { buyerName: 'You (buyer)', sellerName: 'Seller (TBD)' };
    case 'seller':
      return { buyerName: 'Buyer (TBD)', sellerName: 'You (seller)' };
    case 'agent':
      return { buyerName: 'Buyer (TBD)', sellerName: 'Seller (TBD)' };
    case 'other':
    default:
      return { buyerName: 'Party A (TBD)', sellerName: 'Party B (TBD)' };
  }
}

/** Default closing date when user skips the field — ~60 days out, YYYY-MM-DD. */
export function defaultClosingDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}
