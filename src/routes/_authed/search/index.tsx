import {
	createFileRoute,
	getRouteApi,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";

const rootRoute = getRouteApi("__root__");

import { zodValidator } from "@tanstack/zod-adapter";
import { Home, Lock, RefreshCcw, SearchX } from "lucide-react";
import {
	Component,
	type ReactNode,
	Suspense,
	startTransition,
	useEffect,
	useId,
	useOptimistic,
} from "react";
import z from "zod";

import { SearchBar } from "@/client/components/search-bar";
import { SearchLogo } from "@/client/components/search-logo";
import { ThemeToggle } from "@/client/components/theme-toggle";
import { Button } from "@/client/components/ui/button";
import { UserDropdown } from "@/client/components/user-dropdown";
import { searchQueryOptions, useSearch } from "@/client/hooks/use-search";
import {
	SearchCategory,
	type SearchCategory as SearchCategoryType,
	TimeRange,
	type TimeRange as TimeRangeType,
} from "@/server/domain/value-objects";
import { SearchLoading } from "./-components/results/search-loading";
import { SearchResults } from "./-components/results/search-results";
import { SearchFilters } from "./-components/search-filters";

const searchSchema = z.object({
	q: z.string().optional(),
	category: z
		.enum(Object.values(SearchCategory) as [string, ...string[]])
		.optional()
		.transform((val) => val as SearchCategoryType | undefined),
	timeRange: z
		.enum(Object.values(TimeRange) as [string, ...string[]])
		.optional()
		.transform((val) => val as TimeRangeType | undefined),
});

export const Route = createFileRoute("/_authed/search/")({
	validateSearch: zodValidator(searchSchema),
	loaderDeps: ({ search: { q, category, timeRange } }) => ({
		q,
		category,
		timeRange,
	}),
	beforeLoad({ search }) {
		if (!search.q || search.q === "") {
			throw redirect({ to: "/" });
		}
	},
	loader: ({ context, deps: { q, category, timeRange } }) => {
		if (!q) return;
		// Normalize category to match component behavior and avoid double-fetch
		// Component defaults undefined category to SearchCategory.WEB
		void context.queryClient.ensureQueryData(
			searchQueryOptions({
				query: q,
				category: category ?? SearchCategory.WEB,
				timeRange,
			}),
		);
	},
	head: () => {
		return {
			meta: [
				{
					title: "Search - Voy",
				},
			],
		};
	},
	component: SearchPage,
});

class SearchErrorBoundary extends Component<
	{ children: ReactNode; fallback: ReactNode },
	{ hasError: boolean }
> {
	state = { hasError: false };
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	render() {
		if (this.state.hasError) return this.props.fallback;
		return this.props.children;
	}
}

function SearchErrorUI() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[40vh] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">
			<div className="rounded-full bg-destructive/10 p-5 mb-6 ring-1 ring-destructive/20 shadow-sm">
				<SearchX className="h-8 w-8 text-destructive" aria-hidden="true" />
			</div>

			<h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
				Unable to load results
			</h2>

			<p className="text-muted-foreground max-w-[420px] mb-8 text-base leading-relaxed text-balance">
				We encountered an issue while searching. This might be a temporary
				connection problem or an issue with the search provider.
			</p>

			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/" })}
					className="gap-2 h-10 px-6 rounded-xl border-border/60 hover:bg-muted/50"
				>
					<Home className="h-4 w-4" />
					Go Home
				</Button>

				<Button
					onClick={() => window.location.reload()}
					className="gap-2 h-10 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
				>
					<RefreshCcw className="h-4 w-4" />
					Try Again
				</Button>
			</div>
		</div>
	);
}

function SearchResultsList({
	query,
	category,
	timeRange,
}: {
	query: string | undefined;
	category: SearchCategoryType;
	timeRange?: TimeRangeType;
}) {
	const { data: searchResult } = useSearch({
		query,
		category,
		timeRange,
	});

	if (!query) return null;

	return <SearchResults query={query} results={searchResult} />;
}

function SearchPage() {
	const { q: query, category, timeRange } = Route.useSearch();
	const { instanceName } = rootRoute.useLoaderData();
	const searchResultsId = useId();
	const navigate = useNavigate();

	useEffect(() => {
		if (query) {
			document.title = `${query} - Search - ${instanceName}`;
		} else {
			document.title = `Search - ${instanceName}`;
		}
		return () => {
			document.title = instanceName;
		};
	}, [query, instanceName]);

	const urlCategory = category ?? SearchCategory.WEB;
	const [optimisticCategory, setOptimisticCategory] =
		useOptimistic(urlCategory);

	const activeCategory = optimisticCategory;

	const handleCategoryChange = (
		newCategory: (typeof SearchCategory)[keyof typeof SearchCategory],
	) => {
		startTransition(() => {
			setOptimisticCategory(newCategory);
			navigate({
				to: "/search",
				search: (prev) => ({ ...prev, category: newCategory }),
			});
		});
	};

	const [optimisticTimeRange, setOptimisticTimeRange] =
		useOptimistic(timeRange);
	const activeTimeRange = optimisticTimeRange;

	const handleTimeRangeChange = (newTimeRange: TimeRangeType | undefined) => {
		startTransition(() => {
			setOptimisticTimeRange(newTimeRange);
			navigate({
				to: "/search",
				search: (prev) => ({ ...prev, timeRange: newTimeRange }),
			});
		});
	};

	return (
		<div className="flex min-h-screen flex-col bg-background relative selection:bg-primary/10 selection:text-primary">
			{/* Ambient Background Effects */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] opacity-60 animate-pulse-glow" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] opacity-60 animate-pulse-glow delay-1000" />
			</div>

			<a
				href={`#${searchResultsId}`}
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium transition-all"
			>
				Skip to results
			</a>

			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-6xl px-6 lg:px-8">
					<div className="flex h-[72px] items-center gap-6">
						<Link
							to="/"
							className="shrink-0 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
							aria-label={`${instanceName} Search home`}
						>
							<SearchLogo size="sm" />
						</Link>

						<div className="flex-1 max-w-2xl">
							<SearchBar variant="compact" initialQuery={query} />
						</div>

						<div className="hidden items-center gap-3 md:flex ml-auto">
							<ThemeToggle />
							<UserDropdown />
						</div>
					</div>

					<div className="flex items-center h-10 pb-2">
						<SearchFilters
							active={activeCategory}
							onChange={handleCategoryChange}
							timeRange={activeTimeRange}
							onTimeRangeChange={handleTimeRangeChange}
						/>
					</div>
				</div>
			</header>

			<main
				id={searchResultsId}
				className="flex-1 w-full mx-auto max-w-6xl px-6 py-8 lg:px-8"
			>
				<div className="max-w-[800px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
					<SearchErrorBoundary fallback={<SearchErrorUI />}>
						<Suspense
							fallback={
								<div className="animate-pulse">
									<SearchLoading category={activeCategory} />
								</div>
							}
						>
							<SearchResultsList
								key={`${query}-${activeCategory}-${activeTimeRange ?? "all"}`}
								query={query}
								category={activeCategory}
								timeRange={activeTimeRange}
							/>
						</Suspense>
					</SearchErrorBoundary>
				</div>
			</main>

			<footer className="relative z-10 border-t border-border/40 px-6 py-6 md:px-10">
				<div className="mx-auto flex max-w-5xl items-center justify-center gap-6">
					<a
						href="/settings"
						className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
					>
						Settings
					</a>

					<div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
							<Lock className="h-2.5 w-2.5 text-emerald-600" />
						</div>
						<span>Your searches never leave your server</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
