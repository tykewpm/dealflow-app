import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { User } from '../../types';
import { AppSidebar } from './AppSidebar';
import { AppChromeHeader } from './AppChromeHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { WorkspaceNavDrawer } from './WorkspaceNavDrawer';

interface AppShellProps {
  children: React.ReactNode;
  /** Who this browser session acts as (roster-backed); with Convex Auth includes session hints. */
  workspaceIdentity?: {
    users: User[];
    currentUserId: string;
    onChange: (userId: string) => void;
    sessionEmail?: string | null;
    hideRosterPicker?: boolean;
    onSignOut?: () => void | Promise<void>;
  };
  /** Optional banner above main content (e.g. identity mismatch, membership CTA). */
  identityBanner?: React.ReactNode;
  /** One-time welcome after workspace access (distinct from amber identity notices). */
  welcomeBanner?: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'transactq-sidebar-collapsed';

export function AppShell({ children, workspaceIdentity, identityBanner, welcomeBanner }: AppShellProps) {
  const { pathname } = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  const [narrowNavOpen, setNarrowNavOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    setNarrowNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setNarrowNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app">
      <div className="hidden h-full shrink-0 lg:flex">
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          workspaceIdentity={workspaceIdentity}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppChromeHeader
          menuOpen={narrowNavOpen}
          onMenuToggle={() => setNarrowNavOpen((o) => !o)}
        />

        <main
          className="flex min-h-0 flex-1 flex-col overflow-auto bg-bg-app pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0"
        >
          {welcomeBanner != null && welcomeBanner !== false ? (
            <div
              role="status"
              className="flex-shrink-0 border-b border-border-subtle bg-gradient-to-r from-accent-green-soft via-accent-green-soft/80 to-accent-green-soft px-4 py-3 text-sm text-text-primary shadow-sm transition-[background-color,border-color] duration-150 ease-out dark:shadow-none sm:px-6"
            >
              {welcomeBanner}
            </div>
          ) : null}
          {identityBanner != null && identityBanner !== false ? (
            <div
              role="status"
              className="flex-shrink-0 border-b border-border-subtle bg-accent-amber-soft px-4 py-2 text-sm text-text-primary transition-[background-color,border-color,color] duration-150 ease-out dark:border-accent-amber/25 dark:bg-accent-amber-soft sm:px-6"
            >
              {identityBanner}
            </div>
          ) : null}
          <div className="flex-1 overflow-auto">{children}</div>
        </main>

        <MobileBottomNav />
      </div>

      <WorkspaceNavDrawer
        open={narrowNavOpen}
        onClose={() => setNarrowNavOpen(false)}
        workspaceIdentity={workspaceIdentity}
      />
    </div>
  );
}
