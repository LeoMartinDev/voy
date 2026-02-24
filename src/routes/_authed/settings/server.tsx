import { createFileRoute } from "@tanstack/react-router";
import { ServerSection } from "../-components/settings";
import { useSettingsLayout } from "../settings";

export const Route = createFileRoute("/_authed/settings/server")({
	head: () => ({
		meta: [{ title: "Server - Settings" }],
	}),
	component: ServerSettingsSection,
});

function ServerSettingsSection() {
	const { instanceConfig, handleInstanceConfigChange, isAdmin } =
		useSettingsLayout();

	if (!isAdmin || !instanceConfig) {
		return null;
	}

	return (
		<ServerSection
			config={instanceConfig}
			onConfigChange={handleInstanceConfigChange}
		/>
	);
}
