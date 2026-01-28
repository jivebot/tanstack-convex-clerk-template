import { OrganizationList, SignedIn, SignedOut } from "@clerk/clerk-react";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/org")({
	component: OrgPage,
});

function OrgPage() {
	return (
		<>
			<SignedIn>
				<div className="flex min-h-screen items-center justify-center bg-slate-900">
					<OrganizationList
						hidePersonal
						afterSelectOrganizationUrl="/"
						afterCreateOrganizationUrl="/"
						skipInvitationScreen
					/>
				</div>
			</SignedIn>
			<SignedOut>
				<Navigate to="/sign-in" />
			</SignedOut>
		</>
	);
}
