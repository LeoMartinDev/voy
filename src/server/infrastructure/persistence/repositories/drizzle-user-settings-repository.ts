import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { UserSettingsRepository } from "@/server/domain/ports";
import type { UserSettings } from "@/server/domain/value-objects";
import { defaultUserSettings } from "@/server/domain/value-objects";
import type * as schema from "@/server/infrastructure/persistence/drizzle/schema";
import { userSettings } from "@/server/infrastructure/persistence/drizzle/schema";

export function makeDrizzleUserSettingsRepository({
	db,
}: {
	db: BunSQLiteDatabase<typeof schema>;
}): UserSettingsRepository {
	return {
		async findByUserId({
			userId,
		}: {
			userId: string;
		}): Promise<UserSettings | null> {
			const result = await db
				.select()
				.from(userSettings)
				.where(eq(userSettings.userId, userId))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			return {
				safeSearch: result[0].safeSearch as UserSettings["safeSearch"],
				openInNewTab: result[0].openInNewTab,
				theme: result[0].theme as UserSettings["theme"],
				language: result[0].language as UserSettings["language"],
			};
		},

		async save({
			userId,
			settings,
		}: {
			userId: string;
			settings: UserSettings;
		}): Promise<void> {
			const now = new Date();

			const existing = await db
				.select()
				.from(userSettings)
				.where(eq(userSettings.userId, userId))
				.limit(1);

			if (existing.length > 0) {
				await db
					.update(userSettings)
					.set({
						safeSearch: settings.safeSearch,
						openInNewTab: settings.openInNewTab,
						theme: settings.theme,
						language: settings.language,
						updatedAt: now,
					})
					.where(eq(userSettings.userId, userId));
			} else {
				await db.insert(userSettings).values({
					userId,
					safeSearch: settings.safeSearch,
					openInNewTab: settings.openInNewTab,
					theme: settings.theme,
					language: settings.language,
					updatedAt: now,
				});
			}
		},
	};
}

export { defaultUserSettings };
