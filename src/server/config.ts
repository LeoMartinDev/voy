import { env } from "./env";

const runtimeEnvironment =
	process.env.BUN_ENV ?? process.env.NODE_ENV ?? "development";
const isDevelopment = runtimeEnvironment !== "production";

const redactPathsFromEnv = env.LOG_REDACT_PATHS?.split(",")
	.map((value) => value.trim())
	.filter(Boolean);

export const config = {
	searxng: {
		url: env.SEARXNG_URL,
	},
	auth: {
		secret: env.BETTER_AUTH_SECRET,
	},
	instance: {
		name: env.INSTANCE_NAME ?? "Voy",
		url: env.SITE_URL ?? "http://localhost:3000",
	},
	oidc: {
		enabled: Boolean(
			env.OIDC_CLIENT_ID && env.OIDC_CLIENT_SECRET && env.OIDC_ISSUER_URL,
		),
		clientId: env.OIDC_CLIENT_ID,
		clientSecret: env.OIDC_CLIENT_SECRET,
		issuerUrl: env.OIDC_ISSUER_URL,
		displayName: env.OIDC_DISPLAY_NAME ?? "SSO",
		adminClaim: env.OIDC_ADMIN_CLAIM,
		adminValue: env.OIDC_ADMIN_VALUE,
	},
	logging: {
		level: env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
		pretty: env.LOG_PRETTY ? env.LOG_PRETTY === "true" : isDevelopment,
		redactPaths: redactPathsFromEnv ?? [],
		environment: runtimeEnvironment,
		serviceName: "voy",
	},
} as const;
