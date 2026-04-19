import { TemplateTask } from '../../../types/template';
import { GripVertical, Trash2, Calendar } from 'lucide-react';
import { formatRelativeClosingDue } from './formatRelativeClosingDue';

interface TaskRowProps {
  task: TemplateTask;
  onClick: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

export function TaskRow({ task, onClick, onDelete, isSelected }: TaskRowProps) {
  const dueSummary = formatRelativeClosingDue(task.daysFromClosing);

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-accent-blue bg-accent-blue-soft shadow-sm'
          : 'border-border-subtle bg-bg-surface hover:border-input-border hover:shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary transition-colors">
        <GripVertical size={16} />
      </div>

      {/* Checkbox */}
      <div className="w-4 h-4 rounded border-2 border-input-border flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {task.name}
        </div>
      </div>

      {/* Relative due (aligned with inspector copy) */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-elevated/40 rounded text-xs text-text-secondary flex-shrink-0 whitespace-nowrap">
        <Calendar size={12} className="flex-shrink-0" />
        <span>{dueSummary}</span>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-accent-red-soft text-text-muted hover:text-accent-red rounded transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
