import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getContainer } from "@/server/container";
import {
	SafeSearch,
	SearchCategory,
	TimeRange,
} from "@/server/domain/value-objects/search.vo";

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
				const url = new URL(request.url);
				const entries = Object.fromEntries(url.searchParams.entries());

				const validation = searchSchema.safeParse(entries);

				if (!validation.success) {
					return new Response(
						JSON.stringify({
							error: "Validation error",
							details: validation.error.flatten().fieldErrors,
						}),
						{
							status: 400,
							headers: SEARCH_HEADERS,
						},
					);
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
					return new Response(JSON.stringify({ error: "Invalid API key" }), {
						status: 401,
						headers: SEARCH_HEADERS,
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

					return new Response(JSON.stringify(result), {
						status: 200,
						headers: SEARCH_HEADERS,
					});
				} catch (error) {
					console.error("Search API error", error);
					return new Response(
						JSON.stringify({ error: "Internal Server Error" }),
						{
							status: 500,
							headers: SEARCH_HEADERS,
						},
					);
				}
			},
		},
	},
});
