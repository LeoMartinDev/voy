import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		setupFiles: ["./test/setup.ts"],
		env: {
			SEARXNG_URL: "http://localhost:8080",
			BETTER_AUTH_SECRET: "test-secret",
			SITE_URL: "http://localhost:3000",
			DATABASE_URL: ":memory:",
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
