"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/client/hooks/use-mobile";

export function KeyboardHints({ onSlashPress }: { onSlashPress?: () => void }) {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
	const callbackRef = useRef(onSlashPress);

	// Keep callback ref up-to-date without re-registering the listener
	useEffect(() => {
		callbackRef.current = onSlashPress;
	}, [onSlashPress]);

	const handler = useCallback((e: KeyboardEvent) => {
		if (
			e.key === "/" &&
			!["INPUT", "TEXTAREA", "SELECT"].includes(
				(e.target as HTMLElement)?.tagName ?? "",
			) &&
			!(e.target as HTMLElement)?.isContentEditable
		) {
			e.preventDefault();
			callbackRef.current?.();
		}
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [handler]);

	if (isMobile) return null;

	return (
		<div
			className="flex items-center gap-4 text-xs text-muted-foreground"
			aria-hidden="true"
		>
			<span className="flex items-center gap-1.5">
				<kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
					/
				</kbd>
				<span>{t("shortcuts.toSearch")}</span>
			</span>
			<span className="flex items-center gap-1.5">
				<kbd className="inline-flex h-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
					Esc
				</kbd>
				<span>{t("shortcuts.toClose")}</span>
			</span>
		</div>
	);
}
