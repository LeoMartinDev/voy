export type ClientLogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface ClientLogger {
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
}

const LOG_LEVEL_PRIORITY: Record<ClientLogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
	silent: 100,
};

const getCanLogForLevel = ({
	currentLevel,
	targetLevel,
}: {
	currentLevel: ClientLogLevel;
	targetLevel: Exclude<ClientLogLevel, "silent">;
}): boolean => LOG_LEVEL_PRIORITY[targetLevel] >= LOG_LEVEL_PRIORITY[currentLevel];

const withScopePrefix = ({
	scope,
	args,
}: {
	scope: string;
	args: unknown[];
}): unknown[] => [`[${scope}]`, ...args];

export const makeClientLogger = ({
	scope,
	level,
}: {
	scope: string;
	level: ClientLogLevel;
}): ClientLogger => ({
	debug: (...args) => {
		if (getCanLogForLevel({ currentLevel: level, targetLevel: "debug" })) {
			console.debug(...withScopePrefix({ scope, args }));
		}
	},
	info: (...args) => {
		if (getCanLogForLevel({ currentLevel: level, targetLevel: "info" })) {
			console.info(...withScopePrefix({ scope, args }));
		}
	},
	warn: (...args) => {
		if (getCanLogForLevel({ currentLevel: level, targetLevel: "warn" })) {
			console.warn(...withScopePrefix({ scope, args }));
		}
	},
	error: (...args) => {
		if (getCanLogForLevel({ currentLevel: level, targetLevel: "error" })) {
			console.error(...withScopePrefix({ scope, args }));
		}
	},
});
