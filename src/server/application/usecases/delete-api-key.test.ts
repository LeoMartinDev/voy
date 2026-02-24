import { describe, expect, it, type Mock, vi } from "vitest";
import type { ApiKeyRepository } from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";
import type { User } from "@/server/domain/value-objects";
import { makeDeleteApiKey } from "./delete-api-key";

describe("DeleteApiKey Usecase", () => {
	const mockApiKeyRepository = {
		delete: vi.fn(),
	} as unknown as ApiKeyRepository;

	const mockUserRepository = {
		findById: vi.fn(),
	} as unknown as UserRepository;

	const usecase = makeDeleteApiKey({
		apiKeyRepository: mockApiKeyRepository,
		userRepository: mockUserRepository,
	});

	it("throws if user not found", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue(null);

		await expect(
			usecase({ id: "key-id", actorId: "missing-user" }),
		).rejects.toThrow("Unauthorized: User not found");
	});

	it("throws if user is not admin", async () => {
		(mockUserRepository.findById as Mock).mockResolvedValue({
			id: "user-id",
			role: "user",
		} as User);

		await expect(usecase({ id: "key-id", actorId: "user-id" })).rejects.toThrow(
			"Unauthorized: Only admins can delete API keys",
		);
	});

	it("deletes api key if user is admin", async () => {
		const adminUser = {
			id: "admin-id",
			role: "admin",
		} as User;

		(mockUserRepository.findById as Mock).mockResolvedValue(adminUser);
		(mockApiKeyRepository.delete as Mock).mockResolvedValue(undefined);

		await usecase({ id: "key-id", actorId: "admin-id" });

		expect(mockApiKeyRepository.delete).toHaveBeenCalledWith(
			"key-id",
			"admin-id",
		);
	});
});
