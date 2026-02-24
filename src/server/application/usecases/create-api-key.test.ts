import { describe, expect, it, type Mock, vi } from "vitest";
import type { ApiKeyRepository } from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";
import type { User } from "@/server/domain/value-objects";
import { makeCreateApiKey } from "./create-api-key";

describe("CreateApiKey Usecase", () => {
	const mockApiKeyRepository = {
		create: vi.fn(),
		delete: vi.fn(),
		listByUserId: vi.fn(),
		findByKey: vi.fn(),
		updateLastUsedAt: vi.fn(),
	} as unknown as ApiKeyRepository;

	const mockUserRepository = {
		findById: vi.fn(),
	} as unknown as UserRepository;

	const usecase = makeCreateApiKey({
		apiKeyRepository: mockApiKeyRepository,
		userRepository: mockUserRepository,
	});

	it("throws if user not found", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue(null);

		await expect(
			usecase({ actorId: "missing-user", name: "test-key" }),
		).rejects.toThrow("Unauthorized: User not found");
	});

	it("throws if user is not admin", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue({
			id: "user-id",
			role: "user",
		} as User);

		await expect(
			usecase({ actorId: "user-id", name: "test-key" }),
		).rejects.toThrow("Unauthorized: Only admins can create API keys");
	});

	it("creates api key if user is admin", async () => {
		const adminUser = {
			id: "admin-id",
			role: "admin",
		} as User;

		const createdKey = {
			id: "key-id",
			userId: "admin-id",
			name: "test-key",
			key: "voy_123",
			createdAt: new Date(),
			lastUsedAt: null,
		};

		(mockUserRepository.findById as Mock).mockResolvedValue(adminUser);
		(mockApiKeyRepository.create as Mock).mockResolvedValue(createdKey);

		const result = await usecase({ actorId: "admin-id", name: "test-key" });

		expect(result).toEqual(createdKey);
		expect(mockApiKeyRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "admin-id",
				name: "test-key",
				key: expect.stringMatching(/^voy_/),
			}),
		);
	});
});
