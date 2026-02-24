import * as z from "zod";
import { SafeSearch } from "./search.vo";

export const instanceConfigSchema = z.object({
	mistralApiKey: z.string().optional(),
});

export type InstanceConfig = z.infer<typeof instanceConfigSchema>;

export const defaultInstanceConfig: InstanceConfig = {
	mistralApiKey: undefined,
};

export const userSettingsSchema = z.object({
	safeSearch: z
		.enum([SafeSearch.OFF, SafeSearch.MODERATE, SafeSearch.STRICT])
		.default(SafeSearch.OFF),
	openInNewTab: z.boolean().default(true),
	theme: z.enum(["light", "dark", "system"]).default("system"),
	language: z.enum(["en", "fr"]).default("en"),
	enableAiSummary: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const defaultUserSettings: UserSettings = {
	safeSearch: SafeSearch.OFF,
	openInNewTab: true,
	theme: "system",
	language: "en",
	enableAiSummary: false,
};
