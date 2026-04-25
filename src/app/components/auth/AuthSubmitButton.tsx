import { Loader2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

type Props = Omit<ComponentProps<typeof Button>, 'children'> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel: string;
};

export function AuthSubmitButton({
  loading = false,
  loadingLabel,
  children,
  className,
  disabled,
  type = 'submit',
  variant = 'accent',
  ...rest
}: Props) {
  return (
    <Button
      type={type}
      variant={variant}
      disabled={disabled || loading}
      className={cn('min-h-10 w-full gap-2 px-4', className)}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
