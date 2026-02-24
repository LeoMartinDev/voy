import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/client/components/ui/select";
import { authClient } from "@/server/infrastructure/auth/client";
import {
	getUserSettings,
	saveUserSettings,
} from "@/server/infrastructure/functions/user-settings";

export interface LanguageSwitcherProps {
	value?: string;
	onValueChange?: (value: string) => void;
}

export function LanguageSwitcher({
	value,
	onValueChange,
}: LanguageSwitcherProps) {
	const { i18n, t } = useTranslation();
	const { data: session } = authClient.useSession();

	const changeLanguage = async (lng: string) => {
		// Controlled mode: just bubble up the change
		if (onValueChange) {
			onValueChange(lng);
			return;
		}

		// Uncontrolled mode: save and switch immediately
		if (session) {
			try {
				// Fetch current settings first to merge
				const currentSettings = await getUserSettings();
				const normalizedLng = lng.split("-")[0] as "en" | "fr";

				// Save to server first
				await saveUserSettings({
					data: { ...currentSettings, language: normalizedLng },
				});

				// Then update client state
				i18n.changeLanguage(lng);
			} catch (error) {
				console.error("Failed to save language preference:", error);
			}
		} else {
			// Guest user - just change language
			i18n.changeLanguage(lng);
		}
	};

	// Ensure we have a valid language selection, fallback to 'en'
	// Use resolvedLanguage if available, otherwise language, otherwise 'en'
	const currentLanguage =
		value ||
		(i18n.resolvedLanguage || i18n.language || "en").split("-")[0] ||
		"en";

	return (
		<div className="flex items-center gap-2">
			<Globe className="h-4 w-4 text-muted-foreground" />
			<Select value={currentLanguage} onValueChange={changeLanguage}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t("settings.language")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="en">{t("languages.en")}</SelectItem>
					<SelectItem value="fr">{t("languages.fr")}</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
