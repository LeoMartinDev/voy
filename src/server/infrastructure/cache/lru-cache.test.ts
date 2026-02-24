import { describe, expect, it } from "vitest";
import { makeLruCache } from "./lru-cache";

describe("LruCache", () => {
	it("should set and get values", async () => {
		const cache = makeLruCache();
		await cache.set("key", { foo: "bar" });
		const value = await cache.get("key");
		expect(value).toEqual({ foo: "bar" });
	});

	it("should return null for missing keys", async () => {
		const cache = makeLruCache();
		const value = await cache.get("missing");
		expect(value).toBeNull();
	});

	it("should expire items after TTL", async () => {
		// Use real timers for this test as lru-cache uses performance.now()
		// which can be tricky to mock reliably with vitest fake timers
		const cache = makeLruCache({ ttl: 50 });
		await cache.set("key", "value");

		expect(await cache.get("key")).toBe("value");

		// Wait for expiration (50ms + buffer)
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(await cache.get("key")).toBeNull();
	});

	it("should respect memory limit (eviction)", async () => {
		const cache = makeLruCache<string>({
			maxSize: 10,
		});

		// 1 item (2 bytes) fits in 10 bytes.
		await cache.set("1", "a");
		expect(await cache.get("1")).toBe("a");

		// "abcdef" is 12 bytes (6 chars * 2 bytes/char) > 10 bytes.
		// This should evict "1" to make room, or fail to set if one item is too big?
		// Actually, lru-cache behavior: if one item > max, it might not be cached or evict everything.
		// Let's use multiple small items to trigger eviction.
		// "1" -> "a" (2 bytes)
		// "2" -> "b" (2 bytes)
		// ...
		// "5" -> "e" (2 bytes)
		// Total 10 bytes.

		await cache.set("2", "b");
		await cache.set("3", "c");
		await cache.set("4", "d");
		await cache.set("5", "e");

		// Now full (10 bytes). Adding "6" -> "f" (2 bytes) should evict "1".
		await cache.set("6", "f");

		expect(await cache.get("6")).toBe("f");
		// First item should be evicted
		expect(await cache.get("1")).toBeNull();
	});
});
