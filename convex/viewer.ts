import { query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

/** Current signed-in user profile (Convex Auth `users` row), or null if anonymous. */
export const loggedInProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
