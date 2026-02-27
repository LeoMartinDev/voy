import { describe, expect, test } from "vitest";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeDrizzleInstanceConfigRepository } from "@/server/infrastructure/persistence/repositories/drizzle-instance-config-repository";
import { createTestDb } from "@/server/test-utils";
import { makeInstanceConfigService } from "../services/instance-config-service";
import { makeSaveInstanceConfigUsecase } from "./save-instance-config";

describe("SaveInstanceConfig Usecase", () => {
	test("saves config to DB and invalidates cache", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeSaveInstanceConfigUsecase({ service });

		const newConfig: InstanceConfig = {};

		await usecase({ config: newConfig });

		// Verify DB
		const saved = await repository.find();
		expect(saved).toEqual(newConfig);

		// Verify cache invalidation
		const cached = await cache.get("instance-config");
		expect(cached).toBeNull();
	});

	test("updates existing config", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeSaveInstanceConfigUsecase({ service });

		// Initial state
		await repository.save({ config: {} });

		const updatedConfig: InstanceConfig = {};
		await usecase({ config: updatedConfig });

		const saved = await repository.find();
		expect(saved).toEqual(updatedConfig);
	});
});
