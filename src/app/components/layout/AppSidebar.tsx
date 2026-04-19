import { AnimatePresence, motion } from 'motion/react';
import type { User } from '../../types';
import { WorkspaceNavList, WorkspaceAccountFooter } from './WorkspaceNavList';
import { ThemeMenu } from '../theme/ThemeMenu';
import transactqLogo from '../../../imports/logo.svg';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  workspaceIdentity?: {
    users: User[];
    currentUserId: string;
    onChange: (userId: string) => void;
    sessionEmail?: string | null;
    hideRosterPicker?: boolean;
    onSignOut?: () => void | Promise<void>;
  };
}

/** Persistent left rail — visible from `lg` breakpoint ({@link AppShell}). */
export function AppSidebar({ isCollapsed, onToggle, workspaceIdentity }: AppSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? '72px' : '240px',
      }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative z-10 flex h-screen flex-col border-r border-border-subtle bg-bg-surface transition-[background-color,border-color] duration-150 ease-out"
    >
      <div className="flex h-16 flex-shrink-0 items-center justify-center border-b border-border-subtle px-4 transition-colors duration-150 ease-out">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 flex items-center justify-center"
            >
              <img src={transactqLogo} alt="" className="w-full h-full object-contain" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img src={transactqLogo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-text-primary">TransactQ</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WorkspaceNavList variant="sidebar" collapsed={isCollapsed} />

      <WorkspaceAccountFooter
        variant="sidebar"
        collapsed={isCollapsed}
        workspaceIdentity={workspaceIdentity}
      />

      <div className="flex flex-shrink-0 items-center justify-end border-t border-border-subtle px-2 py-2">
        <ThemeMenu />
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color,color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated dark:shadow-none"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={13} className="text-text-muted" />
        ) : (
          <ChevronLeft size={13} className="text-text-muted" />
        )}
      </button>
    </motion.aside>
  );
}
