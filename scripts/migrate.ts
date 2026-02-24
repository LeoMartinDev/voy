import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL ?? resolve(import.meta.dir, "../dev.db");

console.log(`[INFO] Running migrations on: ${databaseUrl}`);

const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: resolve(import.meta.dir, "../src/server/infrastructure/persistence/drizzle/migrations") });

console.log("[SUCCESS] Migrations completed");

sqlite.close();
