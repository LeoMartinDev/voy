import type {
	ApiKey,
	ApiKeyRepository,
} from "@/server/domain/ports/api-key-repository.port";

export type ValidateApiKey = (input: { key: string }) => Promise<ApiKey | null>;

export const makeValidateApiKey =
	({
		apiKeyRepository,
	}: {
		apiKeyRepository: ApiKeyRepository;
	}): ValidateApiKey =>
	async ({ key }) => {
		const apiKey = await apiKeyRepository.findByKey(key);
		if (apiKey) {
			await apiKeyRepository.updateLastUsedAt(apiKey.id);
		}
		return apiKey;
	};
