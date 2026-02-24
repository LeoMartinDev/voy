import { Server } from "lucide-react";
import { useId } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import type { InstanceConfig } from "@/server/infrastructure/functions/instance-config";

interface ServerSectionProps {
	config: InstanceConfig;
	onConfigChange: <K extends keyof InstanceConfig>(
		key: K,
		value: InstanceConfig[K],
	) => void;
}

export function ServerSection({ config, onConfigChange }: ServerSectionProps) {
	const mistralApiKeyId = useId();

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Server className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">
								Server Configuration
							</CardTitle>
							<CardDescription className="text-xs">
								Configure AI integration
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={mistralApiKeyId} className="text-xs">
							Mistral API Key
						</Label>
						<Input
							id={mistralApiKeyId}
							type="password"
							value={config.mistralApiKey ?? ""}
							onChange={(e) =>
								onConfigChange("mistralApiKey", e.target.value || undefined)
							}
							placeholder="Enter your Mistral API key"
							className="h-9"
						/>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
