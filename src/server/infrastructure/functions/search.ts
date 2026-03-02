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
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

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

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "search-server-fn",
	},
});

export const searchFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => searchInputSchema.parse(data))
	.handler(async ({ data }) => {
		const startedAt = performance.now();
		const request = getRequest();
		const requestContext = createRequestContext({
			request,
			logger,
			operation: "serverfn.search",
		});

		try {
			const headers = request.headers;
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				requestContext.logger.warn(
					{
						event: "serverfn.search.unauthorized",
						durationMs: Math.round(performance.now() - startedAt),
					},
					"Search server function rejected unauthenticated request",
				);
				throw new Error("Unauthorized");
			}

			const container = await getContainer();
			const result = await container.usecases.search({
				query: data.query,
				category: data.category,
				timeRange: data.timeRange,
			});
			requestContext.logger.info(
				{
					event: "serverfn.search.completed",
					userId: session.user.id,
					resultCount: result.count,
					durationMs: Math.round(performance.now() - startedAt),
				},
				"Search server function completed",
			);
			return { success: true, data: result };
		} catch (error) {
			requestContext.logger.error(
				{
					event: "serverfn.search.failed",
					durationMs: Math.round(performance.now() - startedAt),
					err: error,
				},
				"Search server function failed",
			);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});
