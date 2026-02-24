import type { User } from "@/server/domain/value-objects";

export interface UserRepository {
	findById(id: string): Promise<User | null>;
}
