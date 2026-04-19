import { TemplateTask, TemplateDocument, TemplateStage } from '../../../types/template';
import { CheckSquare, FileText, Calendar, PenTool, X } from 'lucide-react';
import { formatRelativeClosingDue } from './formatRelativeClosingDue';

type EditableItem =
  | { type: 'task'; item: TemplateTask; stage: string }
  | { type: 'document'; item: TemplateDocument; stage: string }
  | null;

interface InspectorPanelProps {
  selectedItem: EditableItem;
  stageOptions: { id: TemplateStage; label: string }[];
  onStageChange: (nextStage: TemplateStage) => void;
  onUpdateTask: (updates: Partial<TemplateTask>) => void;
  onUpdateDocument: (updates: Partial<TemplateDocument>) => void;
  onClose: () => void;
}

export function InspectorPanel({
  selectedItem,
  stageOptions,
  onStageChange,
  onUpdateTask,
  onUpdateDocument,
  onClose,
}: InspectorPanelProps) {
  if (!selectedItem) {
    return (
      <div className="bg-bg-surface border-2 border-border-subtle rounded-lg p-8 text-center">
        <div className="text-text-disabled mb-3">
          <CheckSquare className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="font-medium text-text-primary mb-1">No Item Selected</h3>
        <p className="text-sm text-text-muted">
          Click on a task or document to edit its properties
        </p>
      </div>
    );
  }

  const isTask = selectedItem.type === 'task';
  const task = isTask ? (selectedItem.item as TemplateTask) : null;
  const document = !isTask ? (selectedItem.item as TemplateDocument) : null;

  return (
    <div className="bg-bg-surface border-2 border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-border-subtle bg-bg-app">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTask ? (
              <>
                <CheckSquare className="text-accent-blue" size={18} />
                <h3 className="font-semibold text-text-primary">Task Settings</h3>
              </>
            ) : (
              <>
                <FileText className="text-accent-blue" size={18} />
                <h3 className="font-semibold text-text-primary">Document Settings</h3>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-elevated/60 rounded transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Stage</label>
          <select
            value={selectedItem.stage}
            onChange={(e) => onStageChange(e.target.value as TemplateStage)}
            className="w-full px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm bg-bg-surface"
          >
            {stageOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Task Settings */}
        {isTask && task && (
          <>
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={task.name}
                onChange={(e) => onUpdateTask({ name: e.target.value })}
                className="w-full px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm"
                placeholder="Enter task name"
              />
            </div>

            {/* Relative Due Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Due Date (Relative to Closing)</span>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Math.abs(task.daysFromClosing)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const multiplier = task.daysFromClosing < 0 ? -1 : 1;
                    onUpdateTask({ daysFromClosing: value * multiplier });
                  }}
                  className="flex-1 px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm"
                  min="0"
                />
                <select
                  value={task.daysFromClosing < 0 ? 'before' : 'after'}
                  onChange={(e) => {
                    const multiplier = e.target.value === 'before' ? -1 : 1;
                    onUpdateTask({ daysFromClosing: Math.abs(task.daysFromClosing) * multiplier });
                  }}
                  className="px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 text-sm bg-bg-surface"
                >
                  <option value="before">days before</option>
                  <option value="after">days after</option>
                </select>
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                Due {formatRelativeClosingDue(task.daysFromClosing).toLowerCase()}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={task.description ?? ''}
                onChange={(e) =>
                  onUpdateTask({
                    description: e.target.value.trim() === '' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm resize-none"
                placeholder="Add task description or notes..."
              />
            </div>
          </>
        )}

        {/* Document Settings */}
        {!isTask && document && (
          <>
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Document Name
              </label>
              <input
                type="text"
                value={document.name}
                onChange={(e) => onUpdateDocument({ name: e.target.value })}
                className="w-full px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm"
                placeholder="Enter document name"
              />
            </div>

            {/* Signature Required */}
            <div>
              <label className="flex items-start gap-3 p-3 border-2 border-border-subtle rounded-lg cursor-pointer hover:bg-bg-app transition-colors">
                <input
                  type="checkbox"
                  checked={document.signatureRequired}
                  onChange={(e) => onUpdateDocument({ signatureRequired: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-input-border text-accent-blue focus:ring-accent-blue/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <PenTool className="text-accent-blue" size={14} />
                    <span className="text-sm font-medium text-text-primary">Signature Required</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    This document requires signatures from parties
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Notes (Optional)
              </label>
              <textarea
                rows={4}
                value={document.notes ?? ''}
                onChange={(e) =>
                  onUpdateDocument({
                    notes: e.target.value.trim() === '' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-sm resize-none"
                placeholder="Add document notes, instructions, or requirements..."
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
