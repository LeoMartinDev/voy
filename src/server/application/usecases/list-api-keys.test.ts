import { describe, expect, it, type Mock, vi } from "vitest";
import type { ApiKeyRepository } from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";
import type { User } from "@/server/domain/value-objects";
import { makeListApiKeys } from "./list-api-keys";

describe("ListApiKeys Usecase", () => {
	const mockApiKeyRepository = {
		listByUserId: vi.fn(),
	} as unknown as ApiKeyRepository;

	const mockUserRepository = {
		findById: vi.fn(),
	} as unknown as UserRepository;

	const usecase = makeListApiKeys({
		apiKeyRepository: mockApiKeyRepository,
		userRepository: mockUserRepository,
	});

	it("throws if user not found", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue(null);

		await expect(usecase({ actorId: "missing-user" })).rejects.toThrow(
			"Unauthorized: User not found",
		);
	});

	it("throws if user is not admin", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue({
			id: "user-id",
			role: "user",
		} as User);

		await expect(usecase({ actorId: "user-id" })).rejects.toThrow(
			"Unauthorized: Only admins can list API keys",
		);
	});

	it("lists api keys if user is admin", async () => {
		const adminUser = {
			id: "admin-id",
			role: "admin",
		} as User;

		const keys = [
			{
				id: "key-1",
				name: "key-1",
				userId: "admin-id",
				key: "voy_1",
				createdAt: new Date(),
				lastUsedAt: null,
			},
		];

		(mockUserRepository.findById as Mock).mockResolvedValue(adminUser);
		(mockApiKeyRepository.listByUserId as Mock).mockResolvedValue(keys);

		const result = await usecase({ actorId: "admin-id" });

		expect(result).toEqual(keys);
		expect(mockApiKeyRepository.listByUserId).toHaveBeenCalledWith("admin-id");
	});
});
