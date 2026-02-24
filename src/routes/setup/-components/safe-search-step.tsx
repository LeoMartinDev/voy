import { Shield, ShieldAlert, ShieldOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/client/components/ui/button";
import { Label } from "@/client/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import { SafeSearch } from "@/server/domain/value-objects";

export const stepSafeSearchSchema = z.object({
	safeSearch: z.enum([SafeSearch.OFF, SafeSearch.MODERATE, SafeSearch.STRICT]),
});

export type SafeSearchFormValues = z.infer<typeof stepSafeSearchSchema>;

export interface SafeSearchStepProps {
	// biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex
	form: any;
	onSubmit: () => void;
	onBack?: () => void;
}

const safeSearchOptions = [
	{
		value: SafeSearch.OFF,
		label: "Désactivé",
		description: "Aucun filtrage - tous les résultats sont affichés",
		icon: ShieldOff,
	},
	{
		value: SafeSearch.MODERATE,
		label: "Modéré",
		description: "Filtre le contenu explicite le plus sensible",
		icon: Shield,
	},
	{
		value: SafeSearch.STRICT,
		label: "Strict",
		description:
			"Filtre tout le contenu explicite (recommandé pour les familles)",
		icon: ShieldAlert,
	},
];

export function SafeSearchStep({
	form,
	onSubmit,
	onBack,
}: SafeSearchStepProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-6"
		>
			<div className="space-y-4">
				<form.Field name="safeSearch">
					{/* biome-ignore lint/suspicious/noExplicitAny: FormApi type is complex */}
					{(field: any) => (
						<RadioGroup
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value as SafeSearch)}
							className="gap-3"
						>
							{safeSearchOptions.map((option) => {
								const Icon = option.icon;
								return (
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
												<Icon className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium">{option.label}</span>
											</div>
											<p className="text-sm text-muted-foreground">
												{option.description}
											</p>
										</div>
									</Label>
								);
							})}
						</RadioGroup>
					)}
				</form.Field>
			</div>

			<div className="flex gap-3">
				{onBack && (
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="flex-1"
					>
						Retour
					</Button>
				)}
				<Button type="submit" className="flex-1">
					Continuer
				</Button>
			</div>
		</form>
	);
}
