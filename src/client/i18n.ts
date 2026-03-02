import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { defaultLanguageCode, supportedLanguageCodes } from "./languages";
import { en } from "./locales/en";
import { fr } from "./locales/fr";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en,
			fr,
		},
		lng:
			typeof window === "undefined" ? defaultLanguageCode : undefined, // Force English on server
		fallbackLng: defaultLanguageCode,
		supportedLngs: supportedLanguageCodes,
		load: "languageOnly",
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
	});

export default i18n;
