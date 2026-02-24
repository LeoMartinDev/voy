export interface ApiKey {
	id: string;
	userId: string;
	name: string;
	key: string;
	createdAt: Date;
	lastUsedAt: Date | null;
}

export interface ApiKeyRepository {
	create(
		data: Omit<ApiKey, "id" | "createdAt" | "lastUsedAt">,
	): Promise<ApiKey>;
	delete(id: string, userId: string): Promise<void>;
	listByUserId(userId: string): Promise<ApiKey[]>;
	findByKey(key: string): Promise<ApiKey | null>;
	updateLastUsedAt(id: string): Promise<void>;
}
