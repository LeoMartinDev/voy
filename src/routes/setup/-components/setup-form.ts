import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext } = createFormHookContexts();

export const {
	useAppForm: useSetupForm,
	useTypedAppFormContext: useSetupTypedFormContext,
} = createFormHook({
	fieldComponents: {},
	formComponents: {},
	fieldContext,
	formContext,
});
