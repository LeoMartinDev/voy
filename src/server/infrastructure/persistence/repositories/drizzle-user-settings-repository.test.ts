import { Database } from "bun:sqlite";
import { resolve } from "node:path";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../drizzle/schema";
import { makeDrizzleUserSettingsRepository } from "./drizzle-user-settings-repository";

describe("DrizzleUserSettingsRepository", () => {
	let sqlite: Database;
	let db: BunSQLiteDatabase<typeof schema>;
	let repository: ReturnType<typeof makeDrizzleUserSettingsRepository>;

	beforeEach(async () => {
		sqlite = new Database(":memory:");
		db = drizzle(sqlite, { schema });

		// Run migrations
		// The path is relative to this file
		const migrationsFolder = resolve(__dirname, "../drizzle/migrations");
		migrate(db, { migrationsFolder });

		repository = makeDrizzleUserSettingsRepository({ db });
	});

	afterEach(() => {
		sqlite.close();
	});

	it("should save and retrieve user settings", async () => {
		const userId = "user-123";
		const settings = {
			safeSearch: "strict" as const,
			openInNewTab: true,
			theme: "dark" as const,
			enableAiSummary: true,
			language: "en" as const,
		};

		// First save (insert)
		await repository.save({ userId, settings });

		const retrieved = await repository.findByUserId({ userId });
		expect(retrieved).toEqual(settings);

		// Update settings
		const newSettings = {
			...settings,
			theme: "light" as const,
		};

		// Second save (update)
		await repository.save({ userId, settings: newSettings });

		const updated = await repository.findByUserId({ userId });
		expect(updated).toEqual(newSettings);
	});

	it("should return null when settings not found", async () => {
		const result = await repository.findByUserId({ userId: "non-existent" });
		expect(result).toBeNull();
	});

	it("should handle partial updates correctly (logic check)", async () => {
		// The repository implementation replaces all fields on update based on the input object
		// So we just need to ensure that if we pass a full object, it updates correctly.
		// The repository interface demands a full UserSettings object for save.

		const userId = "user-456";
		const initialSettings = {
			safeSearch: "moderate" as const,
			openInNewTab: false,
			theme: "system" as const,
			enableAiSummary: false,
			language: "en" as const,
		};

		await repository.save({ userId, settings: initialSettings });

		const nextSettings = {
			safeSearch: "off" as const,
			openInNewTab: true,
			theme: "dark" as const,
			enableAiSummary: true,
			language: "fr" as const,
		};

		await repository.save({ userId, settings: nextSettings });

		const result = await repository.findByUserId({ userId });
		expect(result).toEqual(nextSettings);
	});
});
