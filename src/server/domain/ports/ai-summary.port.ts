import type { WebResultEntry } from "../value-objects/search.vo";

export interface GenerateSummaryInput {
	query: string;
	results: WebResultEntry[];
}

export interface GenerateSummaryOutput {
	summary: string;
}

export interface AISummaryProvider {
	generateSummary: (
		input: GenerateSummaryInput,
	) => Promise<GenerateSummaryOutput>;
}
