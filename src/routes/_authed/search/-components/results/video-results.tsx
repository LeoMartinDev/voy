import { ExternalLink, Play, Video } from "lucide-react";
import { useState } from "react";
import { useLinkTarget } from "@/client/hooks/use-link-target";
import type { VideoResultEntry } from "@/server/domain/value-objects";
import { ResultsHeader } from "./results-header";

interface VideoResultsProps {
	query: string;
	results: VideoResultEntry[];
	duration: number;
	cached?: boolean;
}

interface VideoCardProps {
	result: VideoResultEntry;
	linkTargetProps: { target?: "_blank"; rel?: string };
}

function VideoCard({ result, linkTargetProps }: VideoCardProps) {
	const [embedActive, setEmbedActive] = useState(false);
	const [thumbnailError, setThumbnailError] = useState(false);

	const hostname = (() => {
		try {
			return new URL(result.url).hostname;
		} catch {
			return "";
		}
	})();

	const formattedDate = result.publishedDate
		? new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			}).format(result.publishedDate)
		: null;

	if (embedActive && result.iframeSrc) {
		return (
			<div className="flex flex-col gap-2">
				<div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border/30">
					<iframe
						src={result.iframeSrc}
						title={result.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						className="h-full w-full"
					/>
				</div>
				<div className="px-1">
					<a
						href={result.url}
						{...linkTargetProps}
						className="text-sm font-medium text-foreground hover:underline line-clamp-2"
					>
						{result.title}
					</a>
					{hostname && (
						<p className="mt-0.5 text-xs text-muted-foreground">{hostname}</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/30 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/10"
				onClick={() => result.iframeSrc && setEmbedActive(true)}
				aria-label={`Play ${result.title}`}
			>
				{result.thumbnail && !thumbnailError ? (
					<img
						src={result.thumbnail}
						alt={result.title}
						loading="lazy"
						decoding="async"
						onError={() => setThumbnailError(true)}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted/50">
						<Video className="h-10 w-10 text-muted-foreground/30" />
					</div>
				)}

				<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				{result.iframeSrc ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 ring-2 ring-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
							<Play className="h-6 w-6 fill-white text-white" />
						</div>
					</div>
				) : (
					<a
						href={result.url}
						{...linkTargetProps}
						className="absolute inset-0 flex items-center justify-center"
						onClick={(e) => e.stopPropagation()}
						aria-label={`Open ${result.title}`}
					>
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 ring-2 ring-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
							<ExternalLink className="h-6 w-6 text-white" />
						</div>
					</a>
				)}
			</button>

			<div className="px-1">
				<a
					href={result.url}
					{...linkTargetProps}
					className="text-sm font-medium text-foreground hover:underline line-clamp-2"
				>
					{result.title}
				</a>
				<div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
					{hostname && <span>{hostname}</span>}
					{hostname && formattedDate && <span>·</span>}
					{formattedDate && <span>{formattedDate}</span>}
				</div>
				{result.content && (
					<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
						{result.content}
					</p>
				)}
			</div>
		</div>
	);
}

const SKELETON_IDS = Array.from({ length: 12 }, (_, i) => `sk-${i}`);

export function VideoResultsSkeleton() {
	return (
		<section
			className="flex flex-col gap-8"
			aria-label="Loading video results"
			aria-busy="true"
		>
			<div className="flex items-center gap-3">
				<div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
				<div className="h-4 w-20 rounded-lg bg-muted animate-pulse [animation-delay:100ms]" />
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{SKELETON_IDS.map((id, i) => (
					<div key={id} className="flex flex-col gap-2">
						<div
							className="aspect-video overflow-hidden rounded-2xl bg-muted/50"
							style={{ animationDelay: `${i * 50}ms` }}
						>
							<div className="h-full w-full animate-pulse bg-muted" />
						</div>
						<div className="space-y-1.5 px-1">
							<div
								className="h-3.5 w-4/5 rounded-md bg-muted animate-pulse"
								style={{ animationDelay: `${i * 50 + 50}ms` }}
							/>
							<div
								className="h-3 w-1/3 rounded-md bg-muted animate-pulse"
								style={{ animationDelay: `${i * 50 + 100}ms` }}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function VideoResults({
	query,
	results,
	duration,
	cached,
}: VideoResultsProps) {
	const linkTargetProps = useLinkTarget();

	if (results.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
					<Video className="h-8 w-8 text-muted-foreground/40" />
				</div>
				<h3 className="text-base font-medium text-foreground">
					No videos found
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Try adjusting your search terms
				</p>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-6" aria-label="Video search results">
			<div className="px-1 sm:px-4">
				<ResultsHeader
					count={results.length}
					query={query}
					duration={duration}
					cached={cached}
					type="video"
				/>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{results.map((result, i) => (
					<VideoCard
						key={`${i}-${result.url}`}
						result={result}
						linkTargetProps={linkTargetProps}
					/>
				))}
			</div>
		</section>
	);
}
