import { describe, expect, test } from "vitest";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { defaultInstanceConfig } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeDrizzleInstanceConfigRepository } from "@/server/infrastructure/persistence/repositories/drizzle-instance-config-repository";
import { createTestDb } from "@/server/test-utils";
import { makeInstanceConfigService } from "../services/instance-config-service";
import { makeGetInstanceConfigUsecase } from "./get-instance-config";

describe("GetInstanceConfig Usecase", () => {
	test("returns default config when no config saved", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeGetInstanceConfigUsecase({ service });

		const result = await usecase();

		expect(result).toEqual(defaultInstanceConfig);
	});

	test("returns saved config from DB", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeGetInstanceConfigUsecase({ service });

		const savedConfig: InstanceConfig = {};
		await repository.save({ config: savedConfig });

		const result = await usecase();

		expect(result).toEqual(savedConfig);
	});

	test("returns cached config", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeGetInstanceConfigUsecase({ service });

		const cachedConfig: InstanceConfig = {};
		await cache.set("instance-config", cachedConfig);

		const result = await usecase();

		expect(result).toEqual(cachedConfig);
	});
});
