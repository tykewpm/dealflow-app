import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Deal,
  DealPipelineStage,
  Task,
  Message,
  DocumentItem as DocumentItemType,
  User,
  DocumentStatus,
} from '../../types';
import { DealStatusBadge } from '../shared/DealStatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import { NextActionCard } from '../shared/NextActionCard';
import { TaskList } from '../tasks/TaskList';
import { ChatPanel } from '../chat/ChatPanel';
import { DocumentList } from '../documents/DocumentList';
import { AddDocumentModal } from '../documents/AddDocumentModal';
import { calculateProgress, countAtRiskItems, formatDate } from '../../utils/dealUtils';
import { getTasksDueSoon, resolveWaitingOn } from '../../utils/dealStatusHelpers';
import { computeDealIntelligence } from '../../utils/dealIntelligence';
import { DealHealthSummary } from './DealHealthSummary';
import { DealOperatorBrief } from './DealOperatorBrief';
import { EditDealMetadataModal } from './EditDealMetadataModal';
import { cn } from '../ui/utils';
import { ArchiveRestore } from 'lucide-react';
import { useDealCompletionCelebration } from '../../hooks/useDealCompletionCelebration';
import { primeDealCompletionCelebration } from '../../celebration/dealCompletionCelebrationIntent';
import { willDealCloseAfterCompletingTask } from '../../utils/willDealCloseAfterCompletingTask';

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
  onAddDocument?: (documentData: {
    name: string;
    status: DocumentStatus;
    signatureRequired: boolean;
    dueDate?: string;
    referenceLink?: string;
  }) => void;
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
}

