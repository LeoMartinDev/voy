"use client";

import { useRouter } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSuggestions } from "@/client/hooks/use-suggestions";

interface SearchBarProps {
	variant?: "home" | "compact";
	initialQuery?: string;
	autoFocus?: boolean;
}

export function SearchBar({
	variant = "home",
	initialQuery = "",
	autoFocus = false,
}: SearchBarProps) {
	const { t } = useTranslation();
	const [query, setQuery] = useState(initialQuery);
	const [isFocused, setIsFocused] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const listboxId = useId();
	const inputId = useId();

	const { suggestions, fetchSuggestions, resetStickyState } = useSuggestions({
		debounceMs: 120,
		minLength: 2,
	});

	useEffect(() => {
		if (autoFocus) {
			inputRef.current?.focus();
		}
	}, [autoFocus]);

	useEffect(() => {
		function handleGlobalKeyDown(e: KeyboardEvent) {
			if (
				e.key === "/" &&
				!["INPUT", "TEXTAREA", "SELECT"].includes(
					(e.target as HTMLElement)?.tagName ?? "",
				) &&
				!(e.target as HTMLElement)?.isContentEditable
			) {
				e.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown);
		return () => window.removeEventListener("keydown", handleGlobalKeyDown);
	}, []);

	useEffect(() => {
		setQuery(initialQuery);
	}, [initialQuery]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsFocused(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = useCallback(
		(searchQuery: string) => {
			const trimmed = searchQuery.trim();
			if (!trimmed) return;
			router.navigate({
				to: "/search",
				search: (prev) => ({ ...prev, q: trimmed }),
			});
			window.scrollTo({ top: 0 });
			setIsFocused(false);
			resetStickyState();
		},
		[router, resetStickyState],
	);

	const handleQueryChange = useCallback(
		(newQuery: string) => {
			setQuery(newQuery);
			setSelectedIndex(-1);
			if (newQuery.trim().length >= 2) {
				fetchSuggestions(newQuery);
			} else {
				resetStickyState();
			}
		},
		[fetchSuggestions, resetStickyState],
	);

	type DropdownItem = { type: "suggestion"; label: string };

	const dropdownItems: DropdownItem[] = suggestions.map((s) => ({
		type: "suggestion" as const,
		label: s,
	}));

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < dropdownItems.length - 1 ? prev + 1 : 0,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev > 0 ? prev - 1 : dropdownItems.length - 1,
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (selectedIndex >= 0 && selectedIndex < dropdownItems.length) {
				setQuery(dropdownItems[selectedIndex].label);
				handleSearch(dropdownItems[selectedIndex].label);
			} else {
				handleSearch(query);
			}
		} else if (e.key === "Escape") {
			setIsFocused(false);
			inputRef.current?.blur();
		}
	}

	const hasItems = dropdownItems.length > 0;
	const isCompact = variant === "compact";
	const activeDescendant =
		selectedIndex >= 0 ? `${listboxId}-option-${selectedIndex}` : undefined;

	return (
		<div
			ref={containerRef}
			className={`relative w-full max-w-2xl group/search transition-all duration-250 ease-out ${
				isFocused ? "scale-[1.01]" : "scale-100"
			} ${isFocused ? "z-50" : "z-30"}`}
		>
			<div
				className={`
					relative flex items-center rounded-2xl border transition-all duration-300 ease-out overflow-hidden
					${
						isFocused
							? "border-primary/40 bg-background/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-primary/10"
							: "border-border/40 bg-background/50 shadow-sm hover:border-border/80 hover:bg-background/80 hover:shadow-md"
					}
					${isCompact ? "h-11" : "h-14"}
					backdrop-blur-xl
				`}
			>
				{/* Subtle animated gradient glow on focus */}
				<div
					className={`absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-700 ${
						isFocused ? "opacity-100" : ""
					}`}
				/>

				<div
					className={`
						pointer-events-none absolute flex items-center justify-center
						transition-all duration-300
						${isCompact ? "left-3" : "left-4"}
					`}
				>
					<Search
						className={`
							transition-colors duration-300
							${isFocused ? "text-primary" : "text-muted-foreground/70"}
							${isCompact ? "h-4 w-4" : "h-5 w-5"}
						`}
						aria-hidden="true"
					/>
				</div>

				<input
					id={inputId}
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => handleQueryChange(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onKeyDown={handleKeyDown}
					placeholder={t("search.placeholder")}
					className={`
						h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/50
						text-foreground transition-all duration-300
						${isCompact ? "pl-10 pr-20 text-sm" : "pl-12 pr-24 text-base"}
						font-normal tracking-wide
					`}
					aria-label="Search"
					role="combobox"
					aria-expanded={hasItems}
					aria-autocomplete="list"
					aria-controls={hasItems ? listboxId : undefined}
					aria-activedescendant={activeDescendant}
				/>

				<div
					className={`
						absolute flex items-center gap-1 transition-all duration-300
						${isCompact ? "right-1.5" : "right-2"}
					`}
				>
					<div
						className={`transition-all duration-200 ${query ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"}`}
					>
						<button
							type="button"
							onClick={() => {
								setQuery("");
								resetStickyState();
								inputRef.current?.focus();
							}}
							className={`
								flex items-center justify-center rounded-full
								text-muted-foreground/40 transition-all duration-200
								hover:bg-muted hover:text-foreground
								${isCompact ? "h-7 w-7" : "h-8 w-8"}
							`}
							aria-label="Clear search"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>

					<div className="w-px h-4 bg-border/40 mx-1" />

					<button
						type="button"
						onClick={() => handleSearch(query)}
						disabled={!query.trim()}
						className={`
							flex items-center justify-center rounded-lg
							transition-all duration-300
							disabled:opacity-30 disabled:cursor-not-allowed
							enabled:hover:bg-primary/10 enabled:hover:text-primary enabled:active:scale-95
							${isCompact ? "h-7 w-8" : "h-9 w-10"}
						`}
						aria-label="Submit search"
					>
						<ArrowRight
							className={`transition-transform duration-300 ${query.trim() ? "group-hover/search:translate-x-0.5" : ""} ${isCompact ? "h-4 w-4" : "h-5 w-5"}`}
						/>
					</button>
				</div>
			</div>

			{/* Suggestions Dropdown */}
			<div
				className={`
					absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl
					border border-border/40 bg-background/95 backdrop-blur-2xl
					shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]
					transition-all duration-200 origin-top
					${hasItems && isFocused ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none"}
				`}
			>
				{isFocused && (
					<div
						id={listboxId}
						role="listbox"
						aria-label="Search suggestions"
						className="py-1.5"
					>
						{suggestions.length > 0 && (
							<div className="px-1.5">
								{suggestions.map((item, idx) => (
									<button
										key={`suggestion-${item}`}
										id={`${listboxId}-option-${idx}`}
										role="option"
										aria-selected={selectedIndex === idx}
										type="button"
										onClick={() => {
											setQuery(item);
											handleSearch(item);
										}}
										className={`
											flex w-full items-center gap-3 rounded-lg px-3 py-2.5
											text-left group transition-colors duration-150
											${
												selectedIndex === idx
													? "bg-muted/70 text-foreground"
													: "text-muted-foreground/80 hover:bg-muted/40 hover:text-foreground"
											}
										`}
									>
										<Search
											className={`h-3.5 w-3.5 ${selectedIndex === idx ? "text-primary" : "text-muted-foreground/50"}`}
											aria-hidden="true"
										/>

										<span className="flex-1 text-sm font-medium truncate">
											{/* Highlight matching part logic could go here */}
											{item}
										</span>

										{selectedIndex === idx && (
											<span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium px-1.5">
												Select
											</span>
										)}
									</button>
								))}
							</div>
						)}

						{suggestions.length > 0 && (
							<div className="mt-1 border-t border-border/30 px-4 py-2 bg-muted/20">
								<div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
									<span>{t("shortcuts.suggestion")}</span>
									<div className="flex gap-3">
										<span className="flex items-center gap-1">
											<kbd className="font-sans">↑↓</kbd>{" "}
											{t("shortcuts.toNavigate")}
										</span>
										<span className="flex items-center gap-1">
											<kbd className="font-sans">↵</kbd>{" "}
											{t("shortcuts.toSearch")}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
