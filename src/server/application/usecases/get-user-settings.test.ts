import { describe, expect, it } from "vitest";
import type { UserSettings } from "@/server/domain/value-objects";
import { defaultUserSettings } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeDrizzleUserSettingsRepository } from "@/server/infrastructure/persistence/repositories/drizzle-user-settings-repository";
import { createTestDb } from "@/server/test-utils";
import { makeUserSettingsService } from "../services/user-settings-service";
import { makeGetUserSettingsUsecase } from "./get-user-settings";

describe("GetUserSettings Usecase", () => {
	it("returns default settings for new user", async () => {
		const db = createTestDb();
		const repository = makeDrizzleUserSettingsRepository({ db });
		const cache = makeInMemoryCache<UserSettings>();
		const service = makeUserSettingsService({ repository, cache });
		const usecase = makeGetUserSettingsUsecase({ service });

		const result = await usecase({ userId: "new-user" });

		expect(result).toEqual(defaultUserSettings);
	});

	it("returns saved settings from DB", async () => {
		const db = createTestDb();
		const repository = makeDrizzleUserSettingsRepository({ db });
		const cache = makeInMemoryCache<UserSettings>();
		const service = makeUserSettingsService({ repository, cache });
		const usecase = makeGetUserSettingsUsecase({ service });

		// Manually save settings using the repository (or service)
		const settings: UserSettings = {
			...defaultUserSettings,
			theme: "dark",
		};
		await repository.save({ userId: "existing-user", settings });

		const result = await usecase({ userId: "existing-user" });

		expect(result).toEqual(settings);
	});

	it("returns cached settings if available", async () => {
		const db = createTestDb();
		const repository = makeDrizzleUserSettingsRepository({ db });
		const cache = makeInMemoryCache<UserSettings>();
		const service = makeUserSettingsService({ repository, cache });
		const usecase = makeGetUserSettingsUsecase({ service });

		const settings: UserSettings = {
			...defaultUserSettings,
			safeSearch: "strict",
		};

		// Populate cache directly
		await cache.set("user-settings:cached-user", settings);

		const result = await usecase({ userId: "cached-user" });
		expect(result).toEqual(settings);

		// Verify DB was not called? We can't easily spy on the real DB repository without wrapping it.
		// But we rely on production code, so we trust the service uses the cache.
		// To verify it didn't hit the DB, we could ensure the DB is empty for this user.
		const dbResult = await repository.findByUserId({ userId: "cached-user" });
		expect(dbResult).toBeNull();
	});
});
