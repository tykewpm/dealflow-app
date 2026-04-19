import { useEffect } from 'react';
import type { User } from '../../types';
import { WorkspaceNavList, WorkspaceAccountFooter } from './WorkspaceNavList';
import { workspaceSecondaryNavItems } from './workspaceNavConfig';
import { DrawerNavSection } from './DrawerNavSection';
import transactqLogo from '../../../imports/logo.svg';

type WorkspaceNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  workspaceIdentity?: {
    users: User[];
    currentUserId: string;
    onChange: (userId: string) => void;
    sessionEmail?: string | null;
    hideRosterPicker?: boolean;
    onSignOut?: () => void | Promise<void>;
  };
};

/** Slide-out menu: workspace utilities + account — not the primary workflow list (see bottom bar). */
export function WorkspaceNavDrawer({ open, onClose, workspaceIdentity }: WorkspaceNavDrawerProps) {
  const secondaryCount = workspaceSecondaryNavItems().length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 ease-out dark:bg-black/55 lg:hidden"
        aria-hidden
        onClick={onClose}
      />
      <aside
        id="workspace-nav-drawer"
        className="fixed left-0 top-0 z-50 flex h-full w-[min(300px,91vw)] flex-col overflow-hidden border-r border-border-subtle bg-bg-surface shadow-xl transition-[background-color,border-color,box-shadow] duration-150 ease-out dark:shadow-none lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="App and account menu"
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtle px-4">
          <img src={transactqLogo} alt="" className="h-9 w-9 object-contain" />
          <div className="min-w-0">
            <span className="block font-semibold leading-tight tracking-tight text-text-primary">TransactQ</span>
            <span className="text-[11px] text-text-muted">Workspace & account</span>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {secondaryCount > 0 ? (
              <DrawerNavSection title="Workspace">
                <WorkspaceNavList variant="drawer" scope="secondary" onNavigate={onClose} />
              </DrawerNavSection>
            ) : null}
            <DrawerNavSection
              title="Account"
              className="border-t border-border-subtle bg-gradient-to-b from-bg-app/90 to-bg-app pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 transition-[background-color,border-color] duration-150 ease-out dark:from-bg-elevated/80 dark:to-bg-app"
            >
              <div className="px-2">
                <WorkspaceAccountFooter
                  variant="drawer"
                  groupedSurface
                  workspaceIdentity={workspaceIdentity}
                />
              </div>
            </DrawerNavSection>
          </div>
        </div>
      </aside>
    </>
  );
}
