"use client";

import {
	FileArchive,
	FileAudio,
	FileIcon,
	FileSpreadsheet,
	FileText,
	FileType,
	FileVideo,
} from "lucide-react";
import { useLinkTarget } from "@/client/hooks/use-link-target";
import type { FileResultEntry } from "@/server/domain/value-objects";
import { ResultsHeader } from "./results-header";

interface FileResultsLayoutProps {
	query: string;
	results: FileResultEntry[];
	duration: number;
	cached?: boolean;
}

const FILE_CONFIG: Record<
	string,
	{
		icon: typeof FileIcon;
		color: string;
		bg: string;
		label: string;
	}
> = {
	".pdf": {
		icon: FileText,
		color: "text-red-600",
		bg: "bg-red-50 dark:bg-red-950/30",
		label: "PDF",
	},
	".doc": {
		icon: FileText,
		color: "text-blue-600",
		bg: "bg-blue-50 dark:bg-blue-950/30",
		label: "DOC",
	},
	".docx": {
		icon: FileText,
		color: "text-blue-600",
		bg: "bg-blue-50 dark:bg-blue-950/30",
		label: "DOCX",
	},
	".xls": {
		icon: FileSpreadsheet,
		color: "text-green-600",
		bg: "bg-green-50 dark:bg-green-950/30",
		label: "XLS",
	},
	".xlsx": {
		icon: FileSpreadsheet,
		color: "text-green-600",
		bg: "bg-green-50 dark:bg-green-950/30",
		label: "XLSX",
	},
	".ppt": {
		icon: FileType,
		color: "text-orange-600",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		label: "PPT",
	},
	".pptx": {
		icon: FileType,
		color: "text-orange-600",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		label: "PPTX",
	},
	".zip": {
		icon: FileArchive,
		color: "text-yellow-600",
		bg: "bg-yellow-50 dark:bg-yellow-950/30",
		label: "ZIP",
	},
	".rar": {
		icon: FileArchive,
		color: "text-yellow-600",
		bg: "bg-yellow-50 dark:bg-yellow-950/30",
		label: "RAR",
	},
	".mp3": {
		icon: FileAudio,
		color: "text-purple-600",
		bg: "bg-purple-50 dark:bg-purple-950/30",
		label: "MP3",
	},
	".mp4": {
		icon: FileVideo,
		color: "text-pink-600",
		bg: "bg-pink-50 dark:bg-pink-950/30",
		label: "MP4",
	},
};

function getFileConfig(extension: string) {
	return (
		FILE_CONFIG[extension] ?? {
			icon: FileIcon,
			color: "text-muted-foreground",
			bg: "bg-muted/50",
			label: extension.toUpperCase().slice(1),
		}
	);
}

interface FileCardProps {
	result: FileResultEntry;
	index: number;
	linkTargetProps: {
		target?: "_blank";
		rel?: string;
	};
}

function FileCard({ result, index, linkTargetProps }: FileCardProps) {
	const hostname = (() => {
		try {
			return new URL(result.url).hostname;
		} catch {
			return "";
		}
	})();

	const config = getFileConfig(result.extension ?? "");
	const Icon = config.icon;

	return (
		<a
			href={result.url}
			{...linkTargetProps}
			className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-border/50 hover:bg-muted/50 hover:shadow-sm"
			style={{
				animationDelay: `${index * 50}ms`,
			}}
		>
			<div
				className={`
					flex h-12 w-12 shrink-0 items-center justify-center rounded-lg
					${config.bg} ring-1 ring-border/50
					transition-all duration-300 group-hover:scale-105 group-hover:shadow-md
				`}
			>
				<Icon className={`h-6 w-6 ${config.color}`} />
			</div>

			<div className="flex flex-col gap-1 min-w-0 flex-1">
				<div className="flex items-center gap-2 mb-0.5">
					<span className="text-xs text-muted-foreground">{hostname}</span>
					{result.extension && (
						<span
							className={`
								inline-flex items-center rounded-md px-1.5 py-0.5
								text-[10px] font-bold uppercase tracking-wide
								${config.bg} ${config.color}
								ring-1 ring-border/30
							`}
						>
							{config.label}
						</span>
					)}
				</div>

				<h2 className="text-lg font-medium text-blue-700 dark:text-blue-300 group-hover:underline leading-tight line-clamp-2">
					{result.title}
				</h2>

				<p className="text-xs text-green-700 dark:text-green-400 truncate opacity-80">
					{result.url}
				</p>
			</div>
		</a>
	);
}

export function FileResultsSkeleton() {
	return (
		<section
			className="flex flex-col gap-8"
			aria-label="Loading file results"
			aria-busy="true"
		>
			<div className="flex items-center gap-3">
				<div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
				<div className="h-4 w-20 rounded-lg bg-muted animate-pulse [animation-delay:100ms]" />
			</div>

			<div className="flex flex-col">
				{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
					<div
						key={`file-skeleton-${i}`}
						className="flex items-start gap-4 rounded-xl border border-transparent p-4"
						style={{
							animationDelay: `${i * 100}ms`,
						}}
					>
						<div className="h-12 w-12 shrink-0 rounded-lg bg-muted animate-pulse" />

						<div className="flex flex-col gap-2 min-w-0 flex-1 py-1">
							<div className="flex items-center gap-2">
								<div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
								<div className="h-4 w-10 rounded bg-muted animate-pulse" />
							</div>

							<div className="h-5 w-3/4 rounded-md bg-muted animate-pulse" />

							<div className="h-3 w-full rounded-md bg-muted/70 animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function FileResults({
	query,
	results,
	duration,
	cached,
}: FileResultsLayoutProps) {
	const linkTargetProps = useLinkTarget();

	if (results.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
					<FileIcon className="h-8 w-8 text-muted-foreground/40" />
				</div>
				<h3 className="text-base font-medium text-foreground">
					No files found
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Try adjusting your search terms
				</p>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-6" aria-label="File search results">
			<div className="mb-4 px-4">
				<ResultsHeader
					count={results.length}
					query={query}
					duration={duration}
					cached={cached}
					type="file"
				/>
			</div>

			<div className="flex flex-col">
				{results.map((result, i) => (
					<FileCard
						key={`${i}-${result.url}`}
						result={result}
						index={i}
						linkTargetProps={linkTargetProps}
					/>
				))}
			</div>
		</section>
	);
}
