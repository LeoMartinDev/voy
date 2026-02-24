import { Sparkles } from "lucide-react";
import { useId } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import type { UserSettings } from "@/server/infrastructure/functions/user-settings";

interface AiUserSectionProps {
	settings: UserSettings;
	onSettingChange: <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K],
	) => void;
}

export function AiUserSection({
	settings,
	onSettingChange,
}: AiUserSectionProps) {
	const enableAiSummaryId = useId();

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Sparkles className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">AI Summary</CardTitle>
							<CardDescription className="text-xs">
								AI-generated summaries for search results
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label
								htmlFor={enableAiSummaryId}
								className="text-xs font-medium"
							>
								Enable AI Summary
							</Label>
							<p className="text-[11px] text-muted-foreground">
								Show AI-generated summaries above search results
							</p>
						</div>
						<Switch
							id={enableAiSummaryId}
							checked={settings.enableAiSummary}
							onCheckedChange={(checked) =>
								onSettingChange("enableAiSummary", checked)
							}
						/>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
