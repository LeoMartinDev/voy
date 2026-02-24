import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getContainer } from "@/server/container";
import { ResultType } from "@/server/domain/value-objects";
import { auth } from "@/server/infrastructure/auth";

const summaryInputSchema = z.object({
	query: z.string().min(1),
	results: z.array(
		z.object({
			title: z.string(),
			url: z.string(),
			content: z.string(),
		}),
	),
});

export type SummaryInput = z.infer<typeof summaryInputSchema>;

interface SummaryResponse {
	summary: string;
	success: boolean;
	error?: string;
}

const summaryCache = new Map<string, { summary: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

function getCacheKey(query: string, results: SummaryInput["results"]): string {
	const urls = results
		.slice(0, 5)
		.map((r) => r.url)
		.join("|");
	return `${query}::${urls}`;
}

function getCachedSummary(key: string): string | null {
	const cached = summaryCache.get(key);
	if (!cached) return null;

	const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
	if (isExpired) {
		summaryCache.delete(key);
		return null;
	}

	return cached.summary;
}

function setCachedSummary(key: string, summary: string): void {
	summaryCache.set(key, { summary, timestamp: Date.now() });

	if (summaryCache.size > MAX_CACHE_SIZE) {
		const oldestKey = summaryCache.keys().next().value;
		if (oldestKey) {
			summaryCache.delete(oldestKey);
		}
	}
}

export const generateSummaryFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => summaryInputSchema.parse(data))
	.handler(async ({ data }): Promise<SummaryResponse> => {
		try {
			const session = await auth.api.getSession({
				headers: getRequest().headers,
			});

			if (!session) {
				return {
					success: false,
					summary: "",
					error: "Authentication required",
				};
			}

			const container = await getContainer();
			const userSettings = await container.usecases.getUserSettings({
				userId: session.user.id,
			});

			if (!userSettings.enableAiSummary) {
				return {
					success: false,
					summary: "",
					error: "AI summaries disabled",
				};
			}

			if (!container.usecases.generateSummary) {
				return {
					success: false,
					summary: "",
					error: "AI summary not configured",
				};
			}

			const cacheKey = getCacheKey(data.query, data.results);
			const cached = getCachedSummary(cacheKey);
			if (cached) {
				return { success: true, summary: cached };
			}

			const result = await container.usecases.generateSummary({
				query: data.query,
				results: data.results.slice(0, 7).map((r) => ({
					type: ResultType.WEB,
					title: r.title,
					url: r.url,
					content: r.content,
					publishedDate: undefined,
				})),
			});

			setCachedSummary(cacheKey, result.summary);

			return { success: true, summary: result.summary };
		} catch (error) {
			console.error("AI Summary error:", error);
			return {
				success: false,
				summary: "",
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	});
