import { describe, expect, it, type Mock, vi } from "vitest";
import type { ApiKeyRepository } from "@/server/domain/ports/api-key-repository.port";
import { makeValidateApiKey } from "./validate-api-key";

describe("ValidateApiKey Usecase", () => {
	const mockApiKeyRepository = {
		findByKey: vi.fn(),
		updateLastUsedAt: vi.fn(),
	} as unknown as ApiKeyRepository;

	const usecase = makeValidateApiKey({
		apiKeyRepository: mockApiKeyRepository,
	});

	it("returns null if key not found", async () => {
		(mockApiKeyRepository.findByKey as Mock).mockResolvedValue(null);

		const result = await usecase({ key: "invalid-key" });

		expect(result).toBeNull();
		expect(mockApiKeyRepository.updateLastUsedAt).not.toHaveBeenCalled();
	});

	it("returns key and updates last used at if key found", async () => {
		const key = {
			id: "key-id",
			userId: "user-id",
			name: "key-name",
			key: "valid-key",
			createdAt: new Date(),
			lastUsedAt: null,
		};

		(mockApiKeyRepository.findByKey as Mock).mockResolvedValue(key);
		(mockApiKeyRepository.updateLastUsedAt as Mock).mockResolvedValue(
			undefined,
		);

		const result = await usecase({ key: "valid-key" });

		expect(result).toEqual(key);
		expect(mockApiKeyRepository.updateLastUsedAt).toHaveBeenCalledWith(
			"key-id",
		);
	});
});
