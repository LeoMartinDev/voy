"use client";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/client/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { sessionQueryOptions } from "@/routes/_authed";
import { authClient } from "@/server/infrastructure/auth/client";

export function UserDropdown() {
	const navigate = useNavigate();
	const { data: session } = useQuery(sessionQueryOptions);

	const user = session?.user;

	if (!user) {
		return null;
	}

	const initials = user.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: user.email.slice(0, 2).toUpperCase();

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/login", search: { redirect: undefined } });
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:border-foreground/10 hover:text-foreground active:scale-95"
					aria-label="User menu"
				>
					<Avatar className="h-7 w-7">
						<AvatarImage
							src={user.image ?? undefined}
							alt={user.name ?? user.email}
						/>
						<AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
							{initials}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user.name ?? "User"}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{user.role === "admin" && (
					<DropdownMenuItem
						onClick={() => navigate({ to: "/settings" })}
						className="cursor-pointer"
					>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span>Disconnect</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
