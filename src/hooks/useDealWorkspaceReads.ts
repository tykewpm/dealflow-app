import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Deal, DocumentItem, Message, Task, User } from '../app/types';

export type WorkspaceSnapshotAccess =
  | 'ok'
  | 'blocked';

export type DealWorkspaceReads = {
  deals: Deal[] | undefined;
  tasks: Task[] | undefined;
  documents: DocumentItem[] | undefined;
  messages: Message[] | undefined;
  /** Workspace roster (Convex `workspacePeople`) — same shape as `User`. */
  users: User[] | undefined;
  isLoading: boolean;
  workspaceAccess: WorkspaceSnapshotAccess | undefined;
  workspaceAccessReason: 'unauthenticated' | 'no_membership' | null | undefined;
};

/**
 * Read-only workspace snapshot from Convex (`getWorkspaceSnapshot`).
 * Pass `enabled: false` to skip the subscription (mock mode / no Convex).
 */
export function useDealWorkspaceReads(enabled: boolean): DealWorkspaceReads {
  const snapshot = useQuery(api.workspace.getWorkspaceSnapshot, enabled ? {} : 'skip');
  const isLoading = enabled && snapshot === undefined;

  const workspaceAccess =
    snapshot === undefined
      ? undefined
      : snapshot.workspaceAccess === 'ok'
        ? 'ok'
        : 'blocked';

  return {
    deals: snapshot?.deals,
    tasks: snapshot?.tasks,
    documents: snapshot?.documents,
    messages: snapshot?.messages,
    users: snapshot?.users,
    isLoading,
    workspaceAccess,
    workspaceAccessReason: snapshot?.workspaceAccessReason ?? undefined,
  };
}
