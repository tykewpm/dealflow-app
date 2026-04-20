import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import transactqLogo from '../../../imports/logo.svg';

/**
 * Public auth shell — no sidebar. Main app stays at `/*` behind the authenticated-style workspace layout.
 * Pass `children` for flat top-level routes, or use nested `<Route>` children with `<Outlet />`.
 */
export function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-app">
      <header className="flex justify-center border-b border-border-subtle bg-bg-surface/90 px-6 py-5 backdrop-blur-[2px] dark:bg-bg-surface/80">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-text-primary">
          <img src={transactqLogo} alt="" className="h-9 w-auto" />
          TransactQ
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-border-subtle bg-bg-surface/90 px-4 py-4 text-center text-sm dark:bg-bg-surface/80">
        <Link to="/demo" className="font-medium text-accent-blue hover:underline">
          Open demo workspace
        </Link>
        <span className="mx-2 text-text-disabled">·</span>
        <span className="text-text-muted">
          {import.meta.env.VITE_CONVEX_URL
            ? 'Password sign-in uses Convex Auth for this deployment.'
            : 'Authentication is not connected yet.'}
        </span>
      </footer>
    </div>
  );
}
