import { Database } from "bun:sqlite";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "@/server/env";
import * as schema from "./schema.ts";

const databaseUrl =
	env.DATABASE_URL ?? resolve(import.meta.dir, "../../../../../dev.db");

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required");
}

const sqlite = new Database(databaseUrl);
export const db = drizzle(sqlite, { schema });
