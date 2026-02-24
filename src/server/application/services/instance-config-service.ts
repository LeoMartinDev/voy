import type { Cache, InstanceConfigRepository } from "@/server/domain/ports";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { defaultInstanceConfig } from "@/server/domain/value-objects";

const CACHE_KEY = "instance-config";
const DEFAULT_TTL_MS = 30 * 60 * 1000;

export interface InstanceConfigService {
	get(): Promise<InstanceConfig>;
	save(args: { config: InstanceConfig }): Promise<void>;
}

export function makeInstanceConfigService({
	repository,
	cache,
}: {
	repository: InstanceConfigRepository;
	cache: Cache<InstanceConfig>;
}): InstanceConfigService {
	return {
		async get(): Promise<InstanceConfig> {
			const cached = await cache.get(CACHE_KEY);
			if (cached) {
				return cached;
			}

			const config = await repository.find();
			const result = config ?? defaultInstanceConfig;

			await cache.set(CACHE_KEY, result, DEFAULT_TTL_MS);

			return result;
		},

		async save({ config }: { config: InstanceConfig }): Promise<void> {
			await repository.save({ config });
			await cache.delete(CACHE_KEY);
		},
	};
}
