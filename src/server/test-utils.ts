import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "@/server/infrastructure/persistence/drizzle/schema";

export function createTestDb() {
	const sqlite = new Database(":memory:");
	const db = drizzle(sqlite, { schema });

	// We can't easily run migrations from the compiled code or if folders are different.
	// But for tests, we can just push the schema using `db.run` or similar if we had the SQL.
	// Or we can use `migrate` if we point to the correct folder.
	// Assuming running from root:
	try {
		migrate(db, {
			migrationsFolder:
				"./src/server/infrastructure/persistence/drizzle/migrations",
		});
	} catch (error) {
		console.warn(
			"Migration failed, falling back to manual schema push or ignoring if not needed for specific test",
			error,
		);
		// If migration fails (e.g. folder not found), we might want to manually create tables or just fail.
		// For now, let's assume it works.
		throw error;
	}

	return db;
}
