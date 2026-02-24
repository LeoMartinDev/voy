import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";
import { LoginForm } from "@/routes/login/-components/login-form";
import { getSetupStatus } from "@/server/infrastructure/functions/setup";

const rootRoute = getRouteApi("__root__");

export const Route = createFileRoute("/login")({
	loader: async () => {
		const { setupRequired } = await getSetupStatus();

		if (setupRequired) {
			throw redirect({ to: "/setup" });
		}

		return { setupComplete: true };
	},
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	head: () => ({
		meta: [{ title: "Login" }],
	}),
	component: LoginPage,
});

function LoginPage() {
	const { redirect: redirectTo } = Route.useSearch();
	const { instanceName } = rootRoute.useLoaderData();

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEndIcon className="size-4" />
						</div>
						{instanceName}
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm redirectTo={redirectTo} />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="/light.jpg"
					alt="Login page background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
