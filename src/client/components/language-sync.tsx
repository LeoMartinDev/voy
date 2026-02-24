"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/server/infrastructure/auth/client";
import { getUserSettings } from "@/server/infrastructure/functions/user-settings";

export function LanguageSync() {
	const { i18n } = useTranslation();
	const synced = useRef(false);
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (synced.current || isPending || !session) return;

		const syncLanguage = async () => {
			try {
				const settings = await getUserSettings();
				if (settings.language && settings.language !== i18n.language) {
					i18n.changeLanguage(settings.language);
				}
			} catch (e) {
				console.error("Failed to sync language", e);
			} finally {
				synced.current = true;
			}
		};
		syncLanguage();
	}, [i18n, session, isPending]);

	return null;
}
