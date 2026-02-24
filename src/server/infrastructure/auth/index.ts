import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { config } from "@/server/config";
import { db } from "@/server/infrastructure/persistence/drizzle/connection";

export const auth = betterAuth({
	appName: config.instance.name,
	baseURL: config.instance.url,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
	},
	plugins: [
		tanstackStartCookies(),
		admin({
			defaultRole: "user",
			adminRoles: ["admin"],
		}),
	],
});

export { authClient } from "./client";
