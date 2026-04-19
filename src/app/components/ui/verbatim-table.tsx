/**
 * Thin, parity-first `<table>` / `<tbody>` wrappers only.
 * Not related to components/ui/table.tsx — use these when preserving exact Tailwind strings matters.
 */

import type { ComponentProps } from 'react';

import { cn } from './utils';

export function ParityTable({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('w-full', className)} {...props} />;
}

export function ParityTbody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody className={cn('divide-y divide-border-subtle', className)} {...props} />
  );
}
