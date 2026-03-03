import { createServerFn } from "@tanstack/react-start";

export type PublicConfig = {
	instanceName: string;
};

export const getPublicConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicConfig> => {
		const { config } = await import("@/server/config");
		return { instanceName: config.instance.name };
	},
);
