import type { Deal, DocumentItem, Task, User } from '../types';
import type { WorkloadLevel } from '../types/agent';
import type { DealHealthLevel } from './dealIssueDetection';
import { detectDealIssues } from './dealIssueDetection';

export interface UserWorkloadRow {
  userId: string;
  name: string;
  email: string;
  /** Incomplete assigned tasks on active (non-complete) deals */
  openAssignedTasks: number;
  overdueTasks: number;
  /** Tasks with status `at-risk` among open assigned tasks */
  atRiskTaskStatusCount: number;
  /** Distinct active deals where the user has at least one incomplete assigned task */
  activeDealsTouched: number;
  /** Among those touched deals, count where derived health is `at-risk` */
  dealsDerivedAtRiskHealth: number;
  /** Incomplete checklist documents on those touched deals */
  incompleteDocumentsOnWorkloadDeals: number;
  nextUrgent?: {
    taskId: string;
    title: string;
    dueDate: string;
    dealId: string;
    dealAddress: string;
  };
  workloadLevel: WorkloadLevel;
}

export interface UserWorkloadDetail {
  row: UserWorkloadRow;
  incompleteTasks: Task[];
  touchedDeals: Array<{
    deal: Deal;
    health: DealHealthLevel;
    incompleteTaskCount: number;
    incompleteDocCount: number;
  }>;
}

function isActivePipelineDeal(deal: Deal): boolean {
  return deal.status !== 'complete';
}

function isIncompleteDoc(d: DocumentItem): boolean {
  return d.status !== 'signed' && d.status !== 'completed';
}

function deriveWorkloadLevel(
  open: number,
  overdue: number,
  atRiskDeals: number,
): WorkloadLevel {
  if (overdue >= 4 || open >= 20 || atRiskDeals >= 6) return 'overloaded';
  if (overdue >= 2 || open >= 12 || atRiskDeals >= 3) return 'heavy';
  if (open >= 6 || overdue >= 1 || atRiskDeals >= 1) return 'normal';
  return 'light';
}

function attentionReason(row: UserWorkloadRow): string | undefined {
  if (row.overdueTasks > 0) {
    return `${row.overdueTasks} overdue task${row.overdueTasks === 1 ? '' : 's'}`;
  }
  if (row.dealsDerivedAtRiskHealth > 0) {
    return `${row.dealsDerivedAtRiskHealth} deal${row.dealsDerivedAtRiskHealth === 1 ? '' : 's'} with at‑risk health`;
  }
  if (row.atRiskTaskStatusCount > 0) {
    return `${row.atRiskTaskStatusCount} task${row.atRiskTaskStatusCount === 1 ? '' : 's'} marked at-risk`;
  }
  return undefined;
}

export function deriveUserWorkloadRow(
  user: User,
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
): UserWorkloadRow {
  const activeDealsList = deals.filter(isActivePipelineDeal);
  const activeDealIds = new Set(activeDealsList.map((d) => d.id));

  const assignedIncomplete = tasks.filter(
    (t) =>
      t.assigneeId === user.id &&
      t.status !== 'complete' &&
      activeDealIds.has(t.dealId),
  );

  const openAssignedTasks = assignedIncomplete.length;
  const overdueTasks = assignedIncomplete.filter((t) => t.status === 'overdue').length;
  const atRiskTaskStatusCount = assignedIncomplete.filter((t) => t.status === 'at-risk').length;

  const touchedDealIds = [...new Set(assignedIncomplete.map((t) => t.dealId))];
  const activeDealsTouched = touchedDealIds.length;

  let dealsDerivedAtRiskHealth = 0;
  let incompleteDocumentsOnWorkloadDeals = 0;

  for (const dealId of touchedDealIds) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) continue;
    const dealTasks = tasks.filter((t) => t.dealId === dealId);
    const dealDocs = documents.filter((d) => d.dealId === dealId);
    const detection = detectDealIssues(deal, dealTasks, dealDocs);
    if (detection.health === 'at-risk') dealsDerivedAtRiskHealth++;
    incompleteDocumentsOnWorkloadDeals += dealDocs.filter(isIncompleteDoc).length;
  }

  const nextUrgent = pickNextUrgentTask(assignedIncomplete, deals);

  const workloadLevel = deriveWorkloadLevel(
    openAssignedTasks,
    overdueTasks,
    dealsDerivedAtRiskHealth,
  );

  const row: UserWorkloadRow = {
    userId: user.id,
    name: user.name,
    email: user.email,
    openAssignedTasks,
    overdueTasks,
    atRiskTaskStatusCount,
    activeDealsTouched,
    dealsDerivedAtRiskHealth,
    incompleteDocumentsOnWorkloadDeals,
    ...(nextUrgent !== undefined ? { nextUrgent } : {}),
    workloadLevel,
  };

  return row;
}

