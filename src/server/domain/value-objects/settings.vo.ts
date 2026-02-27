import * as z from "zod";
import { SafeSearch } from "./search.vo";

export const instanceConfigSchema = z.object({});

export type InstanceConfig = z.infer<typeof instanceConfigSchema>;

export const defaultInstanceConfig: InstanceConfig = {};

export const userSettingsSchema = z.object({
	safeSearch: z
		.enum([SafeSearch.OFF, SafeSearch.MODERATE, SafeSearch.STRICT])
		.default(SafeSearch.OFF),
	openInNewTab: z.boolean().default(true),
	theme: z.enum(["light", "dark", "system"]).default("system"),
	language: z.enum(["en", "fr"]).default("en"),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const defaultUserSettings: UserSettings = {
	safeSearch: SafeSearch.OFF,
	openInNewTab: true,
	theme: "system",
	language: "en",
};
