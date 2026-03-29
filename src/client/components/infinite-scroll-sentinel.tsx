import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
	onVisible: () => void;
	loading: boolean;
}

export function InfiniteScrollSentinel({
	onVisible,
	loading,
}: InfiniteScrollSentinelProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !loading) {
					onVisible();
				}
			},
			{ rootMargin: "200px" },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [onVisible, loading]);

	return (
		<div ref={ref} className="flex justify-center py-8">
			{loading ? (
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
			) : (
				<button
					type="button"
					onClick={onVisible}
					className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-muted/40"
				>
					Load more
				</button>
			)}
		</div>
	);
}
