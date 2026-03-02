import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	defaultLanguageCode,
	languageCodeTuple,
	normalizeLanguageCode,
} from "@/client/languages";

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
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	safeSearch: z.string().optional(),
	language: z.enum(languageCodeTuple).optional(),
});

interface FinalizeSetupInput {
	name?: unknown;
	email?: unknown;
	password?: unknown;
	safeSearch?: unknown;
	language?: unknown;
}

const normalizeFinalizeSetupInput = (data: unknown): FinalizeSetupInput => {
	if (!data || typeof data !== "object") {
		return {};
	}

	return data as FinalizeSetupInput;
};

const getSetupLocale = (input: FinalizeSetupInput) => {
	const language =
		typeof input.language === "string"
			? normalizeLanguageCode(input.language)
			: defaultLanguageCode;

	return language === "fr" ? z.locales.fr() : z.locales.en();
};

export const finalizeSetup = createServerFn({ method: "POST" })
	.inputValidator(normalizeFinalizeSetupInput)
	.handler(async ({ data }) => {
		const { db } = await import(
			"@/server/infrastructure/persistence/drizzle/connection"
		);
		const { user } = await import(
			"@/server/infrastructure/persistence/drizzle/schema"
		);
		const { auth } = await import("@/server/infrastructure/auth");

		try {
			const locale = getSetupLocale(data);
			z.config(locale);

			const validation = finalizeSetupSchema.safeParse(data);
			if (!validation.success) {
				throw validation.error;
			}

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
					name: validation.data.name,
					email: validation.data.email,
					password: validation.data.password,
					role: "admin",
				},
			});

			await auth.api.signInEmail({
				body: {
					email: validation.data.email,
					password: validation.data.password,
				},
			});
		} catch (error) {
			console.error("Setup config error:", error);
			throw error;
		}
	});
