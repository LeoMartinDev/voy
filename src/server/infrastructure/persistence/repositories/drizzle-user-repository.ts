import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";
import type { User } from "@/server/domain/value-objects";
import type * as schema from "@/server/infrastructure/persistence/drizzle/schema";
import { user } from "@/server/infrastructure/persistence/drizzle/schema";

export function makeDrizzleUserRepository({
	db,
}: {
	db: BunSQLiteDatabase<typeof schema>;
}): UserRepository {
	return {
		async findById(id: string): Promise<User | null> {
			const result = await db
				.select()
				.from(user)
				.where(eq(user.id, id))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			return {
				id: result[0].id,
				role: result[0].role || "user",
			};
		},
	};
}
