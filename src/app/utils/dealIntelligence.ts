import type { Deal, DocumentItem, Message, Task } from '../types';
import { formatDate } from './dealUtils';
import { detectDealIssues, type DealIssueDetectionResult } from './dealIssueDetection';
import {
  computeDealNextAction,
  computeDealNextActionSummary,
  type DealNextAction,
  type DealNextActionSummary,
} from './dealNextActionEngine';

/**
 * Phase-1 “deal intelligence”: concise operator-style guidance derived from deal state.
 *
 * Today this is **rules-only** (deterministic, client-side, fast). The shape is meant to swap
 * for an LLM-backed provider later: keep `source` + stable `nextAction.ruleKey` for analytics.
 */

export type DealIntelligenceSource = 'rules-v1';

export type DealIntelligenceSignalLevel = 'info' | 'watch' | 'risk';

export interface DealIntelligenceSignal {
  id: string;
  level: DealIntelligenceSignalLevel;
  text: string;
}

export interface DealIntelligence {
  source: DealIntelligenceSource;
  /** Single line — operator tone, not chat. */
  operatorHeadline: string;
  /** 2–3 short lines max. */
  summaryLines: string[];
  /** Risk / inactivity / pressure — compact chips. */
  signals: DealIntelligenceSignal[];
  /** Same engine the workbench already uses — CTAs stay consistent. */
  nextAction: DealNextAction;
  summaryMetrics: DealNextActionSummary;
  detection: DealIssueDetectionResult;
}

const PIPELINE_LABEL: Record<Deal['pipelineStage'], string> = {
  'under-contract': 'Under contract',
  'due-diligence': 'Due diligence',
  financing: 'Financing',
  'pre-closing': 'Pre-closing',
  closing: 'Closing',
};

const CHAT_STALE_DAYS = 7;
const NEW_DEAL_CHAT_GRACE_DAYS = 3;

function daysUntilClosing(closingDate: string): number {
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

function incompleteDocCount(documents: DocumentItem[]): number {
  return documents.filter((d) => d.status !== 'signed' && d.status !== 'completed').length;
}

function incompleteTaskCount(tasks: Task[]): number {
  return tasks.filter((t) => t.status !== 'complete').length;
}

function buildOperatorHeadline(next: DealNextAction): string {
  if (next.ruleKey === 'deal-on-track') {
    return 'No urgent blockers — keep the file warm for closing.';
  }
  if (next.ruleKey === 'deal-stall-reengage') {
    return 'Deal has gone quiet — re-open the thread before work drifts.';
  }
  if (next.ruleKey === 'deal-stall-watch') {
    return 'Light activity — a short check-in keeps momentum.';
  }
  switch (next.severity) {
    case 'overdue':
      return `Unblock first: ${next.title}`;
    case 'at-risk':
      return `Next priority: ${next.title}`;
    default:
      return `Do this next: ${next.title}`;
  }
}

function buildSummaryLines(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  detection: DealIssueDetectionResult,
): string[] {
  const until = daysUntilClosing(deal.closingDate);
  const stage = PIPELINE_LABEL[deal.pipelineStage];
  const closingPhrase =
    until >= 0
      ? `Closing ${formatDate(deal.closingDate)} (${until} ${until === 1 ? 'day' : 'days'} out). Pipeline: ${stage}.`
      : `Closing was ${formatDate(deal.closingDate)} (${Math.abs(until)} ${Math.abs(until) === 1 ? 'day' : 'days'} ago) — confirm record status matches reality. Pipeline: ${stage}.`;

  const openTasks = incompleteTaskCount(tasks);
  const openDocs = incompleteDocCount(documents);
  const workbench = `${openTasks} open ${openTasks === 1 ? 'task' : 'tasks'}, ${openDocs} document${openDocs === 1 ? '' : 's'} still in flight.`;

  let healthLine: string;
  if (detection.health === 'at-risk') {
    healthLine = 'Overall: elevated risk — address overdue work or signatures before they slip closing.';
  } else if (detection.health === 'needs-attention') {
    healthLine = 'Overall: needs attention — a few items warrant a pass this week.';
  } else {
    healthLine = 'Overall: on track relative to tasks, documents, and closing timing.';
  }

  return [closingPhrase, workbench, healthLine];
}

function buildSignals(
  deal: Deal,
  messages: Message[],
  detection: DealIssueDetectionResult,
): DealIntelligenceSignal[] {
  const out: DealIntelligenceSignal[] = [];
  const seen = new Set<string>();

  const push = (id: string, level: DealIntelligenceSignalLevel, text: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, level, text });
  };

  if (detection.closingRisk === 'severe') {
    push('closing-risk-severe', 'risk', 'High closing pressure — open work inside the final week.');
  } else if (detection.closingRisk === 'elevated') {
    push('closing-risk-elevated', 'watch', 'Closing is near with open checklist items.');
  }

  for (const issue of detection.issues) {
    if (out.length >= 5) break;
    const level: DealIntelligenceSignalLevel =
      issue.severity === 'high' ? 'risk' : 'watch';
    push(issue.id, level, issue.detail ? `${issue.title} — ${issue.detail}` : issue.title);
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const dealAgeDays = daysSince(deal.createdAt);

  if (messages.length === 0 && dealAgeDays > NEW_DEAL_CHAT_GRACE_DAYS && deal.status !== 'complete') {
    push('chat-empty', 'info', 'No deal chat yet — log key decisions here so the team stays aligned.');
  } else if (sorted.length > 0 && deal.status !== 'complete') {
    const idleDays = daysSince(sorted[0].createdAt);
    if (idleDays >= CHAT_STALE_DAYS) {
      push(
        'chat-stale',
        'watch',
        `No deal messages in ${Math.floor(idleDays)}+ days — ping the room if work is still moving.`,
      );
    }
  }

  return out.slice(0, 5);
}

/**
 * Compute operator brief + reuse next-action engine outputs.
 * Re-run whenever `deal`, `tasks`, `documents`, or `messages` change.
 */
export function computeDealIntelligence(
  deal: Deal,
  tasks: Task[],
  documents: DocumentItem[],
  messages: Message[],
): DealIntelligence {
  const nextAction = computeDealNextAction(deal, tasks, documents, messages);
  const summaryMetrics = computeDealNextActionSummary(tasks, documents);
  const detection = detectDealIssues(deal, tasks, documents);

  const operatorHeadline = buildOperatorHeadline(nextAction);
  const summaryLines = buildSummaryLines(deal, tasks, documents, detection);
  const signals = buildSignals(deal, messages, detection);

  return {
    source: 'rules-v1',
    operatorHeadline,
    summaryLines,
    signals,
    nextAction,
    summaryMetrics,
    detection,
  };
}
