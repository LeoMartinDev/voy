import { formOptions } from "@tanstack/react-form";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/client/components/ui/button";
import { Label } from "@/client/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import { useSetupTypedFormContext } from "./setup-form";

export const stepLanguageSchema = z.object({
	language: z.enum(["en", "fr"]),
});

export type LanguageStepFormValues = z.infer<typeof stepLanguageSchema>;

export const languageFormOpts = formOptions({
	defaultValues: {
		language: "en" as LanguageStepFormValues["language"],
	},
	validators: {
		onChange: stepLanguageSchema,
	},
});

export interface LanguageStepProps {
	onSubmit: () => void;
}

export function LanguageStep({ onSubmit }: LanguageStepProps) {
	const form = useSetupTypedFormContext(languageFormOpts);
	const { t, i18n } = useTranslation();

	const languageOptions = [
		{
			value: "en",
			label: t("languages.en"),
		},
		{
			value: "fr",
			label: t("languages.fr"),
		},
	];

	const handleLanguageChange = (value: string) => {
		i18n.changeLanguage(value);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-6"
		>
			<div className="space-y-4">
				<form.Field name="language">
					{(field) => (
						<RadioGroup
							value={field.state.value}
							onValueChange={(value) => {
								field.handleChange(value as LanguageStepFormValues["language"]);
								handleLanguageChange(value);
							}}
							className="gap-3"
						>
							{languageOptions.map((option) => (
								<Label
									key={option.value}
									htmlFor={option.value}
									className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
								>
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className="mt-0.5"
									/>
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<Languages className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">{option.label}</span>
										</div>
									</div>
								</Label>
							))}
						</RadioGroup>
					)}
				</form.Field>
			</div>

			<Button type="submit" className="w-full">
				{t("setup.language.continue")}
			</Button>
		</form>
	);
}
