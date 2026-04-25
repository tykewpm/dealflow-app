import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import transactqLogo from '../../../imports/logo.svg';
import { AuthShell } from './AuthShell';

/**
 * Public auth shell — no sidebar. Main app stays at `/*` behind the authenticated-style workspace layout.
 * Pass `children` for flat top-level routes, or use nested `<Route>` children with `<Outlet />`.
 */
export function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-app text-text-primary">
      <header className="flex justify-center border-b border-border-subtle bg-bg-surface/95 px-6 py-5 backdrop-blur-sm dark:bg-bg-surface/90">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25"
        >
          <img src={transactqLogo} alt="" className="h-9 w-auto" />
          TransactQ
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        <AuthShell>{children ?? <Outlet />}</AuthShell>
      </main>

      <footer className="border-t border-border-subtle bg-bg-surface/95 px-4 py-4 text-center text-sm text-text-muted backdrop-blur-sm dark:bg-bg-surface/90">
        <AuthShell>
          <p className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
            <Link
              to="/demo"
              className="font-medium text-accent-blue underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25"
            >
              Open demo workspace
            </Link>
            <span className="text-text-disabled" aria-hidden>
              ·
            </span>
            <span>
              {import.meta.env.VITE_CONVEX_URL
                ? 'Password sign-in uses Convex Auth for this deployment.'
                : 'Authentication is not connected yet.'}
            </span>
          </p>
        </AuthShell>
      </footer>
    </div>
  );
}
