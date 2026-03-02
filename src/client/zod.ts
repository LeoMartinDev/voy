import { z } from "zod";
import i18n from "./i18n";
import { normalizeLanguageCode } from "./languages";

const applyZodLocale = () => {
	const language = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
	const locale = language === "fr" ? z.locales.fr() : z.locales.en();
	z.config(locale);
};

applyZodLocale();
i18n.on("initialized", applyZodLocale);
i18n.on("languageChanged", applyZodLocale);
