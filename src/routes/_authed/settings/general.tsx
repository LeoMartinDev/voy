import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GeneralSection } from "../-components/settings/general-section";

export const Route = createFileRoute("/_authed/settings/general")({
	component: GeneralSettings,
});

function GeneralSettings() {
	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">{t("settings.general")}</h3>
				<p className="text-sm text-muted-foreground">
					{t("settings.generalDescription")}
				</p>
			</div>
			<GeneralSection />
		</div>
	);
}
