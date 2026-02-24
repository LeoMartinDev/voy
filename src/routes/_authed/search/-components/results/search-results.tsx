import { Compass, Lightbulb, SearchX } from "lucide-react";
import type { SearchResult } from "@/server/domain/value-objects";
import {
	isFileResult,
	isImageResult,
	isWebResult,
} from "@/server/domain/value-objects";
import { FileResults } from "./file-results";
import { ImageResults } from "./image-results";
import { WebResults } from "./web-results";

interface SearchResultsProps {
	query: string;
	results: SearchResult | undefined;
}

function EmptyState({ query }: { query: string }) {
	const suggestions = [
		"Try using more general keywords",
		"Check your spelling",
		"Use fewer or different keywords",
		"Try synonyms for your search terms",
	];

	return (
		<section
			className="flex flex-col items-center justify-center py-16 px-4"
			aria-label="Search results"
		>
			<div className="flex flex-col items-center text-center max-w-md">
				<div className="relative mb-6">
					<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-muted/80 to-muted/40 ring-1 ring-border/50">
						<SearchX
							className="h-10 w-10 text-muted-foreground/60"
							aria-hidden="true"
						/>
					</div>
					<div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-1 ring-border/50">
						<Compass className="h-4 w-4 text-muted-foreground" />
					</div>
				</div>

				<h2 className="text-xl font-semibold text-foreground mb-2">
					No results found
				</h2>

				<p className="text-muted-foreground mb-6">
					We couldn&apos;t find anything matching{" "}
					<span className="font-medium text-foreground italic">"{query}"</span>
				</p>

				<div className="w-full rounded-2xl border border-border/50 bg-muted/30 p-5 text-left">
					<div className="flex items-center gap-2 mb-4">
						<Lightbulb className="h-4 w-4 text-amber-500" />
						<h3 className="text-sm font-medium text-foreground">Search tips</h3>
					</div>

					<ul className="space-y-3">
						{suggestions.map((suggestion) => (
							<li
								key={suggestion}
								className="flex items-start gap-3 text-sm text-muted-foreground"
							>
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
									{suggestions.indexOf(suggestion) + 1}
								</span>
								{suggestion}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

export function SearchResults({ query, results }: SearchResultsProps) {
	const firstResult = results?.results[0];

	if (!results || results?.results.length === 0 || firstResult === undefined) {
		return <EmptyState query={query} />;
	}

	if (isImageResult(firstResult)) {
		return (
			<ImageResults
				query={query}
				results={results.results.filter(isImageResult)}
				duration={results.duration}
				cached={results.cached}
			/>
		);
	}

	if (isFileResult(firstResult)) {
		return (
			<FileResults
				query={query}
				results={results.results.filter(isFileResult)}
				duration={results.duration}
				cached={results.cached}
			/>
		);
	}

	if (isWebResult(firstResult)) {
		return (
			<WebResults
				query={query}
				results={results?.results.filter(isWebResult)}
				searchResult={results}
			/>
		);
	}

	return null;
}
