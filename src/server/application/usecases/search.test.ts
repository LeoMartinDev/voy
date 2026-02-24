import { describe, expect, it, vi } from "vitest";
import type { Cache, SearchEngine } from "@/server/domain/ports";
import type { SearchResult } from "@/server/domain/value-objects";
import { ResultType } from "@/server/domain/value-objects";
import { makeSearchUsecase } from "./search";

describe("Search Usecase", () => {
	const mockCache: Cache<SearchResult> = {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		clear: vi.fn(),
	};

	it("calls search engine with query", async () => {
		const searchEngine: SearchEngine = {
			search: vi.fn(async () => ({
				results: [],
				count: 0,
				duration: 0,
			})),
			suggest: vi.fn(async () => ({ suggestions: [] })),
		};

		const usecase = makeSearchUsecase({ searchEngine, cache: mockCache });
		const args = { query: "test query" };

		await usecase(args);

		expect(searchEngine.search).toHaveBeenCalledWith(args);
	});

	it("calls search engine with timeRange", async () => {
		const searchEngine: SearchEngine = {
			search: vi.fn(async () => ({
				results: [],
				count: 0,
				duration: 0,
			})),
			suggest: vi.fn(async () => ({ suggestions: [] })),
		};

		const usecase = makeSearchUsecase({ searchEngine, cache: mockCache });
		const args = { query: "test query", timeRange: "day" as const };

		await usecase(args);

		expect(searchEngine.search).toHaveBeenCalledWith(args);
	});

	it("calls search engine with timeRange ALL", async () => {
		const searchEngine: SearchEngine = {
			search: vi.fn(async () => ({
				results: [],
				count: 0,
				duration: 0,
			})),
			suggest: vi.fn(async () => ({ suggestions: [] })),
		};

		const usecase = makeSearchUsecase({ searchEngine, cache: mockCache });
		const args = { query: "test query", timeRange: "all" as const };

		await usecase(args);

		expect(searchEngine.search).toHaveBeenCalledWith(args);
	});

	it("returns results from search engine", async () => {
		const expectedResult: SearchResult = {
			results: [
				{
					type: ResultType.WEB,
					title: "Test Result",
					url: "https://example.com",
					content: "Test content",
					publishedDate: undefined,
				},
			],
			count: 1,
			duration: 123,
		};

		const searchEngine: SearchEngine = {
			search: vi.fn(async () => expectedResult),
			suggest: vi.fn(async () => ({ suggestions: [] })),
		};

		const usecase = makeSearchUsecase({ searchEngine, cache: mockCache });
		const result = await usecase({ query: "test" });

		expect(result).toEqual({
			...expectedResult,
			duration: expect.any(Number),
		});
	});

	it("updates duration when returning from cache", async () => {
		const cachedResult: SearchResult = {
			results: [],
			count: 0,
			duration: 9999, // Old duration
		};

		const mockCacheWithHit: Cache<SearchResult> = {
			...mockCache,
			get: vi.fn(async () => cachedResult),
		};

		const searchEngine: SearchEngine = {
			search: vi.fn(),
			suggest: vi.fn(),
		};

		const usecase = makeSearchUsecase({
			searchEngine,
			cache: mockCacheWithHit,
		});
		const result = await usecase({ query: "test" });

		expect(result.duration).not.toBe(9999);
		expect(result.duration).toBeLessThan(100); // Should be very fast
	});
});
