import { useState, useRef, useEffect } from 'react';
import { Message, User } from '../../types';
import { ChatMessage } from './ChatMessage';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

interface ChatPanelProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  readOnly?: boolean;
  /** Merged onto the root element (e.g. responsive borders when stacked below the work pane). */
  className?: string;
}

export function ChatPanel({
  messages,
  users,
  currentUserId,
  onSendMessage,
  readOnly = false,
  className,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const getUserById = (userId: string): User => {
    return users.find(u => u.id === userId) || { id: userId, name: 'Unknown', email: '' };
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-l border-border-subtle bg-gradient-to-b from-bg-app/95 via-bg-surface to-bg-surface dark:from-bg-surface dark:via-bg-surface dark:to-bg-elevated/30',
        className,
      )}
    >
      {/* Chat Header */}
      <div className="h-[70px] flex-shrink-0 border-b border-border-subtle bg-bg-surface/90 px-4 py-3 backdrop-blur-[2px] transition-[background-color,border-color] duration-150 ease-out dark:bg-bg-elevated/60 sm:px-5">
        <h2 className="text-sm font-semibold tracking-tight text-text-primary">Deal Chat</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 sm:px-5">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-subtle bg-bg-elevated/40 py-8 text-center transition-colors duration-150 dark:bg-bg-elevated/25">
              <div className="mb-2 text-text-muted">
                <svg className="mx-auto h-10 w-10 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">No messages yet</p>
              <p className="mt-1 text-xs text-text-muted">Messages you send stay on this deal for your team.</p>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                sender={getUserById(message.senderId)}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-border-subtle bg-bg-surface/90 px-4 py-3 backdrop-blur-[2px] transition-[background-color,border-color] duration-150 ease-out dark:bg-bg-elevated/50 sm:px-5">
        <form onSubmit={handleSubmit}>
          <div
            className={`flex gap-2 rounded-lg border border-border-subtle bg-input-bg p-1 shadow-sm transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-[color:var(--input-focus-ring)] dark:shadow-none ${
              readOnly ? 'opacity-90' : ''
            }`}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={readOnly ? 'Read-only — chat is not saved to the server yet' : 'Type a message...'}
              disabled={readOnly}
              title={readOnly ? 'Messages are disabled while Convex workspace is read-only' : undefined}
              className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 disabled:text-text-disabled"
            />
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={readOnly || !newMessage.trim()}
              title={readOnly ? 'Messages are disabled while Convex workspace is read-only' : undefined}
              className="shrink-0"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
