import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import type { Id } from "./_generated/dataModel";

/**
 * Sync or create org based on Clerk organization
 * Call this after user selects an organization
 */
export const syncFromOrg = mutation({
	args: {
		orgId: v.string(),
		orgName: v.string(),
		orgRole: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Find existing org for this Clerk org
		let org = await ctx.db
			.query("orgs")
			.withIndex("byExternalId", (q) => q.eq("externalId", args.orgId))
			.unique();

		let dbOrgId: Id<"orgs">;

		if (org) {
			// Update org name in case it changed
			await ctx.db.patch(org._id, { name: args.orgName });
			dbOrgId = org._id;
		} else {
			// Create new org
			dbOrgId = await ctx.db.insert("orgs", {
				name: args.orgName,
				externalId: args.orgId,
			});
		}

		// Link user to org if not already linked
		const existingMembership = await ctx.db
			.query("orgMembers")
			.withIndex("byUserAndOrg", (q) =>
				q.eq("userId", user._id).eq("orgId", dbOrgId),
			)
			.unique();

		if (!existingMembership) {
			// Map Clerk role to internal role
			const role = args.orgRole === "admin" ? "admin" : "member";

			await ctx.db.insert("orgMembers", {
				userId: user._id,
				orgId: dbOrgId,
				role,
			});
		}

		// Set user's primary org if not set
		if (!user.orgId) {
			await ctx.db.patch(user._id, { orgId: dbOrgId });
		}

		return dbOrgId;
	},
});

/**
 * Get current user's active org based on Clerk org context
 */
export const getCurrentOrg = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Get active org from Clerk context
		const identity = await ctx.auth.getUserIdentity();
		// Clerk JWT uses snake_case: org_id, org_role, org_slug
		const clerkOrgId = (identity as unknown as { org_id?: string })?.org_id;
		if (!clerkOrgId) {
			return null;
		}

		// Find org by Clerk org ID
		const org = await ctx.db
			.query("orgs")
			.withIndex("byExternalId", (q) => q.eq("externalId", clerkOrgId))
			.unique();

		if (!org) {
			return null;
		}

		// Verify user is a member
		const membership = await ctx.db
			.query("orgMembers")
			.withIndex("byUserAndOrg", (q) =>
				q.eq("userId", user._id).eq("orgId", org._id),
			)
			.unique();

		if (!membership) {
			return null;
		}

		return { ...org, membership };
	},
});
