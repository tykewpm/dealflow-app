import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';

/** Empty string = app root (`/`); `/demo` = isolated mock workspace under `/demo/*`. */
const WorkspaceLinkBaseContext = createContext('');

export function WorkspaceLinkBaseProvider({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <WorkspaceLinkBaseContext.Provider value={value}>{children}</WorkspaceLinkBaseContext.Provider>
  );
}

/** Pathname with optional `/demo` prefix stripped so nav active rules can use `/`, `/transactions`, etc. */
export function useWorkspacePathname(): string {
  const { pathname } = useLocation();
  const base = useContext(WorkspaceLinkBaseContext);
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return '/';
  if (pathname.startsWith(`${base}/`)) {
    const rest = pathname.slice(base.length);
    return rest.length > 0 ? rest : '/';
  }
  return pathname;
}

/**
 * Navigate within the current workspace URL scope (root or `/demo`).
 * Pass absolute-in-app paths like `/deals/abc`, `/templates`.
 */
export function useWorkspaceGo() {
  const navigate = useNavigate();
  const base = useContext(WorkspaceLinkBaseContext);
  return useCallback(
    (path: string, options?: NavigateOptions) => {
      if (!base) {
        navigate(path, options);
        return;
      }
      const target = path === '/' ? base : `${base}${path}`;
      navigate(target, options);
    },
    [navigate, base],
  );
}

/**
 * Resolve app paths like `/deals/x` or `/` for `<Link to>` when the workspace uses a basename (`/demo`).
 */
export function useWorkspaceRelativeHref(): (path: string) => string {
  const base = useContext(WorkspaceLinkBaseContext);
  return useCallback(
    (path: string) => {
      if (!base) return path;
      return path === '/' ? base : `${base}${path}`;
    },
    [base],
  );
}