const PIPELINE_STAGE_OPTIONS: { id: DealPipelineStage; label: string }[] = [
  { id: 'under-contract', label: 'Under Contract' },
  { id: 'due-diligence', label: 'Due Diligence' },
  { id: 'financing', label: 'Financing' },
  { id: 'pre-closing', label: 'Pre-Closing' },
  { id: 'closing', label: 'Closing' },
];

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
}: DealDetailProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'documents'>('tasks');
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showEditDealMetadataModal, setShowEditDealMetadataModal] = useState(false);
  const [summaryPinned, setSummaryPinned] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const summarySentinelRef = useRef<HTMLDivElement>(null);
  const nextActionCelebrationAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRootRef.current;
    const sentinel = summarySentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSummaryPinned(!entry.isIntersecting);
      },
      { root, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  const progress = calculateProgress(tasks);
  const atRiskCount = countAtRiskItems(tasks);
  const dueSoonCount = getTasksDueSoon(tasks);
  const waitingOn = resolveWaitingOn(tasks, users);
  const canEditAssignee = Boolean(onChangeTaskAssignee && (!readOnly || allowTaskStatusToggle));
  const intelligence = useMemo(
    () => computeDealIntelligence(deal, tasks, documents, messages),
    [deal, tasks, documents, messages],
  );
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

  const handleAddDocument = (documentData: {
    name: string;
    status: DocumentStatus;
    signatureRequired: boolean;
    dueDate?: string;
    referenceLink?: string;
  }) => {
    if (onAddDocument) {
      onAddDocument(documentData);
    }
    setShowAddDocumentModal(false);
  };

  const canEditDocumentChecklist = !readOnly || allowDocumentChecklistEdit;
  const canEditDealMetadata =
    (!readOnly || allowDealMetadataEdit) && Boolean(onUpdateDealMetadata);

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
            <p className="font-medium text-text-primary">Archived deal</p>
            <p className="mt-1 text-text-secondary">
              This deal is hidden from the main workspace lists (Dashboard Active/Completed, Transactions, Team
              workload, and applying templates). Open it from the Dashboard Archived tab or by link; restore it to
              bring it back to those views.
            </p>
          </div>
          {onRestoreFromArchive ? (
            <button
              type="button"
              onClick={onRestoreFromArchive}
              className="shrink-0 rounded-lg border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 dark:shadow-none"
            >
              Restore to workspace
            </button>
          ) : null}
        </div>
      )}
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
                parts.push('Pipeline stage changes are saved to the server.');
              }
              if (allowTaskStatusToggle) {
                parts.push('Task completion toggles are saved to the server.');
              }
              if (onChangeTaskAssignee) {
                parts.push('Task assignee updates are saved to the server.');
              }
              if (allowDocumentChecklistEdit) {
                parts.push('Document checklist updates are saved to the server.');
              }
              if (allowDealMetadataEdit) {
                parts.push('Deal profile (address & party names) updates are saved to the server.');
              }
              if (allowDealChat) {
                parts.push('Deal chat messages are saved to the server.');
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
      {/* Work surface: stacked on small screens (chat below); side-by-side from `lg`. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border-subtle bg-bg-app lg:w-3/5 lg:border-b-0 lg:border-r">
          <div
            ref={scrollRootRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
          >
            {/* Identity-only — scrolls away so the workbench isn’t dominated by a tall header */}
            <header className="border-b border-border-subtle bg-bg-surface">
              <div className="px-4 py-2.5 sm:px-5">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="min-w-0 text-lg font-semibold leading-snug text-text-primary">
                        {deal.propertyAddress}
                      </h1>
                      {canEditDealMetadata && (
                        <button
                          type="button"
                          onClick={() => setShowEditDealMetadataModal(true)}
                          className="flex-shrink-0 rounded-md text-sm font-medium text-accent-blue underline-offset-4 transition-colors duration-150 ease-out hover:text-accent-blue-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
                        >
                          Edit deal
                        </button>
                      )}
                      {!deal.archived && onArchiveDeal ? (
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
                    <p className="mt-1 text-sm text-text-secondary">
                      Buyer: {deal.buyerName} • Seller: {deal.sellerName}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <div
              ref={summarySentinelRef}
              className="pointer-events-none h-px shrink-0"
              aria-hidden
            />

            {/* Sticky operating summary — stays visible while working through tasks/documents */}
            <div
              className={cn(
                'sticky top-0 z-10 border-b border-border-subtle bg-bg-app/90 backdrop-blur-sm transition-[box-shadow,background-color,border-color] duration-150 ease-out dark:bg-bg-surface/90',
                summaryPinned
                  ? 'shadow-[0_6px_16px_-8px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.05] dark:shadow-none dark:ring-border-subtle'
                  : 'shadow-[0_1px_0_0_rgba(15,23,42,0.04)] dark:shadow-none',
                dealSummaryCompletionPulse &&
                  'motion-safe:animate-deal-complete-surface motion-reduce:ring-1 motion-reduce:ring-accent-green/25',
              )}
            >
              <div className="space-y-2 px-4 py-2.5 sm:px-5">
                <DealOperatorBrief intelligence={intelligence} />
                <div className="grid grid-cols-2 items-start gap-x-3 gap-y-3 sm:gap-y-2 lg:grid-cols-4">
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
                      <div className="flex-1 min-w-0">
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
                    <label htmlFor="deal-pipeline-stage" className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-text-muted">
                      Pipeline stage
                    </label>
                    <select
                      id="deal-pipeline-stage"
                      value={deal.pipelineStage}
                      disabled={readOnly && !allowPipelineStageEdit}
                      title={
                        readOnly && !allowPipelineStageEdit
                          ? 'Pipeline edits are disabled while Convex workspace is read-only'
                          : undefined
                      }
                      onChange={(e) => onPipelineStageChange(e.target.value as DealPipelineStage)}
                      className="w-full max-w-full rounded-md border border-input-border bg-input-bg px-2.5 py-1.5 text-xs text-text-primary shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-border-strong focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--input-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                    >
                      {PIPELINE_STAGE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-subtle pt-1.5 text-xs text-text-secondary sm:text-[13px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {atRiskCount > 0 ? (
                      <>
                        <svg className="h-3.5 w-3.5 shrink-0 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-text-primary">
                          {atRiskCount} {atRiskCount === 1 ? 'task' : 'tasks'} at risk
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5 shrink-0 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-text-primary">No risks detected</span>
                      </>
                    )}
                  </div>
                  <div className="hidden h-3.5 w-px shrink-0 bg-border-subtle sm:block" aria-hidden />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {dueSoonCount > 0 ? (
                        <span className="font-medium text-text-primary">
                          {dueSoonCount} {dueSoonCount === 1 ? 'task' : 'tasks'} due soon
                        </span>
                      ) : (
                        <span className="text-text-muted">No upcoming deadlines</span>
                      )}
                    </span>
                  </div>
                  {waitingOn && (
                    <>
                      <div className="hidden h-3.5 w-px shrink-0 bg-border-subtle sm:block" aria-hidden />
                      <div className="flex items-center gap-1.5 min-w-0">
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
                  )}
                </div>

                <p className="text-[10px] leading-snug text-text-muted">
                  Health below is detected from tasks, documents, and closing timing — separate from pipeline
                  and record status.
                </p>
                <DealHealthSummary detection={issueDetection} compact />
              </div>
            </div>

            <div className="px-4 pb-6 pt-3 sm:px-5">
              <div className="mb-2.5 flex gap-1 overflow-x-auto border-b border-border-subtle [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 ${
                    activeTab === 'tasks'
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  Tasks & Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30 ${
                    activeTab === 'documents'
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  Documents
                </button>
              </div>

              <div ref={nextActionCelebrationAnchorRef} className="mb-3">
                <NextActionCard
                  variant="compact"
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
              </div>

              {activeTab === 'tasks' && (
                <TaskList
                  tasks={tasks}
                  users={users}
                  onToggleComplete={(taskId) =>
                    handleTaskToggleWithCloseCelebration(taskId, 'task_list')
                  }
                  readOnly={readOnly && !allowTaskStatusToggle}
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
                  onAddDocument={
                    canEditDocumentChecklist && onAddDocument
                      ? () => setShowAddDocumentModal(true)
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
                    (!readOnly || allowDocumentChecklistEdit) && onMarkDocumentComplete
                      ? (docId) => onMarkDocumentComplete(docId)
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[min(42vh,24rem)] min-h-[260px] w-full shrink-0 flex-col lg:h-auto lg:min-h-0 lg:w-2/5 lg:min-w-0 lg:max-w-none">
          <ChatPanel
            messages={messages}
            users={users}
            currentUserId={currentUserId}
            onSendMessage={(text) => onSendMessage(deal.id, text)}
            readOnly={readOnly && !allowDealChat}
            className="border-l-0 border-t border-border-subtle lg:border-l lg:border-t-0"
          />
        </div>
      </div>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        onAdd={handleAddDocument}
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
