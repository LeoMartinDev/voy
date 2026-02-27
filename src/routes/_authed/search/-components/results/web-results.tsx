import { useLinkTarget } from "@/client/hooks/use-link-target";
import type {
	SearchResult,
	WebResultEntry,
} from "@/server/domain/value-objects";
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
			className="group relative flex flex-col gap-1 px-4 transition-opacity duration-200"
			style={{
				animationDelay: `${index * 50}ms`,
			}}
		>
			<a
				href={result.url}
				{...linkTargetProps}
				className="flex flex-col gap-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg"
			>
				<div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
					<div className="relative flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/40 shrink-0">
						<img
							src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
							alt=""
							className="h-2.5 w-2.5 object-contain opacity-85"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								e.currentTarget.parentElement?.classList.add("bg-primary/5");
							}}
						/>
					</div>
					<span className="truncate">{displayUrl}</span>
				</div>

				<h3 className="text-xl font-normal text-blue-700 dark:text-blue-300 group-hover:underline truncate leading-tight">
					{result.title}
				</h3>

				<p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
					{result.content}
				</p>
			</a>
		</article>
	);
}

export function WebResultsSkeleton() {
	return (
		<section
			className="flex flex-col gap-10 px-4"
			aria-label="Loading search results"
			aria-busy="true"
		>
			<div className="flex flex-col space-y-10">
				{[0, 1, 2, 3, 4].map((i) => (
					<div
						key={`web-skeleton-${i}`}
						className="flex flex-col gap-2"
						style={{
							animationDelay: `${i * 100}ms`,
						}}
					>
						<div className="flex flex-col gap-1">
							{/* Icon + URL */}
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
								<div className="h-3 w-32 rounded bg-muted/60 animate-pulse" />
							</div>

							{/* Title */}
							<div className="h-6 w-3/4 rounded bg-muted animate-pulse my-1" />

							{/* Snippet */}
							<div className="space-y-2">
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
			<section className="flex flex-col" aria-label="Search results">
				<div className="px-4">
					<ResultsHeader
						count={results.length}
						query={query}
						duration={searchResult?.duration}
						cached={searchResult?.cached}
						type="result"
					/>
				</div>

				<div className="flex flex-col space-y-10">
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
