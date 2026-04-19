/**
 * User-created transaction templates (Template Builder saves).
 * Replace this module's implementation with API calls when backend ships.
 *
 * Uses localStorage so saves survive refresh and navigation without lifting all
 * template state into App.tsx — the rest of the app still reads merged data on demand.
 */
import type { TransactionTemplate } from '../types/template';
import { shouldUseConvexWorkspaceReads } from '../dealDataSource';
import { isBuiltInTemplateId, mockTemplates } from './templateData';

const STORAGE_KEY = 'transactq:v1:user-transaction-templates';

/** Built-ins + custom list (same order as `getMergedTemplates` in mock mode). */
export function mergeBuiltInAndCustom(custom: TransactionTemplate[]): TransactionTemplate[] {
  return [...mockTemplates, ...custom];
}

export function loadUserTemplates(): TransactionTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as TransactionTemplate[];
  } catch {
    return [];
  }
}

export function getMergedTemplates(): TransactionTemplate[] {
  return mergeBuiltInAndCustom(loadUserTemplates());
}

export function getTemplateById(id: string): TransactionTemplate | undefined {
  return getMergedTemplates().find((t) => t.id === id);
}

/** True if this id is stored in user templates (editable save target). */
export function isPersistedUserTemplate(id: string): boolean {
  return loadUserTemplates().some((t) => t.id === id);
}

export function upsertUserTemplate(template: TransactionTemplate): void {
  const list = loadUserTemplates();
  const i = list.findIndex((t) => t.id === template.id);
  if (i >= 0) list[i] = template;
  else list.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Decide save id: new route → fresh id; editing a user-saved template → same id;
 * editing a built-in mock template → fork to a new user id (never overwrite mocks).
 */
export function resolveSaveTemplateId(routeTemplateId: string | undefined): string {
  if (!routeTemplateId) {
    return `user-${Date.now()}`;
  }
  if (isBuiltInTemplateId(routeTemplateId)) {
    return `user-${Date.now()}`;
  }
  if (shouldUseConvexWorkspaceReads()) {
    return routeTemplateId;
  }
  if (isPersistedUserTemplate(routeTemplateId)) {
    return routeTemplateId;
  }
  return `user-${Date.now()}`;
}

/** User-created template (localStorage in mock mode; Convex-backed id when workspace reads use Convex). */
export function isCustomTemplate(id: string): boolean {
  if (shouldUseConvexWorkspaceReads()) {
    return !isBuiltInTemplateId(id);
  }
  return isPersistedUserTemplate(id);
}

export function deleteUserTemplate(id: string): boolean {
  if (!isPersistedUserTemplate(id)) return false;
  const next = loadUserTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

/** Increment usageCount and set lastUsed for a localStorage custom template (mock mode). No-op if id is missing. */
export function recordUserTemplateApplyUsage(templateId: string): void {
  const list = loadUserTemplates();
  const i = list.findIndex((t) => t.id === templateId);
  if (i < 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const row = list[i];
  list[i] = {
    ...row,
    usageCount: row.usageCount + 1,
    lastUsed: today,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function duplicateTemplateToStorage(source: TransactionTemplate): TransactionTemplate {
  const newId = `user-${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);
  const copy: TransactionTemplate = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    usageCount: 0,
    lastUsed: undefined,
    createdAt: today,
    tasks: source.tasks.map((t) => ({ ...t })),
    documents: source.documents.map((d) => ({ ...d })),
    stages: [...source.stages],
  };
  upsertUserTemplate(copy);
  return copy;
}
