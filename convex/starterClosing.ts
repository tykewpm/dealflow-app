import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { syncDealPipelineStageFromTasksIfNeeded } from './dealPhaseSync';

function addDays(yyyyMmDd: string, days: number): string {
  const d = new Date(`${yyyyMmDd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type SeedPhase = 'under-contract' | 'inspection' | 'financing' | 'escrow' | 'closing';

/**
 * For a newly provisioned personal workspace with no deals yet, inserts a starter
 * "My Home Purchase" transaction and default closing-step tasks (idempotent).
 */
export async function seedStarterClosingIfEmpty(
  ctx: MutationCtx,
  workspaceId: Id<'workspaces'>,
  rosterUserId: string,
): Promise<void> {
  const existing = await ctx.db
    .query('deals')
    .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
    .first();
  if (existing) {
    return;
  }

  const createdAt = new Date().toISOString().slice(0, 10);
  const closingDate = addDays(createdAt, 60);

  const dealId = await ctx.db.insert('deals', {
    workspaceId,
    propertyAddress: 'My Home Purchase',
    buyerName: 'You',
    sellerName: 'Seller (TBD)',
    closingDate,
    status: 'active',
    createdAt,
    pipelineStage: 'under-contract',
    archived: false,
  });

  const steps: readonly { name: string; days: number; phase: SeedPhase; isGate?: boolean }[] = [
    { name: 'Sign purchase agreement', days: 7, phase: 'under-contract', isGate: true },
    { name: 'Schedule inspection', days: 14, phase: 'inspection' },
    { name: 'Secure financing', days: 28, phase: 'financing' },
    { name: 'Order appraisal', days: 35, phase: 'financing' },
    { name: 'Final walkthrough', days: 52, phase: 'escrow' },
    { name: 'Close escrow', days: 60, phase: 'closing' },
  ];

  for (const step of steps) {
    await ctx.db.insert('tasks', {
      dealId,
      name: step.name,
      dueDate: addDays(createdAt, step.days),
      status: 'upcoming',
      assigneeId: rosterUserId,
      phase: step.phase,
      ...(step.isGate === true ? { isGate: true } : {}),
    });
  }

  await syncDealPipelineStageFromTasksIfNeeded(ctx, dealId);
}
