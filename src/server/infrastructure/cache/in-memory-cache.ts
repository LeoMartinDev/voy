import type { Cache } from "@/server/domain/ports";

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export function makeInMemoryCache<T>(): Cache<T> {
	const store = new Map<string, CacheEntry<T>>();

	return {
		async get(key: string): Promise<T | null> {
			const entry = store.get(key);
			if (!entry) {
				return null;
			}
			if (Date.now() > entry.expiresAt) {
				store.delete(key);
				return null;
			}
			return entry.value;
		},

		async set(key: string, value: T, ttlMs?: number): Promise<void> {
			const ttl = ttlMs ?? DEFAULT_TTL_MS;
			store.set(key, {
				value,
				expiresAt: Date.now() + ttl,
			});
		},

		async delete(key: string): Promise<void> {
			store.delete(key);
		},

		async clear(): Promise<void> {
			store.clear();
		},
	};
}
