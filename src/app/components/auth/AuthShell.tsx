import type { ReactNode } from 'react';

/** Centers auth content with a stable max width (Linear-like restraint). */
export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[440px]">{children}</div>;
}
