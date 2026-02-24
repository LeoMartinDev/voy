import { createMistral } from "@ai-sdk/mistral";
import { streamText } from "ai";
import type {
	AISummaryProvider,
	GenerateSummaryInput,
	GenerateSummaryOutput,
} from "@/server/domain/ports";

interface MakeMistralSummaryAdapterOptions {
	apiKey: string;
}

function buildContext(results: GenerateSummaryInput["results"]): string {
	const topResults = results.slice(0, 7);
	return topResults
		.map(
			(
				result: { title: string; content: string; url: string },
				index: number,
			) =>
				`[${index + 1}] ${result.title}\n${result.content.substring(0, 516)}\nSource: ${result.url}`,
		)
		.join("\n\n");
}

export const makeMistralSummaryAdapter = ({
	apiKey,
}: MakeMistralSummaryAdapterOptions): AISummaryProvider => {
	const mistral = createMistral({
		apiKey,
	});

	return {
		generateSummary: async (
			input: GenerateSummaryInput,
		): Promise<GenerateSummaryOutput> => {
			const topResults = input.results.slice(0, 7);

			if (topResults.length === 0) {
				throw new Error("No results to summarize");
			}

			const context = buildContext(input.results);

			const result = streamText({
				model: mistral("mistral-medium-latest"),
				system: `You are a helpful search assistant. Provide a concise, accurate summary of the search results.
Use citations [1], [2], etc. to reference sources. No more than 2 citations per sentence.
Keep your response brief (2-4 sentences) and factual.
IMPORTANT: you must use proper markdown formatting, important words must be bolded, etc.
IMPORTANT: do not include informations that are not in the search results.
IMPORTANT: you must answer in the same language as the query.`,
				prompt: `Query: ${input.query}\n\nSearch Results:\n${context}\n\nProvide a summary with citations:`,
				temperature: 0.3,
				maxOutputTokens: 516,
			});

			let summary = "";
			for await (const textPart of result.textStream) {
				summary += textPart;
			}

			if (!summary.trim()) {
				throw new Error("Empty response from AI");
			}

			return { summary: summary.trim() };
		},
	};
};
