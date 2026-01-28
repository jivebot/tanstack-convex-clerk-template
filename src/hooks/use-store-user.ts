import { useClerk, useOrganization } from "@clerk/clerk-react";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Syncs Clerk user and organization to Convex database
 * Call in your protected layout to ensure user exists in DB
 */
export function useStoreUser() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { organization, membership } = useOrganization();
	const { signOut } = useClerk();

	const [userId, setUserId] = useState<Id<"users"> | null>(null);
	const storeUser = useMutation(api.users.store);
	const syncOrg = useMutation(api.orgs.syncFromOrg);

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}
		// Wait for organization to load (undefined means loading)
		if (organization === undefined) {
			return;
		}

		async function checkUser() {
			try {
				// Store/update user in Convex
				const id = await storeUser();

				// Sync organization if selected
				if (organization && membership) {
					await syncOrg({
						orgId: organization.id,
						orgName: organization.name,
						orgRole: membership.role,
					});
				}

				setUserId(id);
			} catch (error) {
				console.error("User sync error:", error);
				await signOut();
			}
		}
		checkUser();
		return () => setUserId(null);
	}, [isAuthenticated, storeUser, syncOrg, organization, membership, signOut]);

	return {
		isLoading: isLoading || (isAuthenticated && userId === null),
		isAuthenticated: isAuthenticated && userId !== null,
	};
}
