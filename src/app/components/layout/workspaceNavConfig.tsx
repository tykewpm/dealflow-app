import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  BarChart3,
  UserPlus,
} from 'lucide-react';

export type WorkspaceNavItem = {
  id: string;
  /** Full label (sidebar, tooltips, drawer) */
  label: string;
  /** Short label for bottom bar (≤10 chars ideally) */
  shortLabel: string;
  icon: LucideIcon;
  path: string;
  /** Shown on primary mobile bottom bar (first N slots) */
  mobilePrimary?: boolean;
  match?: (pathname: string) => boolean;
};

/**
 * Single source for workspace navigation — sidebar, drawer, and bottom bar stay aligned.
 */
export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    path: '/',
    mobilePrimary: true,
    match: (pathname) => pathname === '/',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    shortLabel: 'Closings',
    icon: Briefcase,
    path: '/transactions',
    mobilePrimary: true,
    match: (pathname) =>
      pathname === '/transactions' ||
      pathname.startsWith('/deals/') ||
      pathname === '/deals/new',
  },
  {
    id: 'templates',
    label: 'Templates & Checklists',
    shortLabel: 'Templates',
    icon: FileText,
    path: '/templates',
    mobilePrimary: true,
    match: (pathname) =>
      pathname === '/templates' || pathname.startsWith('/templates/'),
  },
  {
    id: 'agents',
    label: 'Team workload',
    shortLabel: 'Workload',
    icon: Users,
    path: '/agents',
    mobilePrimary: true,
    match: (pathname) => pathname === '/agents',
  },
  {
    id: 'reports',
    label: 'Reports',
    shortLabel: 'Reports',
    icon: BarChart3,
    path: '/reports',
    mobilePrimary: true,
    match: (pathname) => pathname === '/reports',
  },
  {
    id: 'roster',
    label: 'Invite (roster)',
    shortLabel: 'Roster',
    icon: UserPlus,
    path: '/workspace/roster',
    mobilePrimary: false,
    match: (pathname) =>
      pathname === '/workspace/roster' || pathname.startsWith('/workspace/roster/'),
  },
];

/** Primary workflow destinations (mobile bottom bar + sidebar work list). */
export function workspacePrimaryNavItems(): WorkspaceNavItem[] {
  return WORKSPACE_NAV_ITEMS.filter((i) => i.mobilePrimary);
}

/** Secondary workspace tools — drawer / sidebar only (not duplicated on bottom bar). */
export function workspaceSecondaryNavItems(): WorkspaceNavItem[] {
  return WORKSPACE_NAV_ITEMS.filter((i) => !i.mobilePrimary);
}
