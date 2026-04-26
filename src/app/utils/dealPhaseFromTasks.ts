import type { DealPipelineStage, Task, TaskClosingPhase } from '../types';
import type { TemplateStage } from '../types/template';
import { STARTER_CHECKLIST } from './starterClosingChecklist';

export const TASK_CLOSING_PHASE_ORDER: TaskClosingPhase[] = [
  'under-contract',
  'inspection',
  'financing',
  'escrow',
  'closing',
];

export function templateStageToTaskClosingPhase(stage: TemplateStage): TaskClosingPhase {
  switch (stage) {
    case 'under-contract':
      return 'under-contract';
    case 'due-diligence':
      return 'inspection';
    case 'financing':
      return 'financing';
    case 'pre-closing':
      return 'escrow';
    case 'closing':
      return 'closing';
    default:
      return 'under-contract';
  }
}

export function dealPipelineStageToTaskClosingPhase(stage: DealPipelineStage): TaskClosingPhase {
  switch (stage) {
    case 'under-contract':
      return 'under-contract';
    case 'due-diligence':
      return 'inspection';
    case 'financing':
      return 'financing';
    case 'pre-closing':
      return 'escrow';
    case 'closing':
      return 'closing';
    default:
      return 'under-contract';
  }
}

export function taskClosingPhaseToPipelineStage(phase: TaskClosingPhase): DealPipelineStage {
  const m: Record<TaskClosingPhase, DealPipelineStage> = {
    'under-contract': 'under-contract',
    inspection: 'due-diligence',
    financing: 'financing',
    escrow: 'pre-closing',
    closing: 'closing',
  };
  return m[phase];
}

const STARTER_NAME_TO_TASK_PHASE: Map<string, TaskClosingPhase> = new Map(
  STARTER_CHECKLIST.map((row) => [row.name, row.phase]),
);

export function inferTaskClosingPhaseFromTaskName(name: string): TaskClosingPhase | undefined {
  return STARTER_NAME_TO_TASK_PHASE.get(name);
}

export function effectiveTaskClosingPhase(task: Task): TaskClosingPhase | undefined {
  if (task.phase) return task.phase;
  return inferTaskClosingPhaseFromTaskName(task.name);
}

/** True when at least one task participates in phase math (explicit `phase` or starter title match). */
export function dealHasTaskPhaseCoverage(tasks: Task[]): boolean {
  return tasks.some((t) => effectiveTaskClosingPhase(t) !== undefined);
}

function phaseSliceComplete(tasks: Task[]): boolean {
  if (tasks.length === 0) return true;
  const gates = tasks.filter((t) => t.isGate === true);
  if (gates.length > 0) {
    return gates.every((t) => t.status === 'complete');
  }
  return tasks.every((t) => t.status === 'complete');
}

/**
 * Ordered pass through phases: first phase with any work that is not “complete” wins.
 * If every bucketed phase is complete → `closing`.
 * Tasks with no known phase are ignored for this calculation.
 */
export function computeDealPhase(tasks: Task[]): DealPipelineStage {
  const byPhase = new Map<TaskClosingPhase, Task[]>();
  for (const p of TASK_CLOSING_PHASE_ORDER) {
    byPhase.set(p, []);
  }
  for (const t of tasks) {
    const p = effectiveTaskClosingPhase(t);
    if (!p) continue;
    byPhase.get(p)!.push(t);
  }
  const anyBucketed = TASK_CLOSING_PHASE_ORDER.some((p) => (byPhase.get(p) ?? []).length > 0);
  if (!anyBucketed) {
    return 'under-contract';
  }
  for (const p of TASK_CLOSING_PHASE_ORDER) {
    const slice = byPhase.get(p) ?? [];
    if (slice.length === 0) continue;
    if (!phaseSliceComplete(slice)) {
      return taskClosingPhaseToPipelineStage(p);
    }
  }
  return 'closing';
}
