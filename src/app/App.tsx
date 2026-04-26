import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
  useOutletContext,
} from 'react-router-dom';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { AuthDisabledInMockModePage } from './components/auth/AuthDisabledInMockModePage';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  Deal,
  DealPipelineStage,
  DocumentItem,
  Message,
  SignatureStatus,
  Task,
  User,
  type AddDealDocumentPayload,
  type AddWorkspacePersonInput,
} from './types';
import { mockDeals, mockTasks, mockMessages, mockDocuments, mockUsers } from './data/mockData';
import {
  getDealDataSourceMode,
  isWorkspaceReadOnly,
  shouldUseConvexWorkspaceReads,
} from './dealDataSource';
import { WorkspaceLinkBaseProvider, useWorkspaceGo } from './context/WorkspaceLinkBaseContext';
import { useDealWorkspaceReads } from '../hooks/useDealWorkspaceReads';
import { useWorkspaceMembershipOnboarding } from '../hooks/useWorkspaceMembershipOnboarding';
import { useWorkspaceCurrentUser } from '../hooks/useWorkspaceCurrentUser';
import { useWorkspaceIdentity } from '../hooks/useWorkspaceIdentity';
import { DealsDashboard } from './components/deals/DealsDashboard';
import { DealDetail } from './components/deals/DealDetail';
import { CreateDealFlow } from './components/create-deal/CreateDealFlow';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { TemplatesPage } from './components/templates/TemplatesPage';
import { TemplateBuilder } from './components/templates/TemplateBuilder';
import { SharedTemplateView } from './components/templates/sharing/SharedTemplateView';
import { AgentsPage } from './components/agents/AgentsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { WorkspaceRosterPage } from './components/workspace/WorkspaceRosterPage';
import { WorkspaceWelcomeStrip } from './components/workspace/WorkspaceWelcomeStrip';
import { DealHealthDemo } from './components/demo/DealHealthDemo';
import { DocumentDraft, TaskDraft } from './components/create-deal/Step3ReviewTasks';
import { AppShell } from './components/layout/AppShell';
import { WorkspaceLoadingPanel } from './components/layout/WorkspaceLoadingPanel';
import { WorkspaceMembershipGate } from './components/layout/WorkspaceMembershipGate';
import type { TransactionTemplate } from './types/template';
import { isBuiltInTemplateId } from './data/templateData';
import {
  isPersistedUserTemplate,
  recordUserTemplateApplyUsage,
} from './data/userTemplatesStorage';
import { appendDocumentsFromTemplate, appendTasksFromTemplate } from './utils/applyTemplateToDeal';
import { computeDealPhase, dealHasTaskPhaseCoverage } from './utils/dealPhaseFromTasks';
import { determineTaskStatus } from './utils/dealUtils';
import { displayLabelFromUrl, getMarkDocumentCompletePatch } from './utils/documentHelpers';
import {
  DemoAppRoot,
  DemoRouteNotFound,
  DemoWorkspaceShell,
  type DemoWorkspaceOutletContext,
} from './demo/DemoApp';

/** Mock workspace — local state only; does not call Convex hooks (no provider required). */
function AppContentMock() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { currentUserId, setCurrentUserId } = useWorkspaceCurrentUser(users);

  const handleAddWorkspacePerson = useCallback(async (input: AddWorkspacePersonInput) => {
    const emailLower = input.email.trim().toLowerCase();
    let duplicate = false;
    setUsers((prev) => {
      if (prev.some((u) => u.email.trim().toLowerCase() === emailLower)) {
        duplicate = true;
        return prev;
      }
      const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      return [
        ...prev,
        {
          id,
          name: input.name.trim(),
          email: input.email.trim(),
          partyLabel: input.partyLabel,
          permissionRole: input.permissionRole,
        },
      ];
    });
    if (duplicate) {
      window.alert('That email is already on the workspace roster.');
      throw new Error('duplicate email');
    }
  }, []);

  const handleWorkloadTaskAssignee = (taskId: string, assigneeId: string | null) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        if (assigneeId === null || assigneeId === '') {
          const { assigneeId: _removed, ...rest } = task;
          return rest as Task;
        }
        return { ...task, assigneeId };
      }),
    );
  };

  const handleApplyTemplate = (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const appended = appendTasksFromTemplate(
      template,
      deal,
      tasks,
      options.includeTasks,
      currentUserId,
    );
    const nextTasks = [...tasks, ...appended];
    setTasks(nextTasks);
    const forDeal = nextTasks.filter((t) => t.dealId === dealId);
    if (dealHasTaskPhaseCoverage(forDeal)) {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, pipelineStage: computeDealPhase(forDeal) } : d)),
      );
    }
    setDocuments((prev) => [
      ...prev,
      ...appendDocumentsFromTemplate(template, dealId, prev, options.includeDocuments),
    ]);

    if (isPersistedUserTemplate(template.id)) {
      recordUserTemplateApplyUsage(template.id);
    }
  };

  const handleSetDealArchived = (dealId: string, archived: boolean) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, archived } : d)));
  };

  return (
    <WorkspaceRoutes
      workspaceLoading={false}
      workspaceReadOnly={false}
      templateApplyDisabled={false}
      onApplyTemplate={handleApplyTemplate}
      deals={deals}
      setDeals={setDeals}
      tasks={tasks}
      setTasks={setTasks}
      messages={messages}
      setMessages={setMessages}
      documents={documents}
      setDocuments={setDocuments}
      users={users}
      currentUserId={currentUserId}
      onCurrentUserIdChange={setCurrentUserId}
      sessionEmail={undefined}
      hideRosterPicker={undefined}
      identityBanner={undefined}
      onSignOut={undefined}
      onWorkloadTaskAssigneeChange={handleWorkloadTaskAssignee}
      onSetDealArchived={handleSetDealArchived}
      onAddWorkspacePerson={handleAddWorkspacePerson}
    />
  );
}

