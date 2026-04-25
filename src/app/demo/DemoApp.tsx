import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import type { Deal, DocumentItem, Message, Task, User } from '../types';
import type { TransactionTemplate } from '../types/template';
import { mockDeals, mockTasks, mockMessages, mockDocuments, mockUsers } from '../data/mockData';
import { beginIsolatedDemoWorkspace, endIsolatedDemoWorkspace } from '../dealDataSource';
import { WorkspaceLinkBaseProvider } from '../context/WorkspaceLinkBaseContext';
import { AppShell } from '../components/layout/AppShell';
import { useWorkspaceCurrentUser } from '../../hooks/useWorkspaceCurrentUser';
import { isBuiltInTemplateId } from '../data/templateData';
import {
  isPersistedUserTemplate,
  recordUserTemplateApplyUsage,
} from '../data/userTemplatesStorage';
import { appendDocumentsFromTemplate, appendTasksFromTemplate } from '../utils/applyTemplateToDeal';
/** All mock workspace state + handlers passed to nested demo routes via `<Outlet context />`. */
export type DemoWorkspaceOutletContext = {
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
  setCurrentUserId: (id: string) => void;
  onApplyTemplate: (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => void;
  onWorkloadTaskAssignee: (taskId: string, assigneeId: string | null) => void;
  onSetDealArchived: (dealId: string, archived: boolean) => void;
};

export function useDemoWorkspaceOutletContext(): DemoWorkspaceOutletContext {
  return useOutletContext<DemoWorkspaceOutletContext>();
}

/**
 * `/demo` root — isolation ref-count + provider. Renders `<Outlet />` for the shell + pages.
 */
export function DemoAppRoot() {
  const isolatedBegunRef = useRef(false);
  if (!isolatedBegunRef.current) {
    isolatedBegunRef.current = true;
    beginIsolatedDemoWorkspace();
  }
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[DemoApp] Rendering demo routes', window.location.pathname);
    }
    return () => {
      isolatedBegunRef.current = false;
      endIsolatedDemoWorkspace();
    };
  }, []);

  return (
    <WorkspaceLinkBaseProvider value="/demo">
      <Outlet />
    </WorkspaceLinkBaseProvider>
  );
}

/**
 * Mock state + AppShell + `<Outlet />` for page content. Nested under `/demo` in the router tree.
 */
export function DemoWorkspaceShell() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [users] = useState<User[]>(mockUsers);
  const { currentUserId, setCurrentUserId } = useWorkspaceCurrentUser(users);

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

  const handleSetDealArchived = (dealId: string, archived: boolean) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, archived } : d)));
  };

  const handleApplyTemplate = (
    template: TransactionTemplate,
    dealId: string,
    options: { includeTasks: boolean; includeDocuments: boolean },
  ) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    setTasks((prev) => [
      ...prev,
      ...appendTasksFromTemplate(template, deal, prev, options.includeTasks, currentUserId),
    ]);
    setDocuments((prev) => [
      ...prev,
      ...appendDocumentsFromTemplate(template, dealId, prev, options.includeDocuments),
    ]);

    if (isPersistedUserTemplate(template.id)) {
      recordUserTemplateApplyUsage(template.id);
    }
  };

  const outletCtx: DemoWorkspaceOutletContext = {
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
    setCurrentUserId,
    onApplyTemplate: handleApplyTemplate,
    onWorkloadTaskAssignee: handleWorkloadTaskAssignee,
    onSetDealArchived: handleSetDealArchived,
  };

  return (
    <AppShell
      workspaceIdentity={{
        users,
        currentUserId,
        onChange: setCurrentUserId,
        sessionEmail: undefined,
        hideRosterPicker: undefined,
        onSignOut: undefined,
      }}
    >
      <Outlet context={outletCtx} />
    </AppShell>
  );
}

export function DemoRouteNotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm font-medium text-text-primary">Page not found in demo</p>
      <p className="max-w-md text-xs text-text-muted">
        This path isn&apos;t part of the public demo. Try the dashboard or go back.
      </p>
      <button
        type="button"
        onClick={() => navigate('/demo', { replace: true })}
        className="text-sm font-medium text-accent-blue hover:underline"
      >
        Back to demo home
      </button>
    </div>
  );
}
