import type {
	ApiKey,
	ApiKeyRepository,
} from "@/server/domain/ports/api-key-repository.port";
import type { UserRepository } from "@/server/domain/ports/user-repository.port";

export type CreateApiKey = (input: {
	actorId: string;
	name: string;
}) => Promise<ApiKey>;

export const makeCreateApiKey =
	({
		apiKeyRepository,
		userRepository,
	}: {
		apiKeyRepository: ApiKeyRepository;
		userRepository: UserRepository;
	}): CreateApiKey =>
	async ({ actorId, name }) => {
		const actor = await userRepository.findById(actorId);

		if (!actor) {
			throw new Error("Unauthorized: User not found");
		}

		if (actor.role !== "admin") {
			throw new Error("Unauthorized: Only admins can create API keys");
		}

		const key = `voy_${crypto.randomUUID().replace(/-/g, "")}`;
		return apiKeyRepository.create({ userId: actor.id, name, key });
	};
