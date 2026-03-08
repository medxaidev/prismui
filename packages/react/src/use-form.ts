// ---------------------------------------------------------------------------
// useForm — convenience hook combining reactive form state + controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { FormController, FieldState, FormValidator } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useForm(). */
export interface UseFormReturn {
  fields: Record<string, FieldState>;
  isSubmitting: boolean;
  submitCount: number;
  formSubmitError: string | null;
  registerField: (name: string, initialValue?: unknown) => void;
  unregisterField: (name: string) => void;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string | null) => void;
  setTouched: (name: string) => void;
  validate: (validator: FormValidator) => boolean;
  submitStart: () => void;
  submitSuccess: () => void;
  setSubmitError: (error: string) => void;
  reset: () => void;
  getValues: () => Record<string, unknown>;
  getErrors: () => Record<string, string | null>;
  isValid: () => boolean;
  isDirty: () => boolean;
}

/**
 * Convenience hook for form operations.
 * Combines `useRuntimeState()` for reactive form state with `runtime.modules.form` for actions.
 */
export function useForm(): UseFormReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.form as FormController;

  const registerField = useCallback(
    (name: string, initialValue?: unknown) => controller.registerField(name, initialValue),
    [controller],
  );
  const unregisterField = useCallback((name: string) => controller.unregisterField(name), [controller]);
  const setValue = useCallback((name: string, value: unknown) => controller.setValue(name, value), [controller]);
  const setError = useCallback((name: string, error: string | null) => controller.setError(name, error), [controller]);
  const setTouched = useCallback((name: string) => controller.setTouched(name), [controller]);
  const validate = useCallback((validator: FormValidator) => controller.validate(validator), [controller]);
  const submitStart = useCallback(() => controller.submitStart(), [controller]);
  const submitSuccess = useCallback(() => controller.submitSuccess(), [controller]);
  const submitErrorFn = useCallback((error: string) => controller.submitError(error), [controller]);
  const reset = useCallback(() => controller.reset(), [controller]);
  const getValues = useCallback(() => controller.getValues(), [controller]);
  const getErrors = useCallback(() => controller.getErrors(), [controller]);
  const isValid = useCallback(() => controller.isValid(), [controller]);
  const isDirty = useCallback(() => controller.isDirty(), [controller]);

  return {
    fields: (state.formFields ?? {}) as Record<string, FieldState>,
    isSubmitting: (state.formIsSubmitting ?? false) as boolean,
    submitCount: (state.formSubmitCount ?? 0) as number,
    formSubmitError: (state.formSubmitError ?? null) as string | null,
    registerField,
    unregisterField,
    setValue,
    setError,
    setTouched,
    validate,
    submitStart,
    submitSuccess,
    setSubmitError: submitErrorFn,
    reset,
    getValues,
    getErrors,
    isValid,
    isDirty,
  };
}
