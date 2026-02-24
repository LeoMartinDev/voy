import { createFileRoute } from "@tanstack/react-router";
import { SearchSection } from "../-components/settings";
import { useSettingsLayout } from "../settings";

export const Route = createFileRoute("/_authed/settings/search")({
	head: () => ({
		meta: [{ title: "Search - Settings" }],
	}),
	component: SearchSettingsSection,
});

function SearchSettingsSection() {
	const { userSettings, handleUserSettingChange } = useSettingsLayout();

	return (
		<SearchSection
			settings={userSettings}
			onSettingChange={handleUserSettingChange}
		/>
	);
}
