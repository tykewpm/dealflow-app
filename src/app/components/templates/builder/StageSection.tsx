import { TemplateStage, TemplateTask, TemplateDocument } from '../../../types/template';
import { Plus, CheckSquare, FileText } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { DocumentRow } from './DocumentRow';

interface StageSectionProps {
  stage: TemplateStage;
  label: string;
  tasks: TemplateTask[];
  documents: TemplateDocument[];
  onAddTask: () => void;
  onAddDocument: () => void;
  onSelectTask: (task: TemplateTask) => void;
  onSelectDocument: (doc: TemplateDocument) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteDocument: (docId: string) => void;
  selectedItemId?: string;
}

const stageColors: Record<TemplateStage, string> = {
  'under-contract': 'border-border-subtle bg-accent-blue-soft',
  'due-diligence': 'border-border-subtle bg-accent-green-soft',
  'financing': 'border-border-subtle bg-accent-amber-soft',
  'pre-closing': 'border-border-subtle bg-bg-elevated/50',
  'closing': 'border-border-subtle bg-accent-green-soft',
};

export function StageSection({
  stage,
  label,
  tasks,
  documents,
  onAddTask,
  onAddDocument,
  onSelectTask,
  onSelectDocument,
  onDeleteTask,
  onDeleteDocument,
  selectedItemId,
}: StageSectionProps) {
  return (
    <div className="bg-bg-surface border-2 border-border-subtle rounded-lg overflow-hidden">
      {/* Stage Header */}
      <div className={`px-5 py-4 border-b-2 ${stageColors[stage]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">{label}</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}, {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddTask}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-input-border text-text-secondary rounded-md hover:bg-bg-app transition-colors text-sm font-medium"
            >
              <Plus size={14} />
              Task
            </button>
            <button
              onClick={onAddDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-input-border text-text-secondary rounded-md hover:bg-bg-app transition-colors text-sm font-medium"
            >
              <Plus size={14} />
              Document
            </button>
          </div>
        </div>
      </div>

      {/* Stage Content */}
      <div className="p-4">
        {/* Empty State */}
        {tasks.length === 0 && documents.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <div className="mb-2">
              <CheckSquare className="w-8 h-8 mx-auto opacity-50" />
            </div>
            <p className="text-sm">No tasks or documents yet</p>
            <p className="text-xs mt-1">Click "+ Task" or "+ Document" to get started</p>
          </div>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <CheckSquare className="text-text-muted" size={16} />
              <span className="text-sm font-medium text-text-secondary">Tasks</span>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => onSelectTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  isSelected={selectedItemId === task.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {documents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <FileText className="text-text-muted" size={16} />
              <span className="text-sm font-medium text-text-secondary">Documents</span>
            </div>
            <div className="space-y-2">
              {documents.map(doc => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onClick={() => onSelectDocument(doc)}
                  onDelete={() => onDeleteDocument(doc.id)}
                  isSelected={selectedItemId === doc.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
