import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/server/infrastructure/auth";
import { getSetupStatus } from "@/server/infrastructure/functions/setup";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "authed-route",
	},
});

const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
	const requestContext = createRequestContext({
		request: getRequest(),
		logger,
		operation: "serverfn.session.get",
	});
	const session = await auth.api.getSession({
		headers: getRequest().headers,
	});
	requestContext.logger.info(
		{
			event: "serverfn.session.get.completed",
			authenticated: Boolean(session),
		},
		"Session lookup completed",
	);
	return session;
});

export const sessionQueryOptions = queryOptions({
	queryKey: ["session"],
	queryFn: () => getSessionFn(),
	staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const { setupRequired } = await getSetupStatus();

		if (setupRequired) {
			throw redirect({ to: "/setup" });
		}

		// ensureQueryData populates the TanStack Query cache on the server.
		// setupRouterSsrQueryIntegration then dehydrates that cache into the HTML,
		// so on the client the data is already available synchronously — no Suspense.
		await queryClient.ensureQueryData(sessionQueryOptions);

		const session = queryClient.getQueryData(sessionQueryOptions.queryKey);

		if (!session) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}

		return { user: session.user };
	},
	component: () => <Outlet />,
});
