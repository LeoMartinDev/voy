import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getContainer } from "@/server/container";
import { auth } from "@/server/infrastructure/auth";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

const createApiKeySchema = z.object({
	name: z.string().min(1, "Name is required"),
});

const deleteApiKeySchema = z.object({
	id: z.string().uuid("Invalid ID"),
});

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "api-keys-server-fn",
	},
});

export const listApiKeys = createServerFn({ method: "GET" }).handler(
	async () => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.api_keys.list",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			requestContext.logger.warn(
				{
					event: "serverfn.api_keys.list.unauthorized",
				},
				"Unauthorized API key list request",
			);
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		const apiKeys = await container.usecases.listApiKeys({
			actorId: session.user.id,
		});
		requestContext.logger.info(
			{
				event: "serverfn.api_keys.list.completed",
				userId: session.user.id,
				count: apiKeys.length,
			},
			"Listed API keys",
		);
		return apiKeys;
	},
);

export const createApiKey = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => createApiKeySchema.parse(data))
	.handler(async ({ data }) => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.api_keys.create",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			requestContext.logger.warn(
				{
					event: "serverfn.api_keys.create.unauthorized",
				},
				"Unauthorized API key creation request",
			);
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		const apiKey = await container.usecases.createApiKey({
			actorId: session.user.id,
			name: data.name,
		});
		requestContext.logger.info(
			{
				event: "serverfn.api_keys.create.completed",
				userId: session.user.id,
				apiKeyId: apiKey.id,
			},
			"Created API key",
		);
		return apiKey;
	});

export const deleteApiKey = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => deleteApiKeySchema.parse(data))
	.handler(async ({ data }) => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.api_keys.delete",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			requestContext.logger.warn(
				{
					event: "serverfn.api_keys.delete.unauthorized",
				},
				"Unauthorized API key deletion request",
			);
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		await container.usecases.deleteApiKey({
			id: data.id,
			actorId: session.user.id,
		});
		requestContext.logger.info(
			{
				event: "serverfn.api_keys.delete.completed",
				userId: session.user.id,
				apiKeyId: data.id,
			},
			"Deleted API key",
		);
		return { success: true };
	});

export const apiKeysQueryOptions = queryOptions({
	queryKey: ["apiKeys"],
	queryFn: () => listApiKeys(),
});
