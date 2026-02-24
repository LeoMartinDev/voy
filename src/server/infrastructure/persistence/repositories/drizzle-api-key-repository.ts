import { and, eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type {
	ApiKey,
	ApiKeyRepository,
} from "@/server/domain/ports/api-key-repository.port";
import type * as schema from "@/server/infrastructure/persistence/drizzle/schema";
import { apiKey } from "@/server/infrastructure/persistence/drizzle/schema";

export function makeDrizzleApiKeyRepository({
	db,
}: {
	db: BunSQLiteDatabase<typeof schema>;
}): ApiKeyRepository {
	return {
		async create(
			data: Omit<ApiKey, "id" | "createdAt" | "lastUsedAt">,
		): Promise<ApiKey> {
			const id = crypto.randomUUID();
			const now = new Date();

			const newKey: ApiKey = {
				id,
				userId: data.userId,
				name: data.name,
				key: data.key,
				createdAt: now,
				lastUsedAt: null,
			};

			await db.insert(apiKey).values(newKey);
			return newKey;
		},

		async delete(id: string, userId: string): Promise<void> {
			await db
				.delete(apiKey)
				.where(and(eq(apiKey.id, id), eq(apiKey.userId, userId)));
		},

		async listByUserId(userId: string): Promise<ApiKey[]> {
			const results = await db
				.select()
				.from(apiKey)
				.where(eq(apiKey.userId, userId));

			return results;
		},

		async findByKey(key: string): Promise<ApiKey | null> {
			const results = await db
				.select()
				.from(apiKey)
				.where(eq(apiKey.key, key))
				.limit(1);

			return results[0] || null;
		},

		async updateLastUsedAt(id: string): Promise<void> {
			const now = new Date();
			await db.update(apiKey).set({ lastUsedAt: now }).where(eq(apiKey.id, id));
		},
	};
}