function pickNextUrgentTask(
  incompleteAssigned: Task[],
  deals: Deal[],
): UserWorkloadRow['nextUrgent'] | undefined {
  if (incompleteAssigned.length === 0) return undefined;

  const sorted = [...incompleteAssigned].sort((a, b) => {
    const ao = a.status === 'overdue' ? 0 : 1;
    const bo = b.status === 'overdue' ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const t = sorted[0];
  const deal = deals.find((d) => d.id === t.dealId);
  return {
    taskId: t.id,
    title: t.name,
    dueDate: t.dueDate,
    dealId: t.dealId,
    dealAddress: deal?.propertyAddress ?? 'Unknown address',
  };
}

export function deriveAllUserWorkloads(
  users: User[],
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
): UserWorkloadRow[] {
  const rows = users.map((u) => deriveUserWorkloadRow(u, deals, tasks, documents));
  rows.sort((a, b) => {
    if (b.openAssignedTasks !== a.openAssignedTasks) return b.openAssignedTasks - a.openAssignedTasks;
    if (b.overdueTasks !== a.overdueTasks) return b.overdueTasks - a.overdueTasks;
    return a.name.localeCompare(b.name);
  });
  return rows;
}

export function workloadAttentionReason(row: UserWorkloadRow): string | undefined {
  return attentionReason(row);
}

export function buildUserWorkloadDetail(
  row: UserWorkloadRow,
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
): UserWorkloadDetail {
  const activeDealIds = new Set(deals.filter(isActivePipelineDeal).map((d) => d.id));

  const incompleteTasks = tasks
    .filter(
      (t) =>
        t.assigneeId === row.userId &&
        t.status !== 'complete' &&
        activeDealIds.has(t.dealId),
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const touchedDealIds = [...new Set(incompleteTasks.map((t) => t.dealId))];

  const touchedDeals = touchedDealIds
    .map((dealId) => {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return null;
      const dt = tasks.filter((t) => t.dealId === dealId);
      const dd = documents.filter((d) => d.dealId === dealId);
      const detection = detectDealIssues(deal, dt, dd);
      const incompleteTaskCount = dt.filter((t) => t.status !== 'complete').length;
      const incompleteDocCount = dd.filter(isIncompleteDoc).length;
      return {
        deal,
        health: detection.health,
        incompleteTaskCount,
        incompleteDocCount,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  touchedDeals.sort((a, b) => {
    const h =
      healthRank(a.health) - healthRank(b.health) ||
      b.incompleteTaskCount - a.incompleteTaskCount;
    return h;
  });

  return { row, incompleteTasks, touchedDeals };
}

function healthRank(h: DealHealthLevel): number {
  if (h === 'at-risk') return 0;
  if (h === 'needs-attention') return 1;
  return 2;
}

/** Workspace-wide count of active deals whose derived health is at-risk (same rules as dashboard detection). */
export function countWorkspaceDealsAtRiskHealth(
  deals: Deal[],
  tasks: Task[],
  documents: DocumentItem[],
): number {
  let n = 0;
  for (const deal of deals) {
    if (deal.status === 'complete') continue;
    const dt = tasks.filter((t) => t.dealId === deal.id);
    const dd = documents.filter((d) => d.dealId === deal.id);
    const detection = detectDealIssues(deal, dt, dd);
    if (detection.health === 'at-risk') n++;
  }
  return n;
}

/** Incomplete tasks on active deals with no assignee — same universe as workload “unassigned” warnings. */
export interface UnassignedOpenTaskItem {
  task: Task;
  dealAddress: string;
}

/**
 * Lists unassigned open tasks for triage UI (sorted: overdue first, then by due date).
 * Keep filter rules aligned with {@link countUnassignedOpenTasks}.
 */
export function listUnassignedOpenTasks(deals: Deal[], tasks: Task[]): UnassignedOpenTaskItem[] {
  const activeDealIds = new Set(deals.filter(isActivePipelineDeal).map((d) => d.id));
  const filtered = tasks.filter(
    (t) =>
      (t.assigneeId === undefined || t.assigneeId === '') &&
      t.status !== 'complete' &&
      activeDealIds.has(t.dealId),
  );
  const sorted = [...filtered].sort((a, b) => {
    const ao = a.status === 'overdue' ? 0 : 1;
    const bo = b.status === 'overdue' ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  return sorted.map((task) => ({
    task,
    dealAddress: deals.find((d) => d.id === task.dealId)?.propertyAddress ?? 'Unknown address',
  }));
}

export function countUnassignedOpenTasks(deals: Deal[], tasks: Task[]): number {
  return listUnassignedOpenTasks(deals, tasks).length;
}

export function totalsAssignedIncomplete(tasks: Task[], deals: Deal[]): {
  open: number;
  overdue: number;
} {
  const activeDealIds = new Set(deals.filter(isActivePipelineDeal).map((d) => d.id));
  const open = tasks.filter(
    (t) =>
      t.assigneeId &&
      t.status !== 'complete' &&
      activeDealIds.has(t.dealId),
  );
  return {
    open: open.length,
    overdue: open.filter((t) => t.status === 'overdue').length,
  };
}
