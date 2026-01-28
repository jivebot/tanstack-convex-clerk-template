import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
	component: Dashboard,
});

function Dashboard() {
	return (
		<div className="min-h-screen bg-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
				<p className="text-gray-400">
					Welcome! You are signed in and have an organization selected.
				</p>
			</div>
		</div>
	);
}
