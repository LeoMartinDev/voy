import { describe, expect, it, vi } from "vitest";
import type { Cache, SearchEngine } from "@/server/domain/ports";
import type { SuggestResult } from "@/server/domain/value-objects";
import { makeSuggestUsecase } from "./suggest";

describe("Suggest Usecase", () => {
	const mockCache: Cache<SuggestResult> = {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		clear: vi.fn(),
	};

	it("calls search engine suggest method", async () => {
		const searchEngine: SearchEngine = {
			search: vi.fn(),
			suggest: vi.fn(async () => ({ suggestions: ["a", "b"] })),
		};

		const usecase = makeSuggestUsecase({ searchEngine, cache: mockCache });
		const args = { query: "test" };

		await usecase(args);

		expect(searchEngine.suggest).toHaveBeenCalledWith({ ...args, limit: 6 });
	});

	it("returns suggestions from search engine", async () => {
		const expectedResult = { suggestions: ["test", "testing"] };
		const searchEngine: SearchEngine = {
			search: vi.fn(),
			suggest: vi.fn(async () => expectedResult),
		};

		const usecase = makeSuggestUsecase({ searchEngine, cache: mockCache });
		const result = await usecase({ query: "test" });

		expect(result).toEqual(expectedResult);
	});
});
