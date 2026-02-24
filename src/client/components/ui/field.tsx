import { cn } from "@/client/utils";

export function Field({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function FieldLabel({
	className,
	...props
}: React.ComponentProps<"label">) {
	// biome-ignore lint/a11y/noLabelWithoutControl: Reusable component, consumer must associate with input via htmlFor or wrapping
	return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FieldDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p className={cn("text-sm text-muted-foreground", className)} {...props} />
	);
}

export function FieldGroup({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}

export function FieldSeparator({
	children,
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("relative my-2", className)} {...props}>
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t" />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="bg-background px-2 text-muted-foreground">
					{children}
				</span>
			</div>
		</div>
	);
}
