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
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

export type { UserSettings } from "@/server/domain/value-objects";
export { userSettingsSchema } from "@/server/domain/value-objects";

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "user-settings-server-fn",
	},
});

export const getUserSettings = createServerFn({ method: "GET" }).handler(
	async (): Promise<UserSettings> => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.user_settings.get",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			requestContext.logger.info(
				{
					event: "serverfn.user_settings.get.anonymous",
				},
				"Returned default user settings for anonymous request",
			);
			return defaultUserSettings;
		}

		const container = await getContainer();
		const settings = await container.usecases.getUserSettings({
			userId: session.user.id,
		});
		requestContext.logger.info(
			{
				event: "serverfn.user_settings.get.completed",
				userId: session.user.id,
			},
			"Fetched user settings",
		);
		return settings;
	},
);

export const saveUserSettings = createServerFn({ method: "POST" })
	.inputValidator(
		(data: unknown) => userSettingsSchema.parse(data) as UserSettings,
	)
	.handler(async ({ data }) => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.user_settings.save",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session) {
			requestContext.logger.warn(
				{
					event: "serverfn.user_settings.save.unauthorized",
				},
				"Unauthorized user settings save request",
			);
			throw new Error("Unauthorized: Authentication required");
		}

		const container = await getContainer();
		await container.usecases.saveUserSettings({
			userId: session.user.id,
			settings: data,
		});
		requestContext.logger.info(
			{
				event: "serverfn.user_settings.save.completed",
				userId: session.user.id,
			},
			"Saved user settings",
		);

		return { success: true };
	});

export const userSettingsQueryOptions = queryOptions({
	queryKey: ["userSettings"],
	queryFn: () => getUserSettings(),
	staleTime: 5 * 60 * 1000,
});
