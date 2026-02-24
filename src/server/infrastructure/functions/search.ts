import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getContainer } from "@/server/container";
import {
	SearchCategory,
	type SearchCategory as SearchCategoryType,
	TimeRange,
	type TimeRange as TimeRangeType,
} from "@/server/domain/value-objects";
import { auth } from "@/server/infrastructure/auth";

const searchInputSchema = z.object({
	query: z.string().min(1),
	category: z
		.enum(Object.values(SearchCategory) as [string, ...string[]])
		.optional()
		.transform((val) => val as SearchCategoryType | undefined),
	timeRange: z
		.enum(Object.values(TimeRange) as [string, ...string[]])
		.optional()
		.transform((val) => val as TimeRangeType | undefined),
});

export const searchFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => searchInputSchema.parse(data))
	.handler(async ({ data }) => {
		try {
			const request = getRequest();
			const headers = request.headers;
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				throw new Error("Unauthorized");
			}

			const container = await getContainer();
			const result = await container.usecases.search({
				query: data.query,
				category: data.category,
				timeRange: data.timeRange,
			});
			return result;
		} catch (error) {
			console.error("Search failed:", error);
			throw error;
		}
	});
