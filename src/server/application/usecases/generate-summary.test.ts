import { describe, expect, it, vi } from "vitest";
import type { AISummaryProvider } from "@/server/domain/ports";
import type { WebResultEntry } from "@/server/domain/value-objects";
import { ResultType } from "@/server/domain/value-objects";
import { makeGenerateSummaryUsecase } from "./generate-summary";

describe("GenerateSummary Usecase", () => {
	it("calls AI provider with correct input", async () => {
		const aiSummaryProvider: AISummaryProvider = {
			generateSummary: vi.fn(async () => ({ summary: "Test summary" })),
		};

		const usecase = makeGenerateSummaryUsecase({ aiSummaryProvider });

		const results: WebResultEntry[] = [
			{
				type: ResultType.WEB,
				title: "Test",
				url: "http://test.com",
				content: "Content",
				publishedDate: undefined,
			},
		];
		const args = { query: "test", results };

		await usecase(args);

		expect(aiSummaryProvider.generateSummary).toHaveBeenCalledWith(args);
	});

	it("returns summary from provider", async () => {
		const expectedSummary = "Generated summary";
		const aiSummaryProvider: AISummaryProvider = {
			generateSummary: vi.fn(async () => ({ summary: expectedSummary })),
		};

		const usecase = makeGenerateSummaryUsecase({ aiSummaryProvider });

		const results: WebResultEntry[] = [
			{
				type: ResultType.WEB,
				title: "Test",
				url: "http://test.com",
				content: "Content",
				publishedDate: undefined,
			},
		];
		const result = await usecase({ query: "test", results });

		expect(result.summary).toBe(expectedSummary);
	});
});