/**
 * Convex mode — stays in sync with `getWorkspaceSnapshot` so creates and future writes reflect after mutations.
 */
function AppContentConvex() {
  const convexSnapshot = useDealWorkspaceReads(true);
  const [welcomeStripDismissTick, setWelcomeStripDismissTick] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const {
    currentUserId,
    setCurrentUserId,
    sessionEmail,
    identityMode,
    showRosterPicker,
  } = useWorkspaceIdentity(users);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const onboarding = useWorkspaceMembershipOnboarding(true);
  const applyTemplateToDealMut = useMutation(api.templateApply.applyTemplateToDeal);
  const updateTaskAssigneeMut = useMutation(api.taskUpdates.updateTaskAssignee);
  const setDealArchivedMut = useMutation(api.dealUpdates.setDealArchived);
  const addPersonToRosterMut = useMutation(api.workspaceRosterAdmin.addPersonToRoster);

  const handleAddWorkspacePerson = useCallback(
    async (input: AddWorkspacePersonInput) => {
      try {
        await addPersonToRosterMut({
          name: input.name,
          email: input.email,
          partyLabel: input.partyLabel,
          permissionRole: input.permissionRole,
        });
      } catch (e) {
        console.error(e);
        const msg =
          e instanceof Error ? e.message : 'Could not add person to the workspace roster. Try again.';
        window.alert(msg);
        throw e;
      }
    },
    [addPersonToRosterMut],
  );

  const handleSetDealArchived = (dealId: string, archived: boolean) => {
    void (async () => {
      try {
        await setDealArchivedMut({ dealId: dealId as Id<'deals'>, archived });
      } catch (e) {
        console.error(e);
        window.alert('Could not update archive state. Try again.');
      }
    })();
  };

  const handleWorkloadTaskAssignee = (taskId: string, assigneeId: string | null) => {
    void (async () => {
      try {
        await updateTaskAssigneeMut({
          taskId: taskId as Id<'tasks'>,
          assigneeId,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update assignee. Try again.');
      }
    })();
  };

  useEffect(() => {
    if (convexSnapshot.isLoading) return;
    if (convexSnapshot.deals === undefined) return;
    setDeals(convexSnapshot.deals);
    setTasks(convexSnapshot.tasks ?? []);
    setDocuments(convexSnapshot.documents ?? []);
    setMessages(convexSnapshot.messages ?? []);
    const roster = convexSnapshot.users;
    if (roster !== undefined) {
      setUsers(roster.length > 0 ? roster : mockUsers);
    }
  }, [
    convexSnapshot.isLoading,
    convexSnapshot.deals,
    convexSnapshot.tasks,
    convexSnapshot.documents,
    convexSnapshot.messages,
    convexSnapshot.users,
  ]);

  const handleApplyTemplate = (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const newTasks = appendTasksFromTemplate(
      template,
      deal,
      tasks,
      options.includeTasks,
      currentUserId,
    );
    const newDocs = appendDocumentsFromTemplate(template, dealId, documents, options.includeDocuments);

    void (async () => {
      try {
        const canRecordConvexTemplateUsage =
          !isBuiltInTemplateId(template.id) && !template.id.startsWith('user-');

        await applyTemplateToDealMut({
          dealId: dealId as Id<'deals'>,
          ...(canRecordConvexTemplateUsage
            ? { customTemplateId: template.id as Id<'customTransactionTemplates'> }
            : {}),
          tasks: newTasks.map(({ name, dueDate, status, assigneeId, phase, isGate }) => ({
            name,
            dueDate,
            status,
            ...(assigneeId !== undefined ? { assigneeId } : {}),
            ...(phase !== undefined ? { phase } : {}),
            ...(isGate === true ? { isGate: true } : {}),
          })),
          documents: newDocs.map((d) => ({
            name: d.name,
            status: d.status,
            signatureStatus: d.signatureStatus,
            ...(d.dueDate !== undefined ? { dueDate: d.dueDate } : {}),
            ...(d.referenceLink !== undefined ? { referenceLink: d.referenceLink } : {}),
            ...(d.notes !== undefined ? { notes: d.notes } : {}),
          })),
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not apply template. Try again.');
      }
    })();
  };

  const handleSignOut = () =>
    void signOut().then(() => navigate('/login', { replace: true }));

  const emailFallbackBanner: ReactNode =
    sessionEmail && identityMode === 'session-fallback' ? (
      <span>
        Signed in as {sessionEmail}, but no workspace profile matches this email. Pick someone below
        for tasks and chat, or update roster data.
      </span>
    ) : null;

  const identityBanner: ReactNode = emailFallbackBanner;

  /** Must run before any conditional returns — hooks cannot follow early `return`s. */
  const welcomeBanner = useMemo(() => {
    if (convexSnapshot.isLoading || convexSnapshot.workspaceAccess !== 'ok') return undefined;
    if (identityMode !== 'session') return undefined;
    const key =
      currentUserId.length > 0 ? `transactq_workspace_welcome_v1_${currentUserId}` : null;
    if (!key) return undefined;
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1') {
        return undefined;
      }
    } catch {
      /* ignore quota / private mode */
    }
    return (
      <WorkspaceWelcomeStrip
        users={users}
        currentUserId={currentUserId}
        deals={deals}
        tasks={tasks}
        onDismiss={() => {
          try {
            localStorage.setItem(key, '1');
          } catch {
            /* ignore */
          }
          setWelcomeStripDismissTick((n) => n + 1);
        }}
      />
    );
  }, [
    convexSnapshot.isLoading,
    convexSnapshot.workspaceAccess,
    identityMode,
    currentUserId,
    users,
    deals,
    tasks,
    welcomeStripDismissTick,
  ]);

  /** Full-screen onboarding: auto-claim in progress or roster mismatch after automatic claim. */
  if (!convexSnapshot.isLoading && onboarding.showClaimingOverlay) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-app p-6">
        <WorkspaceLoadingPanel
          showSpinner
          title="Setting up your workspace…"
          subtitle="This will just take a second."
          className="w-full max-w-md"
        />
      </div>
    );
  }

  if (!convexSnapshot.isLoading && onboarding.showNoAccessGate) {
    return (
      <WorkspaceMembershipGate
        email={sessionEmail}
        blockKind={onboarding.membershipBlockKind}
        onRetry={onboarding.retry}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <WorkspaceRoutes
      workspaceLoading={convexSnapshot.isLoading}
      workspaceReadOnly={isWorkspaceReadOnly()}
      templateApplyDisabled={false}
      onApplyTemplate={handleApplyTemplate}
      deals={deals}
      setDeals={setDeals}
      tasks={tasks}
      setTasks={setTasks}
      messages={messages}
      setMessages={setMessages}
      documents={documents}
      setDocuments={setDocuments}
      users={users}
      currentUserId={currentUserId}
      onCurrentUserIdChange={setCurrentUserId}
      sessionEmail={sessionEmail}
      hideRosterPicker={!showRosterPicker}
      identityBanner={identityBanner}
      welcomeBanner={welcomeBanner}
      onSignOut={handleSignOut}
      onWorkloadTaskAssigneeChange={handleWorkloadTaskAssignee}
      onSetDealArchived={handleSetDealArchived}
      onAddWorkspacePerson={handleAddWorkspacePerson}
    />
  );
}

/**
 * Inner workspace route tree — **not** top-level `App` routes.
 *
 * Renders inside {@link AuthenticatedApp} (`path="/*"`), behind `AppShell`. Public demo uses nested routes
 * under `/demo` in `App` — not this tree.
 *
 * Core paths: `/`, `/transactions`, `/templates`, `/agents`, `/reports`, `/workspace/roster`, `/deals/new`,
 * `/deals/:dealId` (plus templates builder, shared template, deal-health demo, …).
 */
function WorkspaceRoutes({
  workspaceLoading = false,
  workspaceReadOnly,
  templateApplyDisabled,
  onApplyTemplate,
  deals,
  setDeals,
  tasks,
  setTasks,
  messages,
  setMessages,
  documents,
  setDocuments,
  users,
  currentUserId,
  onCurrentUserIdChange,
  sessionEmail,
  hideRosterPicker,
  identityBanner,
  welcomeBanner,
  onSignOut,
  onWorkloadTaskAssigneeChange,
  onSetDealArchived,
  onAddWorkspacePerson,
}: {
  workspaceLoading?: boolean;
  workspaceReadOnly: boolean;
  /** When true, template Apply CTAs stay disabled (e.g. future gating). */
  templateApplyDisabled: boolean;
  onApplyTemplate: (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => void;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  users: User[];
  currentUserId: string;
  onCurrentUserIdChange: (userId: string) => void;
  sessionEmail?: string | null;
  hideRosterPicker?: boolean;
  identityBanner?: ReactNode;
  /** Dismissible strip after roster-backed session gains workspace access (Convex only). */
  welcomeBanner?: ReactNode;
  onSignOut?: () => void | Promise<void>;
  onWorkloadTaskAssigneeChange: (taskId: string, assigneeId: string | null) => void;
  onSetDealArchived: (dealId: string, archived: boolean) => void;
  onAddWorkspacePerson?: (input: AddWorkspacePersonInput) => void | Promise<void>;
}) {
  const go = useWorkspaceGo();

  return (
    <WorkspaceLinkBaseProvider value="">
      <AppShell
        welcomeBanner={welcomeBanner}
        identityBanner={identityBanner}
        workspaceIdentity={{
          users,
          currentUserId,
          onChange: onCurrentUserIdChange,
          sessionEmail: sessionEmail ?? undefined,
          hideRosterPicker,
          onSignOut,
        }}
      >
        <>
        <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              workspaceLoading={workspaceLoading}
              deals={deals}
              tasks={tasks}
              messages={messages}
              documents={documents}
              createDealDisabled={false}
              onSetDealArchived={onSetDealArchived}
              onStartNewClosing={() => go('/deals/new')}
            />
          }
        />
        <Route
          path="/transactions"
          element={
            <TransactionsPageRoute
              workspaceLoading={workspaceLoading}
              deals={deals}
              tasks={tasks}
              messages={messages}
              documents={documents}
              createDealDisabled={false}
              onStartNewClosing={() => go('/deals/new')}
            />
          }
        />
        <Route
          path="/templates"
          element={
            <TemplatesPage
              workspaceLoading={workspaceLoading}
              deals={deals}
              onApplyTemplate={onApplyTemplate}
              templateApplyDisabled={templateApplyDisabled}
            />
          }
        />
        <Route
          path="/templates/new"
          element={<TemplateBuilder />}
        />
        <Route
          path="/templates/:templateId/edit"
          element={<TemplateBuilder />}
        />
        <Route
          path="/shared/templates/:templateId"
          element={
            <SharedTemplateView
              workspaceLoading={workspaceLoading}
              deals={deals}
              onApplyTemplate={onApplyTemplate}
              templateApplyDisabled={templateApplyDisabled}
            />
          }
        />
        <Route
          path="/agents"
          element={
            <AgentsPage
              deals={deals}
              tasks={tasks}
              documents={documents}
              users={users}
              workspaceLoading={workspaceLoading}
              onWorkloadTaskAssigneeChange={onWorkloadTaskAssigneeChange}
            />
          }
        />
        <Route
          path="/reports"
          element={<ReportsPage />}
        />
        <Route
          path="/workspace/roster"
          element={<WorkspaceRosterPage />}
        />
        <Route path="/deal-health" element={<DealHealthDemo />} />
        <Route
          path="/deals/new"
          element={
            <CreateDealPage
              deals={deals}
              setDeals={setDeals}
              tasks={tasks}
              setTasks={setTasks}
              documents={documents}
              setDocuments={setDocuments}
              defaultAssigneeId={currentUserId}
            />
          }
        />
        <Route
          path="/deals/:dealId"
          element={
            <DealDetailPage
              workspaceLoading={workspaceLoading}
              workspaceReadOnly={workspaceReadOnly}
              deals={deals}
              setDeals={setDeals}
              tasks={tasks}
              setTasks={setTasks}
              messages={messages}
              setMessages={setMessages}
              documents={documents}
              setDocuments={setDocuments}
              users={users}
              currentUserId={currentUserId}
              onSetDealArchived={onSetDealArchived}
              onAddWorkspacePerson={onAddWorkspacePerson}
            />
          }
        />
        <Route
          path="*"
          element={
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-8 text-center text-sm text-text-muted">
              Route not found
            </div>
          }
        />
        </Routes>
        </>
      </AppShell>
    </WorkspaceLinkBaseProvider>
  );
}

function DashboardPage({
  workspaceLoading = false,
  deals,
  tasks,
  messages,
  documents,
  createDealDisabled,
  onSetDealArchived,
  onStartNewClosing,
}: {
  workspaceLoading?: boolean;
  deals: Deal[];
  tasks: Task[];
  messages: Message[];
  documents: DocumentItem[];
  createDealDisabled: boolean;
  onSetDealArchived: (dealId: string, archived: boolean) => void;
  onStartNewClosing: () => void;
}) {
  const go = useWorkspaceGo();

  return (
    <DealsDashboard
      workspaceLoading={workspaceLoading}
      deals={deals}
      tasks={tasks}
      messages={messages}
      documents={documents}
      onSelectDeal={(dealId) => go(`/deals/${dealId}`)}
      onStartNewClosing={onStartNewClosing}
      onImportFromMls={() => go('/deals/new')}
      createDealDisabled={createDealDisabled}
      onSetDealArchived={onSetDealArchived}
    />
  );
}

function TransactionsPageRoute({
  workspaceLoading = false,
  deals,
  tasks,
  messages,
  documents,
  createDealDisabled,
  onStartNewClosing,
}: {
  workspaceLoading?: boolean;
  deals: Deal[];
  tasks: Task[];
  messages: Message[];
  documents: DocumentItem[];
  createDealDisabled: boolean;
  onStartNewClosing: () => void;
}) {
  return (
    <TransactionsPage
      workspaceLoading={workspaceLoading}
      deals={deals}
      tasks={tasks}
      messages={messages}
      documents={documents}
      onStartNewClosing={onStartNewClosing}
      createDealDisabled={createDealDisabled}
    />
  );
}

function CreateDealPage({
  deals,
  setDeals,
  tasks,
  setTasks,
  documents,
  setDocuments,
  defaultAssigneeId,
}: {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  documents: DocumentItem[];
  setDocuments: (documents: DocumentItem[]) => void;
  defaultAssigneeId: string;
}) {
  return shouldUseConvexWorkspaceReads() ? (
    <CreateDealPageConvex defaultAssigneeId={defaultAssigneeId} />
  ) : (
    <CreateDealPageMock
      deals={deals}
      setDeals={setDeals}
      tasks={tasks}
      setTasks={setTasks}
      documents={documents}
      setDocuments={setDocuments}
      defaultAssigneeId={defaultAssigneeId}
    />
  );
}

/** Local mock persistence — unchanged from pre-Convex behavior. */
function CreateDealPageMock({
  deals,
  setDeals,
  tasks,
  setTasks,
  documents,
  setDocuments,
  defaultAssigneeId,
}: {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  documents: DocumentItem[];
  setDocuments: (documents: DocumentItem[]) => void;
  defaultAssigneeId: string;
}) {
  const go = useWorkspaceGo();

  const handleCreateDeal = (dealData: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
    tasks: TaskDraft[];
    documents: DocumentDraft[];
  }) => {
    const newDeal: Deal = {
      id: `d${deals.length + 1}`,
      propertyAddress: dealData.propertyAddress,
      buyerName: dealData.buyerName,
      sellerName: dealData.sellerName,
      closingDate: dealData.closingDate,
      status: 'active',
      createdAt: new Date().toISOString(),
      pipelineStage: 'under-contract',
    };

    const newTasks: Task[] = dealData.tasks.map((taskDraft, index) => {
      const base: Task = {
        id: `t${tasks.length + index + 1}`,
        dealId: newDeal.id,
        name: taskDraft.name,
        dueDate: taskDraft.dueDate,
        status: 'upcoming',
        assigneeId: defaultAssigneeId,
      };
      return { ...base, status: determineTaskStatus(base) };
    });

    const namedDocDrafts = dealData.documents.filter((d) => d.name.trim().length > 0);
    const newDocuments: DocumentItem[] = namedDocDrafts.map((d, index) => ({
      id: `doc${documents.length + index + 1}`,
      dealId: newDeal.id,
      name: d.name.trim(),
      status: 'not-started',
      signatureStatus: d.signatureRequired ? 'requested' : 'not-required',
    }));

    setDeals([...deals, newDeal]);
    setTasks([...tasks, ...newTasks]);
    setDocuments([...documents, ...newDocuments]);
    go(`/deals/${newDeal.id}`);
  };

  return <CreateDealFlow onCreateDeal={handleCreateDeal} />;
}

