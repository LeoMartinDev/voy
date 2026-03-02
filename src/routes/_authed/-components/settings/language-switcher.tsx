import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/client/components/ui/select";
import {
	languageOptions,
	normalizeLanguageCode,
} from "@/client/languages";
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
		const normalizedLng = normalizeLanguageCode(lng);
		// Controlled mode: just bubble up the change
		if (onValueChange) {
			onValueChange(normalizedLng);
			return;
		}

		// Uncontrolled mode: save and switch immediately
		if (session) {
			try {
				// Fetch current settings first to merge
				const currentSettings = await getUserSettings();

				// Save to server first
				await saveUserSettings({
					data: { ...currentSettings, language: normalizedLng },
				});

				// Then update client state
				i18n.changeLanguage(normalizedLng);
			} catch (error) {
				console.error("Failed to save language preference:", error);
			}
		} else {
			// Guest user - just change language
			i18n.changeLanguage(normalizedLng);
		}
	};

	// Ensure we have a valid language selection, fallback to 'en'
	// Use resolvedLanguage if available, otherwise language, otherwise 'en'
	const currentLanguage =
		value ||
		normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

	return (
		<div className="flex items-center gap-2">
			<Globe className="h-4 w-4 text-muted-foreground" />
			<Select value={currentLanguage} onValueChange={changeLanguage}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t("settings.language")} />
				</SelectTrigger>
				<SelectContent>
					{languageOptions.map((option) => (
						<SelectItem key={option.code} value={option.code}>
							{t(option.labelKey)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
