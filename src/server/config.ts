import { env } from "./env";

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
} as const;
