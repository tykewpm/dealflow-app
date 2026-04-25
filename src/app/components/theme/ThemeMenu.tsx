import { useEffect, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../ui/utils';

const triggerBase =
  'w-[215px] rounded-lg p-2 text-text-muted outline-none transition-[color,background-color,border-color] duration-150 ease-out hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25';

export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = (mounted ? resolvedTheme : 'light') as 'light' | 'dark';
  const TriggerIcon = resolved === 'dark' ? Moon : Sun;

  const pick = (next: 'light' | 'dark' | 'system') => {
    setTheme(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label="Theme"
        className={cn(triggerBase, className)}
      >
        {!mounted ? (
          <Monitor className="size-[18px]" aria-hidden />
        ) : (
          <TriggerIcon className="size-[18px]" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10.5rem] dark:shadow-none">
        <DropdownMenuItem
          onClick={() => pick('light')}
          className="gap-2"
        >
          <Sun className="size-4 text-text-muted" aria-hidden />
          <span>Light</span>
          {theme === 'light' ? (
            <Check className="ml-auto size-4 shrink-0 text-accent-blue" aria-hidden />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => pick('dark')}
          className="gap-2"
        >
          <Moon className="size-4 text-text-muted" aria-hidden />
          <span>Dark</span>
          {theme === 'dark' ? (
            <Check className="ml-auto size-4 shrink-0 text-accent-blue" aria-hidden />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => pick('system')}
          className="gap-2"
        >
          <Monitor className="size-4 text-text-muted" aria-hidden />
          <span>System</span>
          {theme === 'system' ? (
            <Check className="ml-auto size-4 shrink-0 text-accent-blue" aria-hidden />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
