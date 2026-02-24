import {
	type InstanceConfigService,
	makeInstanceConfigService,
} from "./application/services/instance-config-service";
import {
	makeUserSettingsService,
	type UserSettingsService,
} from "./application/services/user-settings-service";
import {
	type CreateApiKey,
	makeCreateApiKey,
} from "./application/usecases/create-api-key";
import {
	type DeleteApiKey,
	makeDeleteApiKey,
} from "./application/usecases/delete-api-key";
import {
	type GenerateSummaryUsecase,
	makeGenerateSummaryUsecase,
} from "./application/usecases/generate-summary";
import {
	type GetInstanceConfig,
	makeGetInstanceConfigUsecase,
} from "./application/usecases/get-instance-config";
import {
	type GetUserSettings,
	makeGetUserSettingsUsecase,
} from "./application/usecases/get-user-settings";
import {
	type ListApiKeys,
	makeListApiKeys,
} from "./application/usecases/list-api-keys";
import {
	makeSaveInstanceConfigUsecase,
	type SaveInstanceConfig,
} from "./application/usecases/save-instance-config";
import {
	makeSaveUserSettingsUsecase,
	type SaveUserSettings,
} from "./application/usecases/save-user-settings";
import {
	makeSearchUsecase,
	type SearchUsecase,
} from "./application/usecases/search";
import {
	makeSuggestUsecase,
	type SuggestUsecase,
} from "./application/usecases/suggest";
import {
	makeValidateApiKey,
	type ValidateApiKey,
} from "./application/usecases/validate-api-key";
import type {
	AISummaryProvider,
	ApiKeyRepository,
	Cache,
	InstanceConfigRepository,
	SearchEngine,
	UserRepository,
	UserSettingsRepository,
} from "./domain/ports";
import type {
	InstanceConfig,
	SearchResult,
	SuggestResult,
	UserSettings,
} from "./domain/value-objects";
import { makeMistralSummaryAdapter } from "./infrastructure/ai/mistral-summary.adapter";
import { makeInMemoryCache } from "./infrastructure/cache/in-memory-cache";
import { makeLruCache } from "./infrastructure/cache/lru-cache";
import { makeSearXngSearchEngine } from "./infrastructure/http/searxng/search-engine";
import { db } from "./infrastructure/persistence/drizzle/connection";
import { makeDrizzleApiKeyRepository } from "./infrastructure/persistence/repositories/drizzle-api-key-repository";
import { makeDrizzleInstanceConfigRepository } from "./infrastructure/persistence/repositories/drizzle-instance-config-repository";
import { makeDrizzleUserRepository } from "./infrastructure/persistence/repositories/drizzle-user-repository";
import { makeDrizzleUserSettingsRepository } from "./infrastructure/persistence/repositories/drizzle-user-settings-repository";

export interface Container {
	infrastructure: {
		searchEngine: SearchEngine;
		userRepository: UserRepository;
		userSettingsRepository: UserSettingsRepository;
		instanceConfigRepository: InstanceConfigRepository;
		apiKeyRepository: ApiKeyRepository;
		userSettingsCache: Cache<UserSettings>;
		instanceConfigCache: Cache<InstanceConfig>;
		searchCache: Cache<SearchResult>;
		suggestCache: Cache<SuggestResult>;
		aiSummaryProvider: AISummaryProvider | null;
	};
	services: {
		userSettings: UserSettingsService;
		instanceConfig: InstanceConfigService;
	};
	usecases: {
		search: SearchUsecase;
		suggest: SuggestUsecase;
		getUserSettings: GetUserSettings;
		saveUserSettings: SaveUserSettings;
		getInstanceConfig: GetInstanceConfig;
		saveInstanceConfig: SaveInstanceConfig;
		generateSummary: GenerateSummaryUsecase | null;
		createApiKey: CreateApiKey;
		deleteApiKey: DeleteApiKey;
		listApiKeys: ListApiKeys;
		validateApiKey: ValidateApiKey;
	};
}

let _container: Container | null = null;

export async function getContainer(): Promise<Container> {
	if (_container) return _container;

	const searchEngine = makeSearXngSearchEngine();
	const userRepository = makeDrizzleUserRepository({ db });
	const userSettingsRepository = makeDrizzleUserSettingsRepository({ db });
	const instanceConfigRepository = makeDrizzleInstanceConfigRepository({ db });
	const apiKeyRepository = makeDrizzleApiKeyRepository({ db });
	const userSettingsCache = makeInMemoryCache<UserSettings>();
	const instanceConfigCache = makeInMemoryCache<InstanceConfig>();
	const searchCache = makeLruCache<SearchResult>({
		maxSize: 128 * 1024 * 1024,
		ttl: 30 * 60 * 1000,
	});
	const suggestCache = makeLruCache<SuggestResult>({
		maxSize: 64 * 1024 * 1024,
		ttl: 30 * 60 * 1000,
	});

	const userSettingsService = makeUserSettingsService({
		repository: userSettingsRepository,
		cache: userSettingsCache,
	});

	const instanceConfigService = makeInstanceConfigService({
		repository: instanceConfigRepository,
		cache: instanceConfigCache,
	});

	const config = await instanceConfigService.get();
	const aiSummaryProvider = config.mistralApiKey
		? makeMistralSummaryAdapter({ apiKey: config.mistralApiKey })
		: null;

	const search = makeSearchUsecase({ searchEngine, cache: searchCache });
	const suggest = makeSuggestUsecase({ searchEngine, cache: suggestCache });
	const getUserSettings = makeGetUserSettingsUsecase({
		service: userSettingsService,
	});
	const saveUserSettings = makeSaveUserSettingsUsecase({
		service: userSettingsService,
	});
	const getInstanceConfig = makeGetInstanceConfigUsecase({
		service: instanceConfigService,
	});
	const saveInstanceConfig = makeSaveInstanceConfigUsecase({
		service: instanceConfigService,
	});
	const generateSummary = aiSummaryProvider
		? makeGenerateSummaryUsecase({ aiSummaryProvider })
		: null;

	const createApiKey = makeCreateApiKey({ apiKeyRepository, userRepository });
	const deleteApiKey = makeDeleteApiKey({ apiKeyRepository, userRepository });
	const listApiKeys = makeListApiKeys({ apiKeyRepository, userRepository });
	const validateApiKey = makeValidateApiKey({ apiKeyRepository });

	_container = {
		infrastructure: {
			searchEngine,
			userRepository,
			userSettingsRepository,
			instanceConfigRepository,
			apiKeyRepository,
			userSettingsCache,
			instanceConfigCache,
			searchCache,
			suggestCache,
			aiSummaryProvider,
		},
		services: {
			userSettings: userSettingsService,
			instanceConfig: instanceConfigService,
		},
		usecases: {
			search,
			suggest,
			getUserSettings,
			saveUserSettings,
			getInstanceConfig,
			saveInstanceConfig,
			generateSummary,
			createApiKey,
			deleteApiKey,
			listApiKeys,
			validateApiKey,
		},
	};

	return _container;
}

export function resetContainer(): void {
	_container = null;
}
