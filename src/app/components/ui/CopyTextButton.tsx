import { useState } from 'react';

interface CopyTextButtonProps {
  text: string;
  label: string;
  /** Shown briefly after a successful copy. */
  copiedLabel?: string;
  className?: string;
}

export function CopyTextButton({
  text,
  label,
  copiedLabel = 'Copied',
  className = 'rounded-md border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-primary shadow-sm transition-colors hover:border-border-strong hover:bg-bg-elevated/50 dark:shadow-none',
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          },
          () => {
            window.alert('Could not copy to clipboard.');
          },
        );
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
