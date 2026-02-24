import { Database } from "bun:sqlite";
import { resolve } from "node:path";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../drizzle/schema";
import { makeDrizzleInstanceConfigRepository } from "./drizzle-instance-config-repository";

describe("DrizzleInstanceConfigRepository", () => {
	let sqlite: Database;
	let db: BunSQLiteDatabase<typeof schema>;
	let repository: ReturnType<typeof makeDrizzleInstanceConfigRepository>;

	beforeEach(async () => {
		sqlite = new Database(":memory:");
		db = drizzle(sqlite, { schema });

		// Run migrations
		const migrationsFolder = resolve(__dirname, "../drizzle/migrations");
		migrate(db, { migrationsFolder });

		repository = makeDrizzleInstanceConfigRepository({ db });
	});

	afterEach(() => {
		sqlite.close();
	});

	it("should save and retrieve instance config", async () => {
		const config = {
			mistralApiKey: "test-api-key",
		};

		// First save (insert)
		await repository.save({ config });

		const retrieved = await repository.find();
		expect(retrieved).toEqual(config);

		// Update config
		const newConfig = {
			mistralApiKey: "new-api-key",
		};

		// Second save (update)
		await repository.save({ config: newConfig });

		const updated = await repository.find();
		expect(updated).toEqual(newConfig);
	});

	it("should return null when config not found", async () => {
		const result = await repository.find();
		expect(result).toBeNull();
	});

	it("should handle clearing the API key", async () => {
		const config = {
			mistralApiKey: "test-api-key",
		};

		await repository.save({ config });

		const clearConfig = {
			mistralApiKey: undefined,
		};

		await repository.save({ config: clearConfig });

		const result = await repository.find();
		expect(result?.mistralApiKey).toBeUndefined();
	});
});
