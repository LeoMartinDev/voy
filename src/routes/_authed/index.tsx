import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/client/components/search-bar";
import { SearchLogo } from "@/client/components/search-logo";
import { ThemeToggle } from "@/client/components/theme-toggle";
import { UserDropdown } from "@/client/components/user-dropdown";
import { KeyboardHints } from "@/routes/_authed/-components/keyboard-hints";

export const Route = createFileRoute("/_authed/")({
	component: HomePage,
});

function HomePage() {
	const { t } = useTranslation();
	const mainSearchId = useId();

	return (
		<div className="relative flex min-h-svh flex-col bg-background overflow-hidden">
			<div className="absolute inset-0 pointer-events-none">
				<div
					className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-[0.03] dark:opacity-[0.05]"
					style={{
						background:
							"radial-gradient(circle, currentColor 0%, transparent 70%)",
						filter: "blur(60px)",
					}}
				/>
				<div
					className="absolute right-0 top-0 w-[500px] h-[500px] opacity-[0.02] dark:opacity-[0.03]"
					style={{
						background:
							"radial-gradient(circle at top right, currentColor 0%, transparent 60%)",
						filter: "blur(80px)",
					}}
				/>
				<div
					className="absolute left-0 bottom-0 w-[600px] h-[600px] opacity-[0.02] dark:opacity-[0.03]"
					style={{
						background:
							"radial-gradient(circle at bottom left, currentColor 0%, transparent 60%)",
						filter: "blur(80px)",
					}}
				/>
			</div>

			<a
				href={`#${mainSearchId}`}
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-foreground focus:px-5 focus:py-3 focus:text-background focus:outline-none focus:shadow-lg"
			>
				{t("shortcuts.skipToSearch") || "Skip to search"}
			</a>

			<header className="relative z-10 flex items-center justify-end px-6 py-5 md:px-10">
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<UserDropdown />
				</div>
			</header>

			<main
				id={mainSearchId}
				className="flex flex-1 flex-col items-center justify-center px-6 pb-32 relative z-10"
			>
				<div className="flex w-full max-w-2xl flex-col items-center gap-10">
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards">
						<SearchLogo size="lg" />
					</div>

					<div className="relative z-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards delay-150">
						<SearchBar variant="home" autoFocus />
						<div className="hidden lg:flex mt-4 justify-center">
							<KeyboardHints />
						</div>
					</div>
				</div>
			</main>

			<footer className="relative z-10 border-t border-border/40 px-6 py-6 md:px-10">
				<div className="mx-auto flex max-w-5xl items-center justify-center gap-6">
					<a
						href="/settings"
						className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
					>
						{t("common.settings")}
					</a>

					<div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
							<Lock className="h-2.5 w-2.5 text-emerald-600" />
						</div>
						<span>{t("settings.privacyContentTitle")}</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
