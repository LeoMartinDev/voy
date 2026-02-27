import {
	ExternalLink,
	Github,
	Heart,
	Lock,
	Server,
	Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";

export function AboutSection() {
	const { t } = useTranslation();

	return (
		<section className="settings-section space-y-4">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{t("settings.aboutTitle")}
					</CardTitle>
					<CardDescription className="text-xs">
						{t("settings.aboutDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-xs text-muted-foreground">
						{t("settings.aboutContent")}
					</p>
				</CardContent>
			</Card>

			<div className="grid grid-cols-2 gap-3">
				{[
					{
						icon: Shield,
						title: t("settings.privacyFirst"),
						desc: t("settings.noTracking"),
					},
					{
						icon: Server,
						title: t("settings.selfHosted"),
						desc: t("settings.fullControl"),
					},
					{
						icon: Lock,
						title: t("settings.encrypted"),
						desc: t("settings.secureConnections"),
					},
					{
						icon: Heart,
						title: t("settings.openSource"),
						desc: t("settings.transparent"),
					},
				].map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.title}
							className="rounded-lg border border-border/50 bg-muted/30 p-3"
						>
							<div className="flex items-center gap-2">
								<Icon className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="text-xs font-medium">{item.title}</span>
							</div>
							<p className="text-[10px] text-muted-foreground mt-1">
								{item.desc}
							</p>
						</div>
					);
				})}
			</div>

			<Card className="settings-card">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{t("settings.technology")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-1.5">
						{["SearXNG", "TanStack Start", "React", "SQLite", "Bun"].map(
							(tech) => (
								<span
									key={tech}
									className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
								>
									{tech}
								</span>
							),
						)}
					</div>
				</CardContent>
			</Card>

			<Card className="settings-card">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{t("settings.resources")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<a
						href="https://github.com/LeoMartinDev/voy"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
					>
						<div className="flex items-center gap-2">
							<Github className="h-4 w-4 text-muted-foreground" />
							<span className="text-xs font-medium">
								{t("settings.githubRepo")}
							</span>
						</div>
						<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
					</a>
				</CardContent>
			</Card>
		</section>
	);
}
