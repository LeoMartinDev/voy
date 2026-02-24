"use client";

import * as React from "react";
import {
	getUserSettings,
	saveUserSettings,
} from "@/server/infrastructure/functions/user-settings";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "theme",
}: ThemeProviderProps) {
	const [theme, setThemeState] = React.useState<Theme>(() => {
		if (typeof window === "undefined") return defaultTheme;
		const stored = window.localStorage.getItem(storageKey);
		return stored === "light" || stored === "dark" || stored === "system"
			? stored
			: defaultTheme;
	});

	const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(
		getSystemTheme(),
	);

	const [hasSyncedFromDb, setHasSyncedFromDb] = React.useState(false);

	React.useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const updateSystemTheme = () => {
			if (theme === "system") {
				setResolvedTheme(mediaQuery.matches ? "dark" : "light");
			}
		};

		updateSystemTheme();
		mediaQuery.addEventListener("change", updateSystemTheme);
		return () => mediaQuery.removeEventListener("change", updateSystemTheme);
	}, [theme]);

	React.useEffect(() => {
		const nextResolved = theme === "system" ? getSystemTheme() : theme;
		setResolvedTheme(nextResolved);
		window.document.documentElement.classList.toggle(
			"dark",
			nextResolved === "dark",
		);
		window.localStorage.setItem(storageKey, theme);
	}, [theme, storageKey]);

	React.useEffect(() => {
		if (hasSyncedFromDb) return;

		let mounted = true;

		const syncThemeFromDb = async () => {
			try {
				const settings = await getUserSettings();
				if (mounted && settings.theme && settings.theme !== theme) {
					setThemeState(settings.theme);
				}
			} catch {
			} finally {
				if (mounted) {
					setHasSyncedFromDb(true);
				}
			}
		};

		syncThemeFromDb();

		return () => {
			mounted = false;
		};
	}, [theme, hasSyncedFromDb]);

	const setTheme = React.useCallback((newTheme: Theme) => {
		setThemeState(newTheme);

		getUserSettings()
			.then((currentSettings) => {
				return saveUserSettings({
					data: { ...currentSettings, theme: newTheme },
				});
			})
			.catch(() => {});
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const value = React.useContext(ThemeContext);
	if (value) return value;

	return {
		theme: "system" as Theme,
		resolvedTheme: "light" as ResolvedTheme,
		setTheme: () => {},
	};
}
