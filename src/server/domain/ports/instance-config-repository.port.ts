import type { InstanceConfig } from "../value-objects/settings.vo";

export interface InstanceConfigRepository {
	find(): Promise<InstanceConfig | null>;
	save(args: { config: InstanceConfig }): Promise<void>;
}
