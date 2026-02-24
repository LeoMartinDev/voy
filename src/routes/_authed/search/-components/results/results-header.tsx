"use client";

import { Zap } from "lucide-react";

interface ResultsHeaderProps {
	count: number;
	query: string;
	duration?: number;
	cached?: boolean;
	type?: "result" | "image" | "file";
}

export function ResultsHeader({
	count,
	query,
	duration,
	cached,
	type = "result",
}: ResultsHeaderProps) {
	const typeLabel =
		type === "image" ? "image" : type === "file" ? "file" : "result";
	const pluralLabel = count !== 1 ? `${typeLabel}s` : typeLabel;

	const formatDuration = (ms: number): string => {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	};

	return (
		<div className="flex items-center gap-2 mb-6">
			<p className="text-sm text-muted-foreground">
				<span className="font-semibold text-foreground">{count}</span>{" "}
				{pluralLabel} for <span className="text-foreground">"{query}"</span>
			</p>
			{cached ? (
				<span className="flex items-center gap-1 text-sm text-muted-foreground/50">
					· <Zap className="h-3 w-3" /> Cached
				</span>
			) : (
				duration !== undefined && (
					<span className="text-sm text-muted-foreground/50">
						· {formatDuration(duration)}
					</span>
				)
			)}
		</div>
	);
}
