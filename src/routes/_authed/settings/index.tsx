import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings/")({
	loader: () => {
		throw redirect({ to: "/settings/general" });
	},
});
