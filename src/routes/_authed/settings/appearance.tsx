import { createFileRoute } from "@tanstack/react-router";
import { AppearanceSection } from "../-components/settings";

export const Route = createFileRoute("/_authed/settings/appearance")({
	head: () => ({
		meta: [{ title: "Appearance - Settings" }],
	}),
	component: AppearanceSettingsSection,
});

function AppearanceSettingsSection() {
	return <AppearanceSection />;
}
