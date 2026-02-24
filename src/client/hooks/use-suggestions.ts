"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSuggestionsOptions {
	debounceMs?: number;
	minLength?: number;
}

export function useSuggestions({
	debounceMs = 200,
	minLength = 2,
}: UseSuggestionsOptions = {}) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasHadSuggestionsRef = useRef(false);

	const fetchSuggestions = useCallback(
		async (query: string) => {
			if (query.trim().length < minLength) {
				setSuggestions([]);
				return;
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();

			try {
				setIsLoading(true);
				const params = new URLSearchParams({ q: query, limit: "6" });
				const response = await fetch(`/api/suggest?${params.toString()}`, {
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					throw new Error("Failed to fetch suggestions");
				}

				const data = await response.json();
				const newSuggestions =
					Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];

				if (newSuggestions.length > 0) {
					hasHadSuggestionsRef.current = true;
					setSuggestions(newSuggestions.slice(0, 6));
				} else if (!hasHadSuggestionsRef.current) {
					setSuggestions([]);
				}
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					console.error("Failed to fetch suggestions:", error);
					if (!hasHadSuggestionsRef.current) {
						setSuggestions([]);
					}
				}
			} finally {
				setIsLoading(false);
			}
		},
		[minLength],
	);

	const debouncedFetch = useCallback(
		(query: string) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			if (query.trim().length < minLength) {
				setSuggestions([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			timeoutRef.current = setTimeout(() => {
				fetchSuggestions(query);
			}, debounceMs);
		},
		[debounceMs, minLength, fetchSuggestions],
	);

	const clearSuggestions = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		setSuggestions([]);
		setIsLoading(false);
	}, []);

	const resetStickyState = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		setSuggestions([]);
		setIsLoading(false);
		hasHadSuggestionsRef.current = false;
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return {
		suggestions,
		isLoading,
		fetchSuggestions: debouncedFetch,
		clearSuggestions,
		resetStickyState,
	};
}
