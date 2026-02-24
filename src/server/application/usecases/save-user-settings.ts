import type { UserSettings } from "@/server/domain/value-objects";
import { userSettingsSchema } from "@/server/domain/value-objects";
import type { UserSettingsService } from "../services/user-settings-service";

export type SaveUserSettings = (args: {
	userId: string;
	settings: UserSettings;
}) => Promise<void>;

export function makeSaveUserSettingsUsecase({
	service,
}: {
	service: UserSettingsService;
}): SaveUserSettings {
	return async ({
		userId,
		settings,
	}: {
		userId: string;
		settings: UserSettings;
	}) => {
		const validated = userSettingsSchema.parse(settings);
		await service.save({ userId, settings: validated });
	};
}
