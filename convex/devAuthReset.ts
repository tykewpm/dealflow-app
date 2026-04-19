import { internalMutation, type MutationCtx } from './_generated/server';
import type { TableNames } from './_generated/dataModel';

/**
 * DEV recovery: wipe Convex Auth rows + sessions + workspace membership links.
 *
 * ## Guards (both required)
 * - `CONVEX_DEPLOYMENT` must NOT start with `prod:` — this mutation never runs on production,
 *   even if env vars are mis-set (no override).
 * - `ALLOW_LOCAL_AUTH_RESET=true` must be set on the Convex deployment (Dashboard → Settings → Env,
 *   or `.env.local` for `convex dev`).
 *
 * ## What gets deleted
 * - `workspaceMemberships` — required: each row references `users` by id; leaving them would orphan
 *   data after auth users are removed.
 * - All @convex-dev/auth tables: `authRefreshTokens`, `authVerifiers`, `authVerificationCodes`,
 *   `authSessions`, `authAccounts`, `authRateLimits`, `users`.
 *
 * ## What stays
 * - `workspaces`, `workspacePeople`, `deals`, `tasks`, templates, etc. — so you keep roster emails
 *   and can sign up / claim again without re-seeding fixtures.
 *
 * ## Run
 * ```bash
 * npm run reset:local-auth
 * ```
 * Then sign out in the app (or clear browser storage), sign up / sign in again, and go through
 * roster claim as usual. Use `npm run seed:dev` only if you also want deals/tasks/roster reset
 * to fixture data (destructive to workspace content).
 */
function assertLocalAuthResetAllowed(): void {
  const deployment = process.env.CONVEX_DEPLOYMENT ?? '';
  if (deployment.startsWith('prod:')) {
    throw new Error(
      'resetLocalDevAuthData: blocked on production deployments (CONVEX_DEPLOYMENT starts with prod:). ' +
        'This tool is dev-only and has no production override.',
    );
  }
  if (process.env.ALLOW_LOCAL_AUTH_RESET !== 'true') {
    throw new Error(
      'resetLocalDevAuthData: set Convex env ALLOW_LOCAL_AUTH_RESET=true on this deployment, then retry.',
    );
  }
}

async function deleteAllInTable(ctx: MutationCtx, table: TableNames): Promise<number> {
  const docs = await ctx.db.query(table).collect();
  for (const doc of docs) {
    await ctx.db.delete(doc._id);
  }
  return docs.length;
}

/** Internal-only: `npx convex run devAuthReset:resetLocalDevAuthData` */
export const resetLocalDevAuthData = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertLocalAuthResetAllowed();

    const workspaceMembershipsDeleted = await deleteAllInTable(ctx, 'workspaceMemberships');
    const authRefreshTokensDeleted = await deleteAllInTable(ctx, 'authRefreshTokens');
    const authVerifiersDeleted = await deleteAllInTable(ctx, 'authVerifiers');
    const authVerificationCodesDeleted = await deleteAllInTable(ctx, 'authVerificationCodes');
    const authSessionsDeleted = await deleteAllInTable(ctx, 'authSessions');
    const authAccountsDeleted = await deleteAllInTable(ctx, 'authAccounts');
    const authRateLimitsDeleted = await deleteAllInTable(ctx, 'authRateLimits');
    const usersDeleted = await deleteAllInTable(ctx, 'users');

    return {
      ok: true as const,
      workspaceMembershipsDeleted,
      authRefreshTokensDeleted,
      authVerifiersDeleted,
      authVerificationCodesDeleted,
      authSessionsDeleted,
      authAccountsDeleted,
      authRateLimitsDeleted,
      usersDeleted,
    };
  },
});
