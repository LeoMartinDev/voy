"use client";

import { getRouteApi } from "@tanstack/react-router";

const rootRoute = getRouteApi("__root__");

interface SearchLogoProps {
	size?: "sm" | "lg";
}

export function SearchLogo({ size = "lg" }: SearchLogoProps) {
	const { instanceName } = rootRoute.useLoaderData();

	return (
		<div className="flex items-center gap-3 group/logo select-none">
			<div
				className={`
					relative flex items-center justify-center rounded-xl overflow-hidden
					bg-primary/5 ring-1 ring-primary/10
					transition-all duration-500 ease-out
					group-hover/logo:bg-primary/10 group-hover/logo:ring-primary/20 group-hover/logo:scale-105
					${size === "lg" ? "h-11 w-11" : "h-9 w-9"}
				`}
			>
				<img
					src="/logo.jpg"
					alt="Logo"
					className={`
						h-full w-full object-cover
						transition-all duration-500 ease-out
						group-hover/logo:rotate-12 group-hover/logo:scale-110
					`}
				/>
			</div>

			<div className="flex flex-col justify-center">
				<span
					className={`
						font-bold tracking-tight text-foreground/90 leading-none
						transition-colors duration-300 group-hover/logo:text-foreground
						${size === "lg" ? "text-xl" : "text-base"}
					`}
				>
					{instanceName}
				</span>

				{size === "lg" && (
					<span className="text-[10px] tracking-widest uppercase text-muted-foreground/60 font-semibold mt-1">
						Private Search
					</span>
				)}
			</div>
		</div>
	);
}
