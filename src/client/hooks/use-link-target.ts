import { useQuery } from "@tanstack/react-query";
import { userSettingsQueryOptions } from "@/server/infrastructure/functions/user-settings";

interface LinkTargetProps {
	target?: "_blank";
	rel?: string;
}

export function useLinkTarget(): LinkTargetProps {
	const { data: userSettings } = useQuery(userSettingsQueryOptions);

	const openInNewTab = userSettings?.openInNewTab ?? true;

	if (!openInNewTab) {
		return {};
	}

	return {
		target: "_blank",
		rel: "noopener noreferrer",
	};
}
