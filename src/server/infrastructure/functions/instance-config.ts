import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { instanceConfigSchema } from "@/server/domain/value-objects";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

export type { InstanceConfig } from "@/server/domain/value-objects";
export { instanceConfigSchema } from "@/server/domain/value-objects";

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "instance-config-server-fn",
	},
});

export const getInstanceConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<InstanceConfig> => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.instance_config.get",
		});
		const { getContainer } = await import("@/server/container");
		const container = await getContainer();
		const instanceConfig = await container.usecases.getInstanceConfig();
		requestContext.logger.info(
			{
				event: "serverfn.instance_config.get.completed",
			},
			"Fetched instance configuration",
		);
		return instanceConfig;
	},
);

export const saveInstanceConfig = createServerFn({ method: "POST" })
	.inputValidator(
		(data: unknown) => instanceConfigSchema.parse(data) as InstanceConfig,
	)
	.handler(async ({ data }) => {
		const [{ auth }, { getContainer }] = await Promise.all([
			import("@/server/infrastructure/auth"),
			import("@/server/container"),
		]);
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.instance_config.save",
		});
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session || session.user.role !== "admin") {
			requestContext.logger.warn(
				{
					event: "serverfn.instance_config.save.unauthorized",
				},
				"Unauthorized instance config save request",
			);
			throw new Error("Unauthorized: Admin access required");
		}

		const container = await getContainer();
		await container.usecases.saveInstanceConfig({ config: data });
		requestContext.logger.info(
			{
				event: "serverfn.instance_config.save.completed",
				userId: session.user.id,
			},
			"Saved instance configuration",
		);

		return { success: true };
	});
