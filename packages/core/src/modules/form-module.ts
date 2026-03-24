// ---------------------------------------------------------------------------
// Form Module — Built-in Interaction Module (Layer 0.5)
// Manages form state: field registration, values, validation, submission.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import { createModuleActions } from '../action-types';

// ── Types ─────────────────────────────────────────────────────────────

/** State of a single form field. */
export interface FieldState {
  value: unknown;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/** State slice contributed by the Form Module. */
export interface FormModuleState {
  formFields: Record<string, FieldState>;
  formIsSubmitting: boolean;
  formSubmitCount: number;
  formSubmitError: string | null;
}

/** Validator function: receives all fields, returns error map (null = valid). */
export type FormValidator = (
  fields: Record<string, FieldState>,
) => Record<string, string | null>;

/** Controller API for the Form Module. */
export interface FormController {
  registerField(name: string, initialValue?: unknown): void;
  unregisterField(name: string): void;
  setValue(name: string, value: unknown): void;
  setError(name: string, error: string | null): void;
  setTouched(name: string): void;
  validate(validator: FormValidator): boolean;
  submitStart(): void;
  submitSuccess(): void;
  submitError(error: string): void;
  reset(): void;
  getField(name: string): FieldState | undefined;
  getValues(): Record<string, unknown>;
  getErrors(): Record<string, string | null>;
  isValid(): boolean;
  isDirty(): boolean;
  getSubmitCount(): number;
}

// ── Events ────────────────────────────────────────────────────────────

// Event type constants (namespaced)
const FormActions = createModuleActions('form', {
  REGISTER_FIELD: 'registerField',
  UNREGISTER_FIELD: 'unregisterField',
  SET_VALUE: 'setValue',
  SET_ERROR: 'setError',
  SET_TOUCHED: 'setTouched',
  VALIDATE: 'validate',
  SUBMIT_START: 'submitStart',
  SUBMIT_SUCCESS: 'submitSuccess',
  SUBMIT_ERROR: 'submitError',
  RESET: 'reset',
});

export { FormActions };

/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_REGISTER_FIELD = FormActions.REGISTER_FIELD;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_UNREGISTER_FIELD = FormActions.UNREGISTER_FIELD;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SET_VALUE = FormActions.SET_VALUE;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SET_ERROR = FormActions.SET_ERROR;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SET_TOUCHED = FormActions.SET_TOUCHED;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_VALIDATE = FormActions.VALIDATE;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SUBMIT_START = FormActions.SUBMIT_START;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SUBMIT_SUCCESS = FormActions.SUBMIT_SUCCESS;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_SUBMIT_ERROR = FormActions.SUBMIT_ERROR;
/** @deprecated Use FormActions — kept for backward compatibility */
export const FORM_RESET = FormActions.RESET;

// ── Module Factory ────────────────────────────────────────────────────

export function createFormModule(): RuntimeModule<FormController> {
  // Track initial values for reset
  const initialValues: Record<string, unknown> = {};

  return {
    name: 'form',

    initialState: {
      formFields: {} as Record<string, FieldState>,
      formIsSubmitting: false,
      formSubmitCount: 0,
      formSubmitError: null,
    },

    reducers: {
      [FormActions.REGISTER_FIELD]: (event, prevState) => {
        const { name, initialValue } = event.payload as {
          name: string;
          initialValue?: unknown;
        };
        const fields = prevState.formFields as Record<string, FieldState>;

        return {
          nextState: {
            ...prevState,
            formFields: {
              ...fields,
              [name]: {
                value: initialValue ?? '',
                error: null,
                touched: false,
                dirty: false,
              },
            },
          },
        };
      },

      [FormActions.UNREGISTER_FIELD]: (event, prevState) => {
        const { name } = event.payload as { name: string };
        const fields = { ...(prevState.formFields as Record<string, FieldState>) };
        delete fields[name];

        return {
          nextState: {
            ...prevState,
            formFields: fields,
          },
        };
      },

      [FormActions.SET_VALUE]: (event, prevState) => {
        const { name, value } = event.payload as { name: string; value: unknown };
        const fields = prevState.formFields as Record<string, FieldState>;
        const field = fields[name];
        if (!field) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            formFields: {
              ...fields,
              [name]: { ...field, value, dirty: true },
            },
          },
        };
      },

      [FormActions.SET_ERROR]: (event, prevState) => {
        const { name, error } = event.payload as { name: string; error: string | null };
        const fields = prevState.formFields as Record<string, FieldState>;
        const field = fields[name];
        if (!field) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            formFields: {
              ...fields,
              [name]: { ...field, error },
            },
          },
        };
      },

      [FormActions.SET_TOUCHED]: (event, prevState) => {
        const { name } = event.payload as { name: string };
        const fields = prevState.formFields as Record<string, FieldState>;
        const field = fields[name];
        if (!field) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            formFields: {
              ...fields,
              [name]: { ...field, touched: true },
            },
          },
        };
      },

      [FormActions.VALIDATE]: (event, prevState) => {
        const { errors } = event.payload as { errors: Record<string, string | null> };
        const fields = prevState.formFields as Record<string, FieldState>;
        const updatedFields = { ...fields };

        for (const [name, error] of Object.entries(errors)) {
          if (updatedFields[name]) {
            updatedFields[name] = { ...updatedFields[name], error };
          }
        }

        return {
          nextState: {
            ...prevState,
            formFields: updatedFields,
          },
        };
      },

      [FormActions.SUBMIT_START]: (_event, prevState) => {
        return {
          nextState: {
            ...prevState,
            formIsSubmitting: true,
            formSubmitError: null,
          },
        };
      },

      [FormActions.SUBMIT_SUCCESS]: (_event, prevState) => {
        return {
          nextState: {
            ...prevState,
            formIsSubmitting: false,
            formSubmitCount: (prevState.formSubmitCount as number) + 1,
          },
        };
      },

      [FormActions.SUBMIT_ERROR]: (event, prevState) => {
        const { error } = event.payload as { error: string };
        return {
          nextState: {
            ...prevState,
            formIsSubmitting: false,
            formSubmitCount: (prevState.formSubmitCount as number) + 1,
            formSubmitError: error,
          },
        };
      },

      [FormActions.RESET]: (_event, prevState) => {
        const fields = prevState.formFields as Record<string, FieldState>;
        const resetFields: Record<string, FieldState> = {};

        for (const name of Object.keys(fields)) {
          resetFields[name] = {
            value: initialValues[name] ?? '',
            error: null,
            touched: false,
            dirty: false,
          };
        }

        return {
          nextState: {
            ...prevState,
            formFields: resetFields,
            formIsSubmitting: false,
            formSubmitCount: 0,
            formSubmitError: null,
          },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      registerField(name: string, initialValue?: unknown): void {
        const val = initialValue ?? '';
        initialValues[name] = val;
        bus.dispatch({ type: FormActions.REGISTER_FIELD, payload: { name, initialValue: val } });
      },

      unregisterField(name: string): void {
        delete initialValues[name];
        bus.dispatch({ type: FormActions.UNREGISTER_FIELD, payload: { name } });
      },

      setValue(name: string, value: unknown): void {
        bus.dispatch({ type: FormActions.SET_VALUE, payload: { name, value } });
      },

      setError(name: string, error: string | null): void {
        bus.dispatch({ type: FormActions.SET_ERROR, payload: { name, error } });
      },

      setTouched(name: string): void {
        bus.dispatch({ type: FormActions.SET_TOUCHED, payload: { name } });
      },

      validate(validator: FormValidator): boolean {
        const fields = store.getState().formFields as Record<string, FieldState>;
        const errors = validator(fields);
        bus.dispatch({ type: FormActions.VALIDATE, payload: { errors } });

        // Check if any errors are non-null
        return Object.values(errors).every((e) => e === null);
      },

      submitStart(): void {
        bus.dispatch({ type: FormActions.SUBMIT_START });
      },

      submitSuccess(): void {
        bus.dispatch({ type: FormActions.SUBMIT_SUCCESS });
      },

      submitError(error: string): void {
        bus.dispatch({ type: FormActions.SUBMIT_ERROR, payload: { error } });
      },

      reset(): void {
        bus.dispatch({ type: FormActions.RESET });
      },

      getField(name: string): FieldState | undefined {
        const fields = store.getState().formFields as Record<string, FieldState>;
        return fields[name];
      },

      getValues(): Record<string, unknown> {
        const fields = store.getState().formFields as Record<string, FieldState>;
        const values: Record<string, unknown> = {};
        for (const [name, field] of Object.entries(fields)) {
          values[name] = field.value;
        }
        return values;
      },

      getErrors(): Record<string, string | null> {
        const fields = store.getState().formFields as Record<string, FieldState>;
        const errors: Record<string, string | null> = {};
        for (const [name, field] of Object.entries(fields)) {
          errors[name] = field.error;
        }
        return errors;
      },

      isValid(): boolean {
        const fields = store.getState().formFields as Record<string, FieldState>;
        return Object.values(fields).every((f) => f.error === null);
      },

      isDirty(): boolean {
        const fields = store.getState().formFields as Record<string, FieldState>;
        return Object.values(fields).some((f) => f.dirty);
      },

      getSubmitCount(): number {
        return store.getState().formSubmitCount as number;
      },
    }),
  };
}
