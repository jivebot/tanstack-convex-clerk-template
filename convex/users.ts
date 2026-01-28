import { mutation, query, type QueryCtx } from "./_generated/server";

/**
 * Store or update user from Clerk identity
 * Call this on sign-in to sync Clerk user to Convex
 */
export const store = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Called storeUser without authentication present");
		}

		// Check if user already exists by Clerk ID
		const user = await ctx.db
			.query("users")
			.withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
			.unique();

		if (user !== null) {
			// Existing user - return ID
			return user._id;
		}

		// New user - create record
		const userId = await ctx.db.insert("users", {
			externalId: identity.subject,
			orgId: undefined,
		});

		return userId;
	},
});

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity === null) {
		return null;
	}
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
		.unique();
}

/**
 * Get current user or throw error
 * Use in mutations/queries that require authentication
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Can't get current user");
	return userRecord;
}

/**
 * Query to get current user (for frontend)
 */
export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});
