import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/client/components/ui/button";
import { sessionQueryOptions } from "@/routes/_authed";
import {
	getInstanceConfig,
	type InstanceConfig,
	saveInstanceConfig,
} from "@/server/infrastructure/functions/instance-config";
import {
	getUserSettings,
	saveUserSettings,
	type UserSettings,
	userSettingsQueryOptions,
} from "@/server/infrastructure/functions/user-settings";
import { SettingsSidebar } from "./-components/settings";

export interface SettingsLayoutContext {
	userSettings: UserSettings;
	instanceConfig: InstanceConfig | null;
	isAdmin: boolean;
	setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
	setInstanceConfig: React.Dispatch<
		React.SetStateAction<InstanceConfig | null>
	>;
	lastSavedUserSettings: UserSettings;
	lastSavedInstanceConfig: InstanceConfig | null;
	setLastSavedUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
	setLastSavedInstanceConfig: React.Dispatch<
		React.SetStateAction<InstanceConfig | null>
	>;
	hasUserSettingsChanges: boolean;
	hasInstanceConfigChanges: boolean;
	hasChanges: boolean;
	handleUserSettingChange: <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K],
	) => void;
	handleInstanceConfigChange: <K extends keyof InstanceConfig>(
		key: K,
		value: InstanceConfig[K],
	) => void;
	handleSave: () => Promise<void>;
	isSaving: boolean;
}

export const SettingsLayoutContext =
	React.createContext<SettingsLayoutContext | null>(null);

export function useSettingsLayout() {
	const context = React.useContext(SettingsLayoutContext);
	if (!context) {
		throw new Error("useSettingsLayout must be used within SettingsLayout");
	}
	return context;
}

export const Route = createFileRoute("/_authed/settings")({
	loader: async ({ context: { queryClient } }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions);

		const isAdmin = session?.user.role === "admin";

		const userSettings = await getUserSettings();

		let instanceConfig: InstanceConfig | null = null;
		if (isAdmin) {
			instanceConfig = await getInstanceConfig();
		}

		return {
			userSettings,
			instanceConfig,
			isAdmin,
		};
	},
	component: SettingsLayout,
});

function SettingsLayout() {
	const {
		userSettings: initialUserSettings,
		instanceConfig: initialInstanceConfig,
		isAdmin,
	} = Route.useLoaderData();

	const [userSettings, setUserSettings] =
		useState<UserSettings>(initialUserSettings);
	const [instanceConfig, setInstanceConfig] = useState<InstanceConfig | null>(
		initialInstanceConfig ?? {
			mistralApiKey: undefined,
		},
	);
	const [isSaving, setIsSaving] = useState(false);

	const [lastSavedUserSettings, setLastSavedUserSettings] =
		useState<UserSettings>(initialUserSettings);
	const [lastSavedInstanceConfig, setLastSavedInstanceConfig] =
		useState<InstanceConfig | null>(initialInstanceConfig);

	const { t, i18n } = useTranslation();
	const saveUserSettingsFn = useServerFn(saveUserSettings);
	const saveInstanceConfigFn = useServerFn(saveInstanceConfig);
	const queryClient = useQueryClient();

	const hasUserSettingsChanges = useMemo(() => {
		return (
			JSON.stringify(userSettings) !== JSON.stringify(lastSavedUserSettings)
		);
	}, [userSettings, lastSavedUserSettings]);

	const hasInstanceConfigChanges = useMemo(() => {
		if (!lastSavedInstanceConfig) return false;
		return (
			JSON.stringify(instanceConfig) !== JSON.stringify(lastSavedInstanceConfig)
		);
	}, [instanceConfig, lastSavedInstanceConfig]);

	const hasChanges = hasUserSettingsChanges || hasInstanceConfigChanges;

	const handleUserSettingChange = <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K],
	) => {
		setUserSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleInstanceConfigChange = <K extends keyof InstanceConfig>(
		key: K,
		value: InstanceConfig[K],
	) => {
		setInstanceConfig((prev) => {
			if (!prev) return prev;
			return { ...prev, [key]: value };
		});
	};

	const handleSave = async () => {
		setIsSaving(true);

		try {
			if (hasUserSettingsChanges) {
				await saveUserSettingsFn({ data: userSettings });
				setLastSavedUserSettings(userSettings);
				await queryClient.invalidateQueries({
					queryKey: userSettingsQueryOptions.queryKey,
				});

				// Apply language change if needed
				const currentLng = (
					i18n.resolvedLanguage ||
					i18n.language ||
					"en"
				).split("-")[0];
				if (userSettings.language !== currentLng) {
					i18n.changeLanguage(userSettings.language);
				}
			}

			if (isAdmin && hasInstanceConfigChanges) {
				await saveInstanceConfigFn({ data: instanceConfig });
				setLastSavedInstanceConfig(instanceConfig);
			}

			toast.success(t("common.savedSuccess"));
		} catch (error) {
			toast.error(t("common.savedError"));
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasChanges]);

	const context: SettingsLayoutContext = {
		userSettings,
		instanceConfig,
		isAdmin,
		setUserSettings,
		setInstanceConfig,
		lastSavedUserSettings,
		lastSavedInstanceConfig,
		setLastSavedUserSettings,
		setLastSavedInstanceConfig,
		hasUserSettingsChanges,
		hasInstanceConfigChanges,
		hasChanges,
		handleUserSettingChange,
		handleInstanceConfigChange,
		handleSave,
		isSaving,
	};

	return (
		<SettingsLayoutContext.Provider value={context}>
			<div className="flex min-h-svh flex-col bg-background">
				<div className="flex-1 px-5 py-8 md:px-8 md:py-12">
					<div className="mx-auto max-w-4xl">
						<div className="mb-8">
							<h1 className="text-2xl font-semibold tracking-tight">
								{t("settings.title")}
							</h1>
							<p className="text-sm text-muted-foreground mt-1">
								{isAdmin
									? t("settings.adminDescription")
									: t("settings.userDescription")}
							</p>
						</div>

						<div className="flex flex-col gap-8 md:flex-row">
							<SettingsSidebar isAdmin={isAdmin} />

							<div className="flex-1 min-w-0">
								<div className="space-y-6">
									<Outlet />

									<div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
										<Button
											onClick={handleSave}
											disabled={!hasChanges}
											className="min-w-[120px] transition-all duration-200"
										>
											{isSaving ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin" />
													<span>{t("common.saving")}</span>
												</>
											) : (
												t("common.saveChanges")
											)}
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</SettingsLayoutContext.Provider>
	);
}
