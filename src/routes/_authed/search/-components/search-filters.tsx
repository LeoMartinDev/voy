import {
	Calendar,
	ChevronDown,
	FileIcon,
	Globe,
	ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/client/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import {
	SearchCategory,
	type SearchCategory as SearchCategoryType,
	TimeRange,
	type TimeRange as TimeRangeType,
} from "@/server/domain/value-objects";

const FILTERS: {
	id: SearchCategoryType;
	icon: typeof Globe;
}[] = [
	{ id: SearchCategory.WEB, icon: Globe },
	{ id: SearchCategory.IMAGES, icon: ImageIcon },
	{ id: SearchCategory.FILES, icon: FileIcon },
];

const TIME_RANGES: {
	id: TimeRangeType | undefined;
	labelKey: string;
}[] = [
	{ id: TimeRange.ALL, labelKey: "search.anyTime" },
	{ id: TimeRange.DAY, labelKey: "search.pastDay" },
	{ id: TimeRange.MONTH, labelKey: "search.pastMonth" },
	{ id: TimeRange.YEAR, labelKey: "search.pastYear" },
];

interface SearchFiltersProps {
	active: SearchCategoryType;
	onChange: (category: SearchCategoryType) => void;
	timeRange?: TimeRangeType;
	onTimeRangeChange?: (timeRange: TimeRangeType | undefined) => void;
}

export function SearchFilters({
	active,
	onChange,
	timeRange,
	onTimeRangeChange,
}: SearchFiltersProps) {
	const { t } = useTranslation();

	const activeTimeRangeLabel = TIME_RANGES.find(
		(r) => r.id === (timeRange ?? TimeRange.ALL),
	)?.labelKey;

	return (
		<div className="flex w-full items-center gap-8">
			<nav
				className="flex items-center gap-5"
				aria-label={t("search.filterResults")}
			>
				{FILTERS.map((filter) => {
					const isActive = active === filter.id;
					const Icon = filter.icon;

					return (
						<button
							key={filter.id}
							type="button"
							aria-pressed={isActive}
							onClick={() => onChange(filter.id)}
							className={`
								group relative flex items-center gap-1.5 py-1.5 text-[13px] font-medium transition-all
								focus-visible:outline-none focus-visible:text-primary
								${isActive ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"}
							`}
						>
							<Icon
								className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-105 ${
									isActive ? "text-primary" : "text-muted-foreground/50"
								}`}
								aria-hidden="true"
							/>
							<span>{t(`search.${filter.id}`)}</span>

							{/* Active Indicator Line */}
							{isActive && (
								<div className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary animate-in fade-in zoom-in-x-50 duration-300" />
							)}
						</button>
					);
				})}
			</nav>

			{onTimeRangeChange && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={`
								h-8 gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-all hover:bg-muted/50
								${
									timeRange && timeRange !== TimeRange.ALL
										? "text-primary bg-primary/5 hover:bg-primary/10"
										: "text-muted-foreground/80"
								}
							`}
						>
							<Calendar className="h-3.5 w-3.5" />
							<span>
								{activeTimeRangeLabel
									? t(activeTimeRangeLabel)
									: t("search.anyTime")}
							</span>
							<ChevronDown className="h-3 w-3 opacity-40" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-40 rounded-xl p-1 shadow-2xl"
					>
						{TIME_RANGES.map((range) => (
							<DropdownMenuItem
								key={range.labelKey}
								onClick={() => onTimeRangeChange(range.id)}
								className={`
									rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors
									${(timeRange ?? TimeRange.ALL) === range.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}
								`}
							>
								{t(range.labelKey)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