/** Convex: one atomic mutation; list views update via `getWorkspaceSnapshot` subscription. */
function CreateDealPageConvex({ defaultAssigneeId }: { defaultAssigneeId: string }) {
  const navigate = useNavigate();
  const createDealMutation = useMutation(api.createDeal.createDealWithWorkspace);

  const handleCreateDeal = (dealData: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
    closingDate: string;
    tasks: TaskDraft[];
    documents: DocumentDraft[];
  }) => {
    void (async () => {
      const createdAt = new Date().toISOString();
      const placeholderDealId = 'pending';
      const taskRows = dealData.tasks.map((taskDraft, index) => {
        const base: Task = {
          id: `tmp-${index}`,
          dealId: placeholderDealId,
          name: taskDraft.name,
          dueDate: taskDraft.dueDate,
          status: 'upcoming',
        };
        return {
          name: taskDraft.name,
          dueDate: taskDraft.dueDate,
          status: determineTaskStatus(base),
          assigneeId: defaultAssigneeId,
        };
      });

      const namedDocDrafts = dealData.documents.filter((d) => d.name.trim().length > 0);
      const documentRows = namedDocDrafts.map((d) => ({
        name: d.name.trim(),
        status: 'not-started' as const,
        signatureStatus: (d.signatureRequired ? 'requested' : 'not-required') as SignatureStatus,
      }));

      try {
        const { dealId } = await createDealMutation({
          propertyAddress: dealData.propertyAddress,
          buyerName: dealData.buyerName,
          sellerName: dealData.sellerName,
          closingDate: dealData.closingDate,
          createdAt,
          status: 'active',
          pipelineStage: 'under-contract',
          tasks: taskRows,
          documents: documentRows,
        });
        navigate(`/deals/${dealId}`);
      } catch (e) {
        console.error(e);
        window.alert('Could not create deal. Check your connection and try again.');
      }
    })();
  };

  return <CreateDealFlow onCreateDeal={handleCreateDeal} />;
}

