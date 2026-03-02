import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getContainer } from "@/server/container";
import {
	SafeSearch,
	SearchCategory,
	TimeRange,
} from "@/server/domain/value-objects/search.vo";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import {
	createRequestContext,
	withRequestIdHeader,
} from "@/server/infrastructure/logging/request-context";

const SEARCH_HEADERS = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
} as const;

const searchSchema = z.object({
	q: z.string().min(1, "Query is required"),
	key: z.string().min(1, "API key is required"),
	category: z.enum(SearchCategory).optional(),
	timeRange: z.enum(TimeRange).optional(),
	locale: z.string().optional(),
	safeSearch: z.enum(SafeSearch).optional(),
});

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "api-search-route",
	},
});

export const Route = createFileRoute("/api/search")({
	server: {
		handlers: {
			OPTIONS: () => {
				return new Response(null, {
					status: 204,
					headers: SEARCH_HEADERS,
				});
			},
			GET: async ({ request }) => {
				const startedAt = performance.now();
				const requestContext = createRequestContext({
					request,
					logger,
					operation: "api.search",
				});
				const url = new URL(request.url);
				const entries = Object.fromEntries(url.searchParams.entries());

				const validation = searchSchema.safeParse(entries);

				if (!validation.success) {
					const response = new Response(
						JSON.stringify({
							error: "Validation error",
							details: validation.error.flatten().fieldErrors,
						}),
						{
							status: 400,
							headers: SEARCH_HEADERS,
						},
					);
					requestContext.logger.warn(
						{
							event: "api.search.validation_failed",
							status: 400,
							durationMs: Math.round(performance.now() - startedAt),
						},
						"Search API validation failed",
					);
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				}

				const {
					q: query,
					key: token,
					category,
					timeRange,
					locale,
					safeSearch,
				} = validation.data;

				const container = await getContainer();
				const apiKey = await container.usecases.validateApiKey({ key: token });

				if (!apiKey) {
					const response = new Response(
						JSON.stringify({ error: "Invalid API key" }),
						{
							status: 401,
							headers: SEARCH_HEADERS,
						},
					);
					requestContext.logger.warn(
						{
							event: "api.search.invalid_api_key",
							status: 401,
							durationMs: Math.round(performance.now() - startedAt),
						},
						"Search API rejected invalid key",
					);
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				}

				try {
					const result = await container.usecases.search({
						query,
						category,
						timeRange,
						locale,
						safeSearch,
					});

					requestContext.logger.info(
						{
							event: "api.search.completed",
							userId: apiKey.userId,
							status: 200,
							resultCount: result.count,
							durationMs: Math.round(performance.now() - startedAt),
						},
						"Search API request completed",
					);
					const response = new Response(JSON.stringify(result), {
						status: 200,
						headers: SEARCH_HEADERS,
					});
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				} catch (error) {
					requestContext.logger.error(
						{
							event: "api.search.failed",
							userId: apiKey.userId,
							status: 500,
							durationMs: Math.round(performance.now() - startedAt),
							err: error,
						},
						"Search API request failed",
					);
					const response = new Response(
						JSON.stringify({ error: "Internal Server Error" }),
						{
							status: 500,
							headers: SEARCH_HEADERS,
						},
					);
					return withRequestIdHeader({
						response,
						requestId: requestContext.requestId,
					});
				}
			},
		},
	},
});
