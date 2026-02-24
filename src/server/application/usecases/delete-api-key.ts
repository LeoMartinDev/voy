import type { ApiKeyRepository } from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";

export type DeleteApiKey = (input: {
	id: string;
	actorId: string;
}) => Promise<void>;

export const makeDeleteApiKey =
	({
		apiKeyRepository,
		userRepository,
	}: {
		apiKeyRepository: ApiKeyRepository;
		userRepository: UserRepository;
	}): DeleteApiKey =>
	async ({ id, actorId }) => {
		const actor = await userRepository.findById(actorId);

		if (!actor) {
			throw new Error("Unauthorized: User not found");
		}

		if (actor.role !== "admin") {
			throw new Error("Unauthorized: Only admins can delete API keys");
		}

		return apiKeyRepository.delete(id, actor.id);
	};
