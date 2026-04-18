import { useFieldContext } from './FieldContext';
import {
  stateDataAttrs,
  type StateDataAttrsOptions,
} from '../../core/state/state-data-attrs';

/**
 * Stage 3 Step 10 · Phase 2-bis · A-1 / A-6 — Field-aware data-attrs provider.
 *
 * ## Why this hook exists
 *
 * The `state` system (`stateDataAttrs`) produces `data-disabled` /
 * `data-readonly` / `data-interactive-disabled` from **raw component props**,
 * which is the correct behavior for context-free components like `Button`.
 *
 * Field-aware Controls (Input, Select, Textarea, …) additionally inherit
 * `disabled` / `readOnly` from surrounding `<Field disabled readOnly>`. The
 * merged state only exists *inside render* (after `useFieldControlProps`), so
 * factory-time `systemDataAttrs` cannot see it. Without this hook every
 * Control would re-implement the merge + re-build the 3 keys by hand (Input
 * originally did this as a one-off).
 *
 * ## A-6 · single-writer hierarchy
 *
 * This hook is the **first legitimate overlay layer** above the system base:
 *
 * ```text
 *   [lowest]  systemDataAttrs         — from props only (pre-Field)
 *             ↑
 *             useFieldDataAttrs()     — Field context overlay  ← this hook
 *             ↑
 *             component local attrs   — escape hatches only (data-pointer, …)
 *   [highest]
 * ```
 *
 * ### Overlay contract
 *
 * - **Spread AFTER `systemDataAttrs`** (later spread wins, matches the mental
 *   model of hierarchy layers).
 * - **Monotonic in presence**: this hook can turn a key from "absent" to
 *   `'true'` (disabled becomes true due to Field), never the reverse. See
 *   §6.5 for the formal rule. If the raw prop already said `disabled=true`,
 *   Field cannot downgrade it.
 * - **Subset restriction**: only emits the 3 state keys. Never produces
 *   `data-variant` / `data-size` / `data-color` — those have no Field-merged
 *   semantics and stay in the base layer.
 *
 * ### When NOT to use
 *
 * - Action Surface (Button, IconButton) — no Field merge, use `systemDataAttrs`
 *   alone.
 * - Container / Overlay Surfaces — they are not Field children.
 *
 * ## API
 *
 * @example
 * // Input.tsx · Control Surface · Field-aware
 * const mergedInputProps = useFieldControlProps(domProps);
 * const fieldDataAttrs = useFieldDataAttrs(mergedInputProps, {
 *   interactiveStrategy: 'control',
 * });
 *
 * return (
 *   <div
 *     {...systemDataAttrs}   // base layer
 *     {...fieldDataAttrs}    // Field overlay — wins on conflict
 *   />
 * );
 */
export interface FieldAwareStateProps {
  disabled?: unknown;
  readOnly?: unknown;
  loading?: unknown;
}

/**
 * Build the 3 state data-attrs from **Field-merged** inputs.
 *
 * Usage:
 * - Pass the output of `useFieldControlProps(domProps)` (or any props object
 *   where `disabled` / `readOnly` already reflect the Field merge).
 * - If called *outside* a `<Field>`, this hook behaves identically to calling
 *   `stateDataAttrs(props, options)` — safe to use unconditionally.
 *
 * Returns an attribute dictionary with `undefined` values pruned by the
 * consumer's JSX spread (React omits attrs whose value is `undefined`).
 */
export function useFieldDataAttrs(
  props: FieldAwareStateProps & Record<string, unknown>,
  options?: StateDataAttrsOptions,
): Record<string, string | undefined> {
  const ctx = useFieldContext();

  // Fast path: no Field in tree → behave exactly like stateDataAttrs.
  // This mirrors useFieldControlProps's pass-through semantics, keeping the
  // hook safe to call unconditionally from a Control component.
  if (!ctx) return stateDataAttrs(props, options);

  // Field overlay: monotonic "absent → true" only.
  // If the caller already passed `disabled=true` in props (they might have
  // run useFieldControlProps which merges ctx.disabled in), no change needed.
  // If they passed raw un-merged props, respect ctx when raw is undefined.
  //
  // Rationale for checking `undefined` rather than falsy: a Control author
  // who explicitly writes `<Input disabled={false}>` inside `<Field disabled>`
  // is opting out — that is a valid concrete value and must win (matches
  // useFieldControlProps priority: Control > Field).
  const merged = {
    ...props,
    disabled: props.disabled === undefined ? ctx.disabled : props.disabled,
    readOnly: props.readOnly === undefined ? ctx.readOnly : props.readOnly,
  };
  return stateDataAttrs(merged, options);
}
