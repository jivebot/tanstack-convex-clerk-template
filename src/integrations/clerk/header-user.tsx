import {
	OrganizationSwitcher,
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";

export default function HeaderUser() {
	return (
		<>
			<SignedIn>
				<div className="flex items-center gap-4">
					<OrganizationSwitcher
						hidePersonal
						afterSelectOrganizationUrl="/"
						afterCreateOrganizationUrl="/"
					/>
					<UserButton />
				</div>
			</SignedIn>
			<SignedOut>
				<SignInButton />
			</SignedOut>
		</>
	);
}
