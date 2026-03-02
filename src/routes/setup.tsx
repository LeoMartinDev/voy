import { defineStepper } from "@stepperize/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizeLanguageCode } from "@/client/languages";
import { cn } from "@/client/utils";
import { SafeSearch } from "@/server/domain/value-objects";
import {
	finalizeSetup,
	getSetupStatus,
} from "@/server/infrastructure/functions/setup";
import {
	AdminStep,
	adminFormOpts,
	LanguageStep,
	languageFormOpts,
	SafeSearchStep,
	safeSearchFormOpts,
} from "./setup/-components";
import { useSetupForm } from "./setup/-components/setup-form";

const { useStepper } = defineStepper(
	{
		id: "language",
		title: "setup.steps.language",
		description: "setup.steps.languageDescription",
	},
	{
		id: "safe-search",
		title: "setup.steps.safeSearch",
		description: "setup.steps.safeSearchDescription",
	},
	{
		id: "admin",
		title: "setup.steps.admin",
		description: "setup.steps.adminDescription",
	},
);

export const Route = createFileRoute("/setup")({
	loader: async () => {
		const { setupRequired } = await getSetupStatus();

		if (!setupRequired) {
			throw redirect({ to: "/" });
		}

		return { setupRequired: true };
	},
	head: () => ({
		meta: [{ title: "Setup" }],
	}),
	component: SetupPage,
});

function SetupPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const stepper = useStepper();
	const [error, setError] = useState<string | null>(null);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
	const [mounted, setMounted] = useState(false);
	const normalizedLanguage = normalizeLanguageCode(
		i18n.resolvedLanguage || i18n.language,
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	const finalizeSetupFn = useServerFn(finalizeSetup);
	const setupMutation = useMutation({
		mutationFn: (data: {
			safeSearch: string;
			name: string;
			email: string;
			password: string;
			language: string;
		}) => finalizeSetupFn({ data }),
		onSuccess: () => {
			navigate({ to: "/", replace: true });
		},
		onError: (error) => {
			setError(
				error instanceof Error ? error.message : t("common.genericError"),
			);
		},
	});

	const languageForm = useSetupForm({
		...languageFormOpts,
		defaultValues: {
			...languageFormOpts.defaultValues,
			language: normalizedLanguage,
		},
		onSubmit: async () => {
			stepper.navigation.next();
		},
	});

	const safeSearchForm = useSetupForm({
		...safeSearchFormOpts,
		onSubmit: async () => {
			stepper.navigation.next();
		},
	});

	const adminForm = useSetupForm({
		...adminFormOpts,
		onSubmit: async ({ value }) => {
			const rawSafeSearch = safeSearchForm.state.values.safeSearch;

			const validSafeSearch = [
				SafeSearch.OFF,
				SafeSearch.MODERATE,
				SafeSearch.STRICT,
			].includes(rawSafeSearch)
				? rawSafeSearch
				: SafeSearch.MODERATE;

			const payload = {
				safeSearch: validSafeSearch,
				name: value.name,
				email: value.email,
				password: value.password,
				language: languageForm.state.values.language,
			};

			setupMutation.mutate(payload);
		},
	});

	const handleAdminBack = () => {
		setHasAttemptedSubmit(false);
		adminForm.reset(adminForm.state.values, { keepDefaultValues: true });
		stepper.navigation.prev();
	};

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md space-y-8">
						<div className="text-center space-y-2">
							<h1 className="text-2xl font-semibold tracking-tight">
								{t("setup.title")}
							</h1>
						</div>

						{error && (
							<div className="p-3 bg-error/10 text-error rounded-lg text-sm border border-error/20">
								{error}
							</div>
						)}

						<div className="space-y-6">
							<div className="relative flex items-center justify-between">
								{stepper.state.all.map((step, index) => {
									const isCompleted =
										mounted && index < stepper.state.current.index;
									const isCurrent = !mounted
										? index === 0
										: index === stepper.state.current.index;

									return (
										<div
											key={step.id}
											className="flex items-center flex-1 last:flex-none"
										>
											<div className="relative flex flex-col items-center">
												<div
													className={cn(
														"w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-out",
														isCompleted &&
															"bg-primary text-primary-foreground shadow-sm",
														isCurrent &&
															"bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10",
														!isCompleted &&
															!isCurrent &&
															"bg-muted/80 text-muted-foreground border border-border",
													)}
												>
													{isCompleted ? (
														<Check className="w-5 h-5" strokeWidth={2.5} />
													) : (
														index + 1
													)}
												</div>
												<span
													className={cn(
														"absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors duration-200",
														isCurrent
															? "text-foreground"
															: "text-muted-foreground",
													)}
												>
													{t(step.title)}
												</span>
											</div>

											{index < stepper.state.all.length - 1 && (
												<div className="flex-1 mx-3 h-0.5 rounded-full overflow-hidden bg-muted">
													<div
														className={cn(
															"h-full bg-primary transition-all duration-500 ease-out",
															isCompleted ? "w-full" : "w-0",
														)}
													/>
												</div>
											)}
										</div>
									);
								})}
							</div>

							<div className="pt-8 text-center">
								<p className="text-sm text-muted-foreground">
									{t(
										mounted
											? stepper.state.current.data.title
											: stepper.state.all[0].title,
									)}
									:{" "}
									{t(
										mounted
											? stepper.state.current.data.description
											: stepper.state.all[0].description,
									)}
								</p>
							</div>
						</div>

						{stepper.flow.switch({
							language: () => (
								<languageForm.AppForm>
									<LanguageStep onSubmit={() => languageForm.handleSubmit()} />
								</languageForm.AppForm>
							),
							"safe-search": () => (
								<safeSearchForm.AppForm>
									<SafeSearchStep
										onSubmit={() => safeSearchForm.handleSubmit()}
										onBack={() => stepper.navigation.prev()}
									/>
								</safeSearchForm.AppForm>
							),
							admin: () => (
								<adminForm.AppForm>
									<AdminStep
										hasAttemptedSubmit={hasAttemptedSubmit}
										isPending={setupMutation.isPending}
										onBack={handleAdminBack}
										onSubmit={() => {
											setHasAttemptedSubmit(true);
											adminForm.handleSubmit();
										}}
									/>
								</adminForm.AppForm>
							),
						})}
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="/light.jpg"
					alt="Setup page background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
