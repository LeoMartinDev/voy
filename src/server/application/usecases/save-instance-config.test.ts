import { describe, expect, it } from "vitest";
import type { InstanceConfig } from "@/server/domain/value-objects";
import { defaultInstanceConfig } from "@/server/domain/value-objects";
import { makeInMemoryCache } from "@/server/infrastructure/cache/in-memory-cache";
import { makeDrizzleInstanceConfigRepository } from "@/server/infrastructure/persistence/repositories/drizzle-instance-config-repository";
import { createTestDb } from "@/server/test-utils";
import { makeInstanceConfigService } from "../services/instance-config-service";
import { makeSaveInstanceConfigUsecase } from "./save-instance-config";

describe("SaveInstanceConfig Usecase", () => {
	it("saves config to DB and invalidates cache", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeSaveInstanceConfigUsecase({ service });

		const newConfig: InstanceConfig = {
			mistralApiKey: "new-api-key",
		};

		// Pre-populate cache
		await cache.set("instance-config", defaultInstanceConfig);

		await usecase({ config: newConfig });

		// Verify DB
		const saved = await repository.find();
		expect(saved).toEqual(newConfig);

		// Verify Cache is invalidated
		const cached = await cache.get("instance-config");
		expect(cached).toBeNull();
	});

	it("updates existing config", async () => {
		const db = createTestDb();
		const repository = makeDrizzleInstanceConfigRepository({ db });
		const cache = makeInMemoryCache<InstanceConfig>();
		const service = makeInstanceConfigService({ repository, cache });
		const usecase = makeSaveInstanceConfigUsecase({ service });

		const initialConfig: InstanceConfig = {
			mistralApiKey: "initial-key",
		};
		await repository.save({ config: initialConfig });

		const updatedConfig: InstanceConfig = {
			mistralApiKey: "updated-key",
		};
		await usecase({ config: updatedConfig });

		const saved = await repository.find();
		expect(saved).toEqual(updatedConfig);
	});
});
