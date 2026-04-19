import { Menu, X } from 'lucide-react';
import transactqLogo from '../../../imports/logo.svg';
import { ThemeMenu } from '../theme/ThemeMenu';

type AppChromeHeaderProps = {
  /** Narrow viewports: opens the full navigation drawer */
  menuOpen: boolean;
  onMenuToggle: () => void;
};

/**
 * Top chrome for tablet/phone — complements persistent desktop sidebar (`lg+`).
 */
export function AppChromeHeader({ menuOpen, onMenuToggle }: AppChromeHeaderProps) {
  return (
    <header className="grid h-14 shrink-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center border-b border-border-subtle bg-bg-surface px-2 transition-[background-color,border-color] duration-150 ease-out sm:px-3 lg:hidden">
      <button
        type="button"
        onClick={onMenuToggle}
        className="touch-manipulation justify-self-start rounded-lg p-2 text-text-secondary transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
        aria-expanded={menuOpen}
        aria-controls="workspace-nav-drawer"
        aria-label={menuOpen ? 'Close menu' : 'Open workspace and account menu'}
      >
        {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
      </button>
      <div className="flex min-w-0 items-center justify-center gap-2 px-1">
        <img src={transactqLogo} alt="" className="h-8 w-8 shrink-0 object-contain" />
        <span className="truncate font-semibold tracking-tight text-text-primary">TransactQ</span>
      </div>
      <div className="justify-self-end pr-0.5">
        <ThemeMenu />
      </div>
    </header>
  );
}
