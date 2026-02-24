import { describe, expect, it } from "vitest";
import type { UserSettings } from "@/server/domain/value-objects";
import { defaultUserSettings } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeDrizzleUserSettingsRepository } from "@/server/infrastructure/persistence/repositories/drizzle-user-settings-repository";
import { createTestDb } from "@/server/test-utils";
import { makeUserSettingsService } from "../services/user-settings-service";
import { makeSaveUserSettingsUsecase } from "./save-user-settings";

describe("SaveUserSettings Usecase", () => {
	it("saves settings to DB and invalidates cache", async () => {
		const db = createTestDb();
		const repository = makeDrizzleUserSettingsRepository({ db });
		const cache = makeInMemoryCache<UserSettings>();
		const service = makeUserSettingsService({ repository, cache });
		const usecase = makeSaveUserSettingsUsecase({ service });

		const newSettings: UserSettings = {
			...defaultUserSettings,
			theme: "dark",
			safeSearch: "strict",
		};

		// Pre-populate cache to verify invalidation
		await cache.set("user-settings:user-1", defaultUserSettings);

		await usecase({ userId: "user-1", settings: newSettings });

		// Verify DB
		const saved = await repository.findByUserId({ userId: "user-1" });
		expect(saved).toEqual(newSettings);

		// Verify Cache is invalidated (or updated, depending on implementation)
		// The service implementation of save usually just invalidates or updates.
		// Let's check the service implementation.
		// makeUserSettingsService -> save -> cache.del ? or cache.set ?
		// Let's assume it invalidates for now, or check the code.
		// But checking if it's null is a safe bet if invalidation is used.
		const cached = await cache.get("user-settings:user-1");
		// If the service updates the cache, it would be newSettings.
		// If it invalidates, it would be null.
		// Re-reading the service implementation (from previous Read call):
		// 107->		it("invalidates cache after save", async () => {
		// So it invalidates.
		expect(cached).toBeNull();
	});

	it("updates existing settings", async () => {
		const db = createTestDb();
		const repository = makeDrizzleUserSettingsRepository({ db });
		const cache = makeInMemoryCache<UserSettings>();
		const service = makeUserSettingsService({ repository, cache });
		const usecase = makeSaveUserSettingsUsecase({ service });

		const initialSettings: UserSettings = {
			...defaultUserSettings,
			theme: "light",
		};
		await repository.save({ userId: "user-1", settings: initialSettings });

		const updatedSettings: UserSettings = {
			...defaultUserSettings,
			theme: "dark",
		};
		await usecase({ userId: "user-1", settings: updatedSettings });

		const saved = await repository.findByUserId({ userId: "user-1" });
		expect(saved).toEqual(updatedSettings);
	});
});
