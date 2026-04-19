import { Gauge, Sparkles } from 'lucide-react';
import type { DealIntelligence, DealIntelligenceSignalLevel } from '../../utils/dealIntelligence';
import { cn } from '../ui/utils';

const signalClass: Record<DealIntelligenceSignalLevel, string> = {
  risk: 'border-border-subtle bg-accent-red-soft text-accent-red',
  watch: 'border-border-subtle bg-accent-amber-soft text-accent-amber',
  info: 'border-border-subtle bg-bg-elevated/70 text-text-secondary',
};

interface DealOperatorBriefProps {
  intelligence: DealIntelligence;
}

/**
 * Operator-style deal brief: headline + short summary + signal chips.
 * Not a chat surface — deterministic Phase-1 rules with an LLM-ready data shape.
 */
export function DealOperatorBrief({ intelligence }: DealOperatorBriefProps) {
  return (
    <section
      aria-labelledby="deal-operator-brief-heading"
      aria-describedby="deal-operator-brief-insight-hint"
      className="rounded-lg border border-border-subtle border-l-2 border-l-insight-accent/25 bg-bg-surface/90 shadow-sm transition-[box-shadow,border-color] duration-150 ease-out dark:border-l-insight-accent/35 dark:shadow-none"
    >
      <div className="px-3 py-2.5 sm:px-4">
        <div className="flex items-start gap-2.5">
          <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Sparkles
                    className="size-3.5 shrink-0 text-insight-accent/75 dark:text-insight-accent/85"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p
                    id="deal-operator-brief-heading"
                    className="text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Deal brief
                  </p>
                </div>
                <span
                  id="deal-operator-brief-insight-hint"
                  className="text-[10px] font-normal normal-case tracking-normal text-text-muted/70"
                >
                  · Automated insight
                </span>
              </div>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-text-primary">
                {intelligence.operatorHeadline}
              </p>
            </div>
            <ul className="space-y-1 text-xs leading-snug text-text-secondary">
              {intelligence.summaryLines.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-text-muted" aria-hidden>
                    –
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {intelligence.signals.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {intelligence.signals.map((s) => (
                  <span
                    key={s.id}
                    className={cn(
                      'inline-flex max-w-full items-center rounded-md border px-2 py-0.5 text-[11px] font-medium leading-snug',
                      signalClass[s.level],
                    )}
                    title={s.text}
                  >
                    <span className="truncate">{s.text}</span>
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-[10px] leading-snug text-text-muted">
              Updates when tasks, documents, or messages change
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
