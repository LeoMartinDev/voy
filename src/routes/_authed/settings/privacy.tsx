import { createFileRoute } from "@tanstack/react-router";
import { PrivacySection } from "../-components/settings";

export const Route = createFileRoute("/_authed/settings/privacy")({
	head: () => ({
		meta: [{ title: "Privacy - Settings" }],
	}),
	component: PrivacySettingsSection,
});

function PrivacySettingsSection() {
	return <PrivacySection />;
}
