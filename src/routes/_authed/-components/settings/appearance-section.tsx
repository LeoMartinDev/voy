"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/client/components/theme-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";

export function AppearanceSection() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();

	const themeOptions = [
		{
			value: "light" as const,
			label: t("themes.light"),
			icon: Sun,
		},
		{
			value: "dark" as const,
			label: t("themes.dark"),
			icon: Moon,
		},
		{
			value: "system" as const,
			label: t("themes.system"),
			icon: Monitor,
		},
	];

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{t("settings.themeTitle")}
					</CardTitle>
					<CardDescription className="text-xs">
						{t("settings.themeDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-2">
						{themeOptions.map((option) => {
							const Icon = option.icon;
							const isSelected = theme === option.value;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setTheme(option.value)}
									className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
										isSelected
											? "border-primary/30 bg-muted/50"
											: "border-border/50 hover:border-border hover:bg-muted/30"
									}`}
								>
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-lg ${
											isSelected
												? "bg-primary/10 text-primary"
												: "bg-muted text-muted-foreground"
										}`}
									>
										<Icon className="h-4 w-4" />
									</div>
									<span className="text-xs font-medium">{option.label}</span>
									{isSelected && <Check className="h-3 w-3 text-primary" />}
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
