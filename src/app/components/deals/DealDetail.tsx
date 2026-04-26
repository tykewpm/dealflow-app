import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '../ui/use-mobile';
import {
  Deal,
  DealPipelineStage,
  Task,
  Message,
  DocumentItem as DocumentItemType,
  User,
  type AddDealDocumentPayload,
  type AddWorkspacePersonInput,
} from '../../types';
import { DealStatusBadge } from '../shared/DealStatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import { NextActionCard } from '../shared/NextActionCard';
import { TaskList } from '../tasks/TaskList';
import { ChatPanel } from '../chat/ChatPanel';
import { DealChatMobileDock } from './DealChatMobileDock';
import { DocumentList } from '../documents/DocumentList';
import { AddDocumentModal, type AddDocumentModalMode } from '../documents/AddDocumentModal';
import { calculateProgress, countAtRiskItems, formatDate } from '../../utils/dealUtils';
import { getTasksDueSoon, resolveWaitingOn } from '../../utils/dealStatusHelpers';
import { computeDealIntelligence } from '../../utils/dealIntelligence';
import { ClosingPhaseTracker } from './ClosingPhaseTracker';
import { PhaseAdvanceSuggestion } from './PhaseAdvanceSuggestion';
import { getClosingStepSectionGroups, getPhaseAdvanceSuggestion } from '../../utils/starterClosingChecklist';
import { DealHealthSummary } from './DealHealthSummary';
import { DealOperatorBrief } from './DealOperatorBrief';
import { EditDealMetadataModal } from './EditDealMetadataModal';
import { cn } from '../ui/utils';
import { PIPELINE_STAGE_SELECT_OPTIONS, pipelineStageDisplayLabel } from '../../utils/pipelineStageLabels';
import { computeDealPhase, dealHasTaskPhaseCoverage } from '../../utils/dealPhaseFromTasks';
import { ArchiveRestore } from 'lucide-react';
import { useDealCompletionCelebration } from '../../hooks/useDealCompletionCelebration';
import { primeDealCompletionCelebration } from '../../celebration/dealCompletionCelebrationIntent';
import { willDealCloseAfterCompletingTask } from '../../utils/willDealCloseAfterCompletingTask';
import { findRelatedIncompleteTask } from '../../utils/documentTaskRelation';
import { displayLabelFromUrl } from '../../utils/documentHelpers';
import { isWorkspaceViewer } from '../../utils/workspacePermissions';
import { useWorkspaceRelativeHref } from '../../context/WorkspaceLinkBaseContext';
import { DealPeopleSection } from './DealPeopleSection';

interface DealDetailProps {
  deal: Deal;
  tasks: Task[];
  messages: Message[];
  documents: DocumentItemType[];
  users: User[];
  currentUserId: string;
  /** When true, tasks/documents/chat (and default pipeline) stay non-persistent — except pipeline if allowed below */
  readOnly?: boolean;
  /** When read-only in Convex mode, allow pipeline stage `<select>` so stage can be persisted without enabling other edits */
  allowPipelineStageEdit?: boolean;
  /** When read-only in Convex mode, allow task checkbox / next-action primary for task rows (persisted separately) */
  allowTaskStatusToggle?: boolean;
  /** When read-only in Convex mode, allow document checklist actions (mark complete → persisted status/signature) */
  allowDocumentChecklistEdit?: boolean;
  /** When read-only in Convex mode, allow deal chat (messages persisted separately) */
  allowDealChat?: boolean;
  /** When read-only in Convex mode, allow editing address / party names (persisted separately) */
  allowDealMetadataEdit?: boolean;
  onBack: () => void;
  onToggleTask: (taskId: string) => void;
  /** Change task assignee (roster ids + null = unassigned); omit when editing is disabled */
  onChangeTaskAssignee?: (taskId: string, assigneeId: string | null) => void;
  onSendMessage: (dealId: string, text: string) => void;
  onAddDocument?: (documentData: AddDealDocumentPayload) => void | Promise<void>;
  onPipelineStageChange: (stage: DealPipelineStage) => void;
  /** Mark document checklist row complete (status + signature when applicable); omitted when checklist is disabled */
  onMarkDocumentComplete?: (documentId: string) => void;
  /** Persist reference link edits (prompt is shown here when enabled) */
  onUpdateDocumentReferenceLink?: (documentId: string, referenceLink: string) => void;
  /** Persist notes edits (prompt is shown here when enabled) */
  onUpdateDocumentNotes?: (documentId: string, notes: string) => void;
  /** Update property address and party names (modal entry point when provided) */
  onUpdateDealMetadata?: (fields: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
  }) => void;
  /** Clears `deal.archived` via the same path as Dashboard restore — omit if archive actions are unavailable. */
  onRestoreFromArchive?: () => void;
  /** Sets archived — mirrors Dashboard card “Archive”; omit when unavailable or when deal is already archived. */
  onArchiveDeal?: () => void;
  /** Adds a roster person (workspace-wide V1); omit when unavailable or for viewers. */
  onAddWorkspacePerson?: (input: AddWorkspacePersonInput) => void | Promise<void>;
}

