import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

type TaskClosingPhase = 'under-contract' | 'inspection' | 'financing' | 'escrow' | 'closing';

type PipelineStage = Doc<'deals'>['pipelineStage'];

const PHASE_ORDER: TaskClosingPhase[] = [
  'under-contract',
  'inspection',
  'financing',
  'escrow',
  'closing',
];

function toPipeline(phase: TaskClosingPhase): PipelineStage {
  const m: Record<TaskClosingPhase, PipelineStage> = {
    'under-contract': 'under-contract',
    inspection: 'due-diligence',
    financing: 'financing',
    escrow: 'pre-closing',
    closing: 'closing',
  };
  return m[phase];
}

function phaseSliceComplete(
  tasks: Pick<Doc<'tasks'>, 'status' | 'isGate'>[],
): boolean {
  if (tasks.length === 0) return true;
  const gates = tasks.filter((t) => t.isGate === true);
  if (gates.length > 0) {
    return gates.every((t) => t.status === 'complete');
  }
  return tasks.every((t) => t.status === 'complete');
}

function effectivePhase(row: Doc<'tasks'>): TaskClosingPhase | undefined {
  if (row.phase) return row.phase;
  return undefined;
}

/** Same rules as `src/app/utils/dealPhaseFromTasks.ts` — Convex bundle cannot import `src/`. */
export function computeDealPipelineStageFromTaskDocs(tasks: Doc<'tasks'>[]): PipelineStage {
  const byPhase = new Map<TaskClosingPhase, Doc<'tasks'>[]>();
  for (const p of PHASE_ORDER) {
    byPhase.set(p, []);
  }
  for (const t of tasks) {
    const p = effectivePhase(t);
    if (!p) continue;
    byPhase.get(p)!.push(t);
  }
  const anyBucketed = PHASE_ORDER.some((p) => (byPhase.get(p) ?? []).length > 0);
  if (!anyBucketed) {
    return 'under-contract';
  }
  for (const p of PHASE_ORDER) {
    const slice = byPhase.get(p) ?? [];
    if (slice.length === 0) continue;
    if (!phaseSliceComplete(slice)) {
      return toPipeline(p);
    }
  }
  return 'closing';
}

export function taskDocsHavePhaseCoverage(tasks: Doc<'tasks'>[]): boolean {
  return tasks.some((t) => t.phase !== undefined);
}

export async function syncDealPipelineStageFromTasksIfNeeded(
  ctx: MutationCtx,
  dealId: Id<'deals'>,
): Promise<void> {
  const tasks = await ctx.db
    .query('tasks')
    .withIndex('by_dealId', (q) => q.eq('dealId', dealId))
    .collect();
  if (!taskDocsHavePhaseCoverage(tasks)) {
    return;
  }
  const next = computeDealPipelineStageFromTaskDocs(tasks);
  await ctx.db.patch(dealId, { pipelineStage: next });
}
