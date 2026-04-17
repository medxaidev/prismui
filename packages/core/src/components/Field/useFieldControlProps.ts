import { useFieldContext } from './FieldContext';

/**
 * Shape of Control props consumed by this hook.
 * Any additional props are passed through untouched.
 */
export type FieldControlPropsInput = {
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-required'?: boolean | 'true' | 'false';
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
};

/**
 * Merge two `aria-describedby` values (space-separated ID lists), preserving
 * order and de-duplicating.
 *
 * Contract (spec §aria-describedby):
 * - ALWAYS includes Field's descriptionId + errorId (even if the components
 *   are not rendered — ARIA permits dangling refs, and this avoids the
 *   mount/unmount timing bugs of a registration-based approach).
 */
function mergeAriaDescribedBy(
  userValue: string | undefined,
  fieldIds: readonly string[],
): string | undefined {
  const ids: string[] = [];
  if (userValue) {
    for (const id of userValue.split(/\s+/)) {
      if (id && !ids.includes(id)) ids.push(id);
    }
  }
  for (const id of fieldIds) {
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Unified Control integration hook.
 *
 * Merges Control-level props with FieldContext state, applying the priority:
 * **Control props > Field props > defaults**
 *
 * Contract (see devdocs/components/Field/architecture.md §Control integration):
 * - When Field is absent: returns props untouched (pass-through).
 * - When Field is present: injects inputId (if Control did not supply id),
 *   aria-required, aria-invalid, disabled, readOnly, and merges aria-describedby.
 * - `htmlFor` connection is NOT managed here — it is owned by `<Field.Label>`.
 * - `aria-labelledby` is NOT default-injected — `htmlFor` is the default
 *   Label→Control mechanism.
 *
 * Control props (id / disabled / readOnly) ALWAYS win when explicitly provided.
 */
export function useFieldControlProps<P extends FieldControlPropsInput>(props: P): P {
  const ctx = useFieldContext();

  // Field-less use: pass-through.
  if (!ctx) return props;

  const anyProps = props as Record<string, unknown>;
  const merged = { ...props } as P & Record<string, unknown>;

  // id: Field's inputId only if Control did not supply its own.
  if (anyProps.id === undefined) {
    merged.id = ctx.inputId;
  }

  // disabled / readOnly: Control props win; otherwise Field wins.
  if (anyProps.disabled === undefined) {
    merged.disabled = ctx.disabled;
  }
  if (anyProps.readOnly === undefined) {
    merged.readOnly = ctx.readOnly;
  }

  // aria-required / aria-invalid: Field drives unless Control overrides.
  if (anyProps['aria-required'] === undefined && ctx.required) {
    merged['aria-required'] = true;
  }
  if (anyProps['aria-invalid'] === undefined && ctx.invalid) {
    merged['aria-invalid'] = true;
  }

  // aria-describedby: always union Field's descriptionId + errorId with user value.
  merged['aria-describedby'] = mergeAriaDescribedBy(
    anyProps['aria-describedby'] as string | undefined,
    [ctx.descriptionId, ctx.errorId],
  );

  return merged as P;
}