export function DealDetail({
  deal,
  tasks,
  messages,
  documents,
  users,
  currentUserId,
  readOnly = false,
  allowPipelineStageEdit = false,
  allowTaskStatusToggle = false,
  allowDocumentChecklistEdit = false,
  allowDealChat = false,
  allowDealMetadataEdit = false,
  onBack,
  onToggleTask,
  onChangeTaskAssignee,
  onSendMessage,
  onAddDocument,
  onPipelineStageChange,
  onMarkDocumentComplete,
  onUpdateDocumentReferenceLink,
  onUpdateDocumentNotes,
  onUpdateDealMetadata,
  onRestoreFromArchive,
  onArchiveDeal,
  onAddWorkspacePerson,
}: DealDetailProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'documents'>('tasks');
  const [dealOverviewOpen, setDealOverviewOpen] = useState(false);
  const [addDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
  const [addDocumentModalMode, setAddDocumentModalMode] = useState<AddDocumentModalMode>('upload');
  const [showEditDealMetadataModal, setShowEditDealMetadataModal] = useState(false);
  const nextActionCelebrationAnchorRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [mobileChatDraft, setMobileChatDraft] = useState('');

  useEffect(() => {
    setMobileChatDraft('');
  }, [deal.id]);

  const progress = calculateProgress(tasks);
  const completedClosingSteps = tasks.filter((t) => t.status === 'complete').length;
  const totalClosingSteps = tasks.length;
  const atRiskCount = countAtRiskItems(tasks);
  const dueSoonCount = getTasksDueSoon(tasks);
  const waitingOn = resolveWaitingOn(tasks, users);
  const currentWorkspaceUser = users.find((u) => u.id === currentUserId);
  const viewerLock = isWorkspaceViewer(currentWorkspaceUser);
  const workspaceHref = useWorkspaceRelativeHref();
  const inviteWorkspaceUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${workspaceHref('/')}` : '';
  const canAddPeopleToClosing = !viewerLock && Boolean(onAddWorkspacePerson);
  const canEditAssignee = Boolean(
    onChangeTaskAssignee && !viewerLock && (!readOnly || allowTaskStatusToggle),
  );
  const effectivePipelineStage = useMemo(() => {
    if (dealHasTaskPhaseCoverage(tasks)) {
      return computeDealPhase(tasks);
    }
    return deal.pipelineStage;
  }, [deal.pipelineStage, tasks]);

  const dealPhaseContext = useMemo(
    () => ({ ...deal, pipelineStage: effectivePipelineStage }),
    [deal, effectivePipelineStage],
  );

  const intelligence = useMemo(
    () => computeDealIntelligence(dealPhaseContext, tasks, documents, messages),
    [dealPhaseContext, tasks, documents, messages],
  );
  const phaseAdvanceSuggestion = useMemo(() => getPhaseAdvanceSuggestion(deal, tasks), [deal, tasks]);
  const taskSectionGroups = useMemo(() => getClosingStepSectionGroups(tasks), [tasks]);
  const nextAction = intelligence.nextAction;
  const nextActionSummary = intelligence.summaryMetrics;
  const issueDetection = intelligence.detection;

  const { dealSummaryCompletionPulse } = useDealCompletionCelebration(deal.id, deal, tasks);

  const handleTaskToggleWithCloseCelebration = (taskId: string, source: 'primary_cta' | 'task_list') => {
    if (willDealCloseAfterCompletingTask(taskId, deal, tasks)) {
      if (source === 'primary_cta') {
        primeDealCompletionCelebration(
          'explicit',
          nextActionCelebrationAnchorRef.current?.getBoundingClientRect(),
        );
      } else {
        primeDealCompletionCelebration('task_list', null);
      }
    }
    onToggleTask(taskId);
  };

  function labelForTaskMatchFromPayload(payload: AddDealDocumentPayload): string {
    if (payload.kind === 'link') {
      const url = payload.url.trim();
      return (payload.name?.trim() || displayLabelFromUrl(url)).trim();
    }
    return (payload.name?.trim() || payload.file.name).trim();
  }

  const handleAddDocumentFromModal = async (payload: AddDealDocumentPayload) => {
    if (!onAddDocument) return;
    await Promise.resolve(onAddDocument(payload));
    const label = labelForTaskMatchFromPayload(payload);
    const dealTasks = tasks.filter((t) => t.dealId === deal.id);
    const related = findRelatedIncompleteTask(label, dealTasks);
    if (related && window.confirm('Mark related closing step as complete?')) {
      handleTaskToggleWithCloseCelebration(related.id, 'task_list');
    }
  };

  const canEditDocumentChecklist = !viewerLock && (!readOnly || allowDocumentChecklistEdit);
  const canEditDealMetadata =
    !viewerLock && (!readOnly || allowDealMetadataEdit) && Boolean(onUpdateDealMetadata);

  return (
    <div className="h-full flex flex-col">
      {deal.archived && (
        <div
          className="flex shrink-0 flex-wrap items-start gap-3 border-b border-border-subtle bg-bg-elevated/50 px-4 py-3 text-sm text-text-primary transition-[background-color,border-color] duration-150 ease-out sm:px-6"
          role="status"
          aria-live="polite"
        >
          <ArchiveRestore className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-primary">Archived transaction</p>
            <p className="mt-1 text-text-secondary">
              This transaction is hidden from the main workspace lists (Dashboard Active/Completed, Transactions,
              Team workload, and applying templates). Open it from the Dashboard Archived tab or by link; restore
              it to bring it back to those views.
            </p>
          </div>
          {onRestoreFromArchive ? (
            <button
              type="button"
              onClick={onRestoreFromArchive}
              className="shrink-0 rounded-lg border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 dark:shadow-none"
            >
              Restore to dashboard
            </button>
          ) : null}
        </div>
      )}
      {viewerLock ? (
        <div
          className="shrink-0 border-b border-border-subtle bg-bg-elevated/60 px-4 py-2.5 text-sm text-text-secondary transition-[background-color,border-color] duration-150 ease-out sm:px-6"
          role="status"
        >
          <p className="font-medium text-text-primary">View-only access</p>
          <p className="mt-1 text-xs text-text-secondary">
            Your workspace role is <span className="font-medium text-text-primary">Viewer</span>. You can read this
            transaction, chat, and documents — closing steps and checklist edits stay disabled.
          </p>
        </div>
      ) : null}
      {readOnly && (
        <div
          className="shrink-0 border-b border-border-subtle bg-accent-amber-soft px-4 py-2.5 text-sm text-text-primary transition-[background-color,border-color] duration-150 ease-out sm:px-6"
          role="status"
        >
          {allowPipelineStageEdit ||
          allowTaskStatusToggle ||
          allowDocumentChecklistEdit ||
          allowDealChat ||
          allowDealMetadataEdit ? (
            (() => {
              const parts: string[] = [];
              if (allowPipelineStageEdit) {
                parts.push('Closing phase changes are saved to the server.');
              }
              if (allowTaskStatusToggle) {
                parts.push('Closing step completion toggles are saved to the server.');
              }
              if (onChangeTaskAssignee) {
                parts.push('Closing step assignee updates are saved to the server.');
              }
              if (allowDocumentChecklistEdit) {
                parts.push('Document checklist updates are saved to the server.');
              }
              if (allowDealMetadataEdit) {
                parts.push('Transaction profile (address & party names) updates are saved to the server.');
              }
              if (allowDealChat) {
                parts.push('Transaction chat messages are saved to the server.');
              } else {
                parts.push('Chat is read-only until a later phase.');
              }
              return parts.join(' ');
            })()
          ) : (
            'Read-only: this view uses live Convex data; edits are not saved to the server yet.'
          )}
        </div>
      )}
      {/* Work surface: stacked on small screens; chat is inline from `lg+`. On narrow viewports chat is a floating dock + sheet. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border-subtle bg-bg-app lg:w-3/5 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {/* Property header — transaction identity */}
            <header className="border-b border-border-subtle bg-bg-surface">
              <div className="px-4 py-3 sm:px-5">
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={onBack}
                    className="-ml-1.5 flex-shrink-0 rounded-md p-1.5 text-text-muted transition-[color,background-color] duration-150 ease-out hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
                    aria-label="Back to dashboard"
                  >
                    <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Transaction</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="min-w-0 text-lg font-semibold leading-snug text-text-primary">
                        {deal.propertyAddress}
                      </h1>
                      {canEditDealMetadata && (
                        <button
                          type="button"
                          onClick={() => setShowEditDealMetadataModal(true)}
                          className="flex-shrink-0 rounded-md text-sm font-medium text-accent-blue underline-offset-4 transition-colors duration-150 ease-out hover:text-accent-blue-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
                        >
                          Edit transaction
                        </button>
                      )}
                      {!deal.archived && onArchiveDeal && !viewerLock ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveDeal();
                          }}
                          className="flex-shrink-0 rounded-md text-sm font-medium text-text-muted underline-offset-4 transition-colors duration-150 ease-out hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
                        >
                          Archive
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm text-text-secondary">
                      Buyer: {deal.buyerName} · Seller: {deal.sellerName}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Closing <span className="font-medium text-text-secondary">{formatDate(deal.closingDate)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Compact strip + tabs stay visible while scrolling long checklists */}
            <div
              className={cn(
                'sticky top-0 z-10 border-b border-border-subtle bg-bg-app/95 backdrop-blur-sm transition-[box-shadow,background-color,border-color] duration-150 ease-out dark:bg-bg-surface/95',
                'shadow-[0_1px_0_0_rgba(15,23,42,0.04)] dark:shadow-none',
                dealSummaryCompletionPulse &&
                  'motion-safe:animate-deal-complete-surface motion-reduce:ring-1 motion-reduce:ring-accent-green/25',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle/70 px-4 py-2.5 sm:px-5">
                <div
                  ref={nextActionCelebrationAnchorRef}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap"
                >
                  <div className="flex min-w-0 max-w-[11rem] flex-1 items-center gap-2 sm:max-w-[10rem]">
                    <ProgressBar progress={progress} showLabel={false} dense />
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-text-primary">{progress}%</span>
                  </div>
                  <span className="hidden text-xs text-text-muted sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium text-text-secondary">
                    {pipelineStageDisplayLabel(effectivePipelineStage)}
                  </span>
                  {totalClosingSteps > 0 ? (
                    <span className="hidden text-[11px] text-text-muted lg:inline">
                      {completedClosingSteps}/{totalClosingSteps} steps
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setDealOverviewOpen((o) => !o)}
                  aria-expanded={dealOverviewOpen}
                  className="shrink-0 rounded-lg border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-primary shadow-sm transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 dark:shadow-none"
                >
                  {dealOverviewOpen ? 'Hide overview' : 'Overview'}
                </button>
              </div>
              <div className="flex gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 ${
                    activeTab === 'tasks'
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  Closing steps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 ${
                    activeTab === 'documents'
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  Documents
                </button>
              </div>
            </div>

            {dealOverviewOpen ? (
              <div className="border-b border-border-subtle bg-bg-app">
                <ClosingPhaseTracker
                  currentStage={effectivePipelineStage}
                  footnote={
                    dealHasTaskPhaseCoverage(tasks)
                      ? 'Phase follows checklist progress. Use the menu below to override manually if needed.'
                      : undefined
                  }
                />

                {phaseAdvanceSuggestion ? (
                  <div className="border-b border-border-subtle bg-bg-app px-4 py-3 sm:px-5">
                    <PhaseAdvanceSuggestion
                      headline={phaseAdvanceSuggestion.headline}
                      buttonLabel={phaseAdvanceSuggestion.buttonLabel}
                      onAdvance={() => onPipelineStageChange(phaseAdvanceSuggestion.nextStage)}
                      disabled={viewerLock || (readOnly && !allowPipelineStageEdit)}
                    />
                  </div>
                ) : null}

                <div className="space-y-4 border-b border-border-subtle bg-bg-app px-4 py-4 sm:px-5">
                  <section aria-labelledby="deal-next-step-heading">
                    <h2
                      id="deal-next-step-heading"
                      className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Next best step
                    </h2>
                    <NextActionCard
                      variant="compact"
                      contextSubtitle={
                        dealHasTaskPhaseCoverage(tasks)
                          ? `Phase: ${pipelineStageDisplayLabel(effectivePipelineStage)}`
                          : undefined
                      }
                      actionText={nextAction.title}
                      secondaryText={nextAction.subtitle}
                      dueDate={nextAction.dueDate}
                      priority={nextAction.severity}
                      warningMessage={nextAction.warningMessage}
                      overdueCount={nextActionSummary.overdueCount}
                      dueSoonCount={nextActionSummary.dueSoonCount}
                      awaitingSignatureCount={nextActionSummary.awaitingSignatureCount}
                      primaryButtonText={nextAction.primaryCta.label}
                      secondaryButtonText={nextAction.secondaryCta?.label ?? 'View details'}
                      primaryDisabled={
                        viewerLock ||
                        (readOnly && !allowTaskStatusToggle && nextAction.sourceType === 'task') ||
                        (readOnly && !allowDocumentChecklistEdit && nextAction.sourceType === 'document')
                      }
                      onPrimaryAction={() => {
                        if (nextAction.sourceType === 'task') {
                          handleTaskToggleWithCloseCelebration(nextAction.sourceId, 'primary_cta');
                        } else if (nextAction.sourceType === 'document') {
                          setActiveTab('documents');
                        } else {
                          setActiveTab('tasks');
                        }
                      }}
                      onSecondaryAction={() => {
                        if (nextAction.sourceType === 'task') {
                          setActiveTab('documents');
                        } else if (nextAction.sourceType === 'document') {
                          setActiveTab('tasks');
                        } else {
                          setActiveTab('documents');
                        }
                      }}
                    />
                  </section>

                  <div className="space-y-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 shadow-sm dark:shadow-none">
                    <DealOperatorBrief intelligence={intelligence} />
                    <DealPeopleSection
                      users={users}
                      currentUserId={currentUserId}
                      inviteWorkspaceUrl={inviteWorkspaceUrl}
                      canAddPeople={canAddPeopleToClosing}
                      onAddWorkspacePerson={onAddWorkspacePerson}
                    />
                    <div className="grid grid-cols-2 items-start gap-x-3 gap-y-3 border-t border-border-subtle pt-3 sm:gap-y-2 lg:grid-cols-4">
                      <div>
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                          Closing
                        </div>
                        <div className="text-sm font-semibold leading-tight text-text-primary">
                          {formatDate(deal.closingDate)}
                        </div>
                      </div>
                      <div className="min-w-0 lg:col-span-1">
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                          Progress
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <ProgressBar progress={progress} showLabel={false} dense />
                          </div>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-text-primary">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                          Record status
                        </div>
                        <DealStatusBadge status={deal.status} />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="deal-pipeline-stage"
                          className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-text-muted"
                        >
                          Closing phase
                        </label>
                        {dealHasTaskPhaseCoverage(tasks) ? (
                          <p className="mb-1 text-[10px] text-text-muted">
                            Auto from steps — menu overrides saved phase on the deal.
                          </p>
                        ) : null}
                        <select
                          id="deal-pipeline-stage"
                          value={deal.pipelineStage}
                          disabled={viewerLock || (readOnly && !allowPipelineStageEdit)}
                          title={
                            viewerLock
                              ? 'Phase changes are disabled for viewers'
                              : readOnly && !allowPipelineStageEdit
                                ? 'Closing phase edits are disabled while Convex workspace is read-only'
                                : undefined
                          }
                          onChange={(e) => onPipelineStageChange(e.target.value as DealPipelineStage)}
                          className="w-full max-w-full rounded-md border border-input-border bg-input-bg px-2.5 py-1.5 text-xs text-text-primary shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-border-strong focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--input-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                        >
                          {PIPELINE_STAGE_SELECT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-subtle pt-2 text-xs text-text-secondary sm:text-[13px]">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {atRiskCount > 0 ? (
                          <>
                            <svg
                              className="h-3.5 w-3.5 shrink-0 text-accent-amber"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium text-text-primary">
                              {atRiskCount} {atRiskCount === 1 ? 'closing step' : 'closing steps'} at risk
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5 shrink-0 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium text-text-primary">No risks detected</span>
                          </>
                        )}
                      </div>
                      <div className="hidden h-3.5 w-px shrink-0 bg-border-subtle sm:block" aria-hidden />
                      <div className="flex min-w-0 items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {dueSoonCount > 0 ? (
                            <span className="font-medium text-text-primary">
                              {dueSoonCount} {dueSoonCount === 1 ? 'closing step' : 'closing steps'} due soon
                            </span>
                          ) : (
                            <span className="text-text-muted">No upcoming deadlines</span>
                          )}
                        </span>
                      </div>
                      {waitingOn ? (
                        <>
                          <div className="hidden h-3.5 w-px shrink-0 bg-border-subtle sm:block" aria-hidden />
                          <div className="flex min-w-0 items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-text-secondary">
                              Waiting on:{' '}
                              {waitingOn.kind === 'assigned' ? (
                                <span className="font-medium text-text-primary">{waitingOn.user.name}</span>
                              ) : waitingOn.kind === 'unassigned' ? (
                                <span className="font-medium text-accent-amber">Unassigned</span>
                              ) : (
                                <span className="font-medium text-accent-amber" title={waitingOn.assigneeId}>
                                  Unknown assignee
                                </span>
                              )}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>

                    <p className="text-[10px] leading-snug text-text-muted">
                      Health below is detected from closing steps, documents, and closing timing — separate from phase
                      and record status.
                    </p>
                    <DealHealthSummary detection={issueDetection} compact />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-6 pt-3 sm:px-5">
              {activeTab === 'tasks' && (
                <TaskList
                  tasks={tasks}
                  users={users}
                  sectionGroups={taskSectionGroups}
                  onToggleComplete={(taskId) =>
                    handleTaskToggleWithCloseCelebration(taskId, 'task_list')
                  }
                  readOnly={viewerLock || (readOnly && !allowTaskStatusToggle)}
                  onAssigneeChange={canEditAssignee ? onChangeTaskAssignee : undefined}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentList
                  documents={documents}
                  closingDate={deal.closingDate}
                  onUseTemplate={
                    canEditDocumentChecklist
                      ? () => {
                          // TODO: Implement use template - creates all default documents
                          console.log('Use document template');
                        }
                      : undefined
                  }
                  onOpenAddDocumentUpload={
                    canEditDocumentChecklist && onAddDocument
                      ? () => {
                          setAddDocumentModalMode('upload');
                          setAddDocumentModalOpen(true);
                        }
                      : undefined
                  }
                  onOpenAddDocumentLink={
                    canEditDocumentChecklist && onAddDocument
                      ? () => {
                          setAddDocumentModalMode('link');
                          setAddDocumentModalOpen(true);
                        }
                      : undefined
                  }
                  onAddLink={
                    canEditDocumentChecklist && onUpdateDocumentReferenceLink
                      ? (docId) => {
                          const doc = documents.find((d) => d.id === docId);
                          const initial = doc?.referenceLink ?? '';
                          const link = window.prompt('Reference link URL:', initial);
                          if (link === null) return;
                          onUpdateDocumentReferenceLink(docId, link.trim());
                        }
                      : undefined
                  }
                  onAddNote={
                    canEditDocumentChecklist && onUpdateDocumentNotes
                      ? (docId) => {
                          const doc = documents.find((d) => d.id === docId);
                          const initial = doc?.notes ?? '';
                          const note = window.prompt('Notes:', initial);
                          if (note === null) return;
                          onUpdateDocumentNotes(docId, note.trim());
                        }
                      : undefined
                  }
                  onMarkComplete={
                    canEditDocumentChecklist && onMarkDocumentComplete
                      ? (docId) => onMarkDocumentComplete(docId)
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 w-full shrink-0 flex-col lg:flex lg:h-auto lg:w-2/5 lg:min-h-0 lg:min-w-0 lg:max-w-none">
          <div className="flex h-[min(42vh,24rem)] min-h-[260px] w-full flex-1 flex-col lg:h-auto lg:min-h-0">
            <ChatPanel
              messages={messages}
              users={users}
              currentUserId={currentUserId}
              onSendMessage={(text) => onSendMessage(deal.id, text)}
              readOnly={viewerLock || (readOnly && !allowDealChat)}
              className="border-l-0 border-t border-border-subtle lg:border-l lg:border-t-0"
            />
          </div>
        </div>
      </div>

      {isMobile ? (
        <DealChatMobileDock
          key={deal.id}
          messages={messages}
          users={users}
          currentUserId={currentUserId}
          onSendMessage={(text) => onSendMessage(deal.id, text)}
          readOnly={viewerLock || (readOnly && !allowDealChat)}
          messageDraft={mobileChatDraft}
          onMessageDraftChange={setMobileChatDraft}
        />
      ) : null}

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={addDocumentModalOpen}
        initialMode={addDocumentModalMode}
        onClose={() => setAddDocumentModalOpen(false)}
        onAdd={handleAddDocumentFromModal}
      />

      {canEditDealMetadata && onUpdateDealMetadata && (
        <EditDealMetadataModal
          isOpen={showEditDealMetadataModal}
          deal={deal}
          onClose={() => setShowEditDealMetadataModal(false)}
          onSave={(fields) => onUpdateDealMetadata(fields)}
        />
      )}
    </div>
  );
}
