import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/routes/_authed";
import { ApiKeysSection } from "../-components/settings/api-keys-section";

export const Route = createFileRoute("/_authed/settings/api")({
	beforeLoad: async ({ context }) => {
		const queryClient = context.queryClient;
		const session = await queryClient.ensureQueryData(sessionQueryOptions);

		if (session?.user.role !== "admin") {
			throw redirect({ to: "/settings" });
		}
	},
	head: () => ({
		meta: [{ title: "API Keys - Settings" }],
	}),
	component: ApiSettingsPage,
});

function ApiSettingsPage() {
	return <ApiKeysSection />;
}
