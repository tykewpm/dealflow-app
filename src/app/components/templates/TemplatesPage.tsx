import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import type { Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import type { TransactionTemplate } from '../../types/template';
import { shouldUseConvexWorkspaceReads } from '../../dealDataSource';
import { isBuiltInTemplateId } from '../../data/templateData';
import {
  deleteUserTemplate,
  duplicateTemplateToStorage,
  getMergedTemplates,
  isCustomTemplate,
  mergeBuiltInAndCustom,
} from '../../data/userTemplatesStorage';
import {
  TemplatesWorkspaceBody,
  type TemplatesPageProps,
} from './TemplatesWorkspaceBody';

export type { TemplatesPageProps };

/** Convex hooks + merged templates (requires ConvexProvider when `VITE_CONVEX_URL` is set). */
function TemplatesPageWithConvex(props: TemplatesPageProps) {
  const useConvexTemplates = shouldUseConvexWorkspaceReads();
  const convexTemplates = useQuery(api.customTemplates.list, useConvexTemplates ? {} : 'skip');
  const removeConvexTemplate = useMutation(api.customTemplates.remove);
  const duplicateConvexTemplate = useMutation(api.customTemplates.duplicate);
  const upsertConvexTemplate = useMutation(api.customTemplates.upsert);

  const [mockTemplatesState, setMockTemplatesState] = useState<TransactionTemplate[]>(() =>
    getMergedTemplates(),
  );

  const templates = useMemo(() => {
    if (useConvexTemplates) {
      return mergeBuiltInAndCustom(convexTemplates ?? []);
    }
    return mockTemplatesState;
  }, [useConvexTemplates, convexTemplates, mockTemplatesState]);

  const refreshTemplates = () => {
    if (!useConvexTemplates) {
      setMockTemplatesState(getMergedTemplates());
    }
  };

  const onDeleteCustomRequest = async (t: TransactionTemplate): Promise<boolean> => {
    if (!isCustomTemplate(t.id)) return false;
    if (!window.confirm('Delete this custom template? This cannot be undone.')) return false;

    if (useConvexTemplates) {
      try {
        await removeConvexTemplate({ templateId: t.id as Id<'customTransactionTemplates'> });
        return true;
      } catch (e) {
        console.error(e);
        window.alert('Could not delete template. Try again.');
        return false;
      }
    }

    if (deleteUserTemplate(t.id)) {
      refreshTemplates();
      return true;
    }
    return false;
  };

  const onDuplicate = async (t: TransactionTemplate) => {
    if (useConvexTemplates) {
      try {
        if (isBuiltInTemplateId(t.id)) {
          await upsertConvexTemplate({
            name: `${t.name} (Copy)`,
            description: t.description,
            category: t.category,
            tasks: t.tasks,
            documents: t.documents,
            stages: t.stages,
          });
        } else {
          await duplicateConvexTemplate({
            templateId: t.id as Id<'customTransactionTemplates'>,
          });
        }
      } catch (e) {
        console.error(e);
        window.alert('Could not duplicate template. Try again.');
      }
      return;
    }

    duplicateTemplateToStorage(t);
    refreshTemplates();
  };

  return (
    <TemplatesWorkspaceBody
      {...props}
      templates={templates}
      onDeleteCustomRequest={onDeleteCustomRequest}
      onDuplicate={onDuplicate}
    />
  );
}

/** localStorage-only templates — no Convex hooks (for environments without `VITE_CONVEX_URL`). */
function TemplatesPageOffline(props: TemplatesPageProps) {
  const [mockTemplatesState, setMockTemplatesState] = useState<TransactionTemplate[]>(() =>
    getMergedTemplates(),
  );

  const refreshTemplates = () => setMockTemplatesState(getMergedTemplates());

  const onDeleteCustomRequest = (t: TransactionTemplate): boolean => {
    if (!isCustomTemplate(t.id)) return false;
    if (!window.confirm('Delete this custom template? This cannot be undone.')) return false;
    if (deleteUserTemplate(t.id)) {
      refreshTemplates();
      return true;
    }
    return false;
  };

  const onDuplicate = (t: TransactionTemplate) => {
    duplicateTemplateToStorage(t);
    refreshTemplates();
  };

  return (
    <TemplatesWorkspaceBody
      {...props}
      templates={mockTemplatesState}
      onDeleteCustomRequest={onDeleteCustomRequest}
      onDuplicate={onDuplicate}
    />
  );
}

export function TemplatesPage(props: TemplatesPageProps) {
  if (!import.meta.env.VITE_CONVEX_URL || !shouldUseConvexWorkspaceReads()) {
    return <TemplatesPageOffline {...props} />;
  }
  return <TemplatesPageWithConvex {...props} />;
}