type DealDetailPageProps = {
  /** True until Convex workspace snapshot hydrates — avoids flash of “not found” / empty lists. */
  workspaceLoading?: boolean;
  workspaceReadOnly: boolean;
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  documents: DocumentItem[];
  setDocuments: (documents: DocumentItem[]) => void;
  users: User[];
  currentUserId: string;
  onSetDealArchived: (dealId: string, archived: boolean) => void;
  onAddWorkspacePerson?: (input: AddWorkspacePersonInput) => void | Promise<void>;
};

function DealDetailPage(props: DealDetailPageProps) {
  return shouldUseConvexWorkspaceReads() ? (
    <DealDetailPageConvex {...props} />
  ) : (
    <DealDetailPageMock {...props} />
  );
}

/** Mock / local state — pipeline stage updates `deals` in memory only. */
function DealDetailPageMock({
  workspaceReadOnly,
  deals,
  setDeals,
  tasks,
  setTasks,
  messages,
  setMessages,
  documents,
  setDocuments,
  users,
  currentUserId,
  onSetDealArchived,
  onAddWorkspacePerson,
}: DealDetailPageProps) {
  const go = useWorkspaceGo();
  const { dealId } = useParams<{ dealId: string }>();

  const deal = deals.find((d) => d.id === dealId);
  const dealTasks = tasks.filter((t) => t.dealId === dealId);
  const dealMessages = messages.filter((m) => m.dealId === dealId);
  const dealDocuments = documents.filter((d) => d.dealId === dealId);

  const handleToggleTask = (taskId: string) => {
    if (!dealId) return;
    const nextTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'complete' ? 'active' : 'complete',
        };
      }
      return task;
    });
    setTasks(nextTasks);
    const forDeal = nextTasks.filter((t) => t.dealId === dealId);
    if (dealHasTaskPhaseCoverage(forDeal)) {
      const nextStage = computeDealPhase(forDeal);
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, pipelineStage: nextStage } : d)));
    }
  };

  const handleChangeTaskAssignee = (taskId: string, assigneeId: string | null) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        if (assigneeId === null || assigneeId === '') {
          const { assigneeId: _removed, ...rest } = task;
          return rest as Task;
        }
        return { ...task, assigneeId };
      }),
    );
  };

  const handleSendMessage = (dealIdParam: string, text: string) => {
    const newMessage: Message = {
      id: `m${messages.length + 1}`,
      dealId: dealIdParam,
      senderId: currentUserId,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
  };

  const handleAddDocument = async (payload: AddDealDocumentPayload) => {
    const id = `doc${Date.now()}`;
    if (payload.kind === 'link') {
      const url = payload.url.trim();
      const name = payload.name?.trim() || displayLabelFromUrl(url);
      const newDocument: DocumentItem = {
        id,
        dealId: dealId!,
        name,
        status: 'completed',
        signatureStatus: 'not-required',
        referenceLink: url,
        attachmentKind: 'link',
      };
      setDocuments((prev) => [...prev, newDocument]);
      return;
    }
    const name = payload.name?.trim() || payload.file.name;
    const fileUrl = URL.createObjectURL(payload.file);
    const newDocument: DocumentItem = {
      id,
      dealId: dealId!,
      name,
      status: 'completed',
      signatureStatus: 'not-required',
      attachmentKind: 'file',
      fileUrl,
    };
    setDocuments((prev) => [...prev, newDocument]);
  };

  const handlePipelineStageChange = (stage: DealPipelineStage) => {
    if (!dealId) return;
    setDeals(deals.map((d) => (d.id === dealId ? { ...d, pipelineStage: stage } : d)));
  };

  const handleMarkDocumentComplete = (documentId: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === documentId ? { ...doc, ...getMarkDocumentCompletePatch(doc) } : doc,
      ),
    );
  };

  const handleUpdateDocumentReferenceLink = (documentId: string, referenceLink: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === documentId ? { ...doc, referenceLink: referenceLink || undefined } : doc,
      ),
    );
  };

  const handleUpdateDocumentNotes = (documentId: string, notes: string) => {
    setDocuments(
      documents.map((doc) => (doc.id === documentId ? { ...doc, notes: notes || undefined } : doc)),
    );
  };

  const handleUpdateDealMetadata = (fields: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
  }) => {
    if (!dealId) return;
    setDeals(deals.map((d) => (d.id === dealId ? { ...d, ...fields } : d)));
  };

  if (!deal) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-app">
        <div className="text-center">
          <h2 className="font-bold text-text-primary mb-2">Deal not found</h2>
          <button
            type="button"
            onClick={() => go('/')}
            className="text-accent-blue hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DealDetail
      deal={deal}
      tasks={dealTasks}
      messages={dealMessages}
      documents={dealDocuments}
      users={users}
      currentUserId={currentUserId}
      readOnly={workspaceReadOnly}
      onBack={() => go('/')}
      onToggleTask={handleToggleTask}
      onChangeTaskAssignee={handleChangeTaskAssignee}
      onSendMessage={handleSendMessage}
      onAddDocument={handleAddDocument}
      onPipelineStageChange={handlePipelineStageChange}
      onMarkDocumentComplete={handleMarkDocumentComplete}
      onUpdateDocumentReferenceLink={handleUpdateDocumentReferenceLink}
      onUpdateDocumentNotes={handleUpdateDocumentNotes}
      onUpdateDealMetadata={handleUpdateDealMetadata}
      onRestoreFromArchive={
        deal.archived ? () => onSetDealArchived(deal.id, false) : undefined
      }
      onArchiveDeal={
        deal.archived ? undefined : () => onSetDealArchived(deal.id, true)
      }
      onAddWorkspacePerson={onAddWorkspacePerson}
    />
  );
}

