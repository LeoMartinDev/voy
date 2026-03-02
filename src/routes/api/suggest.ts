import { createFileRoute } from "@tanstack/react-router";
import { getContainer } from "@/server/container";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import {
	createRequestContext,
	withRequestIdHeader,
} from "@/server/infrastructure/logging/request-context";

const SUGGEST_HEADERS = {
	"Content-Type": "application/x-suggestions+json",
	"Cache-Control": "public, max-age=300",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
	"Access-Control-Allow-Headers": "*",
} as const;

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
	"Access-Control-Allow-Headers": "*",
	"Access-Control-Max-Age": "600",
} as const;

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "api-suggest-route",
	},
});

export const Route = createFileRoute("/api/suggest")({
	server: {
		handlers: {
			OPTIONS: () => {
				return new Response(null, {
					status: 204,
					headers: CORS_HEADERS,
				});
			},
			HEAD: () => {
				return new Response(null, {
					status: 200,
					headers: SUGGEST_HEADERS,
				});
			},
			GET: async ({ request }) => {
				const startedAt = performance.now();
				const requestContext = createRequestContext({
					request,
					logger,
					operation: "api.suggest",
				});
				const url = new URL(request.url);
				const query = url.searchParams.get("q") ?? "";
				const limitParam = url.searchParams.get("limit") ?? "6";
				const limit = Number.parseInt(limitParam, 10) || 6;

				if (!query) {
					const response = new Response(JSON.stringify(["", [], [], []]), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				}

				try {
					const container = await getContainer();
					const { suggestions } = await container.usecases.suggest({
						query,
						limit,
					});

					const openSearchResponse = [query, suggestions, [], []];
					requestContext.logger.info(
						{
							event: "api.suggest.completed",
							status: 200,
							suggestionsCount: suggestions.length,
							durationMs: Math.round(performance.now() - startedAt),
						},
						"Suggest API request completed",
					);

					const response = new Response(JSON.stringify(openSearchResponse), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				} catch (error) {
					requestContext.logger.error(
						{
							event: "api.suggest.failed",
							status: 200,
							durationMs: Math.round(performance.now() - startedAt),
							err: error,
						},
						"Suggest API fallback to empty response",
					);
					const response = new Response(JSON.stringify([query, [], [], []]), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				}
			},
		},
	},
});
