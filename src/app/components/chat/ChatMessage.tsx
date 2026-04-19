import { Message, User } from '../../types';

interface ChatMessageProps {
  message: Message;
  sender: User;
}

export function ChatMessage({ message, sender }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="group">
      <div className="-mx-1 flex items-start gap-2.5 rounded-md px-1 py-1 transition-colors duration-150 ease-out group-hover:bg-bg-elevated/50">
        {/* Avatar */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue text-xs font-medium text-white">
          {sender.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        {/* Message Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-text-primary">{sender.name}</span>
            <span className="text-[11px] text-text-muted">
              {formatMessageDate(message.createdAt)} at {formatTime(message.createdAt)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-snug text-text-secondary">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
