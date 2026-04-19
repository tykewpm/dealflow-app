import { TransactionTemplate, TemplateCategory, TemplateStage } from '../../types/template';
import {
  Eye,
  Edit,
  Zap,
  CheckSquare,
  FileText,
  PenTool,
  TrendingUp,
  Share2,
  MoreHorizontal,
  Copy,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

type TemplateOrigin = 'built-in' | 'custom';

interface TemplateCardProps {
  template: TransactionTemplate;
  origin: TemplateOrigin;
  onPreview: () => void;
  onEdit: () => void;
  onApply: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  /** Only for custom templates; omit or no-op for built-in. */
  onDelete?: () => void;
  applyDisabled?: boolean;
  applyDisabledTitle?: string;
}

export function TemplateCard({
  template,
  origin,
  onPreview,
  onEdit,
  onApply,
  onShare,
  onDuplicate,
  onDelete,
  applyDisabled = false,
  applyDisabledTitle,
}: TemplateCardProps) {
  const categoryConfig: Record<TemplateCategory, { label: string; color: string }> = {
    'buyer-rep': {
      label: 'Buyer Rep',
      color: 'border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary',
    },
    'seller-rep': {
      label: 'Seller Rep',
      color: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
    'dual-rep': {
      label: 'Dual Rep',
      color: 'border-border-subtle bg-bg-elevated/80 text-text-secondary dark:text-text-primary',
    },
    commercial: {
      label: 'Commercial',
      color: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
  };

  const stageConfig: Record<TemplateStage, { label: string; color: string }> = {
    'under-contract': {
      label: 'Under Contract',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    'due-diligence': {
      label: 'Due Diligence',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    financing: {
      label: 'Financing',
      color: 'border-border-subtle bg-bg-elevated/70 text-text-secondary dark:text-text-primary',
    },
    'pre-closing': {
      label: 'Pre-Closing',
      color: 'border-border-subtle bg-accent-amber-soft text-accent-amber dark:text-text-primary',
    },
    closing: {
      label: 'Closing',
      color: 'border-border-subtle bg-accent-green-soft text-accent-green dark:text-text-primary',
    },
  };

  const signatureSteps = template.documents.filter(d => d.signatureRequired).length;

  return (
    <div className="min-w-0 w-full overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-strong dark:shadow-none">
      {/* Header */}
      <div className="border-b border-border-subtle p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <h3 className="min-w-0 flex-1 line-clamp-2 font-semibold text-text-primary sm:line-clamp-1">
            {template.name}
          </h3>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-start">
            <span
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                origin === 'built-in'
                  ? 'border-border-subtle bg-bg-elevated/70 text-text-secondary'
                  : 'border-border-subtle bg-accent-blue-soft text-accent-blue dark:text-text-primary'
              }`}
            >
              {origin === 'built-in' ? 'Built-in' : 'Custom'}
            </span>
            <span
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${categoryConfig[template.category].color}`}
            >
              {categoryConfig[template.category].label}
            </span>
          </div>
        </div>
        <p className="line-clamp-2 min-h-[40px] text-sm text-text-secondary">
          {template.description}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="border-b border-border-subtle bg-bg-app px-4 py-4 dark:bg-bg-elevated/20 sm:px-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckSquare className="text-text-muted" size={14} />
              <span className="text-sm font-semibold text-text-primary">{template.tasks.length}</span>
            </div>
            <div className="text-xs text-text-muted">Tasks</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="text-text-muted" size={14} />
              <span className="text-sm font-semibold text-text-primary">{template.documents.length}</span>
            </div>
            <div className="text-xs text-text-muted">Documents</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="text-text-muted" size={14} />
              <span className="text-sm font-semibold text-text-primary">{template.usageCount}</span>
            </div>
            <div className="text-xs text-text-muted">Used</div>
          </div>
        </div>
      </div>

      {/* Stage Tags */}
      <div className="border-b border-border-subtle px-4 py-4 sm:px-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Stages
        </div>
        <div className="flex flex-wrap gap-2">
          {template.stages.map(stage => (
            <span
              key={stage}
              className={`rounded border px-2 py-1 text-xs font-medium ${stageConfig[stage].color}`}
            >
              {stageConfig[stage].label}
            </span>
          ))}
        </div>
      </div>

      {/* Includes Section */}
      <div className="border-b border-border-subtle px-4 py-4 sm:px-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Includes
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckSquare className="text-accent-blue" size={14} />
            <span>{template.tasks.length} workflow tasks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <FileText className="text-text-muted" size={14} />
            <span>{template.documents.length} required documents</span>
          </div>
          {signatureSteps > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <PenTool className="text-accent-green" size={14} />
              <span>{signatureSteps} signature {signatureSteps === 1 ? 'step' : 'steps'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-border-subtle bg-bg-app p-4 dark:bg-bg-elevated/20 sm:flex-row">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-secondary transition-[background-color,border-color,color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/50 hover:text-text-primary"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem] dark:shadow-none">
            <DropdownMenuItem onSelect={() => onPreview()}>
              <Eye className="size-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit()}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShare()}>
              <Share2 className="size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate()}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            {origin === 'custom' && onDelete ? (
              <DropdownMenuItem
                onSelect={() => onDelete()}
                className="text-accent-red focus:bg-accent-red-soft focus:text-accent-red data-[highlighted]:bg-accent-red-soft data-[highlighted]:text-accent-red"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="accent"
          onClick={onApply}
          disabled={applyDisabled}
          title={applyDisabled ? applyDisabledTitle : undefined}
          className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2"
        >
          <Zap size={14} />
          <span className="truncate">Apply to Transaction</span>
        </Button>
      </div>
    </div>
  );
}
