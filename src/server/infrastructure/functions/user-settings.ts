import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getContainer } from "@/server/container";
import type { UserSettings } from "@/server/domain/value-objects";
import {
	defaultUserSettings,
	userSettingsSchema,
} from "@/server/domain/value-objects";
import { auth } from "@/server/infrastructure/auth";

export type { UserSettings } from "@/server/domain/value-objects";
export { userSettingsSchema } from "@/server/domain/value-objects";

export const getUserSettings = createServerFn({ method: "GET" }).handler(
	async (): Promise<UserSettings> => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			return defaultUserSettings;
		}

		const container = await getContainer();
		return container.usecases.getUserSettings({ userId: session.user.id });
	},
);

export const saveUserSettings = createServerFn({ method: "POST" })
	.inputValidator(
		(data: unknown) => userSettingsSchema.parse(data) as UserSettings,
	)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			throw new Error("Unauthorized: Authentication required");
		}

		const container = await getContainer();
		await container.usecases.saveUserSettings({
			userId: session.user.id,
			settings: data,
		});

		return { success: true };
	});

export const userSettingsQueryOptions = queryOptions({
	queryKey: ["userSettings"],
	queryFn: () => getUserSettings(),
	staleTime: 5 * 60 * 1000,
});
