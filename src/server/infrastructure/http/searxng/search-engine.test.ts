import { describe, expect, it } from "vitest";
import { SearXNGResultSchema } from "./search-engine";

describe("SearXNGResultSchema", () => {
	it("should parse a result with null content and parsed_url", () => {
		const result = {
			title: "Test",
			url: "https://example.com",
			content: null,
			engine: "google",
			engines: ["google"],
			positions: [1],
			score: 1,
			category: "images",
			template: "default.html",
			parsed_url: null,
			publishedDate: null,
			pubdate: null,
			thumbnail: null,
			img_src: "https://example.com/image.jpg",
			iframe_src: null,
			priority: null,
		};

		const parsed = SearXNGResultSchema.safeParse(result);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.content).toBeNull();
			expect(parsed.data.parsed_url).toBeNull();
		}
	});

	it("should parse a result with valid content and parsed_url", () => {
		const result = {
			title: "Test",
			url: "https://example.com",
			content: "Test content",
			engine: "google",
			engines: ["google"],
			positions: [1],
			score: 1,
			category: "general",
			template: "default.html",
			parsed_url: ["https", "example.com", "/"],
			publishedDate: "2023-01-01",
			pubdate: null,
			thumbnail: null,
			img_src: null,
			iframe_src: null,
			priority: 1,
		};

		const parsed = SearXNGResultSchema.safeParse(result);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.content).toBe("Test content");
			expect(parsed.data.parsed_url).toEqual(["https", "example.com", "/"]);
		}
	});
});
