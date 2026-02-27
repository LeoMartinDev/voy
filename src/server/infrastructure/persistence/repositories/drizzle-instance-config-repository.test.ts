import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { InstanceConfig } from "@/server/domain/value-objects";
import * as schema from "@/server/infrastructure/persistence/drizzle/schema";
import { makeDrizzleInstanceConfigRepository } from "./drizzle-instance-config-repository";
import { createTestDb } from "@/server/test-utils";

describe("DrizzleInstanceConfigRepository", () => {
	let db: ReturnType<typeof createTestDb>;
	let repository: ReturnType<typeof makeDrizzleInstanceConfigRepository>;

	beforeEach(async () => {
		db = createTestDb();
		repository = makeDrizzleInstanceConfigRepository({ db });
	});

	afterEach(() => {
		// No need to close in-memory db explicitly if createTestDb doesn't expose it, 
		// but garbage collection will handle it. 
		// If we need to clear tables, we can do it here.
	});

	it("should save and retrieve instance config", async () => {
		const config: InstanceConfig = {};

		// First save (insert)
		await repository.save({ config });

		const retrieved = await repository.find();
		expect(retrieved).toEqual(config);

		// Verify updatedAt was set
		const rows = await db.select().from(schema.instanceConfig);
		expect(rows).toHaveLength(1);
		expect(rows[0].updatedAt).toBeInstanceOf(Date);
	});

	it("should return null when config not found", async () => {
		const result = await repository.find();
		expect(result).toBeNull();
	});

	it("should update existing config", async () => {
		const config: InstanceConfig = {};

		await repository.save({ config });

		// Wait a bit to ensure timestamp changes
		await new Promise((resolve) => setTimeout(resolve, 10));

		await repository.save({ config });

		const rows = await db.select().from(schema.instanceConfig);
		expect(rows).toHaveLength(1);
		expect(rows[0].updatedAt).toBeInstanceOf(Date);
	});
});
