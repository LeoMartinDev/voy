export const TimeRange = {
	ALL: "all",
	DAY: "day",
	MONTH: "month",
	YEAR: "year",
} as const;

export type TimeRange = (typeof TimeRange)[keyof typeof TimeRange];

export const SafeSearch = {
	MODERATE: "moderate",
	STRICT: "strict",
	OFF: "off",
} as const;

export type SafeSearch = (typeof SafeSearch)[keyof typeof SafeSearch];

export const SearchCategory = {
	WEB: "web",
	IMAGES: "images",
	FILES: "files",
	VIDEOS: "videos",
} as const;

export type SearchCategory =
	(typeof SearchCategory)[keyof typeof SearchCategory];

export const ResultType = {
	WEB: "web",
	IMAGE: "image",
	FILE: "file",
	VIDEO: "video",
} as const;

export type ResultType = (typeof ResultType)[keyof typeof ResultType];

interface BaseResultEntry {
	title: string;
	url: string;
}

export interface WebResultEntry extends BaseResultEntry {
	type: typeof ResultType.WEB;
	content: string;
	publishedDate: Date | undefined;
}

export interface ImageResultEntry extends BaseResultEntry {
	type: typeof ResultType.IMAGE;
	imageSrc: string;
	thumbnail: string | undefined;
}

export interface FileResultEntry extends BaseResultEntry {
	type: typeof ResultType.FILE;
	extension: string;
}

export interface VideoResultEntry extends BaseResultEntry {
	type: typeof ResultType.VIDEO;
	thumbnail: string | undefined;
	iframeSrc: string | undefined;
	content: string;
	publishedDate: Date | undefined;
}

export type SearchResultEntry =
	| WebResultEntry
	| ImageResultEntry
	| FileResultEntry
	| VideoResultEntry;

export function isWebResult(
	result: SearchResultEntry,
): result is WebResultEntry {
	return result.type === ResultType.WEB;
}

export function isImageResult(
	result: SearchResultEntry,
): result is ImageResultEntry {
	return result.type === ResultType.IMAGE;
}

export function isFileResult(
	result: SearchResultEntry,
): result is FileResultEntry {
	return result.type === ResultType.FILE;
}

export function isVideoResult(
	result: SearchResultEntry,
): result is VideoResultEntry {
	return result.type === ResultType.VIDEO;
}

export interface SearchInput {
	query: string;
	category?: SearchCategory;
	timeRange?: TimeRange;
	locale?: string;
	safeSearch?: SafeSearch;
}

export type BaseSearchResult = {
	results: SearchResultEntry[];
	count: number;
};

export type SearchResult = BaseSearchResult & {
	duration: number; // in milliseconds
	cached?: boolean;
};

export interface SuggestInput {
	query: string;
	limit?: number;
}

export type SuggestResult = {
	suggestions: string[];
};
