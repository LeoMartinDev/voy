import { createServerFn } from "@tanstack/react-start";

export type PublicConfig = {
	instanceName: string;
	oidc: { displayName: string } | null;
};

export const getPublicConfig = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicConfig> => {
		const { config } = await import("@/server/config");
		return {
			instanceName: config.instance.name,
			oidc: config.oidc.enabled
				? { displayName: config.oidc.displayName }
				: null,
		};
	},
);
