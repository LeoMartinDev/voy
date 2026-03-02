import { formOptions } from "@tanstack/react-form";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import i18n from "@/client/i18n";
import { useSetupTypedFormContext } from "./setup-form";

export const adminSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, { error: () => i18n.t("setup.admin.nameRequired") }),
		email: z.email({ error: () => i18n.t("setup.admin.emailInvalid") }),
		password: z
			.string()
			.min(8, { error: () => i18n.t("setup.admin.passwordMinLength") }),
		confirmPassword: z
			.string()
			.min(1, { error: () => i18n.t("validation.required") }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		error: () => i18n.t("setup.admin.passwordsDoNotMatch"),
	});

export type AdminFormValues = z.infer<typeof adminSchema>;

export const adminFormOpts = formOptions({
	defaultValues: {
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	},
	validators: {
		onChange: adminSchema,
	},
});

export interface AdminStepProps {
	onBack: () => void;
	onSubmit?: () => void;
	isPending: boolean;
	hasAttemptedSubmit: boolean;
}

export function AdminStep({
	onBack,
	onSubmit,
	isPending,
	hasAttemptedSubmit,
}: AdminStepProps) {
	const form = useSetupTypedFormContext(adminFormOpts);
	const { t } = useTranslation();
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit?.();
			}}
			className="space-y-4"
		>
			<div className="space-y-2">
				<Label htmlFor={nameId}>{t("setup.admin.name")}</Label>
				<form.Field name="name">
					{(field) => (
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
				<Label htmlFor={emailId}>{t("setup.admin.email")}</Label>
				<form.Field name="email">
					{(field) => (
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
				<Label htmlFor={passwordId}>{t("setup.admin.password")}</Label>
				<form.Field name="password">
					{(field) => (
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
				<Label htmlFor={confirmPasswordId}>
					{t("setup.admin.confirmPassword")}
				</Label>
				<form.Field name="confirmPassword">
					{(field) => (
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
					{t("common.back")}
				</Button>
				<Button type="submit" className="flex-1" disabled={isPending}>
					{isPending ? t("common.saving") : t("setup.admin.createAccount")}
				</Button>
			</div>
		</form>
	);
}
