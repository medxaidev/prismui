// ---------------------------------------------------------------------------
// Form Module — Built-in Interaction Module (Layer 0.5)
// Manages form state: field registration, values, validation, submission.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';

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

export const FORM_REGISTER_FIELD = 'FORM_REGISTER_FIELD';
export const FORM_UNREGISTER_FIELD = 'FORM_UNREGISTER_FIELD';
export const FORM_SET_VALUE = 'FORM_SET_VALUE';
export const FORM_SET_ERROR = 'FORM_SET_ERROR';
export const FORM_SET_TOUCHED = 'FORM_SET_TOUCHED';
export const FORM_VALIDATE = 'FORM_VALIDATE';
export const FORM_SUBMIT_START = 'FORM_SUBMIT_START';
export const FORM_SUBMIT_SUCCESS = 'FORM_SUBMIT_SUCCESS';
export const FORM_SUBMIT_ERROR = 'FORM_SUBMIT_ERROR';
export const FORM_RESET = 'FORM_RESET';

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
      [FORM_REGISTER_FIELD]: (event, prevState) => {
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

      [FORM_UNREGISTER_FIELD]: (event, prevState) => {
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

      [FORM_SET_VALUE]: (event, prevState) => {
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

      [FORM_SET_ERROR]: (event, prevState) => {
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

      [FORM_SET_TOUCHED]: (event, prevState) => {
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

      [FORM_VALIDATE]: (event, prevState) => {
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

      [FORM_SUBMIT_START]: (_event, prevState) => {
        return {
          nextState: {
            ...prevState,
            formIsSubmitting: true,
            formSubmitError: null,
          },
        };
      },

      [FORM_SUBMIT_SUCCESS]: (_event, prevState) => {
        return {
          nextState: {
            ...prevState,
            formIsSubmitting: false,
            formSubmitCount: (prevState.formSubmitCount as number) + 1,
          },
        };
      },

      [FORM_SUBMIT_ERROR]: (event, prevState) => {
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

      [FORM_RESET]: (_event, prevState) => {
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
        bus.dispatch({ type: FORM_REGISTER_FIELD, payload: { name, initialValue: val } });
      },

      unregisterField(name: string): void {
        delete initialValues[name];
        bus.dispatch({ type: FORM_UNREGISTER_FIELD, payload: { name } });
      },

      setValue(name: string, value: unknown): void {
        bus.dispatch({ type: FORM_SET_VALUE, payload: { name, value } });
      },

      setError(name: string, error: string | null): void {
        bus.dispatch({ type: FORM_SET_ERROR, payload: { name, error } });
      },

      setTouched(name: string): void {
        bus.dispatch({ type: FORM_SET_TOUCHED, payload: { name } });
      },

      validate(validator: FormValidator): boolean {
        const fields = store.getState().formFields as Record<string, FieldState>;
        const errors = validator(fields);
        bus.dispatch({ type: FORM_VALIDATE, payload: { errors } });

        // Check if any errors are non-null
        return Object.values(errors).every((e) => e === null);
      },

      submitStart(): void {
        bus.dispatch({ type: FORM_SUBMIT_START });
      },

      submitSuccess(): void {
        bus.dispatch({ type: FORM_SUBMIT_SUCCESS });
      },

      submitError(error: string): void {
        bus.dispatch({ type: FORM_SUBMIT_ERROR, payload: { error } });
      },

      reset(): void {
        bus.dispatch({ type: FORM_RESET });
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
