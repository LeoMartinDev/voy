import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/server/infrastructure/auth/client";
import { userSettingsQueryOptions } from "@/server/infrastructure/functions/user-settings";

export function LanguageSync() {
	const { i18n } = useTranslation();
	const synced = useRef(false);
	const { data: session, isPending } = authClient.useSession();
	const { data: userSettings } = useQuery({
		...userSettingsQueryOptions,
		enabled: !isPending && Boolean(session),
	});

	useEffect(() => {
		if (synced.current || isPending || !session || !userSettings) return;

		if (userSettings.language && userSettings.language !== i18n.language) {
			i18n.changeLanguage(userSettings.language);
		}

		synced.current = true;
	}, [i18n, session, isPending, userSettings]);

	return null;
}
