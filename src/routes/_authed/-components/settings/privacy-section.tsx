import { Database, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";

export function PrivacySection() {
	const { t } = useTranslation();

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Lock className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								{t("settings.privacyTitle")}
							</CardTitle>
							<CardDescription className="text-xs">
								{t("settings.privacyDescription")}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-start gap-2">
							<Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<p className="text-xs font-medium">
									{t("settings.privacyContentTitle")}
								</p>
								<p className="text-[11px] text-muted-foreground mt-1">
									{t("settings.privacyContentDescription")}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Database className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								{t("settings.dataStorageTitle")}
							</CardTitle>
							<CardDescription className="text-xs">
								{t("settings.dataStorageDescription")}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-xs text-muted-foreground">
						{t("settings.dataStorageContent")}
					</p>
				</CardContent>
			</Card>
		</section>
	);
}
