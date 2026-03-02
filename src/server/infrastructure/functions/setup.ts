import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	defaultLanguageCode,
	languageCodeTuple,
	normalizeLanguageCode,
} from "@/client/languages";
import { getContainer } from "@/server/container";
import { defaultUserSettings, SafeSearch } from "@/server/domain/value-objects";
import {
	getServerLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";
import { createRequestContext } from "@/server/infrastructure/logging/request-context";

const logger = withLogContext({
	logger: getServerLogger(),
	bindings: {
		component: "setup-server-fn",
	},
});

export const getSetupStatus = createServerFn({ method: "GET" }).handler(
	async () => {
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.setup.status",
		});
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
			requestContext.logger.info(
				{
					event: "serverfn.setup.status.required",
				},
				"Setup is required",
			);
			return { setupRequired: true };
		}

		requestContext.logger.info(
			{
				event: "serverfn.setup.status.completed",
			},
			"Setup already completed",
		);
		return { setupRequired: false };
	},
);

const finalizeSetupSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	safeSearch: z
		.enum([SafeSearch.OFF, SafeSearch.MODERATE, SafeSearch.STRICT])
		.optional(),
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

const getCreatedUserId = (createdUser: unknown): string | null => {
	if (!createdUser || typeof createdUser !== "object") {
		return null;
	}

	const data = createdUser as {
		user?: { id?: unknown };
		id?: unknown;
	};

	if (typeof data.user?.id === "string" && data.user.id.length > 0) {
		return data.user.id;
	}

	if (typeof data.id === "string" && data.id.length > 0) {
		return data.id;
	}

	return null;
};

export const finalizeSetup = createServerFn({ method: "POST" })
	.inputValidator(normalizeFinalizeSetupInput)
	.handler(async ({ data }) => {
		const startedAt = performance.now();
		const requestContext = createRequestContext({
			request: getRequest(),
			logger,
			operation: "serverfn.setup.finalize",
		});
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
				requestContext.logger.warn(
					{
						event: "serverfn.setup.finalize.already_completed",
					},
					"Setup already completed, blocking request",
				);
				throw new Error("Setup already completed");
			}

			const createdUser = await auth.api.createUser({
				body: {
					name: validation.data.name,
					email: validation.data.email,
					password: validation.data.password,
					role: "admin",
				},
			});

			let userId = getCreatedUserId(createdUser);
			if (!userId) {
				const createdAdmin = await db
					.select({ id: user.id })
					.from(user)
					.where(eq(user.email, validation.data.email))
					.limit(1);

				userId = createdAdmin[0]?.id ?? null;
			}

			if (!userId) {
				throw new Error("Unable to resolve created admin user ID");
			}

			const container = await getContainer();
			await container.usecases.saveUserSettings({
				userId,
				settings: {
					...defaultUserSettings,
					safeSearch:
						validation.data.safeSearch ?? defaultUserSettings.safeSearch,
					language: validation.data.language ?? defaultLanguageCode,
				},
			});

			await auth.api.signInEmail({
				body: {
					email: validation.data.email,
					password: validation.data.password,
				},
			});
			requestContext.logger.info(
				{
					event: "serverfn.setup.finalize.completed",
					userId,
					durationMs: Math.round(performance.now() - startedAt),
				},
				"Setup finalized successfully",
			);
		} catch (error) {
			requestContext.logger.error(
				{
					event: "serverfn.setup.finalize.failed",
					durationMs: Math.round(performance.now() - startedAt),
					err: error,
				},
				"Setup finalization failed",
			);
			throw error;
		}
	});
