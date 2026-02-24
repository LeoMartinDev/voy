import type {
	AISummaryProvider,
	GenerateSummaryInput,
	GenerateSummaryOutput,
} from "@/server/domain/ports";

interface MakeGenerateSummaryUsecaseOptions {
	aiSummaryProvider: AISummaryProvider;
}

export const makeGenerateSummaryUsecase = ({
	aiSummaryProvider,
}: MakeGenerateSummaryUsecaseOptions) => {
	return async (
		input: GenerateSummaryInput,
	): Promise<GenerateSummaryOutput> => {
		return aiSummaryProvider.generateSummary(input);
	};
};

export type GenerateSummaryUsecase = ReturnType<
	typeof makeGenerateSummaryUsecase
>;
