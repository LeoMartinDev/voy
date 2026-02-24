import type { Cache, SearchEngine } from "@/server/domain/ports";
import type { SearchInput, SearchResult } from "@/server/domain/value-objects";

export type SearchUsecase = (input: SearchInput) => Promise<SearchResult>;

export const makeSearchUsecase =
	({
		searchEngine,
		cache,
	}: {
		searchEngine: SearchEngine;
		cache: Cache<SearchResult>;
	}): SearchUsecase =>
	async ({ query, category, timeRange, locale, safeSearch }: SearchInput) => {
		const startTime = performance.now();

		const cacheKey = JSON.stringify({
			query,
			category,
			timeRange,
			locale,
			safeSearch,
		});

		const cached = await cache.get(cacheKey);

		if (cached) {
			return {
				...cached,
				duration: Math.round(performance.now() - startTime),
				cached: true,
			};
		}

		const result = await searchEngine.search({
			query,
			category,
			timeRange,
			locale,
			safeSearch,
		});

		const searchResult = {
			...result,
			duration: Math.round(performance.now() - startTime),
		};

		await cache.set(cacheKey, searchResult);

		return searchResult;
	};