/** Convex: persist pipeline stage via mutation; snapshot sync refreshes lists. Other actions stay read-only in UI. */
function DealDetailPageConvex({
  workspaceLoading: _workspaceLoadingUnused = false,
  deals,
  tasks,
  messages,
  documents,
  users,
  currentUserId,
  setMessages: _setMessagesUnused,
  onSetDealArchived,
  onAddWorkspacePerson,
}: DealDetailPageProps) {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  /** Same subscription as workspace reads — resolves the deal as soon as Convex pushes, avoiding a “not found” flash before parent React state catches up after create/navigate. */
  const workspaceSnapshot = useQuery(api.workspace.getWorkspaceSnapshot, {});
  const updatePipelineStage = useMutation(api.dealUpdates.updateDealPipelineStage);
  const updateDealMetadataMut = useMutation(api.dealUpdates.updateDealMetadata);
  const updateTaskStatusMut = useMutation(api.taskUpdates.updateTaskStatus);
  const updateTaskAssigneeMut = useMutation(api.taskUpdates.updateTaskAssignee);
  const updateDealDocumentMut = useMutation(api.documentUpdates.updateDealDocument);
  const createDealDocumentMut = useMutation(api.documentUpdates.createDealDocument);
  const generateDealDocumentUploadUrlMut = useMutation(api.documentUpdates.generateDealDocumentUploadUrl);
  const createDealMessageMut = useMutation(api.dealMessages.createDealMessage);

  const deal =
    workspaceSnapshot !== undefined
      ? workspaceSnapshot.deals.find((d) => d.id === dealId) ?? deals.find((d) => d.id === dealId)
      : undefined;
  const dealTasks = tasks.filter((t) => t.dealId === dealId);
  const dealMessages = messages.filter((m) => m.dealId === dealId);
  const dealDocuments = documents.filter((d) => d.dealId === dealId);

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextStatus = task.status === 'complete' ? 'active' : 'complete';
    void (async () => {
      try {
        await updateTaskStatusMut({
          taskId: taskId as Id<'tasks'>,
          status: nextStatus,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update task. Try again.');
      }
    })();
  };

  const handleChangeTaskAssignee = (taskId: string, assigneeId: string | null) => {
    void (async () => {
      try {
        await updateTaskAssigneeMut({
          taskId: taskId as Id<'tasks'>,
          assigneeId,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update assignee. Try again.');
      }
    })();
  };

  const handleMarkDocumentComplete = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;
    const patch = getMarkDocumentCompletePatch(doc);
    void (async () => {
      try {
        await updateDealDocumentMut({
          documentId: documentId as Id<'dealDocuments'>,
          status: patch.status,
          signatureStatus: patch.signatureStatus,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update document. Try again.');
      }
    })();
  };

  const handleSendMessage = (dealIdParam: string, text: string) => {
    void (async () => {
      try {
        await createDealMessageMut({
          dealId: dealIdParam as Id<'deals'>,
          text,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not send message. Try again.');
      }
    })();
  };

  const handleAddDocument = async (payload: AddDealDocumentPayload) => {
    if (!dealId) return;
    if (payload.kind === 'link') {
      const url = payload.url.trim();
      const name = payload.name?.trim() || displayLabelFromUrl(url);
      await createDealDocumentMut({
        dealId: dealId as Id<'deals'>,
        name,
        status: 'completed',
        signatureStatus: 'not-required',
        referenceLink: url,
        attachmentKind: 'link',
      });
      return;
    }
    const postUrl = await generateDealDocumentUploadUrlMut({});
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': payload.file.type || 'application/octet-stream' },
      body: payload.file,
    });
    if (!res.ok) {
      throw new Error('Upload failed');
    }
    const storageId = (await res.text()).trim();
    const name = payload.name?.trim() || payload.file.name;
    await createDealDocumentMut({
      dealId: dealId as Id<'deals'>,
      name,
      status: 'completed',
      signatureStatus: 'not-required',
      attachmentKind: 'file',
      fileStorageId: storageId as Id<'_storage'>,
    });
  };

  const handleUpdateDocumentReferenceLink = (documentId: string, referenceLink: string) => {
    void (async () => {
      try {
        await updateDealDocumentMut({
          documentId: documentId as Id<'dealDocuments'>,
          referenceLink: referenceLink || '',
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update document link. Try again.');
      }
    })();
  };

  const handleUpdateDocumentNotes = (documentId: string, notes: string) => {
    void (async () => {
      try {
        await updateDealDocumentMut({
          documentId: documentId as Id<'dealDocuments'>,
          notes: notes || '',
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update document notes. Try again.');
      }
    })();
  };

  const handlePipelineStageChange = (stage: DealPipelineStage) => {
    if (!dealId) return;
    void (async () => {
      try {
        await updatePipelineStage({
          dealId: dealId as Id<'deals'>,
          pipelineStage: stage,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update pipeline stage. Try again.');
      }
    })();
  };

  const handleUpdateDealMetadata = (fields: {
    propertyAddress: string;
    buyerName: string;
    sellerName: string;
  }) => {
    if (!dealId) return;
    void (async () => {
      try {
        await updateDealMetadataMut({
          dealId: dealId as Id<'deals'>,
          ...fields,
        });
      } catch (e) {
        console.error(e);
        window.alert('Could not update deal. Try again.');
      }
    })();
  };

  if (workspaceSnapshot === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-app p-6">
        <WorkspaceLoadingPanel
          title="Loading deal…"
          subtitle="Syncing workspace from the server."
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-app">
        <div className="text-center">
          <h2 className="font-bold text-text-primary mb-2">Deal not found</h2>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-accent-blue hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DealDetail
      deal={deal}
      tasks={dealTasks}
      messages={dealMessages}
      documents={dealDocuments}
      users={users}
      currentUserId={currentUserId}
      readOnly
      allowPipelineStageEdit
      allowTaskStatusToggle
      allowDocumentChecklistEdit
      allowDealChat
      allowDealMetadataEdit
      onBack={() => navigate('/')}
      onToggleTask={handleToggleTask}
      onChangeTaskAssignee={handleChangeTaskAssignee}
      onSendMessage={handleSendMessage}
      onAddDocument={handleAddDocument}
      onPipelineStageChange={handlePipelineStageChange}
      onMarkDocumentComplete={handleMarkDocumentComplete}
      onUpdateDocumentReferenceLink={handleUpdateDocumentReferenceLink}
      onUpdateDocumentNotes={handleUpdateDocumentNotes}
      onUpdateDealMetadata={handleUpdateDealMetadata}
      onRestoreFromArchive={
        deal.archived ? () => onSetDealArchived(deal.id, false) : undefined
      }
      onArchiveDeal={
        deal.archived ? undefined : () => onSetDealArchived(deal.id, true)
      }
      onAddWorkspacePerson={onAddWorkspacePerson}
    />
  );
}

// --- Public `/demo/*` nested routes (outlet context from `DemoWorkspaceShell`)

function DemoWorkspaceIndex() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <DashboardPage
      workspaceLoading={false}
      deals={ctx.deals}
      tasks={ctx.tasks}
      messages={ctx.messages}
      documents={ctx.documents}
      createDealDisabled={false}
      onSetDealArchived={ctx.onSetDealArchived}
      onStartNewClosing={ctx.onStartNewClosing}
    />
  );
}

function DemoTransactions() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <TransactionsPageRoute
      workspaceLoading={false}
      deals={ctx.deals}
      tasks={ctx.tasks}
      messages={ctx.messages}
      documents={ctx.documents}
      createDealDisabled={false}
      onStartNewClosing={ctx.onStartNewClosing}
    />
  );
}

function DemoTemplates() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <TemplatesPage
      workspaceLoading={false}
      deals={ctx.deals}
      onApplyTemplate={ctx.onApplyTemplate}
      templateApplyDisabled={false}
    />
  );
}

function DemoSharedTemplate() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <SharedTemplateView
      workspaceLoading={false}
      deals={ctx.deals}
      onApplyTemplate={ctx.onApplyTemplate}
      templateApplyDisabled={false}
    />
  );
}

function DemoAgents() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <AgentsPage
      deals={ctx.deals}
      tasks={ctx.tasks}
      documents={ctx.documents}
      users={ctx.users}
      workspaceLoading={false}
      onWorkloadTaskAssigneeChange={ctx.onWorkloadTaskAssignee}
    />
  );
}

