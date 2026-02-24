import { createFileRoute } from "@tanstack/react-router";
import { AiUserSection } from "../-components/settings";
import { useSettingsLayout } from "../settings";

export const Route = createFileRoute("/_authed/settings/ai")({
	head: () => ({
		meta: [{ title: "AI - Settings" }],
	}),
	component: AiSettingsSection,
});

function AiSettingsSection() {
	const { userSettings, handleUserSettingChange } = useSettingsLayout();

	return (
		<AiUserSection
			settings={userSettings}
			onSettingChange={handleUserSettingChange}
		/>
	);
}
