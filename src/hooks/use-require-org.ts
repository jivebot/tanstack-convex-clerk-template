import { useAuth } from "@clerk/clerk-react";

/**
 * Ensures user has selected an organization
 * Use to redirect to org selection page if needed
 */
export function useRequireOrg() {
	const { orgId, isLoaded } = useAuth();

	return {
		isLoading: !isLoaded,
		hasOrg: !!orgId,
		orgId,
		shouldRedirect: isLoaded && !orgId,
	};
}
