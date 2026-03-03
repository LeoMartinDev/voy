import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { clientConfig } from "./config";
import { defaultLanguageCode, supportedLanguageCodes } from "./languages";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { makeClientLogger } from "./logging/client-logger";

const logger = makeClientLogger({
	scope: "i18n",
	level: clientConfig.logging.level,
});

const normalizeLoggerArgs = ({ args }: { args: unknown }): unknown[] =>
	Array.isArray(args) ? args : [args];

const i18nLoggerPlugin = {
	type: "logger",
	log: (args: unknown) => {
		logger.debug(...normalizeLoggerArgs({ args }));
	},
	warn: (args: unknown) => {
		logger.warn(...normalizeLoggerArgs({ args }));
	},
	error: (args: unknown) => {
		logger.error(...normalizeLoggerArgs({ args }));
	},
} as const;

i18n
	.use(i18nLoggerPlugin)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en,
			fr,
		},
		lng: typeof window === "undefined" ? defaultLanguageCode : undefined, // Force English on server
		fallbackLng: defaultLanguageCode,
		supportedLngs: supportedLanguageCodes,
		load: "languageOnly",
		debug: !clientConfig.isProduction,
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
	});

export default i18n;
