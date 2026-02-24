import { Link, useLocation } from "@tanstack/react-router";
import {
	Info,
	Key,
	Palette,
	Search,
	Server,
	Settings,
	Shield,
	Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export type SettingsSection =
	| "server"
	| "api"
	| "general"
	| "ai"
	| "appearance"
	| "search"
	| "privacy"
	| "about";

interface SettingsSidebarProps {
	isAdmin?: boolean;
}

const adminNavItems: {
	id: SettingsSection;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
}[] = [
	{
		id: "server",
		label: "settings.server",
		icon: Server,
		route: "/settings/server",
	},
	{ id: "api", label: "settings.api", icon: Key, route: "/settings/api" },
];

const userNavItems: {
	id: SettingsSection;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
}[] = [
	{
		id: "general",
		label: "settings.general",
		icon: Settings,
		route: "/settings/general",
	},
	{ id: "ai", label: "settings.ai", icon: Sparkles, route: "/settings/ai" },
	{
		id: "appearance",
		label: "settings.appearance",
		icon: Palette,
		route: "/settings/appearance",
	},
	{
		id: "search",
		label: "common.search",
		icon: Search,
		route: "/settings/search",
	},
	{
		id: "privacy",
		label: "settings.privacy",
		icon: Shield,
		route: "/settings/privacy",
	},
	{
		id: "about",
		label: "settings.about",
		icon: Info,
		route: "/settings/about",
	},
];

export function SettingsSidebar({ isAdmin = false }: SettingsSidebarProps) {
	const location = useLocation();
	const { t } = useTranslation();
	const currentPath = location.pathname;
	const navItems = isAdmin ? [...adminNavItems, ...userNavItems] : userNavItems;

	return (
		<aside className="w-full md:w-48 shrink-0">
			<nav className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = currentPath === item.route;
					return (
						<Link
							key={item.id}
							to={item.route}
							className={`settings-nav-item whitespace-nowrap ${isActive ? "active" : ""}`}
						>
							<Icon className="h-4 w-4" />
							<span>{t(item.label)}</span>
						</Link>
					);
				})}
			</nav>

			<div className="hidden md:block mt-8 pt-6 border-t border-border/50">
				<Link
					to="/"
					className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<span className="text-xs">{t("common.back")}</span>
				</Link>
			</div>
		</aside>
	);
}
