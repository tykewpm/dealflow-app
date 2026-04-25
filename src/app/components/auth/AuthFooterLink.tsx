import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../ui/utils';

type LinkProps = ComponentProps<typeof Link>;

export function AuthFooterLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        'font-medium text-accent-blue underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30',
        className,
      )}
      {...props}
    />
  );
}
