/**
 * Phase 1A: switch between local mock data and Convex read-only workspace snapshot.
 * Default remains mock unless `VITE_DEAL_DATA_SOURCE=convex` and `VITE_CONVEX_URL` are set.
 */
export type DealDataSourceMode = 'mock' | 'convex';

/** Ref-counted: `/demo` mock workspace — must not call Convex (no provider on that subtree). */
let isolatedDemoWorkspaceDepth = 0;

export function beginIsolatedDemoWorkspace(): void {
  isolatedDemoWorkspaceDepth += 1;
}

export function endIsolatedDemoWorkspace(): void {
  isolatedDemoWorkspaceDepth = Math.max(0, isolatedDemoWorkspaceDepth - 1);
}

export function isIsolatedDemoWorkspace(): boolean {
  return isolatedDemoWorkspaceDepth > 0;
}

/** Browser URL under public `/demo/*` — defense in depth if isolated ref-count ever regresses. */
export function isPublicDemoUrlPath(): boolean {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return p === '/demo' || p.startsWith('/demo/');
}

/** Use for demo-only placeholders (shared links, builder) — isolated subtree or `/demo/*` URL. */
export function isDemoRoutesIsolationActive(): boolean {
  return isIsolatedDemoWorkspace() || isPublicDemoUrlPath();
}

export function getDealDataSourceMode(): DealDataSourceMode {
  const raw = import.meta.env.VITE_DEAL_DATA_SOURCE;
  if (raw === 'convex') {
    if (!import.meta.env.VITE_CONVEX_URL) {
      console.warn(
        '[TransactQ] VITE_DEAL_DATA_SOURCE=convex requires VITE_CONVEX_URL — using mock data.',
      );
      return 'mock';
    }
    return 'convex';
  }
  return 'mock';
}

export function shouldUseConvexWorkspaceReads(): boolean {
  if (isIsolatedDemoWorkspace()) return false;
  if (isPublicDemoUrlPath()) return false;
  return getDealDataSourceMode() === 'convex';
}

/** True in Convex mode for Deal Detail and other UIs that still gate non-persisted edits. */
export function isWorkspaceReadOnly(): boolean {
  return shouldUseConvexWorkspaceReads();
}

/** Shown when template apply is disabled (e.g. gated feature flag). Convex template apply uses `templateApply.applyTemplateToDeal`. */
export const TEMPLATE_APPLY_PHASE2_HINT =
  'Applying templates to deals is not available in this configuration.';
