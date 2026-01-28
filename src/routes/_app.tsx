import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useRequireOrg } from "../hooks/use-require-org";
import { useStoreUser } from "../hooks/use-store-user";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

function AppLayout() {
	const { isLoading: userLoading } = useStoreUser();
	const { isLoading: orgLoading, shouldRedirect } = useRequireOrg();

	// Wait for both user and org to load
	if (userLoading || orgLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	// Redirect to org selection if no org selected
	if (shouldRedirect) {
		return <Navigate to="/org" />;
	}

	return (
		<>
			<SignedIn>
				<Outlet />
			</SignedIn>
			<SignedOut>
				<Navigate to="/sign-in" />
			</SignedOut>
		</>
	);
}
