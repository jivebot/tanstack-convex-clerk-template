# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The dev server (`npm run dev`) is always running locally (usually on port 3000) - do not start it after making changes.

```bash
npm run check:write     # Lint and format with Biome (auto-fix)
npm run check           # Lint and format check only
npm run typecheck       # TypeScript type-checking
npm run test            # Run all tests with Vitest
npx vitest run <file>   # Run a single test file
npm run convex:dev:once # Push Convex schema/functions once (use when backend changes)
tail -100 .dev.log      # Read recent dev server logs
```

Pre-commit hooks run `biome check` automatically via lefthook. Dev server output is logged to `.dev.log`.

## Architecture

This is a multi-tenant app built with:

- **TanStack Start** - React meta-framework with file-based routing
- **Convex** - Backend database and real-time functions
- **Clerk** - Authentication with organization (multi-tenancy) support
- **Tailwind CSS v4** - Styling

### Provider Hierarchy

In `src/routes/__root.tsx`, providers are nested as: `ClerkProvider` → `ConvexProvider` → app content. This order is required for Clerk auth tokens to flow to Convex.

### Multi-Tenancy Model

Clerk organizations map to Convex `orgs` table. Data is isolated per-org:

- `orgs` - Tenant records (synced from Clerk organizations)
- `orgMembers` - User-to-org membership with roles
- `users` - Linked to Clerk via `externalId`, have a primary `orgId`

All tenant-scoped data (like `todos`) includes `orgId` for isolation. Query by `orgId` to scope data to current organization.

### Auth Flow

1. User signs in via Clerk → redirected to `/org` to select organization
2. `useStoreUser` hook (in `_app` layout) syncs user and org to Convex
3. Protected routes live under `src/routes/_app/` - the `_app.tsx` layout enforces auth

### Convex Backend

- Schema in `convex/schema.ts`
- Functions in `convex/*.ts` (orgs, users, todos)
- `getCurrentUserOrThrow(ctx)` - helper to get authenticated user in mutations/queries
- Clerk JWT includes `org_id`, `org_role`, `org_slug` for org context

### File-Based Routing

Routes are in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts`.

- `_app.tsx` - Protected layout (requires auth + org selection)
- `_app/*.tsx` - Protected pages
- Public routes: `sign-in.tsx`, `sign-up.tsx`, `org.tsx`
