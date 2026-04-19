import type {
  TemplateCategory,
  TemplateStage,
  TemplateTask,
  TemplateDocument,
  TransactionTemplate,
} from '../types/template';

export type StageBuckets = Record<TemplateStage, { tasks: TemplateTask[]; documents: TemplateDocument[] }>;

export const CANONICAL_STAGE_ORDER: TemplateStage[] = [
  'under-contract',
  'due-diligence',
  'financing',
  'pre-closing',
  'closing',
];

export function emptyStageBuckets(): StageBuckets {
  return {
    'under-contract': { tasks: [], documents: [] },
    'due-diligence': { tasks: [], documents: [] },
    financing: { tasks: [], documents: [] },
    'pre-closing': { tasks: [], documents: [] },
    closing: { tasks: [], documents: [] },
  };
}

export function groupTemplateIntoBuckets(template: TransactionTemplate): StageBuckets {
  const buckets = emptyStageBuckets();
  for (const task of template.tasks) {
    if (buckets[task.stage]) {
      buckets[task.stage].tasks.push(task);
    }
  }
  for (const doc of template.documents) {
    if (buckets[doc.stage]) {
      buckets[doc.stage].documents.push(doc);
    }
  }
  return buckets;
}

export function deriveStagesFromBuckets(stageData: StageBuckets): TemplateStage[] {
  const used = CANONICAL_STAGE_ORDER.filter(
    (s) => stageData[s].tasks.length > 0 || stageData[s].documents.length > 0,
  );
  return used.length > 0 ? used : [...CANONICAL_STAGE_ORDER];
}

export function buildTransactionTemplate(params: {
  id: string;
  name: string;
  category: TemplateCategory;
  stageData: StageBuckets;
  existing?: TransactionTemplate | null;
}): TransactionTemplate {
  const { id, name, category, stageData, existing } = params;
  const tasks: TemplateTask[] = [];
  const documents: TemplateDocument[] = [];
  for (const stage of CANONICAL_STAGE_ORDER) {
    tasks.push(...stageData[stage].tasks);
    documents.push(...stageData[stage].documents);
  }

  const today = new Date().toISOString().slice(0, 10);

  return {
    id,
    name: name.trim() || 'Untitled Template',
    description: existing?.description ?? 'Created in Template Builder',
    category,
    tasks,
    documents,
    stages: deriveStagesFromBuckets(stageData),
    usageCount: existing?.usageCount ?? 0,
    lastUsed: existing?.lastUsed,
    createdAt: existing?.createdAt ?? today,
  };
}
