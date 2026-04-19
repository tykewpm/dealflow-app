import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { getDealDataSourceMode } from '../app/dealDataSource';

function isDemoPath(pathname: string): boolean {
  return pathname === '/demo' || pathname.startsWith('/demo/');
}

/**
 * Keeps `/demo/*` outside Convex Auth (and outside Convex React) so the mock workspace never
 * subscribes to the backend.
 *
 * In `VITE_DEAL_DATA_SOURCE=mock`, skip Convex Auth entirely — use `ConvexProvider` only so
 * hooks like `useQuery(..., 'skip')` still work when `VITE_CONVEX_URL` is set. Auth routes are
 * not rendered in mock mode (`App.tsx`).
 */
export function ConvexGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  if (!client || isDemoPath(location.pathname)) {
    return <>{children}</>;
  }

  const mode = getDealDataSourceMode();

  if (mode === 'mock') {
    return <ConvexProvider client={client}>{children}</ConvexProvider>;
  }

  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}
