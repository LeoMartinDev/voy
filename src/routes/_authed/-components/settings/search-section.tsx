import { Clock, Filter, Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import { Switch } from "@/client/components/ui/switch";
import { SafeSearch } from "@/server/domain/value-objects";
import type { UserSettings } from "@/server/infrastructure/functions/user-settings";

interface SearchSectionProps {
	settings: UserSettings;
	onSettingChange: <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K],
	) => void;
}

export function SearchSection({
	settings,
	onSettingChange,
}: SearchSectionProps) {
	const { t } = useTranslation();
	const openInNewTabId = useId();

	const safeSearchOptions = [
		{
			value: SafeSearch.OFF,
			label: t("safeSearch.off"),
			description: t("safeSearch.offDescription"),
			icon: ShieldOff,
		},
		{
			value: SafeSearch.MODERATE,
			label: t("safeSearch.moderate"),
			description: t("safeSearch.moderateDescription"),
			icon: Shield,
		},
		{
			value: SafeSearch.STRICT,
			label: t("safeSearch.strict"),
			description: t("safeSearch.strictDescription"),
			icon: ShieldAlert,
		},
	];

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Shield className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								{t("settings.safeSearchTitle")}
							</CardTitle>
							<CardDescription className="text-xs">
								{t("settings.safeSearchDescription")}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<RadioGroup
						value={settings.safeSearch}
						onValueChange={(value) =>
							onSettingChange("safeSearch", value as UserSettings["safeSearch"])
						}
						className="gap-2"
					>
						{safeSearchOptions.map((option) => {
							const Icon = option.icon;
							return (
								<Label
									key={option.value}
									htmlFor={option.value}
									className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
								>
									<RadioGroupItem value={option.value} id={option.value} />
									<Icon className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<span className="text-sm font-medium">{option.label}</span>
										<p className="text-xs text-muted-foreground">
											{option.description}
										</p>
									</div>
								</Label>
							);
						})}
					</RadioGroup>
				</CardContent>
			</Card>

			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Clock className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								{t("settings.linkBehaviorTitle")}
							</CardTitle>
							<CardDescription className="text-xs">
								{t("settings.linkBehaviorDescription")}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor={openInNewTabId} className="text-xs font-medium">
								{t("settings.openInNewTabLabel")}
							</Label>
							<p className="text-[11px] text-muted-foreground">
								{t("settings.openInNewTabDescription")}
							</p>
						</div>
						<Switch
							id={openInNewTabId}
							checked={settings.openInNewTab}
							onCheckedChange={(checked) =>
								onSettingChange("openInNewTab", checked)
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="settings-card opacity-50">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Filter className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								{t("settings.defaultCategoryTitle")}
							</CardTitle>
							<CardDescription className="text-xs">
								{t("settings.defaultCategoryDescription")}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground">
						{t("settings.defaultCategoryContent")}
					</p>
					<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
						{t("settings.comingSoon")}
					</span>
				</CardContent>
			</Card>
		</section>
	);
}
