import { useLinkTarget } from "@/client/hooks/use-link-target";
import type {
	SearchResult,
	WebResultEntry,
} from "@/server/domain/value-objects";
import { AISummary } from "../ai-summary";
import { ResultsHeader } from "./results-header";

interface WebResultsLayoutProps {
	query: string;
	results: WebResultEntry[] | undefined;
	searchResult: SearchResult | undefined;
}

function ResultCard({
	result,
	index,
	linkTargetProps,
}: {
	result: WebResultEntry;
	index: number;
	linkTargetProps: {
		target?: "_blank";
		rel?: string;
	};
}) {
	const hostname = (() => {
		try {
			return new URL(result.url).hostname;
		} catch {
			return result.url;
		}
	})();

	const displayUrl = (() => {
		try {
			const url = new URL(result.url);
			return `${url.hostname}${url.pathname !== "/" ? url.pathname : ""}`;
		} catch {
			return result.url;
		}
	})();

	return (
		<article
			className="group relative rounded-2xl transition-all duration-300 hover:bg-muted/60 hover:shadow-sm -mx-4 px-4 py-4"
			style={{
				animationDelay: `${index * 50}ms`,
			}}
		>
			<a
				href={result.url}
				{...linkTargetProps}
				className="flex flex-col gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
			>
				<div className="flex items-center gap-3 mb-1">
					<div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/40 shrink-0">
						<img
							src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
							alt=""
							className="h-4 w-4 object-contain opacity-85 transition-opacity group-hover:opacity-100"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								e.currentTarget.parentElement?.classList.add("bg-primary/5");
							}}
						/>
					</div>

					<div className="flex flex-col min-w-0">
						<span className="text-md font-medium text-foreground/90 truncate">
							{result.title}
						</span>
						<span className="text-[11px] text-muted-foreground truncate">
							{displayUrl}
						</span>
					</div>
				</div>

				<div className="pl-[40px]">
					<p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
						{result.content}
					</p>
				</div>
			</a>
		</article>
	);
}

export function WebResultsSkeleton() {
	return (
		<section
			className="flex flex-col gap-6"
			aria-label="Loading search results"
			aria-busy="true"
		>
			<div className="flex flex-col space-y-6">
				{[0, 1, 2, 3, 4].map((i) => (
					<div
						key={`web-skeleton-${i}`}
						className="rounded-2xl p-4 -mx-4"
						style={{
							animationDelay: `${i * 100}ms`,
						}}
					>
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-3">
								<div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
								<div className="flex flex-col gap-1.5 flex-1">
									<div className="h-3.5 w-48 rounded bg-muted animate-pulse" />
									<div className="h-2.5 w-32 rounded bg-muted/60 animate-pulse" />
								</div>
							</div>

							<div className="pl-[40px] space-y-2">
								<div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
								<div className="h-3 w-[90%] rounded bg-muted/40 animate-pulse" />
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function WebResults({
	query,
	results,
	searchResult,
}: WebResultsLayoutProps) {
	const linkTargetProps = useLinkTarget();

	if (!results || results.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-6 w-full max-w-3xl">
			<AISummary query={query} results={searchResult} />

			<section className="flex flex-col" aria-label="Search results">
				<div className="mb-4 px-1">
					<ResultsHeader
						count={results.length}
						query={query}
						duration={searchResult?.duration}
						cached={searchResult?.cached}
						type="result"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					{results.map((result, i) => (
						<ResultCard
							key={`${i}-${result.url}`}
							result={result}
							index={i}
							linkTargetProps={linkTargetProps}
						/>
					))}
				</div>
			</section>
		</div>
	);
}
