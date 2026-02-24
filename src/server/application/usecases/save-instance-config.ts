import type { InstanceConfig } from "@/server/domain/value-objects";
import { instanceConfigSchema } from "@/server/domain/value-objects";
import type { InstanceConfigService } from "../services/instance-config-service";

export type SaveInstanceConfig = (args: {
	config: InstanceConfig;
}) => Promise<void>;

export function makeSaveInstanceConfigUsecase({
	service,
}: {
	service: InstanceConfigService;
}): SaveInstanceConfig {
	return async ({ config }: { config: InstanceConfig }) => {
		const validated = instanceConfigSchema.parse(config);
		await service.save({ config: validated });
	};
}
