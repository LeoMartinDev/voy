import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { SearchResult } from "@/server/domain/value-objects";
import { isWebResult } from "@/server/domain/value-objects";
import { generateSummaryFn } from "@/server/infrastructure/functions/ai-summary";

interface UseAISummaryOptions {
	query: string;
	results: SearchResult | undefined;
	enabled?: boolean;
}

interface UseAISummaryReturn {
	summary: string | undefined;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	refetch: () => void;
}

function shouldEnableSummary(
	query: string,
	results: SearchResult | undefined,
	enabled: boolean,
): boolean {
	if (!enabled || !query || !results) return false;

	const webResults = results.results.filter(isWebResult);
	return webResults.length > 0;
}

export function useAISummary({
	query,
	results,
	enabled = true,
}: UseAISummaryOptions): UseAISummaryReturn {
	const webResults = results?.results.filter(isWebResult) ?? [];

	const fetchSummary = useCallback(async () => {
		if (webResults.length === 0) {
			return "";
		}

		const input = {
			query,
			results: webResults.slice(0, 7).map((r) => ({
				title: r.title,
				url: r.url,
				content: r.content,
			})),
		};

		const response = await generateSummaryFn({ data: input });

		if (!response.success) {
			throw new Error(response.error || "Failed to generate summary");
		}

		return response.summary;
	}, [query, webResults]);

	const {
		data: summary,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["ai-summary", query, webResults.slice(0, 5).map((r) => r.url)],
		queryFn: fetchSummary,
		enabled: shouldEnableSummary(query, results, enabled),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 1,
	});

	return {
		summary,
		isLoading: shouldEnableSummary(query, results, enabled) ? isLoading : false,
		isError,
		error,
		refetch,
	};
}
