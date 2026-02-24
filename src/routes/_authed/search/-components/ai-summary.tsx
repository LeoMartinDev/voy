"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Markdown } from "@/client/components/ui/markdown";
import { useAISummary } from "@/client/hooks/use-ai-summary";
import type { SearchResult } from "@/server/domain/value-objects";
import { isWebResult } from "@/server/domain/value-objects";
import { userSettingsQueryOptions } from "@/server/infrastructure/functions/user-settings";

interface AISummaryProps {
	query: string;
	results: SearchResult | undefined;
}

function processCitations(
	summary: string,
	results: SearchResult | undefined,
): string {
	if (!results) return summary;

	const webResults = results.results.filter(isWebResult).slice(0, 10);
	if (webResults.length === 0) return summary;

	// Replace [1], [2], etc. with markdown links
	return summary.replace(/\[(\d+)\]/g, (match, numStr) => {
		const citationNumber = Number.parseInt(numStr, 10);
		const resultIndex = citationNumber - 1;

		if (resultIndex >= 0 && resultIndex < webResults.length) {
			// We'll handle the link click in the markdown component
			return `[${numStr}](${webResults[resultIndex].url})`;
		}
		return match;
	});
}

export function AISummary({ query, results }: AISummaryProps) {
	const { data: userSettings } = useQuery(userSettingsQueryOptions);
	const openInNewTab = userSettings?.openInNewTab ?? true;

	const {
		summary,
		isLoading: isSummaryLoading,
		isError,
	} = useAISummary({
		query,
		results,
		enabled: userSettings?.enableAiSummary ?? false,
	});

	const isLoading = isSummaryLoading;

	if (!isLoading && !summary && !isError) return null;
	if (isError) return null; // Hide on error to not clutter

	const processedSummary = summary ? processCitations(summary, results) : "";

	return (
		<section
			className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 backdrop-blur-xl transition-all duration-500"
			aria-label="AI summary"
		>
			{/* Decorative gradient blob */}
			<div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

			<div className="relative p-5 sm:p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm">
						<Sparkles className="h-4 w-4" />
					</div>
					<h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
						AI Overview
						{isLoading && (
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
							</span>
						)}
					</h3>
				</div>

				<div className="pl-0 sm:pl-11">
					{isLoading ? (
						<div className="space-y-3 max-w-2xl">
							<div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
							<div className="h-4 bg-muted/50 rounded w-[90%] animate-pulse delay-75" />
							<div className="h-4 bg-muted/50 rounded w-[95%] animate-pulse delay-150" />
						</div>
					) : (
						<div className="prose prose-sm prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground/90">
							<Markdown
								content={processedSummary}
								openInNewTab={openInNewTab}
							/>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
