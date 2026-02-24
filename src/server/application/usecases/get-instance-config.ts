import type { InstanceConfig } from "@/server/domain/value-objects";
import type { InstanceConfigService } from "../services/instance-config-service";

export type GetInstanceConfig = () => Promise<InstanceConfig>;

export function makeGetInstanceConfigUsecase({
	service,
}: {
	service: InstanceConfigService;
}): GetInstanceConfig {
	return async () => {
		return service.get();
	};
}
