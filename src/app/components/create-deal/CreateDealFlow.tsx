import { useState } from 'react';
import { StepNavigation } from './StepNavigation';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Template } from './Step2Template';
import { Step3ReviewTasks, TaskDraft, DocumentDraft } from './Step3ReviewTasks';
import { Step4Confirm } from './Step4Confirm';
import { CreateDealStartChoice } from './CreateDealStartChoice';
import { MlsListingSearchPanel } from './MlsListingSearchPanel';
import { MlsListingReviewPanel } from './MlsListingReviewPanel';
import { workflowTemplates } from '../../data/workflowTemplates';
import { useWorkspaceGo } from '../../context/WorkspaceLinkBaseContext';
import { computeDueDateFromClosing } from '../../utils/applyTemplateToDeal';
import type { MlsListingPreview } from '../../services/mls/mlsListingTypes';

interface CreateDealFlowProps {
  onCreateDeal: (dealData: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
    tasks: TaskDraft[];
    documents: DocumentDraft[];
  }) => void;
}

type PreMainStep = 'choice' | 'mls-search' | 'mls-review';

export function CreateDealFlow({ onCreateDeal }: CreateDealFlowProps) {
  const go = useWorkspaceGo();
  const [preMain, setPreMain] = useState<PreMainStep | null>('choice');
  const [mlsPick, setMlsPick] = useState<MlsListingPreview | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [propertyAddress, setPropertyAddress] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('default-residential');
  const [tasks, setTasks] = useState<TaskDraft[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([]);

  const enterMainFlowFromManual = () => {
    setPreMain(null);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const enterMainFlowFromMls = (draft: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
  }) => {
    setPropertyAddress(draft.propertyAddress);
    setBuyerName(draft.buyerName);
    setSellerName(draft.sellerName);
    setClosingDate(draft.closingDate);
    setTasks([]);
    setDocumentDrafts([]);
    setSelectedTemplateId('default-residential');
    setMlsPick(null);
    setPreMain(null);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const handleStep1Continue = () => {
    setCompletedSteps([...completedSteps, 1]);
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    if (selectedTemplateId) {
      const template = workflowTemplates.find((t) => t.id === selectedTemplateId);
      if (template) {
        const generatedTasks: TaskDraft[] = template.tasks.map((taskTemplate, index) => ({
          id: `task-${index}`,
          name: taskTemplate.name,
          dueDate: computeDueDateFromClosing(closingDate, taskTemplate.daysFromClosing),
        }));
        setTasks(generatedTasks);

        const stubs = template.documents ?? [];
        const generatedDocs: DocumentDraft[] = stubs.map((d, index) => ({
          id: `doc-${index}`,
          name: d.name,
          signatureRequired: Boolean(d.signatureRequired),
        }));
        setDocumentDrafts(generatedDocs);
      }
    }
    setCompletedSteps([...new Set([...completedSteps, 1, 2])]);
    setCurrentStep(3);
  };

  const handleStep3Continue = () => {
    setCompletedSteps([...new Set([...completedSteps, 1, 2, 3])]);
    setCurrentStep(4);
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskDraft>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleAddTask = () => {
    const newTask: TaskDraft = {
      id: `task-${Date.now()}`,
      name: '',
      dueDate: closingDate,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateDocument = (id: string, updates: Partial<DocumentDraft>) => {
    setDocumentDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleDeleteDocument = (id: string) => {
    setDocumentDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDocument = () => {
    const newDoc: DocumentDraft = {
      id: `doc-${Date.now()}`,
      name: '',
      signatureRequired: false,
    };
    setDocumentDrafts((prev) => [...prev, newDoc]);
  };

  const handleCreateDeal = () => {
    onCreateDeal({
      propertyAddress,
      buyerName,
      sellerName,
      closingDate,
      tasks,
      documents: documentDrafts,
    });
  };

  const handleNavigateToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    go('/');
  };

  const closeBar = (
    <div className="mx-auto max-w-7xl px-8 pt-6 pb-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md p-2 text-text-muted transition-all hover:bg-bg-elevated/60 hover:text-text-primary"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  if (preMain !== null) {
    return (
      <div className="flex h-full w-full flex-col bg-bg-app">
        {closeBar}
        <div className="flex-1 overflow-y-auto pb-12">
          {preMain === 'choice' ? (
            <CreateDealStartChoice
              onChooseMls={() => setPreMain('mls-search')}
              onChooseManual={enterMainFlowFromManual}
            />
          ) : null}
          {preMain === 'mls-search' ? (
            <MlsListingSearchPanel
              onBack={() => setPreMain('choice')}
              onSelectListing={(listing) => {
                setMlsPick(listing);
                setPreMain('mls-review');
              }}
            />
          ) : null}
          {preMain === 'mls-review' && mlsPick ? (
            <MlsListingReviewPanel
              listing={mlsPick}
              onBack={() => {
                setPreMain('mls-search');
                setMlsPick(null);
              }}
              onApply={enterMainFlowFromMls}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <StepNavigation
        currentStep={currentStep}
        completedSteps={completedSteps}
        onNavigateToStep={handleNavigateToStep}
      />

      <div className="flex-1 overflow-y-auto bg-bg-app">
        {closeBar}

        <div className="mx-auto max-w-7xl px-8 pb-12">
          {currentStep === 1 && (
            <Step1BasicInfo
              propertyAddress={propertyAddress}
              closingDate={closingDate}
              buyerName={buyerName}
              sellerName={sellerName}
              onPropertyAddressChange={setPropertyAddress}
              onClosingDateChange={setClosingDate}
              onBuyerNameChange={setBuyerName}
              onSellerNameChange={setSellerName}
              onContinue={handleStep1Continue}
            />
          )}

          {currentStep === 2 && (
            <Step2Template
              templates={workflowTemplates}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
              onContinue={handleStep2Continue}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3ReviewTasks
              tasks={tasks}
              documents={documentDrafts}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddDocument={handleAddDocument}
              onContinue={handleStep3Continue}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step4Confirm
              propertyAddress={propertyAddress}
              closingDate={closingDate}
              buyerName={buyerName}
              sellerName={sellerName}
              tasks={tasks}
              documents={documentDrafts}
              onCreateDeal={handleCreateDeal}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
