import pino, {
	type LevelWithSilent,
	type Logger,
	type LoggerOptions,
} from "pino";
import pinoPretty from "pino-pretty";
import { config } from "@/server/config";

export type AppLogger = Logger;

export type LogBindings = Record<
	string,
	string | number | boolean | null | undefined
>;

const DEFAULT_REDACT_PATHS = [
	"password",
	"token",
	"apiKey",
	"authorization",
	"cookie",
	"headers.authorization",
	"headers.cookie",
	"request.headers.authorization",
	"request.headers.cookie",
	"query.key",
	"query.token",
];

const getRedactPaths = ({
	configuredPaths,
}: {
	configuredPaths: readonly string[];
}) =>
	configuredPaths.length > 0 ? [...configuredPaths] : DEFAULT_REDACT_PATHS;

export const makeLogger = ({
	level,
	pretty,
	serviceName,
	environment,
	redactPaths,
}: {
	level: LevelWithSilent;
	pretty: boolean;
	serviceName: string;
	environment: string;
	redactPaths: readonly string[];
}): AppLogger => {
	const loggerOptions: LoggerOptions = {
		level,
		base: {
			service: serviceName,
			environment,
		},
		redact: {
			paths: getRedactPaths({ configuredPaths: redactPaths }),
			censor: "[REDACTED]",
		},
		serializers: {
			err: pino.stdSerializers.err,
		},
	};

	if (pretty) {
		const destination = pinoPretty({
			colorize: true,
			translateTime: "SYS:standard",
			singleLine: true,
			ignore: "pid,hostname",
		});
		return pino(loggerOptions, destination);
	}

	return pino(loggerOptions);
};

let serverLogger: AppLogger | null = null;

export const getServerLogger = (): AppLogger => {
	if (serverLogger) {
		return serverLogger;
	}

	serverLogger = makeLogger({
		level: config.logging.level,
		pretty: config.logging.pretty,
		serviceName: config.logging.serviceName,
		environment: config.logging.environment,
		redactPaths: config.logging.redactPaths,
	});

	return serverLogger;
};

export const withLogContext = ({
	logger,
	bindings,
}: {
	logger: AppLogger;
	bindings: LogBindings;
}): AppLogger => logger.child(bindings);
