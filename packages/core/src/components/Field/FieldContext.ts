import * as React from 'react';

/**
 * FieldContext — pure semantic connection layer.
 *
 * Provides IDs + state to Compound Components (Label / Description / Error)
 * and to Control components that opt-in via `useFieldControlProps`.
 *
 * Contract (see devdocs/components/Field/architecture.md §Context):
 * - IDs: baseId-derived 4 semantic IDs
 * - State: 4 static states (disabled / readOnly / invalid / required)
 * - NO derived fields (no describedBy / labelledBy / hasError / hasDescription)
 * - NO registration mechanism
 * - `useFieldContext()` returns `null` outside Field (MUST NOT throw)
 */
export interface FieldContextValue {
  /** Base ID (user-provided via Field.id or auto-generated). */
  baseId: string;
  /** `{baseId}-input` — Control's id. */
  inputId: string;
  /** `{baseId}-label` — Label's id (for aria-labelledby fallback). */
  labelId: string;
  /** `{baseId}-description` — Description's id (aria-describedby material). */
  descriptionId: string;
  /** `{baseId}-error` — Error's id (aria-describedby material). */
  errorId: string;

  /** Whether the field is disabled. */
  disabled: boolean;
  /** Whether the field is read-only. */
  readOnly: boolean;
  /** Whether the field is invalid (pure explicit, never derived from <Field.Error>). */
  invalid: boolean;
  /** Whether the field is required. */
  required: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FieldContext.displayName = 'FieldContext';
}

/**
 * Read the current FieldContext value.
 *
 * Returns `null` if called outside a `<Field>` — callers MUST handle this case.
 * This is intentional: Control components must remain usable without Field.
 */
export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext);
}
