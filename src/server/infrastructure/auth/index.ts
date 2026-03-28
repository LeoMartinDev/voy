import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, genericOAuth } from "better-auth/plugins";
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
		...(config.oidc.enabled
			? [
					genericOAuth({
						config: [
							{
								providerId: "oidc",
								clientId: config.oidc.clientId as string,
								clientSecret: config.oidc.clientSecret as string,
								discoveryUrl: `${config.oidc.issuerUrl}/.well-known/openid-configuration`,
								scopes: ["openid", "email", "profile"],
								overrideUserInfo: true,
								mapProfileToUser: (profile) => {
									if (!config.oidc.adminClaim || !config.oidc.adminValue)
										return {};
									const claim = profile[config.oidc.adminClaim];
									const isAdmin = Array.isArray(claim)
										? claim.includes(config.oidc.adminValue)
										: claim === config.oidc.adminValue;
									return { role: isAdmin ? "admin" : "user" };
								},
							},
						],
					}),
				]
			: []),
	],
});
