export const languageOptions = [
	{ code: "en", labelKey: "languages.en" },
	{ code: "fr", labelKey: "languages.fr" },
] as const;

export type LanguageCode = (typeof languageOptions)[number]["code"];

export const languageCodeTuple = languageOptions.map(
	(option) => option.code,
) as [LanguageCode, ...LanguageCode[]];

export const supportedLanguageCodes = languageOptions.map(
	(option) => option.code,
);

export const defaultLanguageCode: LanguageCode = "en";

export const normalizeLanguageCode = (
	language: string | null | undefined,
): LanguageCode => {
	const normalizedLanguage = (language ?? defaultLanguageCode).split("-")[0];

	if (supportedLanguageCodes.includes(normalizedLanguage as LanguageCode)) {
		return normalizedLanguage as LanguageCode;
	}

	return defaultLanguageCode;
};
