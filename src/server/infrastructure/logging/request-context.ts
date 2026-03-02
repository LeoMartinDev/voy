import {
	type AppLogger,
	withLogContext,
} from "@/server/infrastructure/logging/logger";

export const REQUEST_ID_HEADER = "x-request-id";

const getPathnameFromUrl = ({ url }: { url: string }): string => {
	try {
		return new URL(url).pathname;
	} catch {
		return "/";
	}
};

export const getOrCreateRequestId = ({
	headers,
}: {
	headers: Headers;
}): string => {
	const incomingRequestId = headers.get(REQUEST_ID_HEADER)?.trim();
	if (incomingRequestId) {
		return incomingRequestId;
	}

	return crypto.randomUUID();
};

export const createRequestContext = ({
	request,
	logger,
	operation,
}: {
	request: Request;
	logger: AppLogger;
	operation?: string;
}) => {
	const requestId = getOrCreateRequestId({ headers: request.headers });
	const pathname = getPathnameFromUrl({ url: request.url });
	const method = request.method.toUpperCase();
	const requestLogger = withLogContext({
		logger,
		bindings: {
			requestId,
			method,
			pathname,
			operation,
		},
	});

	return {
		requestId,
		pathname,
		method,
		logger: requestLogger,
	};
};

export const withRequestIdHeader = ({
	response,
	requestId,
}: {
	response: Response;
	requestId: string;
}): Response => {
	const headers = new Headers(response.headers);
	headers.set(REQUEST_ID_HEADER, requestId);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
};
