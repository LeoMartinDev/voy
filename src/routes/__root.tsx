import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/client/components/theme-provider";
import { Toaster } from "@/client/components/ui/sonner";
import { getPublicConfig } from "@/server/infrastructure/functions/instance-config";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import "@/client/i18n";
import { useTranslation } from "react-i18next";
import { LanguageSync } from "@/client/components/language-sync";

interface MyRouterContext {
	queryClient: QueryClient;
}

const themeInitScript = `
(() => {
  try {
    const storageKey = 'theme'
    const stored = localStorage.getItem(storageKey)
    const theme =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system'
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  } catch {}
})()
`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	loader: () => getPublicConfig(),
	head: ({ loaderData }) => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: loaderData?.instanceName ?? "Voy",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml",
			},
			{
				rel: "search",
				type: "application/opensearchdescription+xml",
				href: "/opensearch.xml",
				title: loaderData?.instanceName ?? "Voy",
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,opsz,wght@0,6..12,200..800;1,6..12,200..800&family=Instrument+Serif:ital@0;1&display=swap",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	notFoundComponent: NotFound,

	shellComponent: RootDocument,
});

function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<p className="text-muted-foreground">Page not found</p>
			</div>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { i18n } = useTranslation();
	return (
		<html lang={i18n.language} suppressHydrationWarning>
			<head>
				<script>{themeInitScript}</script>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<LanguageSync />
					{children}
					<Toaster position="bottom-right" />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
