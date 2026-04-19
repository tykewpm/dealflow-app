import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/datepicker.css';

export interface TaskDraft {
  id: string;
  name: string;
  dueDate: string;
}

export interface DocumentDraft {
  id: string;
  name: string;
  signatureRequired: boolean;
}

interface Step3ReviewTasksProps {
  tasks: TaskDraft[];
  documents: DocumentDraft[];
  onUpdateTask: (id: string, updates: Partial<TaskDraft>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
  onUpdateDocument: (id: string, updates: Partial<DocumentDraft>) => void;
  onDeleteDocument: (id: string) => void;
  onAddDocument: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step3ReviewTasks({
  tasks,
  documents,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onUpdateDocument,
  onDeleteDocument,
  onAddDocument,
  onContinue,
  onBack,
}: Step3ReviewTasksProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const totalChecklistItems = tasks.length + documents.filter((d) => d.name.trim().length > 0).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-2">Step 3 of 4</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Review your checklist</h1>
        <p className="text-text-secondary">
          Adjust tasks and documents before they are added to your deal
          {totalChecklistItems > 0 ? (
            <span className="text-text-muted"> · {totalChecklistItems} items</span>
          ) : null}
        </p>
      </div>

      {/* Tasks */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Tasks & timeline
        </h3>

        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-bg-app rounded-lg hover:bg-bg-elevated/50 transition-colors group"
              >
                <div className="flex-shrink-0 text-text-muted cursor-grab">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => onUpdateTask(task.id, { name: e.target.value })}
                  onFocus={() => setEditingTaskId(task.id)}
                  onBlur={() => setEditingTaskId(null)}
                  className={`flex-1 px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/25 ${
                    editingTaskId === task.id ? 'border-border-strong' : 'border-transparent'
                  }`}
                  placeholder="Task name"
                />

                <DatePicker
                  selected={task.dueDate ? new Date(task.dueDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      onUpdateTask(task.id, { dueDate: date.toISOString().split('T')[0] });
                    }
                  }}
                  dateFormat="MMM d"
                  className="px-3 py-2 border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/25 text-sm w-32"
                  wrapperClassName="flex-shrink-0"
                />

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="flex-shrink-0 p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-soft rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">No tasks yet</p>
            <button type="button" onClick={onAddTask} className="text-accent-blue hover:underline font-medium">
              + Add your first task
            </button>
          </div>
        )}

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="mt-4 w-full py-3 border-2 border-dashed border-input-border rounded-lg text-text-secondary hover:border-border-strong hover:text-accent-blue transition-colors font-medium"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Documents */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Documents checklist
        </h3>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center gap-3 p-3 bg-bg-app rounded-lg hover:bg-bg-elevated/50 transition-colors group sm:flex-nowrap"
              >
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => onUpdateDocument(doc.id, { name: e.target.value })}
                  className="flex-1 min-w-0 px-3 py-2 bg-transparent border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/25 focus:border-border-strong"
                  placeholder="Document name"
                />
                <label className="flex items-center gap-2 text-sm text-text-secondary flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.signatureRequired}
                    onChange={(e) => onUpdateDocument(doc.id, { signatureRequired: e.target.checked })}
                    className="rounded border-input-border text-accent-blue focus:ring-accent-blue/25"
                  />
                  <span>Signature</span>
                </label>
                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="flex-shrink-0 p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-soft rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-text-muted mb-4">No documents in this workflow — add your own or go back and pick another template.</p>
            <button type="button" onClick={onAddDocument} className="text-accent-blue hover:underline font-medium">
              + Add document
            </button>
          </div>
        )}

        {documents.length > 0 && (
          <button
            type="button"
            onClick={onAddDocument}
            className="mt-4 w-full py-3 border-2 border-dashed border-input-border rounded-lg text-text-secondary hover:border-border-strong hover:text-accent-blue transition-colors font-medium"
          >
            + Add Document
          </button>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-text-secondary hover:bg-bg-elevated/50 rounded-xl transition-colors font-medium"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="px-6 py-3 bg-accent-blue text-white rounded-xl hover:brightness-110 transition-colors font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
