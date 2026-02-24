import type {
	ApiKey,
	ApiKeyRepository,
} from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";

export type ListApiKeys = (input: { actorId: string }) => Promise<ApiKey[]>;

export const makeListApiKeys =
	({
		apiKeyRepository,
		userRepository,
	}: {
		apiKeyRepository: ApiKeyRepository;
		userRepository: UserRepository;
	}): ListApiKeys =>
	async ({ actorId }) => {
		const actor = await userRepository.findById(actorId);

		if (!actor) {
			throw new Error("Unauthorized: User not found");
		}

		if (actor.role !== "admin") {
			throw new Error("Unauthorized: Only admins can list API keys");
		}
		return apiKeyRepository.listByUserId(actor.id);
	};
