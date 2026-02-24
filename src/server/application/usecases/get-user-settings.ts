import type { UserSettings } from "@/server/domain/value-objects";
import type { UserSettingsService } from "../services/user-settings-service";

export type GetUserSettings = (args: {
	userId: string;
}) => Promise<UserSettings>;

export function makeGetUserSettingsUsecase({
	service,
}: {
	service: UserSettingsService;
}): GetUserSettings {
	return async ({ userId }: { userId: string }) => {
		return service.get({ userId });
	};
}
