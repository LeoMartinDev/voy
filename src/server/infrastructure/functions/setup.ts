import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getSetupStatus = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import(
			"@/server/infrastructure/persistence/drizzle/connection"
		);
		const { user } = await import(
			"@/server/infrastructure/persistence/drizzle/schema"
		);

		const adminUser = await db
			.select()
			.from(user)
			.where(eq(user.role, "admin"))
			.limit(1);

		if (adminUser.length === 0) {
			return { setupRequired: true };
		}

		return { setupRequired: false };
	},
);

const finalizeSetupSchema = z.object({
	name: z.string().min(1, "Le nom est requis"),
	email: z.email(),
	password: z.string().min(8),
	safeSearch: z.string().optional(),
});

export const finalizeSetup = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(finalizeSetupSchema))
	.handler(async ({ data }) => {
		const { db } = await import(
			"@/server/infrastructure/persistence/drizzle/connection"
		);
		const { user } = await import(
			"@/server/infrastructure/persistence/drizzle/schema"
		);
		const { auth } = await import("@/server/infrastructure/auth");

		try {
			const existingAdmin = await db
				.select()
				.from(user)
				.where(eq(user.role, "admin"))
				.limit(1);

			if (existingAdmin.length > 0) {
				console.warn("Setup already completed, blocking request");
				throw new Error("Setup already completed");
			}

			await auth.api.createUser({
				body: {
					name: data.name,
					email: data.email,
					password: data.password,
					role: "admin",
				},
			});

			await auth.api.signInEmail({
				body: {
					email: data.email,
					password: data.password,
				},
			});
		} catch (error) {
			console.error("Setup config error:", error);
			throw error;
		}
	});
