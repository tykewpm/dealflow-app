import { X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DrillDownDeal } from '../../types/report';
import { Button } from '../ui/button';

interface DrillDownModalProps {
  title: string;
  deals: DrillDownDeal[];
  onClose: () => void;
}

export function DrillDownModal({ title, deals, onClose }: DrillDownModalProps) {
  const statusConfig = {
    'on-track': {
      icon: CheckCircle2,
      color: 'text-accent-green',
      bg: 'bg-accent-green-soft',
      border: 'border-border-subtle',
    },
    'needs-attention': {
      icon: AlertCircle,
      color: 'text-accent-amber',
      bg: 'bg-accent-amber-soft',
      border: 'border-border-subtle',
    },
    'at-risk': {
      icon: AlertTriangle,
      color: 'text-accent-red',
      bg: 'bg-accent-red-soft',
      border: 'border-border-subtle',
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] dark:bg-bg-app/80"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute left-1/2 top-1/2 flex w-[min(100vw-2rem,56rem)] max-h-[min(90dvh,800px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-xl dark:shadow-none"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border-subtle bg-bg-elevated px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 pr-2">
              <h2 className="font-semibold text-text-primary">{title}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary touch-manipulation"
              aria-label="Close"
            >
              <X size={20} className="text-current" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            {deals.length > 0 ? (
              <div className="space-y-3">
                {deals.map((deal) => {
                  const status = statusConfig[deal.status];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={deal.id}
                      className="rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-border-strong"
                    >
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <h4 className="mb-1 font-medium text-text-primary">
                            {deal.address}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
                            <span>{deal.stage}</span>
                            <span className="hidden text-text-disabled sm:inline">•</span>
                            <span className="text-text-muted">
                              {deal.daysInStage} days in stage
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex shrink-0 items-center gap-1.5 self-start rounded border px-2.5 py-1 sm:self-auto ${status.bg} ${status.border}`}
                        >
                          <StatusIcon size={14} className={status.color} />
                          <span className={`text-xs font-medium capitalize ${status.color}`}>
                            {deal.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-border-subtle pt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 text-sm text-text-primary">
                          <span className="font-medium">Next:</span>{' '}
                          <span className="break-words">{deal.nextAction}</span>
                        </div>
                        <div className="shrink-0 text-xs text-text-muted">Closes: {deal.closingDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-text-muted">No deals found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-border-subtle bg-bg-app px-4 py-4 dark:bg-bg-surface/50 sm:px-6">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
