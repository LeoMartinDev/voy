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

const ParsedUrlSchema = z.array(z.string().nullable()).nullable().optional();

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
	content: z.string().nullable().optional(),
	engine: z.string(),
	engines: z.array(z.string()),
	positions: z.array(z.number()),
	score: z.number(),
	category: z.string(),
	template: z.string(),
	parsed_url: ParsedUrlSchema,
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

export const makeSearXngSearchEngine = (): SearchEngine => {
	return {
		search: async ({ query, category, safeSearch, timeRange }) => {
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

			const response = await fetch(
				`${config.searxng.url}/search?${params.toString()}`,
			);
			if (!response.ok) {
				console.error(
					"SearXNG search error",
					response.status,
					response.statusText,
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

			return result;
		},

		suggest: async ({ query, limit = 6 }): Promise<SuggestResult> => {
			try {
				const params = new URLSearchParams({
					q: query,
					format: "json",
					limit: limit.toString(),
				});

				const response = await fetch(
					`${config.searxng.url}/autocompleter?${params.toString()}`,
				);

				if (!response.ok) {
					console.error(
						"SearXNG suggest error",
						response.status,
						response.statusText,
					);
					return { suggestions: [] };
				}

				const data = await response.json();
				const parsed = SearXNGSuggestionsSchema.safeParse(data);

				if (!parsed.success) {
					console.error("SearXNG suggest parse error", parsed.error);
					return { suggestions: [] };
				}

				const suggestions = parsed.data[1]?.slice(0, limit) ?? [];

				return {
					suggestions,
				};
			} catch (error) {
				console.error("SearXNG suggest error", error);
				return { suggestions: [] };
			}
		},
	};
};

if (import.meta.main) {
	const engine = makeSearXngSearchEngine();

	const results = await engine.suggest({ query: "What is the capi" });

	console.log(results);
}
