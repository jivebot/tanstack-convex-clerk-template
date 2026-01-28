import { OrganizationProfile } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/org-settings")({
	component: OrgSettingsPage,
});

function OrgSettingsPage() {
	return (
		<div className="min-h-screen bg-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<OrganizationProfile
					routing="hash"
					appearance={{
						elements: {
							rootBox: "w-full",
							card: "w-full shadow-none",
						},
					}}
				/>
			</div>
		</div>
	);
}
