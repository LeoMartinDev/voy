"use client";

import { ExternalLink, ImageIcon, Maximize2 } from "lucide-react";
import { useLinkTarget } from "@/client/hooks/use-link-target";
import type { ImageResultEntry } from "@/server/domain/value-objects";
import { ResultsHeader } from "./results-header";

interface ImageResultsLayoutProps {
	query: string;
	results: ImageResultEntry[];
	duration: number;
	cached?: boolean;
}

interface ImageCardProps {
	result: ImageResultEntry;
	linkTargetProps: {
		target?: "_blank";
		rel?: string;
	};
	index: number;
}

function ImageCard({ result, linkTargetProps, index }: ImageCardProps) {
	const hostname = (() => {
		try {
			return new URL(result.url).hostname;
		} catch {
			return "";
		}
	})();

	return (
		<a
			href={result.imageSrc || result.url}
			{...linkTargetProps}
			className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/30 transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/10"
			style={{
				animationDelay: `${index * 30}ms`,
			}}
		>
			<img
				src={result.thumbnail || result.imageSrc || undefined}
				alt={result.title}
				loading="lazy"
				decoding="async"
				onError={(e) => {
					e.currentTarget.src = "/placeholder.svg";
				}}
				className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
			/>

			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			<div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
				<div className="p-4 pt-12">
					<p className="text-sm font-medium text-white line-clamp-2 leading-snug">
						{result.title}
					</p>
					{hostname && (
						<p className="mt-1 text-xs text-white/60 truncate">{hostname}</p>
					)}
				</div>
			</div>

			<div className="absolute right-3 top-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white/30">
						<Maximize2 className="h-4 w-4 text-white" />
					</div>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white/30">
						<ExternalLink className="h-4 w-4 text-white" />
					</div>
				</div>
			</div>
		</a>
	);
}

const SKELETON_IDS = Array.from({ length: 20 }, (_, i) => `sk-${i}`);

export function ImageResultsSkeleton() {
	return (
		<section
			className="flex flex-col gap-8"
			aria-label="Loading image results"
			aria-busy="true"
		>
			<div className="flex items-center gap-3">
				<div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
				<div className="h-4 w-20 rounded-lg bg-muted animate-pulse [animation-delay:100ms]" />
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
				{SKELETON_IDS.map((id, i) => (
					<div
						key={id}
						className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted/50"
						style={{
							animationDelay: `${i * 50}ms`,
						}}
					>
						<div className="h-full w-full animate-pulse bg-muted" />
					</div>
				))}
			</div>
		</section>
	);
}

export function ImageResults({
	query,
	results,
	duration,
	cached,
}: ImageResultsLayoutProps) {
	const linkTargetProps = useLinkTarget();

	if (results.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
					<ImageIcon className="h-8 w-8 text-muted-foreground/40" />
				</div>
				<h3 className="text-base font-medium text-foreground">
					No images found
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Try adjusting your search terms
				</p>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-6" aria-label="Image search results">
			<ResultsHeader
				count={results.length}
				query={query}
				duration={duration}
				cached={cached}
				type="image"
			/>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
				{results.map((result, i) => (
					<ImageCard
						key={`${i}-${result.url}`}
						result={result}
						linkTargetProps={linkTargetProps}
						index={i}
					/>
				))}
			</div>
		</section>
	);
}
