import { LRUCache } from "lru-cache";
import type { Cache } from "@/server/domain/ports/cache.port";

export interface LruCacheOptions {
	/**
	 * Max size in bytes.
	 * Default: 50MB
	 */
	maxSize?: number;

	/**
	 * Default TTL in milliseconds.
	 * Default: 30 minutes
	 */
	ttl?: number;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 mins

function calculateSize(value: unknown, seen = new WeakSet()): number {
	if (value === null || value === undefined) return 0;

	switch (typeof value) {
		case "boolean":
			return 4;
		case "number":
			return 8;
		case "string":
			return value.length * 2;
		case "symbol":
			return 0;
		case "object": {
			if (seen.has(value as object)) return 0;
			seen.add(value as object);

			if (Buffer.isBuffer(value)) {
				return value.length;
			}

			if (Array.isArray(value)) {
				let size = 0;
				for (const item of value) {
					size += calculateSize(item, seen);
				}
				return size;
			}

			let size = 0;
			for (const key in value) {
				if (Object.hasOwn(value, key)) {
					size += key.length * 2;
					size += calculateSize((value as Record<string, unknown>)[key], seen);
				}
			}
			return size;
		}
		default:
			return 0;
	}
}

export function makeLruCache<T extends {}>(
	options: LruCacheOptions = {},
): Cache<T> {
	const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
	const defaultTtl = options.ttl ?? DEFAULT_TTL_MS;

	const cache = new LRUCache<string, T>({
		maxSize,
		sizeCalculation: (value) => calculateSize(value),
		ttl: defaultTtl,
	});

	return {
		async get(key: string): Promise<T | null> {
			const value = cache.get(key);
			return value ?? null;
		},

		async set(key: string, value: T, ttlMs?: number): Promise<void> {
			cache.set(key, value, { ttl: ttlMs ?? defaultTtl });
		},

		async delete(key: string): Promise<void> {
			cache.delete(key);
		},

		async clear(): Promise<void> {
			cache.clear();
		},
	};
}
