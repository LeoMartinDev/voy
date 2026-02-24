import { createFileRoute } from "@tanstack/react-router";
import { getContainer } from "@/server/container";

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
				const url = new URL(request.url);
				const query = url.searchParams.get("q") ?? "";
				const limitParam = url.searchParams.get("limit") ?? "6";
				const limit = Number.parseInt(limitParam, 10) || 6;

				if (!query) {
					return new Response(JSON.stringify(["", [], [], []]), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
				}

				try {
					const container = await getContainer();
					const { suggestions } = await container.usecases.suggest({
						query,
						limit,
					});

					const openSearchResponse = [query, suggestions, [], []];

					return new Response(JSON.stringify(openSearchResponse), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
				} catch (error) {
					console.error("SearXNG suggest error", error);
					return new Response(JSON.stringify([query, [], [], []]), {
						status: 200,
						headers: SUGGEST_HEADERS,
					});
				}
			},
		},
	},
});
