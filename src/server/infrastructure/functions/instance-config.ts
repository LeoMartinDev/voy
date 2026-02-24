import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getContainer } from "@/server/container";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { instanceConfigSchema } from "@/server/domain/value-objects";
import { auth } from "@/server/infrastructure/auth";

export type { InstanceConfig } from "@/server/domain/value-objects";
export { instanceConfigSchema } from "@/server/domain/value-objects";

export type PublicConfig = {
	instanceName: string;
};

export const getPublicConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicConfig> => {
		const { config } = await import("@/server/config");
		return { instanceName: config.instance.name };
	},
);

export const getInstanceConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<InstanceConfig> => {
		const container = await getContainer();
		return container.usecases.getInstanceConfig();
	},
);

export const saveInstanceConfig = createServerFn({ method: "POST" })
	.inputValidator(
		(data: unknown) => instanceConfigSchema.parse(data) as InstanceConfig,
	)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});

		if (!session || session.user.role !== "admin") {
			throw new Error("Unauthorized: Admin access required");
		}

		const container = await getContainer();
		await container.usecases.saveInstanceConfig({ config: data });

		return { success: true };
	});
