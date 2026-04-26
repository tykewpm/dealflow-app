import type { User, WorkspacePartyLabel, WorkspacePermissionRole } from '../types';

/**
 * Section order for “People on this closing” — agents first, then sides and counterparties.
 * Also used by {@link groupUsersByParty} for stable map keys.
 */
export const WORKSPACE_PARTY_ORDER: WorkspacePartyLabel[] = [
  'agent',
  'buyer',
  'seller',
  'lender',
  'escrow',
  'other',
];

const PARTY_TITLE: Record<WorkspacePartyLabel, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  agent: 'Agents',
  lender: 'Lender',
  escrow: 'Escrow / Title',
  other: 'Other',
};

const ROLE_TITLE: Record<WorkspacePermissionRole, string> = {
  owner: 'Owner',
  collaborator: 'Collaborator',
  viewer: 'Viewer',
};

export function partySectionTitle(party: WorkspacePartyLabel): string {
  return PARTY_TITLE[party];
}

export function permissionRoleLabel(role: WorkspacePermissionRole | undefined): string {
  const r = role ?? 'collaborator';
  return ROLE_TITLE[r];
}

const ROLE_HELPER: Record<WorkspacePermissionRole, string> = {
  owner: 'Can edit closing, steps, and documents',
  collaborator: 'Can complete steps and upload documents',
  viewer: 'Can view progress and documents',
};

export function permissionRoleHelperText(role: WorkspacePermissionRole | undefined): string {
  const r = role ?? 'collaborator';
  return ROLE_HELPER[r];
}

/** Default when unset — preserves pre-role behavior (everyone could edit in mock). */
export function effectivePermissionRole(user: User | undefined): WorkspacePermissionRole {
  return user?.permissionRole ?? 'collaborator';
}

export function isWorkspaceViewer(user: User | undefined): boolean {
  return effectivePermissionRole(user) === 'viewer';
}

export function isWorkspaceOwner(user: User | undefined): boolean {
  return effectivePermissionRole(user) === 'owner';
}

/** Group roster users by party for People UI. */
export function groupUsersByParty(users: User[]): Map<WorkspacePartyLabel, User[]> {
  const map = new Map<WorkspacePartyLabel, User[]>();
  for (const p of WORKSPACE_PARTY_ORDER) {
    map.set(p, []);
  }
  for (const u of users) {
    const party: WorkspacePartyLabel = u.partyLabel ?? 'other';
    const list = map.get(party) ?? map.get('other')!;
    list.push(u);
  }
  return map;
}
