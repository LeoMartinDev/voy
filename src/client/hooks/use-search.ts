import {
	infiniteQueryOptions,
	useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import type {
	SearchCategory as SearchCategoryType,
	TimeRange as TimeRangeType,
} from "@/server/domain/value-objects";
import { searchFn } from "@/server/infrastructure/functions/search";

interface UseSearchOptions {
	query: string | undefined;
	category?: SearchCategoryType;
	timeRange?: TimeRangeType;
}

export const infiniteSearchQueryOptions = ({
	query,
	category,
	timeRange,
}: UseSearchOptions) =>
	infiniteQueryOptions({
		queryKey: ["search", query, category, timeRange],
		queryFn: async ({ pageParam }) => {
			if (!query) throw new Error("Query is required");

			const result = await searchFn({
				data: {
					query,
					category,
					timeRange,
					page: pageParam,
				},
			});

			if (!result.success) {
				throw new Error(result.error);
			}

			return result.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.results.length === 0) return undefined;
			return allPages.length + 1;
		},
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	});

export function useInfiniteSearch(options: UseSearchOptions) {
	return useSuspenseInfiniteQuery(infiniteSearchQueryOptions(options));
}
