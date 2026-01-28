import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

async function getCurrentOrg(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	// Clerk JWT uses snake_case: org_id, org_role, org_slug
	const clerkOrgId = (identity as unknown as { org_id?: string })?.org_id;
	if (!clerkOrgId) {
		return null;
	}
	return await ctx.db
		.query("orgs")
		.withIndex("byExternalId", (q) => q.eq("externalId", clerkOrgId))
		.unique();
}

export const list = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		const org = await getCurrentOrg(ctx);
		if (!org) {
			throw new Error("No organization selected");
		}

		// Filter by user and current org
		return await ctx.db
			.query("todos")
			.withIndex("byUserAndOrg", (q) =>
				q.eq("userId", user._id).eq("orgId", org._id),
			)
			.order("desc")
			.collect();
	},
});

export const add = mutation({
	args: { text: v.string() },
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const org = await getCurrentOrg(ctx);
		if (!org) {
			throw new Error("No organization selected");
		}

		return await ctx.db.insert("todos", {
			text: args.text,
			completed: false,
			userId: user._id,
			orgId: org._id,
		});
	},
});

export const toggle = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const org = await getCurrentOrg(ctx);
		if (!org) {
			throw new Error("No organization selected");
		}

		const todo = await ctx.db.get(args.id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		if (todo.userId !== user._id || todo.orgId !== org._id) {
			throw new Error("Not authorized");
		}
		return await ctx.db.patch(args.id, {
			completed: !todo.completed,
		});
	},
});

export const remove = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const org = await getCurrentOrg(ctx);
		if (!org) {
			throw new Error("No organization selected");
		}

		const todo = await ctx.db.get(args.id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		if (todo.userId !== user._id || todo.orgId !== org._id) {
			throw new Error("Not authorized");
		}
		return await ctx.db.delete(args.id);
	},
});
