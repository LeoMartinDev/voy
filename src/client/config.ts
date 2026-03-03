import type { ClientLogLevel } from "./logging/client-logger";

const runtimeEnvironment =
	import.meta.env.MODE === "production" ? "production" : "development";

const isProduction = runtimeEnvironment === "production";

const logLevel: ClientLogLevel = isProduction ? "warn" : "debug";

export const clientConfig = {
	runtimeEnvironment,
	isProduction,
	logging: {
		level: logLevel,
	},
} as const;
