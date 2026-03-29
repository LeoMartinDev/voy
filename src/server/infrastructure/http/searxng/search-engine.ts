import * as z from "zod";
import { config } from "@/server/config";
import type { SearchEngine } from "@/server/domain/ports";
import type {
	BaseSearchResult,
	FileResultEntry,
	ImageResultEntry,
	SuggestResult,
	WebResultEntry,
} from "@/server/domain/value-objects";
import {
	ResultType,
	SearchCategory,
	TimeRange,
} from "@/server/domain/value-objects";
import type { AppLogger } from "@/server/infrastructure/logging/logger";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { extractFileExtension } from "@/server/infrastructure/utils/file-extension";

const resolveImageUrl = (
	url: string | null | undefined,
): string | undefined => {
	if (!url) return undefined;
	const isAbsoluteUrl = url.startsWith("http://") || url.startsWith("https://");
	const isProtocolRelative = url.startsWith("//");
	if (isAbsoluteUrl) return url;
	if (isProtocolRelative) return `https:${url}`;
	const withLeadingSlash = url.startsWith("/") ? url : `/${url}`;
	return `${config.searxng.url}${withLeadingSlash}`;
};

const stringToDateSchema = z
	.string()
	.nullable()
	.optional()
	.transform((str) => {
		if (!str) return null;
		const date = new Date(str);
		return Number.isNaN(date.getTime()) ? null : date;
	});

export const SearXNGResultSchema = z.object({
	title: z.string(),
	url: z.string(),
	content: z.string().nullish(),
	engine: z.string(),
	engines: z.array(z.string()),
	positions: z.array(z.number()),
	score: z.number(),
	category: z.string(),
	template: z.string(),
	parsed_url: z.array(z.string().nullable()).nullish(),
	publishedDate: stringToDateSchema,
	pubdate: stringToDateSchema,
	thumbnail: z.string().nullable().optional(),
	img_src: z.string().nullable().optional(),
	iframe_src: z.string().nullable().optional(),
	priority: z.union([z.string(), z.number()]).nullable().optional(),
});

export const SearXNGResponseSchema = z.object({
	query: z.string(),
	number_of_results: z.number(),
	results: z.array(SearXNGResultSchema),
	corrections: z.array(z.string()),
	suggestions: z.array(z.string()),
});

const SearXNGSuggestionsSchema = z
	.tuple([z.string(), z.array(z.string())])
	.rest(z.unknown());

const toSearXngCategoriesSearchParams = ({
	category,
}: {
	category: SearchCategory | undefined;
}): string | undefined => {
	if (!category) {
		return undefined;
	}

	const map = {
		[SearchCategory.WEB]: undefined,
		[SearchCategory.IMAGES]: ["images"],
		[SearchCategory.FILES]: ["files"],
	};

	return map[category]?.join(",");
};

const toSearXngSafeSearchParam = (
	safeSearch: string | undefined,
): string | undefined => {
	if (!safeSearch) return undefined;
	const map: Record<string, string> = {
		off: "0",
		moderate: "1",
		strict: "2",
	};
	return map[safeSearch];
};

