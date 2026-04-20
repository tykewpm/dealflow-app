import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import type { Message, User } from '../../types';
import { ChatPanel } from '../chat/ChatPanel';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '../ui/drawer';
import { cn } from '../ui/utils';

export interface DealChatMobileDockProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  readOnly: boolean;
  /** Composer text persisted while the sheet is closed. */
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
}

/**
 * Mobile-only: floating chat entry above the bottom nav + bottom sheet with the full thread.
 * Desktop uses inline {@link ChatPanel} in {@link DealDetail}.
 */
export function DealChatMobileDock({
  messages,
  users,
  currentUserId,
  onSendMessage,
  readOnly,
  messageDraft,
  onMessageDraftChange,
}: DealChatMobileDockProps) {
  const [open, setOpen] = useState(false);
  /** Messages at or before this time count as read for badge purposes (others’ messages after = unread). */
  const [lastReadAtMs, setLastReadAtMs] = useState(() => Date.now());

  const composerRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const markAllRead = useCallback(() => {
    const last = messages[messages.length - 1];
    if (last) {
      setLastReadAtMs(new Date(last.createdAt).getTime());
    } else {
      setLastReadAtMs(Date.now());
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    markAllRead();
  }, [open, messages, markAllRead]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      composerRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const unreadCount = useMemo(() => {
    if (open) return 0;
    return messages.filter((m) => {
      if (m.senderId === currentUserId) return false;
      return new Date(m.createdAt).getTime() > lastReadAtMs;
    }).length;
  }, [messages, currentUserId, lastReadAtMs, open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      window.requestAnimationFrame(() => {
        fabRef.current?.focus();
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-end px-4 lg:hidden"
          style={{
            bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px) + 0.5rem)',
          }}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <motion.button
            ref={fabRef}
            type="button"
            layout
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className={cn(
              'pointer-events-auto flex h-14 min-w-14 items-center justify-center rounded-2xl',
              'border border-border-subtle bg-bg-surface/95 text-accent-blue shadow-[0_8px_28px_-8px_rgba(15,23,42,0.25)] backdrop-blur-md',
              'transition-[transform,box-shadow] duration-200 ease-out hover:shadow-[0_12px_32px_-10px_rgba(15,23,42,0.3)] active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/35 dark:bg-bg-elevated/95 dark:shadow-[0_10px_36px_-12px_rgba(0,0,0,0.55)]',
            )}
            onClick={() => setOpen(true)}
            aria-label={unreadCount > 0 ? `Open deal chat, ${unreadCount} unread` : 'Open deal chat'}
          >
            <span className="relative inline-flex">
              <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
              {unreadCount > 0 ? (
                <span
                  className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-blue px-1 text-[10px] font-semibold text-white shadow-sm tabular-nums"
                  aria-hidden
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </span>
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <Drawer open={open} onOpenChange={handleOpenChange} shouldScaleBackground>
        <DrawerContent
          className={cn(
            'mx-auto flex h-[min(82vh,820px)] max-h-[85vh] min-h-0 w-full max-w-lg flex-col gap-0 border-border-subtle bg-bg-elevated p-0',
            'rounded-t-2xl border-x shadow-[0_-12px_48px_-16px_rgba(15,23,42,0.2)] dark:bg-bg-surface dark:shadow-[0_-12px_48px_-20px_rgba(0,0,0,0.45)]',
            '!mt-0',
          )}
        >
          <DrawerTitle className="sr-only">Deal chat</DrawerTitle>
          <DrawerDescription className="sr-only">
            Conversation for this transaction. Drag down or tap outside to close.
          </DrawerDescription>
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel
              messages={messages}
              users={users}
              currentUserId={currentUserId}
              onSendMessage={onSendMessage}
              readOnly={readOnly}
              messageDraft={messageDraft}
              onMessageDraftChange={onMessageDraftChange}
              composerInputRef={composerRef}
              showCloseButton
              onClose={() => handleOpenChange(false)}
              className="border-0 bg-transparent lg:border-l"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
