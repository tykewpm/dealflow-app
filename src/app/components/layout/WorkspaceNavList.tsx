import { AnimatePresence, motion } from 'motion/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import type { User } from '../../types';
import { useWorkspaceGo, useWorkspacePathname } from '../../context/WorkspaceLinkBaseContext';
import {
  WORKSPACE_NAV_ITEMS,
  workspaceSecondaryNavItems,
  type WorkspaceNavItem,
} from './workspaceNavConfig';
import { CurrentUserSelect } from './CurrentUserSelect';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, Settings } from 'lucide-react';

function isActiveItem(item: WorkspaceNavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.path;
}

type NavListProps = {
  variant: 'sidebar' | 'drawer';
  /** Sidebar-only: icon rail mode */
  collapsed?: boolean;
  /** Call after navigation (e.g. close mobile drawer) */
  onNavigate?: () => void;
  /**
   * `all` — full list (desktop sidebar). `secondary` — only non–bottom-bar items
   * (mobile drawer “Workspace” so it does not duplicate the bottom tab bar).
   */
  scope?: 'all' | 'secondary';
};

export function WorkspaceNavList({
  variant,
  collapsed = false,
  onNavigate,
  scope = 'all',
}: NavListProps) {
  const go = useWorkspaceGo();
  const workspacePathname = useWorkspacePathname();

  const handleItem = (item: WorkspaceNavItem) => {
    go(item.path);
    onNavigate?.();
  };

  const showLabels = variant === 'drawer' || !collapsed;

  const items =
    scope === 'secondary' && variant === 'drawer' ? workspaceSecondaryNavItems() : WORKSPACE_NAV_ITEMS;

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={
        variant === 'drawer' && scope === 'secondary'
          ? 'space-y-1'
          : variant === 'drawer'
            ? 'min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4'
            : 'flex-1 space-y-1 px-3 py-4'
      }
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActiveItem(item, workspacePathname);

        const navButton = (
          <button
            type="button"
            onClick={() => handleItem(item)}
            aria-current={active ? 'page' : undefined}
            className={`
              group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left
              transition-[color,background-color,border-color] duration-150 ease-out
              ${
                active
                  ? 'bg-accent-blue-soft text-text-primary'
                  : 'text-text-muted hover:bg-bg-elevated/90 hover:text-text-primary'
              }
            `}
          >
            <Icon
              className={`flex-shrink-0 transition-colors duration-150 ease-out ${
                active ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-secondary'
              }`}
              size={18}
              aria-hidden
            />

            <AnimatePresence>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className={`text-sm truncate ${active ? 'font-medium' : 'font-normal'}`}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {active && (
              <motion.div
                layoutId={
                  variant === 'sidebar' ? 'active-indicator-sidebar' : 'active-indicator-drawer'
                }
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-accent-blue"
                transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              />
            )}
          </button>
        );

        if (variant === 'sidebar' && collapsed) {
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{navButton}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <div key={item.id}>
            {navButton}
          </div>
        );
      })}
    </nav>
  );
}

type AccountFooterProps = {
  variant: 'sidebar' | 'drawer';
  /** Drawer-only: card-style block under “Account” */
  groupedSurface?: boolean;
  collapsed?: boolean;
  workspaceIdentity?: {
    users: User[];
    currentUserId: string;
    onChange: (userId: string) => void;
    sessionEmail?: string | null;
    hideRosterPicker?: boolean;
    onSignOut?: () => void | Promise<void>;
  };
};

/** Shared roster picker + account actions — sidebar rail or full drawer. */
export function WorkspaceAccountFooter({
  variant,
  groupedSurface = false,
  collapsed = false,
  workspaceIdentity,
}: AccountFooterProps) {
  const sidebarSignOut = workspaceIdentity?.onSignOut;

  const identitySection =
    workspaceIdentity && workspaceIdentity.users.length > 0 ? (
      variant === 'sidebar' && collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <CurrentUserSelect
                users={workspaceIdentity.users}
                value={workspaceIdentity.currentUserId}
                onChange={workspaceIdentity.onChange}
                compact
                sessionEmail={workspaceIdentity.sessionEmail ?? undefined}
                hidePicker={workspaceIdentity.hideRosterPicker}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {workspaceIdentity.sessionEmail && workspaceIdentity.hideRosterPicker
              ? 'Signed in: '
              : 'Acting as: '}
            {workspaceIdentity.users.find((u) => u.id === workspaceIdentity.currentUserId)?.name ??
              'Member'}
          </TooltipContent>
        </Tooltip>
      ) : (
        <CurrentUserSelect
          users={workspaceIdentity.users}
          value={workspaceIdentity.currentUserId}
          onChange={workspaceIdentity.onChange}
          sessionEmail={workspaceIdentity.sessionEmail ?? undefined}
          hidePicker={workspaceIdentity.hideRosterPicker}
        />
      )
    ) : null;

  const authActions =
    sidebarSignOut ? (
      variant === 'sidebar' && collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => void sidebarSignOut()}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
            >
              <LogOut className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Sign out
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          type="button"
          onClick={() => void sidebarSignOut()}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
        >
          <LogOut className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
          <span className="truncate text-sm font-normal">Sign out</span>
        </button>
      )
    ) : variant === 'sidebar' && collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/login"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
          >
            <LogIn className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Sign in (preview)
        </TooltipContent>
      </Tooltip>
    ) : (
      <Link
        to="/login"
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
      >
        <LogIn className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
        <span className="truncate text-sm font-normal">Sign in</span>
      </Link>
    );

  const settingsRow =
    variant === 'sidebar' && collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
          >
            <Settings className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Settings
        </TooltipContent>
      </Tooltip>
    ) : (
      <button
        type="button"
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated/90 hover:text-text-primary"
      >
        <Settings className="flex-shrink-0 text-text-muted group-hover:text-text-secondary" size={18} />
        <span className="truncate text-sm font-normal">Settings</span>
      </button>
    );

  if (variant === 'drawer' && groupedSurface) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out dark:shadow-none">
        {identitySection ? <div className="border-b border-border-subtle p-3">{identitySection}</div> : null}
        <div className="space-y-0.5 p-1.5">
          {authActions}
          {settingsRow}
        </div>
      </div>
    );
  }

  return (
    <>
      {workspaceIdentity && workspaceIdentity.users.length > 0 ? (
        <div className="flex-shrink-0 border-t border-border-subtle p-3">{identitySection}</div>
      ) : null}

      <div className="flex-shrink-0 space-y-1 border-t border-border-subtle p-3">
        {authActions}
        {settingsRow}
      </div>
    </>
  );
}
