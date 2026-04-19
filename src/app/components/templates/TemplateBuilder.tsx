import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { Save, X } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { TemplateCategory, TemplateStage, TemplateTask, TemplateDocument } from '../../types/template';
import { StageSection } from './builder/StageSection';
import { InspectorPanel } from './builder/InspectorPanel';
import { mockTemplates, isBuiltInTemplateId } from '../../data/templateData';
import { isDemoRoutesIsolationActive, shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { useWorkspaceGo } from '../../context/WorkspaceLinkBaseContext';
import {
  getTemplateById,
  loadUserTemplates,
  resolveSaveTemplateId,
  upsertUserTemplate,
} from '../../data/userTemplatesStorage';
import {
  buildTransactionTemplate,
  emptyStageBuckets,
  groupTemplateIntoBuckets,
  type StageBuckets,
} from '../../utils/templateBuilderPersistence';

type EditableItem =
  | { type: 'task'; item: TemplateTask; stage: TemplateStage }
  | { type: 'document'; item: TemplateDocument; stage: TemplateStage }
  | null;

function reassignItemInStageData(
  prevData: StageBuckets,
  selected: Exclude<EditableItem, null>,
  nextStage: TemplateStage,
): StageBuckets {
  const fromStage = selected.stage;
  if (selected.type === 'task') {
    const taskId = selected.item.id;
    const task = prevData[fromStage].tasks.find(t => t.id === taskId);
    if (!task) return prevData;
    const moved: TemplateTask = { ...task, stage: nextStage };
    return {
      ...prevData,
      [fromStage]: {
        ...prevData[fromStage],
        tasks: prevData[fromStage].tasks.filter(t => t.id !== taskId),
      },
      [nextStage]: {
        ...prevData[nextStage],
        tasks: [...prevData[nextStage].tasks, moved],
      },
    };
  }
  const docId = selected.item.id;
  const doc = prevData[fromStage].documents.find(d => d.id === docId);
  if (!doc) return prevData;
  const moved: TemplateDocument = { ...doc, stage: nextStage };
  return {
    ...prevData,
    [fromStage]: {
      ...prevData[fromStage],
      documents: prevData[fromStage].documents.filter(d => d.id !== docId),
    },
    [nextStage]: {
      ...prevData[nextStage],
      documents: [...prevData[nextStage].documents, moved],
    },
  };
}

export function TemplateBuilder() {
  if (isDemoRoutesIsolationActive()) {
    return (
      <div className="min-h-full bg-bg-app flex items-center justify-center p-8">
        <div className="max-w-md rounded-lg border border-border-subtle bg-bg-surface p-6 text-center text-sm text-text-secondary shadow-sm">
          <p className="font-medium text-text-primary">Template builder</p>
          <p className="mt-2 leading-relaxed">
            Cloud save and the full editor run in your signed-in workspace. In this offline demo, open{' '}
            <strong>Templates &amp; Checklists</strong> in the sidebar for built-ins and browser-stored custom
            templates.
          </p>
        </div>
      </div>
    );
  }
  return <TemplateBuilderMain />;
}

function TemplateBuilderMain() {
  const go = useWorkspaceGo();
  const { templateId: routeTemplateId } = useParams<{ templateId: string }>();
  const useConvexTemplates = shouldUseConvexWorkspaceReads();
  const upsertConvexTemplate = useMutation(api.customTemplates.upsert);

  const builtinTemplate =
    routeTemplateId !== undefined ? mockTemplates.find((t) => t.id === routeTemplateId) : undefined;
  const convexTemplate = useQuery(
    api.customTemplates.getById,
    useConvexTemplates && routeTemplateId && !builtinTemplate ? { templateId: routeTemplateId } : 'skip',
  );

  const [templateName, setTemplateName] = useState('Untitled Template');
  const [category, setCategory] = useState<TemplateCategory>('buyer-rep');
  const [selectedItem, setSelectedItem] = useState<EditableItem>(null);
  const selectedItemRef = useRef<EditableItem>(null);
  selectedItemRef.current = selectedItem;

  // Template data by stage
  const [stageData, setStageData] = useState<StageBuckets>(() => emptyStageBuckets());

  useEffect(() => {
    if (!routeTemplateId) return;
    const loaded =
      builtinTemplate ??
      (useConvexTemplates ? convexTemplate ?? undefined : getTemplateById(routeTemplateId));
    if (!loaded) return;
    setTemplateName(loaded.name);
    setCategory(loaded.category);
    setStageData(groupTemplateIntoBuckets(loaded));
    setSelectedItem(null);
  }, [routeTemplateId, builtinTemplate, convexTemplate, useConvexTemplates]);

  const stages: { id: TemplateStage; label: string }[] = [
    { id: 'under-contract', label: 'Under Contract' },
    { id: 'due-diligence', label: 'Due Diligence' },
    { id: 'financing', label: 'Financing' },
    { id: 'pre-closing', label: 'Pre-Closing' },
    { id: 'closing', label: 'Closing' },
  ];

  const handleAddTask = (stage: TemplateStage) => {
    const newTask: TemplateTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      stage,
      daysFromClosing: -30,
    };
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        tasks: [...prev[stage].tasks, newTask],
      },
    }));
    setSelectedItem({ type: 'task', item: newTask, stage });
  };

  const handleAddDocument = (stage: TemplateStage) => {
    const newDoc: TemplateDocument = {
      id: `doc-${Date.now()}`,
      name: 'New Document',
      stage,
      signatureRequired: false,
    };
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        documents: [...prev[stage].documents, newDoc],
      },
    }));
    setSelectedItem({ type: 'document', item: newDoc, stage });
  };

  const handleUpdateTask = (stage: TemplateStage, taskId: string, updates: Partial<TemplateTask>) => {
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        tasks: prev[stage].tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      },
    }));
  };

  const handleUpdateDocument = (stage: TemplateStage, docId: string, updates: Partial<TemplateDocument>) => {
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        documents: prev[stage].documents.map(d => d.id === docId ? { ...d, ...updates } : d),
      },
    }));
  };

  const handleDeleteTask = (stage: TemplateStage, taskId: string) => {
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        tasks: prev[stage].tasks.filter(t => t.id !== taskId),
      },
    }));
    if (selectedItem?.type === 'task' && selectedItem.item.id === taskId) {
      setSelectedItem(null);
    }
  };

  const handleDeleteDocument = (stage: TemplateStage, docId: string) => {
    setStageData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        documents: prev[stage].documents.filter(d => d.id !== docId),
      },
    }));
    if (selectedItem?.type === 'document' && selectedItem.item.id === docId) {
      setSelectedItem(null);
    }
  };

  const handleReassignStage = (nextStage: TemplateStage) => {
    const current = selectedItemRef.current;
    if (!current || current.stage === nextStage) return;

    setStageData(prevData => reassignItemInStageData(prevData, current, nextStage));

    setSelectedItem({
      ...current,
      stage: nextStage,
      item: { ...current.item, stage: nextStage },
    });
  };

  const handleSave = () => {
    const saveId = resolveSaveTemplateId(routeTemplateId);
    const existing = loadUserTemplates().find((t) => t.id === saveId) ?? null;

    const template = buildTransactionTemplate({
      id: saveId,
      name: templateName,
      category,
      stageData,
      existing,
    });

    if (useConvexTemplates) {
      void (async () => {
        try {
          await upsertConvexTemplate({
            templateId:
              routeTemplateId && !isBuiltInTemplateId(routeTemplateId)
                ? (routeTemplateId as Id<'customTransactionTemplates'>)
                : undefined,
            name: template.name,
            description: template.description,
            category: template.category,
            tasks: template.tasks,
            documents: template.documents,
            stages: template.stages,
          });
          go('/templates');
        } catch (e) {
          console.error(e);
          window.alert('Could not save template. Try again.');
        }
      })();
      return;
    }

    upsertUserTemplate(template);
    go('/templates');
  };

  return (
    <div className="min-h-full bg-bg-app">
      {/* Top Header */}
      <div className="bg-bg-surface border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Template Info */}
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="text-xl font-semibold text-text-primary bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-accent-blue/30 rounded px-2 py-1 -ml-2"
                placeholder="Template Name"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="px-3 py-1.5 border border-input-border rounded-lg text-sm font-medium bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
              >
                <option value="buyer-rep">Buyer Representation</option>
                <option value="seller-rep">Seller Representation</option>
                <option value="dual-rep">Dual Representation</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => go('/templates')}
                className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-input-border text-text-secondary rounded-lg hover:bg-bg-app transition-colors font-medium"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-hover transition-all shadow-sm hover:shadow font-medium"
              >
                <Save size={16} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Workflow Builder (70%) */}
          <div className="col-span-8 space-y-6">
            {stages.map(stage => (
              <StageSection
                key={stage.id}
                stage={stage.id}
                label={stage.label}
                tasks={stageData[stage.id].tasks}
                documents={stageData[stage.id].documents}
                onAddTask={() => handleAddTask(stage.id)}
                onAddDocument={() => handleAddDocument(stage.id)}
                onSelectTask={(task) => setSelectedItem({ type: 'task', item: task, stage: stage.id })}
                onSelectDocument={(doc) => setSelectedItem({ type: 'document', item: doc, stage: stage.id })}
                onDeleteTask={(taskId) => handleDeleteTask(stage.id, taskId)}
                onDeleteDocument={(docId) => handleDeleteDocument(stage.id, docId)}
                selectedItemId={selectedItem?.item.id}
              />
            ))}
          </div>

          {/* Right: Inspector Panel (30%) */}
          <div className="col-span-4">
            <div className="sticky top-24">
              <InspectorPanel
                selectedItem={selectedItem}
                stageOptions={stages}
                onStageChange={handleReassignStage}
                onUpdateTask={(updates) => {
                  if (selectedItem?.type === 'task') {
                    handleUpdateTask(selectedItem.stage, selectedItem.item.id, updates);
                    setSelectedItem({
                      ...selectedItem,
                      item: { ...selectedItem.item, ...updates },
                    });
                  }
                }}
                onUpdateDocument={(updates) => {
                  if (selectedItem?.type === 'document') {
                    handleUpdateDocument(selectedItem.stage, selectedItem.item.id, updates);
                    setSelectedItem({
                      ...selectedItem,
                      item: { ...selectedItem.item, ...updates },
                    });
                  }
                }}
                onClose={() => setSelectedItem(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
