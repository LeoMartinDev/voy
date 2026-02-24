import type { Cache, SearchEngine } from "@/server/domain/ports";
import type {
	SuggestInput,
	SuggestResult,
} from "@/server/domain/value-objects";

export type SuggestUsecase = (input: SuggestInput) => Promise<SuggestResult>;

export const makeSuggestUsecase =
	({
		searchEngine,
		cache,
	}: {
		searchEngine: SearchEngine;
		cache: Cache<SuggestResult>;
	}): SuggestUsecase =>
	async ({ query, limit = 6 }: SuggestInput) => {
		const cacheKey = JSON.stringify({ query, limit });
		const cached = await cache.get(cacheKey);

		if (cached) {
			return cached;
		}

		const result = await searchEngine.suggest({
			query,
			limit: Math.max(1, Math.min(10, limit)),
		});

		await cache.set(cacheKey, result);

		return result;
	};
