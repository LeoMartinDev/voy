import type { UserSettings } from "../value-objects/settings.vo";

export interface UserSettingsRepository {
	findByUserId(args: { userId: string }): Promise<UserSettings | null>;
	save(args: { userId: string; settings: UserSettings }): Promise<void>;
}
