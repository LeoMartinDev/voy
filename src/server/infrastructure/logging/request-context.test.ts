import { describe, expect, it, vi } from "vitest";
import { makeLogger } from "@/server/infrastructure/logging/logger";
import {
	createRequestContext,
	getOrCreateRequestId,
	REQUEST_ID_HEADER,
	withRequestIdHeader,
} from "@/server/infrastructure/logging/request-context";

const logger = makeLogger({
	level: "silent",
	pretty: false,
	serviceName: "voy-test",
	environment: "test",
	redactPaths: [],
});

describe("request context logging helpers", () => {
	it("uses incoming request id header when provided", () => {
		const headers = new Headers({ [REQUEST_ID_HEADER]: "req-123" });

		const requestId = getOrCreateRequestId({ headers });

		expect(requestId).toBe("req-123");
	});

	it("generates request id when missing", () => {
		const randomUuidSpy = vi
			.spyOn(crypto, "randomUUID")
			.mockReturnValue("11111111-2222-3333-4444-555555555555");

		const requestId = getOrCreateRequestId({
			headers: new Headers(),
		});

		expect(requestId).toBe("11111111-2222-3333-4444-555555555555");
		randomUuidSpy.mockRestore();
	});

	it("creates request context without query params", () => {
		const request = new Request("https://example.com/api/search?q=sensitive", {
			method: "post",
			headers: {
				[REQUEST_ID_HEADER]: "req-path-test",
			},
		});

		const context = createRequestContext({
			request,
			logger,
			operation: "unit-test",
		});

		expect(context.requestId).toBe("req-path-test");
		expect(context.method).toBe("POST");
		expect(context.pathname).toBe("/api/search");
		expect(context.logger).toBeDefined();
	});

	it("appends request id header to response", async () => {
		const originalResponse = new Response("ok", { status: 201 });

		const response = withRequestIdHeader({
			response: originalResponse,
			requestId: "req-response-test",
		});

		expect(response.status).toBe(201);
		expect(response.headers.get(REQUEST_ID_HEADER)).toBe("req-response-test");
		expect(await response.text()).toBe("ok");
	});
});
