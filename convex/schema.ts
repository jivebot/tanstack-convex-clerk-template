import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Orgs represent Clerk organizations (tenants)
	orgs: defineTable({
		name: v.string(),
		externalId: v.optional(v.string()), // Clerk organization ID
	}).index("byExternalId", ["externalId"]),

	// Users linked to Clerk authentication
	users: defineTable({
		externalId: v.string(), // Clerk user ID (identity.subject)
		orgId: v.optional(v.id("orgs")), // Primary org
	}).index("byExternalId", ["externalId"]),

	// Many-to-many: users can belong to multiple orgs
	orgMembers: defineTable({
		userId: v.id("users"),
		orgId: v.id("orgs"),
		role: v.union(v.literal("admin"), v.literal("member")),
	})
		.index("byUserId", ["userId"])
		.index("byOrgId", ["orgId"])
		.index("byUserAndOrg", ["userId", "orgId"]),

	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
		userId: v.id("users"),
		orgId: v.id("orgs"),
	})
		.index("byUserId", ["userId"])
		.index("byOrgId", ["orgId"])
		.index("byUserAndOrg", ["userId", "orgId"]),
});