export const makeSearXngSearchEngine = ({
	logger,
}: {
	logger: AppLogger;
}): SearchEngine => {
	const searxngLogger = withLogContext({
		logger,
		bindings: {
			component: "searxng-adapter",
		},
	});

	return {
		search: async ({ query, category, safeSearch, timeRange, page }) => {
			const startedAt = performance.now();
			const params = new URLSearchParams({
				q: query,
				format: "json",
			});

			const categories = toSearXngCategoriesSearchParams({ category });

			if (categories) {
				params.set("categories", categories);
			}

			if (timeRange && timeRange !== TimeRange.ALL) {
				params.set("time_range", timeRange);
			}

			const safesearchParam = toSearXngSafeSearchParam(safeSearch);
			if (safesearchParam) {
				params.set("safesearch", safesearchParam);
			}

			if (page && page > 1) {
				params.set("pageno", String(page));
			}

			const endpoint = "/search";
			const response = await fetch(
				`${config.searxng.url}${endpoint}?${params.toString()}`,
			);
			if (!response.ok) {
				searxngLogger.error(
					{
						event: "searxng.search.failed",
						endpoint,
						status: response.status,
						statusText: response.statusText,
						durationMs: Math.round(performance.now() - startedAt),
					},
					"SearXNG search request failed",
				);
				throw new Error(`SearXNG error: ${response.statusText}`);
			}
			const data = await response.json();

			const searXngResponse = SearXNGResponseSchema.parse(data);

			const result: BaseSearchResult = {
				results: searXngResponse.results
					.filter((r) => {
						if (category === SearchCategory.IMAGES) {
							return (
								resolveImageUrl(r.img_src) != null ||
								resolveImageUrl(r.thumbnail) != null
							);
						}
						return true;
					})
					.map((r): WebResultEntry | ImageResultEntry | FileResultEntry => {
						if (category === SearchCategory.IMAGES) {
							return {
								type: ResultType.IMAGE,
								title: r.title,
								url: r.url,
								imageSrc: resolveImageUrl(r.img_src) ?? "",
								thumbnail: resolveImageUrl(r.thumbnail),
							};
						}

						if (category === SearchCategory.FILES) {
							return {
								type: ResultType.FILE,
								title: r.title,
								url: r.url,
								extension: extractFileExtension(r.url),
							};
						}

						return {
							type: ResultType.WEB,
							title: r.title,
							url: r.url,
							content: r.content ?? "",
							publishedDate: r.publishedDate ?? r.pubdate ?? undefined,
						};
					}),
				count: searXngResponse.results.length,
			};

			searxngLogger.info(
				{
					event: "searxng.search.completed",
					endpoint,
					status: response.status,
					resultCount: result.count,
					page: page ?? 1,
					durationMs: Math.round(performance.now() - startedAt),
				},
				"SearXNG search request completed",
			);

			return result;
		},

		suggest: async ({ query, limit = 6 }): Promise<SuggestResult> => {
			const startedAt = performance.now();
			try {
				const params = new URLSearchParams({
					q: query,
					format: "json",
					limit: limit.toString(),
				});

				const endpoint = "/autocompleter";
				const response = await fetch(
					`${config.searxng.url}${endpoint}?${params.toString()}`,
				);

				if (!response.ok) {
					searxngLogger.warn(
						{
							event: "searxng.suggest.failed",
							endpoint,
							status: response.status,
							statusText: response.statusText,
							durationMs: Math.round(performance.now() - startedAt),
						},
						"SearXNG suggest request failed",
					);
					return { suggestions: [] };
				}

				const data = await response.json();
				const parsed = SearXNGSuggestionsSchema.safeParse(data);

				if (!parsed.success) {
					searxngLogger.warn(
						{
							event: "searxng.suggest.parse_failed",
							endpoint,
							durationMs: Math.round(performance.now() - startedAt),
							errorName: parsed.error.name,
						},
						"SearXNG suggest response parsing failed",
					);
					return { suggestions: [] };
				}

				const suggestions = parsed.data[1]?.slice(0, limit) ?? [];
				searxngLogger.info(
					{
						event: "searxng.suggest.completed",
						endpoint,
						status: response.status,
						suggestionsCount: suggestions.length,
						durationMs: Math.round(performance.now() - startedAt),
					},
					"SearXNG suggest request completed",
				);

				return {
					suggestions,
				};
			} catch (error) {
				searxngLogger.error(
					{
						event: "searxng.suggest.exception",
						durationMs: Math.round(performance.now() - startedAt),
						err: error,
					},
					"SearXNG suggest request errored",
				);
				return { suggestions: [] };
			}
		},
	};
};

if (import.meta.main) {
	const engine = makeSearXngSearchEngine({
		logger: withLogContext({
			logger: getServerLogger(),
			bindings: {
				component: "searxng-cli",
			},
		}),
	});

	const results = await engine.suggest({ query: "What is the capi" });

	getServerLogger().info(
		{
			event: "searxng.cli.result",
			suggestionsCount: results.suggestions.length,
		},
		"SearXNG CLI suggest finished",
	);
}
