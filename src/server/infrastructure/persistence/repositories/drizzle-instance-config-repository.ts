import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { InstanceConfigRepository } from "@/server/domain/ports";
import type { InstanceConfig } from "@/server/domain/value-objects";
import type * as schema from "@/server/infrastructure/persistence/drizzle/schema";
import { instanceConfig } from "@/server/infrastructure/persistence/drizzle/schema";

const CONFIG_ID = 1;

export function makeDrizzleInstanceConfigRepository({
	db,
}: {
	db: BunSQLiteDatabase<typeof schema>;
}): InstanceConfigRepository {
	return {
		async find(): Promise<InstanceConfig | null> {
			const result = await db
				.select()
				.from(instanceConfig)
				.where(eq(instanceConfig.id, CONFIG_ID))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			return {};
		},

		async save({ config }: { config: InstanceConfig }): Promise<void> {
			const now = new Date();

			const existing = await db
				.select()
				.from(instanceConfig)
				.where(eq(instanceConfig.id, CONFIG_ID))
				.limit(1);

			if (existing.length > 0) {
				await db
					.update(instanceConfig)
					.set({
						updatedAt: now,
					})
					.where(eq(instanceConfig.id, CONFIG_ID));
			} else {
				await db.insert(instanceConfig).values({
					id: CONFIG_ID,
					updatedAt: now,
				});
			}
		},
	};
}
