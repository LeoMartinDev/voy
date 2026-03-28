import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/client/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/client/components/ui/field";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/utils";
import { sessionQueryOptions } from "@/routes/_authed";
import { authClient } from "@/server/infrastructure/auth/client";

const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

interface LoginFormProps extends React.ComponentProps<"form"> {
	redirectTo?: string;
	oidc?: { displayName: string } | null;
}

function getLoginRedirectHref({ redirectTo }: { redirectTo?: string }): string {
	if (!redirectTo) {
		return "/";
	}

	if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
		return "/";
	}

	return redirectTo;
}

export function LoginForm({
	className,
	redirectTo,
	oidc,
	...props
}: LoginFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [error, setError] = useState<string | null>(null);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
	const [isSsoLoading, setIsSsoLoading] = useState(false);
	const emailId = useId();
	const passwordId = useId();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (error) {
				setError(error.message ?? "Invalid email or password");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: sessionQueryOptions.queryKey,
			});

			navigate({
				href: getLoginRedirectHref({ redirectTo }),
				replace: true,
			});
		},
	});

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={(e) => {
				e.preventDefault();
				setHasAttemptedSubmit(true);
				form.handleSubmit();
			}}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your email below to login to your account
					</p>
				</div>

				{error && (
					<div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
						{error}
					</div>
				)}

				<form.Field name="email">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={emailId}>Email</FieldLabel>
							<Input
								id={emailId}
								type="email"
								placeholder="m@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								required
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<FieldDescription className="text-destructive">
									{field.state.meta.errors[0].message}
								</FieldDescription>
							)}
						</Field>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
							<Input
								id={passwordId}
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								required
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<FieldDescription className="text-destructive">
									{field.state.meta.errors[0].message}
								</FieldDescription>
							)}
						</Field>
					)}
				</form.Field>

				<Field>
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Logging in..." : "Login"}
							</Button>
						)}
					</form.Subscribe>
				</Field>

				{oidc && (
					<>
						<div className="relative flex items-center">
							<div className="flex-1 border-t" />
							<span className="text-muted-foreground px-3 text-xs">or</span>
							<div className="flex-1 border-t" />
						</div>
						<Button
							type="button"
							variant="outline"
							disabled={isSsoLoading}
							onClick={async () => {
								setIsSsoLoading(true);
								await authClient.signIn.oauth2({
									providerId: "oidc",
									callbackURL: getLoginRedirectHref({ redirectTo }),
								});
								setIsSsoLoading(false);
							}}
						>
							{isSsoLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Sign in with {oidc.displayName}
						</Button>
					</>
				)}
			</FieldGroup>
		</form>
	);
}
