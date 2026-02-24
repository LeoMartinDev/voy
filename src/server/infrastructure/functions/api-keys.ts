import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getContainer } from "@/server/container";
import { auth } from "@/server/infrastructure/auth";

const createApiKeySchema = z.object({
	name: z.string().min(1, "Name is required"),
});

const deleteApiKeySchema = z.object({
	id: z.string().uuid("Invalid ID"),
});

export const listApiKeys = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		return container.usecases.listApiKeys({ actorId: session.user.id });
	},
);

export const createApiKey = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => createApiKeySchema.parse(data))
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		return container.usecases.createApiKey({
			actorId: session.user.id,
			name: data.name,
		});
	});

export const deleteApiKey = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => deleteApiKeySchema.parse(data))
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			throw new Error("Unauthorized");
		}

		const container = await getContainer();
		await container.usecases.deleteApiKey({
			id: data.id,
			actorId: session.user.id,
		});
		return { success: true };
	});

export const apiKeysQueryOptions = queryOptions({
	queryKey: ["apiKeys"],
	queryFn: () => listApiKeys(),
});
