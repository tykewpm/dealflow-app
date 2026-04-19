interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  /** Tighter track for dense summary bars (Deal Detail sticky strip). */
  dense?: boolean;
}

export function ProgressBar({ progress, showLabel = true, dense = false }: ProgressBarProps) {
  const track = dense ? 'h-1.5' : 'h-2';
  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between ${dense ? 'mb-0.5' : 'mb-1'}`}>
          <span className={`font-medium text-text-secondary ${dense ? 'text-xs' : 'text-sm'}`}>
            {progress}% Complete
          </span>
        </div>
      )}
      <div className={`w-full rounded-full bg-border-subtle/80 dark:bg-bg-elevated ${track}`}>
        <div
          className={`rounded-full bg-accent-blue transition-[width] duration-500 ease-out motion-reduce:duration-150 dark:bg-accent-blue ${track}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
