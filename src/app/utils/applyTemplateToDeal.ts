import type { Deal, DocumentItem, Task } from '../types';
import type { TransactionTemplate } from '../types/template';
import { templateStageToTaskClosingPhase } from './dealPhaseFromTasks';

/** Offset task due dates from the deal's closing date using template offsets (negative = before closing). */
export function computeDueDateFromClosing(closingDateStr: string, daysFromClosing: number): string {
  const [y, m, d] = closingDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysFromClosing);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Maps template tasks to deal tasks; IDs follow existing mock pattern (`t{n}`). */
export function appendTasksFromTemplate(
  template: TransactionTemplate,
  deal: Deal,
  existingTasks: Task[],
  include: boolean,
  /** When set, new tasks default to this assignee (session stub until auth). */
  defaultAssigneeId?: string,
): Task[] {
  if (!include) return [];
  const offset = existingTasks.length;
  return template.tasks.map((tt, index) => ({
    id: `t${offset + index + 1}`,
    dealId: deal.id,
    name: tt.name,
    dueDate: computeDueDateFromClosing(deal.closingDate, tt.daysFromClosing),
    status: 'upcoming' as const,
    phase: templateStageToTaskClosingPhase(tt.stage),
    ...(tt.isGate === true ? { isGate: true as const } : {}),
    ...(defaultAssigneeId !== undefined ? { assigneeId: defaultAssigneeId } : {}),
  }));
}

/** Maps template documents to deal documents; IDs follow existing mock pattern (`doc{n}`). */
export function appendDocumentsFromTemplate(
  template: TransactionTemplate,
  dealId: string,
  existingDocuments: DocumentItem[],
  include: boolean,
): DocumentItem[] {
  if (!include) return [];
  const offset = existingDocuments.length;
  return template.documents.map((td, index) => ({
    id: `doc${offset + index + 1}`,
    dealId,
    name: td.name,
    status: 'not-started',
    signatureStatus: td.signatureRequired ? 'requested' : 'not-required',
  }));
}
