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
 *
 * ⚠️ **FCP-6 — Control components MUST NOT call this hook directly.**
 *
 * (See `@/devdocs/system/control-surface.md` §4.1 FCP-6 · "anti-window-breaking".)
 *
 * Allowed callers:
 * - `useFieldControlProps` / `useFieldDataAttrs` (official indirect entries)
 * - Field-owned Compound Components (`Field.Label` / `Field.Description` /
 *   `Field.Error`) and user-authored `Field.*` compounds that are part of the
 *   Field API surface
 *
 * Forbidden caller:
 * - Any Control Surface component (Input / Textarea / Switch / Checkbox /
 *   Select / …). A Control reading FieldContext directly would bypass
 *   FCP-2 priority (Control prop > Field ctx), FCP-4 aria-describedby
 *   concatenation, and the SR-7 single-writer chain — all of which
 *   `useFieldControlProps` + `useFieldDataAttrs` enforce.
 *
 * Runtime enforcement is intentionally deferred (see OQ-6). This JSDoc warning
 * is the first line of defense; reviewers must reject Control PRs that call
 * `useFieldContext` directly.
 */
export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext);
}
