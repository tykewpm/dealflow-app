import { workspacePrimaryNavItems } from './workspaceNavConfig';
import { useWorkspaceGo, useWorkspacePathname } from '../../context/WorkspaceLinkBaseContext';

/**
 * Fast workflow navigation — primary work areas only, aligned with the five-tile model.
 * Visible below `lg` (with the left rail). The menu drawer holds workspace + account.
 */
export function MobileBottomNav() {
  const go = useWorkspaceGo();
  const pathname = useWorkspacePathname();

  const items = workspacePrimaryNavItems();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-bg-surface/95 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-md transition-[background-color,border-color] duration-150 ease-out supports-[backdrop-filter]:bg-bg-surface/90 dark:shadow-none lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main work areas"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between gap-0.5 px-1.5 pt-1.5">
        {items.map((item) => {
          const active = item.match ? item.match(pathname) : pathname === item.path;
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => go(item.path)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-[color,background-color,border-color] duration-150 ease-out ${
                  active
                    ? 'bg-accent-blue-soft text-accent-blue ring-1 ring-border-strong/80 dark:ring-accent-blue/25'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.25 : 2}
                  className={active ? 'text-accent-blue' : 'text-text-muted'}
                  aria-hidden
                />
                <span className="max-w-[4.5rem] truncate leading-tight">{item.shortLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
