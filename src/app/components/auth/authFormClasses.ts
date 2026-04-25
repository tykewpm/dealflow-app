/** Control only (no top margin) — use inside a `relative mt-1` wrapper for password + reveal. */
const authControlClass =
  'w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary shadow-none transition-[border-color,box-shadow] placeholder:text-text-muted focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-60';

/** Shared field styles — rounded-xl, calm borders, visible focus rings. */
export const authInputClass = `mt-1 ${authControlClass}`;

/** Password input with room for the reveal button on the right. */
export const authPasswordControlClass = `${authControlClass} pr-10`;

export const authLabelClass = 'text-sm font-medium text-text-primary';