function DemoCreateDeal() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <CreateDealPage
      deals={ctx.deals}
      setDeals={ctx.setDeals}
      tasks={ctx.tasks}
      setTasks={ctx.setTasks}
      documents={ctx.documents}
      setDocuments={ctx.setDocuments}
      defaultAssigneeId={ctx.currentUserId}
    />
  );
}

function DemoDealDetail() {
  const ctx = useOutletContext<DemoWorkspaceOutletContext>();
  return (
    <DealDetailPage
      workspaceLoading={false}
      workspaceReadOnly={false}
      deals={ctx.deals}
      setDeals={ctx.setDeals}
      tasks={ctx.tasks}
      setTasks={ctx.setTasks}
      messages={ctx.messages}
      setMessages={ctx.setMessages}
      documents={ctx.documents}
      setDocuments={ctx.setDocuments}
      users={ctx.users}
      currentUserId={ctx.currentUserId}
      onSetDealArchived={ctx.onSetDealArchived}
      onAddWorkspacePerson={ctx.onAddWorkspacePerson}
    />
  );
}

/** Workspace UI when Convex reads + URL are configured — requires Convex Auth session. */
function ConvexAuthenticatedWorkspace() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-app p-6">
        <WorkspaceLoadingPanel
          title="Loading workspace"
          subtitle="Restoring your session."
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <AppContentConvex />;
}

