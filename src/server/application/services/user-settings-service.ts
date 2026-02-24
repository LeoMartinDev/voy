import type { Cache, UserSettingsRepository } from "@/server/domain/ports";
import type { UserSettings } from "@/server/domain/value-objects";
import { defaultUserSettings } from "@/server/domain/value-objects";

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export interface UserSettingsService {
	get(args: { userId: string }): Promise<UserSettings>;
	save(args: { userId: string; settings: UserSettings }): Promise<void>;
}

export function makeUserSettingsService({
	repository,
	cache,
}: {
	repository: UserSettingsRepository;
	cache: Cache<UserSettings>;
}): UserSettingsService {
	return {
		async get({ userId }: { userId: string }): Promise<UserSettings> {
			const cacheKey = `user-settings:${userId}`;

			const cached = await cache.get(cacheKey);
			if (cached) {
				return cached;
			}

			const settings = await repository.findByUserId({ userId });
			const result = settings ?? defaultUserSettings;

			await cache.set(cacheKey, result, DEFAULT_TTL_MS);

			return result;
		},

		async save({
			userId,
			settings,
		}: {
			userId: string;
			settings: UserSettings;
		}): Promise<void> {
			const cacheKey = `user-settings:${userId}`;

			await repository.save({ userId, settings });
			await cache.delete(cacheKey);
		},
	};
}
