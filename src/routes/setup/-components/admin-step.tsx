import { useId } from "react";
import { z } from "zod";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";

export const step2Schema = z
	.object({
		name: z.string().min(1, "Le nom est requis"),
		email: z.email("Email invalide"),
		password: z
			.string()
			.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

export type AdminFormValues = z.infer<typeof step2Schema>;

export interface AdminStepProps {
	// biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex
	form: any;
	onBack: () => void;
	onSubmit?: () => void;
	isPending: boolean;
	hasAttemptedSubmit: boolean;
}

export function AdminStep({
	form,
	onBack,
	onSubmit,
	isPending,
	hasAttemptedSubmit,
}: AdminStepProps) {
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit?.();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<div className="space-y-2">
				<Label htmlFor={nameId}>Votre nom</Label>
				<form.Field name="name">
					{/* biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex */}
					{(field: any) => (
						<>
							<Input
								id={nameId}
								type="text"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Jean Dupont"
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<p className="text-sm text-error">
									{field.state.meta.errors[0].message}
								</p>
							)}
						</>
					)}
				</form.Field>
			</div>

			<div className="space-y-2">
				<Label htmlFor={emailId}>Email</Label>
				<form.Field name="email">
					{/* biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex */}
					{(field: any) => (
						<>
							<Input
								id={emailId}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="admin@example.com"
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<p className="text-sm text-error">
									{field.state.meta.errors[0].message}
								</p>
							)}
						</>
					)}
				</form.Field>
			</div>

			<div className="space-y-2">
				<Label htmlFor={passwordId}>Mot de passe</Label>
				<form.Field name="password">
					{/* biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex */}
					{(field: any) => (
						<>
							<Input
								id={passwordId}
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="••••••••"
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<p className="text-sm text-error">
									{field.state.meta.errors[0].message}
								</p>
							)}
						</>
					)}
				</form.Field>
			</div>

			<div className="space-y-2">
				<Label htmlFor={confirmPasswordId}>Confirmer le mot de passe</Label>
				<form.Field name="confirmPassword">
					{/* biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex */}
					{(field: any) => (
						<>
							<Input
								id={confirmPasswordId}
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="••••••••"
							/>
							{hasAttemptedSubmit && field.state.meta.errors?.[0] && (
								<p className="text-sm text-error">
									{field.state.meta.errors[0].message}
								</p>
							)}
						</>
					)}
				</form.Field>
			</div>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					disabled={isPending}
				>
					Retour
				</Button>
				<Button type="submit" className="flex-1" disabled={isPending}>
					{isPending ? "Configuration..." : "Finaliser"}
				</Button>
			</div>
		</form>
	);
}
