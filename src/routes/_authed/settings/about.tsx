import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "../-components/settings";

export const Route = createFileRoute("/_authed/settings/about")({
	head: () => ({
		meta: [{ title: "About - Settings" }],
	}),
	component: AboutSettingsSection,
});

function AboutSettingsSection() {
	return <AboutSection />;
}
