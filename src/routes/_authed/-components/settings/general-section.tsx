"use client";

import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/routes/_authed/-components/settings/language-switcher";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";
import { useSettingsLayout } from "@/routes/_authed/settings";

export function GeneralSection() {
	const { t } = useTranslation();
	const { userSettings, handleUserSettingChange } = useSettingsLayout();

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{t("settings.language")}
					</CardTitle>
					<CardDescription className="text-xs">
						{t("settings.languageDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LanguageSwitcher
						value={userSettings.language}
						onValueChange={(val) =>
							handleUserSettingChange("language", val as "en" | "fr")
						}
					/>
				</CardContent>
			</Card>
		</section>
	);
}
