import type { Task } from '../types';

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Best-effort match between a new attachment label and an incomplete closing step (V1).
 */
export function findRelatedIncompleteTask(docLabel: string, dealTasks: Task[]): Task | null {
  const label = norm(docLabel);
  if (!label) return null;
  const incomplete = dealTasks.filter((t) => t.status !== 'complete');
  for (const t of incomplete) {
    if (norm(t.name) === label) return t;
  }
  for (const t of incomplete) {
    const tn = norm(t.name);
    if (!tn) continue;
    if (label.includes(tn) || tn.includes(label)) return t;
  }
  return null;
}
