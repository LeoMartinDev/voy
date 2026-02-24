"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type {
	SearchCategory as SearchCategoryType,
	TimeRange as TimeRangeType,
} from "@/server/domain/value-objects";
import { searchFn } from "@/server/infrastructure/functions/search";

interface UseSearchOptions {
	query: string | undefined;
	category?: SearchCategoryType;
	timeRange?: TimeRangeType;
	staleTime?: number;
}

export const searchQueryOptions = ({
	query,
	category,
	timeRange,
	staleTime = Infinity,
}: UseSearchOptions) =>
	queryOptions({
		queryKey: ["search", query, category, timeRange],
		queryFn: async () => {
			if (!query) throw new Error("Query is required");

			return searchFn({
				data: {
					query,
					category,
					timeRange,
				},
			});
		},
		staleTime,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	});

export function useSearch(options: UseSearchOptions) {
	return useSuspenseQuery(searchQueryOptions(options));
}
