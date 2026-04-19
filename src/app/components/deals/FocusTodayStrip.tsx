import { Sparkles } from 'lucide-react';
import type { FocusInsight } from '../../utils/workspaceInsights';

interface FocusTodayStripProps {
  insights: FocusInsight[];
  /** Label beside the sparkle (default: Focus today). */
  heading?: string;
  /** Section accessible name (defaults to `heading`). */
  ariaLabel?: string;
  /** Extra classes on the outer section (default includes mb-6). */
  className?: string;
}

/**
 * Calm cross-deal insight surface — Linear-style, not analytics cards.
 * Dashboard uses default heading; Transactions passes a different `heading`.
 */
export function FocusTodayStrip({
  insights,
  heading = 'Focus today',
  ariaLabel,
  className = 'mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 sm:px-5 sm:py-4',
}: FocusTodayStripProps) {
  if (insights.length === 0) return null;

  return (
    <section aria-label={ariaLabel ?? heading} className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" strokeWidth={1.75} aria-hidden />
          <span className="text-xs font-medium text-muted-foreground">{heading}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          {insights.map((insight) => (
            <p key={insight.id} className="leading-snug">
              <span className="font-semibold text-foreground">
                {insight.count} {insight.count === 1 ? 'deal' : 'deals'} {insight.label}
              </span>
              <span className="text-muted-foreground"> — {insight.action}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