/** Authenticated app shell at `/*` — mock workspace or Convex (with auth gate inside Convex branch). */
function AuthenticatedApp() {
  /** Explicit mock branch — never mount Convex auth/workspace subscription gate for demo data. */
  if (getDealDataSourceMode() === 'mock') {
    return <AppContentMock />;
  }

  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) {
    return <AppContentMock />;
  }

  return <ConvexAuthenticatedWorkspace />;
}

export default function App() {
  const mockMode = getDealDataSourceMode() === 'mock';
  const location = useLocation();

  useEffect(() => {
    console.log('App route:', window.location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/demo/*" element={<DemoAppRoot />}>
        <Route element={<DemoWorkspaceShell />}>
          <Route index element={<DemoWorkspaceIndex />} />
          <Route path="transactions" element={<DemoTransactions />} />
          <Route path="templates" element={<DemoTemplates />} />
          <Route path="templates/new" element={<TemplateBuilder />} />
          <Route path="templates/:templateId/edit" element={<TemplateBuilder />} />
          <Route path="shared/templates/:templateId" element={<DemoSharedTemplate />} />
          <Route path="agents" element={<DemoAgents />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="workspace/roster" element={<WorkspaceRosterPage />} />
          <Route path="deal-health" element={<DealHealthDemo />} />
          <Route path="deals/new" element={<DemoCreateDeal />} />
          <Route path="deals/:dealId" element={<DemoDealDetail />} />
          <Route path="*" element={<DemoRouteNotFound />} />
        </Route>
      </Route>
      <Route
        path="/login"
        element={
          mockMode ? (
            <AuthDisabledInMockModePage />
          ) : (
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/signup"
        element={
          mockMode ? (
            <AuthDisabledInMockModePage />
          ) : (
            <AuthLayout>
              <SignUpPage />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          mockMode ? (
            <AuthDisabledInMockModePage />
          ) : (
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          )
        }
      />
      <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
  );
}