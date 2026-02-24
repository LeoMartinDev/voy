"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/client/components/theme-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";

const themes = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<button
				type="button"
				className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground"
				aria-label="Toggle theme"
			>
				<Sun className="h-4 w-4" />
			</button>
		);
	}

	const currentTheme = themes.find((t) => t.value === theme) ?? themes[2];
	const ThemeIcon = currentTheme.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:border-foreground/10 hover:text-foreground active:scale-95"
					aria-label="Select theme"
				>
					<ThemeIcon className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={4}>
				{themes.map(({ value, label, icon: Icon }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => setTheme(value)}
						className="gap-2"
					>
						<Icon className="h-4 w-4" />
						<span className="flex-1">{label}</span>
						{theme === value && <Check className="h-4 w-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
