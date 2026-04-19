import { TemplateDocument } from '../../../types/template';
import { GripVertical, Trash2, FileText, PenTool } from 'lucide-react';

interface DocumentRowProps {
  document: TemplateDocument;
  onClick: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

export function DocumentRow({ document, onClick, onDelete, isSelected }: DocumentRowProps) {
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

      {/* Document Icon */}
      <div className="text-accent-blue flex-shrink-0">
        <FileText size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {document.name}
        </div>
      </div>

      {/* Signature Badge */}
      {document.signatureRequired && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-blue-soft text-accent-blue rounded text-xs flex-shrink-0">
          <PenTool size={12} />
          <span>Signature</span>
        </div>
      )}

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
