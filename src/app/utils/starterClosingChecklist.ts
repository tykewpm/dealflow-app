import type { Deal, DealPipelineStage, Task, TaskClosingPhase, TaskStatus } from '../types';
import { determineTaskStatus } from './dealUtils';

function taskClosingPhaseToPipelineStageLocal(phase: TaskClosingPhase): DealPipelineStage {
  switch (phase) {
    case 'under-contract':
      return 'under-contract';
    case 'inspection':
      return 'due-diligence';
    case 'financing':
      return 'financing';
    case 'escrow':
      return 'pre-closing';
    case 'closing':
      return 'closing';
    default:
      return 'under-contract';
  }
}

/** Canonical starter step titles → deal pipeline + task phase (quick-create + recognition). */
export const STARTER_CHECKLIST: {
  stage: DealPipelineStage;
  phase: TaskClosingPhase;
  name: string;
  daysFromStart: number;
}[] = [
  { stage: 'under-contract', phase: 'under-contract', name: 'Upload purchase agreement', daysFromStart: 2 },
  { stage: 'under-contract', phase: 'under-contract', name: 'Deposit earnest money', daysFromStart: 5 },
  { stage: 'under-contract', phase: 'under-contract', name: 'Open escrow', daysFromStart: 8 },
  { stage: 'due-diligence', phase: 'inspection', name: 'Schedule home inspection', daysFromStart: 10 },
  { stage: 'due-diligence', phase: 'inspection', name: 'Review inspection report', daysFromStart: 13 },
  { stage: 'due-diligence', phase: 'inspection', name: 'Resolve inspection items', daysFromStart: 16 },
  { stage: 'financing', phase: 'financing', name: 'Confirm loan application', daysFromStart: 18 },
  { stage: 'financing', phase: 'financing', name: 'Order appraisal', daysFromStart: 21 },
  { stage: 'financing', phase: 'financing', name: 'Receive loan approval', daysFromStart: 24 },
  { stage: 'pre-closing', phase: 'escrow', name: 'Review title report', daysFromStart: 26 },
  { stage: 'pre-closing', phase: 'escrow', name: 'Review escrow instructions', daysFromStart: 29 },
  { stage: 'pre-closing', phase: 'escrow', name: 'Confirm closing disclosure', daysFromStart: 32 },
  { stage: 'closing', phase: 'closing', name: 'Schedule final walkthrough', daysFromStart: 35 },
  { stage: 'closing', phase: 'closing', name: 'Prepare signing appointment', daysFromStart: 38 },
  { stage: 'closing', phase: 'closing', name: 'Confirm funds to close', daysFromStart: 41 },
  { stage: 'closing', phase: 'closing', name: 'Record closing', daysFromStart: 44 },
];

const PIPELINE_ORDER: DealPipelineStage[] = [
  'under-contract',
  'due-diligence',
  'financing',
  'pre-closing',
  'closing',
];

const PHASE_SECTION_LABEL: Record<DealPipelineStage, string> = {
  'under-contract': 'Under Contract',
  'due-diligence': 'Inspection',
  financing: 'Financing',
  'pre-closing': 'Escrow',
  closing: 'Closing',
};

export const STARTER_TASK_NAME_SET = new Set(STARTER_CHECKLIST.map((r) => r.name));

