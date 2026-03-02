import * as z from "zod";

const envSchema = z.object({
	SEARXNG_URL: z.url(),
	DATABASE_URL: z.string().optional(),
	BETTER_AUTH_SECRET: z.string(),
	SITE_URL: z.url(),
	INSTANCE_NAME: z.string().min(3).optional(),
	LOG_LEVEL: z
		.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
		.optional(),
	LOG_PRETTY: z.enum(["true", "false"]).optional(),
	LOG_REDACT_PATHS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");

		throw new Error(`Environment validation failed:\n${issues}`);
	}

	return result.data;
}

export const env = parseEnv();
