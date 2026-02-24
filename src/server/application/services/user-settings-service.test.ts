import { describe, expect, it, vi } from "vitest";
import type { Cache, UserSettingsRepository } from "@/server/domain/ports";
import type { UserSettings } from "@/server/domain/value-objects";
import { defaultUserSettings } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeUserSettingsService } from "./user-settings-service";

describe("UserSettingsService", () => {
	const createTestContext = () => {
		const store = new Map<string, UserSettings>();

		const repository: UserSettingsRepository = {
			findByUserId: vi.fn(async ({ userId }) => {
				return store.get(userId) ?? null;
			}),
			save: vi.fn(async ({ userId, settings }) => {
				store.set(userId, settings);
			}),
		};

		const cache: Cache<UserSettings> = makeInMemoryCache<UserSettings>();

		const service = makeUserSettingsService({ repository, cache });

		return { repository, cache, service, store };
	};

	describe("get", () => {
		it("returns default settings when user has no saved settings", async () => {
			const { service, repository } = createTestContext();

			const result = await service.get({ userId: "user-1" });

			expect(result).toEqual(defaultUserSettings);
			expect(repository.findByUserId).toHaveBeenCalledWith({
				userId: "user-1",
			});
		});

		it("returns saved settings from repository", async () => {
			const { service, store } = createTestContext();
			const savedSettings: UserSettings = {
				safeSearch: "strict",
				openInNewTab: false,
				theme: "dark",
				enableAiSummary: true,
				language: "en",
			};
			store.set("user-1", savedSettings);

			const result = await service.get({ userId: "user-1" });

			expect(result).toEqual(savedSettings);
		});

		it("caches settings after fetching from repository", async () => {
			const { service, store, repository } = createTestContext();
			const savedSettings: UserSettings = {
				safeSearch: "moderate",
				openInNewTab: true,
				theme: "light",
				enableAiSummary: false,
				language: "fr",
			};
			store.set("user-1", savedSettings);

			await service.get({ userId: "user-1" });
			await service.get({ userId: "user-1" });

			expect(repository.findByUserId).toHaveBeenCalledTimes(1);
		});

		it("returns cached settings without hitting repository", async () => {
			const { service, cache, repository } = createTestContext();

			await cache.set("user-settings:user-1", {
				safeSearch: "strict",
				openInNewTab: false,
				theme: "dark",
				enableAiSummary: true,
				language: "en",
			});

			const result = await service.get({ userId: "user-1" });

			expect(repository.findByUserId).not.toHaveBeenCalled();
			expect(result.safeSearch).toBe("strict");
		});
	});

	describe("save", () => {
		it("persists settings to repository", async () => {
			const { service, repository, store } = createTestContext();
			const newSettings: UserSettings = {
				safeSearch: "strict",
				openInNewTab: false,
				theme: "dark",
				enableAiSummary: true,
				language: "en",
			};

			await service.save({ userId: "user-1", settings: newSettings });

			expect(repository.save).toHaveBeenCalledWith({
				userId: "user-1",
				settings: newSettings,
			});
			expect(store.get("user-1")).toEqual(newSettings);
		});

		it("invalidates cache after save", async () => {
			const { service, cache } = createTestContext();

			await cache.set("user-settings:user-1", {
				safeSearch: "off",
				openInNewTab: true,
				theme: "system",
				enableAiSummary: false,
				language: "en",
			});

			const newSettings: UserSettings = {
				safeSearch: "strict",
				openInNewTab: false,
				theme: "dark",
				enableAiSummary: true,
				language: "fr",
			};

			await service.save({ userId: "user-1", settings: newSettings });

			const cached = await cache.get("user-settings:user-1");
			expect(cached).toBeNull();
		});
	});
});