function addDaysIso(yyyyMmDd: string, days: number): string {
  const d = new Date(`${yyyyMmDd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Rows for `createDealWithWorkspace` `tasks` argument (Convex + same shape for status rules). */
export function buildStarterTaskMutationRows(opts: {
  createdAt: string;
  assigneeId?: string;
}): {
  name: string;
  dueDate: string;
  status: TaskStatus;
  assigneeId?: string;
  phase: TaskClosingPhase;
  isGate?: boolean;
}[] {
  return STARTER_CHECKLIST.map((row) => {
    const dueDate = addDaysIso(opts.createdAt, row.daysFromStart);
    const base: Task = {
      id: 'tmp',
      dealId: 'tmp',
      name: row.name,
      dueDate,
      status: 'upcoming',
      ...(opts.assigneeId ? { assigneeId: opts.assigneeId } : {}),
    };
    return {
      name: row.name,
      dueDate,
      status: determineTaskStatus(base),
      phase: row.phase,
      ...(row.name === 'Upload purchase agreement' ? { isGate: true as const } : {}),
      ...(opts.assigneeId ? { assigneeId: opts.assigneeId } : {}),
    };
  });
}

/** Local / demo `Task[]` after quick-create. */
export function buildStarterTasksLocal(opts: {
  dealId: string;
  idPrefix: string;
  createdAt: string;
  assigneeId?: string;
}): Task[] {
  return STARTER_CHECKLIST.map((row, index) => {
    const dueDate = addDaysIso(opts.createdAt, row.daysFromStart);
    const base: Task = {
      id: `${opts.idPrefix}-s${index}`,
      dealId: opts.dealId,
      name: row.name,
      dueDate,
      status: 'upcoming',
      ...(opts.assigneeId ? { assigneeId: opts.assigneeId } : {}),
    };
    return {
      ...base,
      status: determineTaskStatus(base),
      phase: row.phase,
      ...(row.name === 'Upload purchase agreement' ? { isGate: true as const } : {}),
    };
  });
}

export function hasStarterChecklistTasks(tasks: Task[]): boolean {
  return tasks.some((t) => STARTER_TASK_NAME_SET.has(t.name));
}

/** Section list for grouped checklist UI; `undefined` = use flat task list. */
export function getClosingStepSectionGroups(tasks: Task[]): { title: string; tasks: Task[] }[] | undefined {
  if (!hasStarterChecklistTasks(tasks)) {
    return undefined;
  }
  const byPhase = new Map<DealPipelineStage, Task[]>();
  for (const p of PIPELINE_ORDER) {
    byPhase.set(p, []);
  }
  const other: Task[] = [];
  for (const t of tasks) {
    if (t.phase) {
      const pipelineBucket = taskClosingPhaseToPipelineStageLocal(t.phase);
      byPhase.get(pipelineBucket)!.push(t);
      continue;
    }
    if (STARTER_TASK_NAME_SET.has(t.name)) {
      const row = STARTER_CHECKLIST.find((r) => r.name === t.name);
      const pipelineBucket = row?.stage;
      if (pipelineBucket) {
        byPhase.get(pipelineBucket)!.push(t);
      } else {
        other.push(t);
      }
    } else {
      other.push(t);
    }
  }
  const sections: { title: string; tasks: Task[] }[] = [];
  for (const p of PIPELINE_ORDER) {
    const list = byPhase.get(p) ?? [];
    if (list.length > 0) {
      sections.push({ title: PHASE_SECTION_LABEL[p], tasks: list });
    }
  }
  if (other.length > 0) {
    sections.push({ title: 'Other closing steps', tasks: other });
  }
  return sections.length > 0 ? sections : undefined;
}

function starterNamesForPipelineStage(stage: DealPipelineStage): string[] {
  return STARTER_CHECKLIST.filter((r) => r.stage === stage).map((r) => r.name);
}

export function nextPipelineStage(stage: DealPipelineStage): DealPipelineStage | null {
  const i = PIPELINE_ORDER.indexOf(stage);
  if (i < 0 || i >= PIPELINE_ORDER.length - 1) {
    return null;
  }
  return PIPELINE_ORDER[i + 1]!;
}

export type PhaseAdvanceSuggestionResult = {
  nextStage: DealPipelineStage;
  headline: string;
  buttonLabel: string;
};

const ADVANCE_COPY: Record<
  DealPipelineStage,
  { headline: string; buttonLabel: string } | undefined
> = {
  'under-contract': {
    headline: 'Under Contract complete. Move to Inspection?',
    buttonLabel: 'Move to Inspection',
  },
  'due-diligence': {
    headline: 'Inspection complete. Move to Financing?',
    buttonLabel: 'Move to Financing',
  },
  financing: {
    headline: 'Financing complete. Move to Escrow?',
    buttonLabel: 'Move to Escrow',
  },
  'pre-closing': {
    headline: 'Escrow complete. Move to Closing?',
    buttonLabel: 'Move to Closing',
  },
  closing: undefined,
};

/**
 * When every starter step for the current pipeline phase is complete, suggest advancing
 * (caller must apply `onPipelineStageChange` — no auto-advance).
 */
export function getPhaseAdvanceSuggestion(deal: Deal, tasks: Task[]): PhaseAdvanceSuggestionResult | null {
  if (deal.archived) {
    return null;
  }
  if (tasks.some((t) => t.phase !== undefined)) {
    return null;
  }
  const current = deal.pipelineStage;
  if (current === 'closing') {
    return null;
  }
  const expectedNames = starterNamesForPipelineStage(current);
  if (expectedNames.length === 0) {
    return null;
  }
  for (const name of expectedNames) {
    const row = tasks.find((t) => t.name === name);
    if (!row || row.status !== 'complete') {
      return null;
    }
  }
  const nextStage = nextPipelineStage(current);
  if (!nextStage) {
    return null;
  }
  const copy = ADVANCE_COPY[current];
  if (!copy) {
    return null;
  }
  return { nextStage, headline: copy.headline, buttonLabel: copy.buttonLabel };
}
