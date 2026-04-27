import type * as React from 'react';

/**
 * Radio + RadioGroup · DEV-only runtime invariants
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2
 * Contract reference: `@/devdocs/system/component-contract.md` SR-1~9
 *
 * Implements five silent-bug-prevention invariants from design.md §7:
 *
 *   R-1a · Radio received `aria-pressed` — filtered + warn.
 *          `role="radio"` + `aria-checked` is the single-writer channel.
 *          `aria-pressed` belongs to ToggleButton / plain button; mixing it
 *          with `aria-checked` confuses NVDA / JAWS / VoiceOver.
 *
 *   R-1a · Radio received `aria-selected` — filtered + warn.
 *          `aria-selected` belongs to `role="option"` / tab / listbox
 *          surfaces; a Radio is NOT a listbox member. Same single-writer
 *          rule.
 *
 *   R-11 · Radio on `<button>` host with `type="submit"` / `type="reset"`
 *          — unconditionally overridden to `type="button"` + warn. A Radio
 *          inside a <form> that submits on selection would reload the page
 *          and lose `onValueChange`; MOST DANGEROUS silent bug.
 *
 *   R-2 · Radio inside a RadioGroup but missing `value` prop — warn + skip
 *         registration. Such a Radio cannot participate in group selection
 *         (`ownValue === undefined` → `groupCtx.value === ownValue` is
 *         always false → `aria-checked="false"` permanently). Usually a
 *         refactor bug.
 *
 *   RG-1 · RadioGroup with duplicate `value`s among its children — warn
 *          once. `onSelect(value)` then flips ALL matches to checked,
 *          violating the single-select invariant. Detected on a best-effort
 *          scan over the item registry (post-mount).
 *
 * Latching strategy — each warning fires once per process to avoid console
 * floods. Test reset hook exposed for unit-test isolation.
 */

const _state =
  process.env.NODE_ENV !== 'production'
    ? {
        warnedAriaPressed: false,
        warnedAriaSelected: false,
        warnedButtonTypeOverride: false,
        warnedMissingValue: false,
        warnedDuplicateValues: false,
      }
    : null;

/**
 * R-1a · warn once if the user passed `aria-pressed` as a prop on <Radio>.
 */
export function warnAriaPressedOnRadio(
  domProps: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedAriaPressed) return;
  if (!('aria-pressed' in domProps)) return;
  _state!.warnedAriaPressed = true;
  console.error(
    '[PrismUI] <Radio> received an `aria-pressed` prop, which is filtered ' +
      'out. Radio carries `role="radio"` + `aria-checked`; `aria-pressed` ' +
      'belongs to ToggleButton / plain button. Screen readers give ' +
      'inconsistent results when both are present. This error is shown ' +
      'once per process.',
  );
}

/**
 * R-1a · warn once if the user passed `aria-selected` as a prop on <Radio>.
 */
export function warnAriaSelectedOnRadio(
  domProps: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedAriaSelected) return;
  if (!('aria-selected' in domProps)) return;
  _state!.warnedAriaSelected = true;
  console.error(
    '[PrismUI] <Radio> received an `aria-selected` prop, which is filtered ' +
      'out. `aria-selected` belongs to `role="option"` / tab / listbox ' +
      'members. Radio uses `role="radio"` + `aria-checked`. This error is ' +
      'shown once per process.',
  );
}

/**
 * R-11 · warn once if the user passed `type="submit"` / `type="reset"` on a
 * Radio rendered as `<button>`. Polymorphic non-button hosts are silent.
 */
export function warnRadioButtonTypeOverride(
  Element: React.ElementType,
  userType: unknown,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedButtonTypeOverride) return;
  if (Element !== 'button') return;
  if (userType !== 'submit' && userType !== 'reset') return;
  _state!.warnedButtonTypeOverride = true;
  console.error(
    '[PrismUI] <Radio type="' +
      userType +
      '"> is overridden to `type="button"` to prevent accidental form ' +
      'submission — a <button type="submit"> inside a <form> would trigger ' +
      'submit + page navigation on selection, losing `onValueChange` and ' +
      'the freshly-selected value. Remove the `type` prop. This error is ' +
      'shown once per process.',
  );
}

/**
 * R-2 · warn once when a Radio rendered inside a RadioGroup is missing its
 * `value` prop. Such a Radio cannot participate in group selection and is
 * skipped during registration.
 */
export function warnRadioMissingValueInGroup(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedMissingValue) return;
  _state!.warnedMissingValue = true;
  console.error(
    '[PrismUI] <Radio> rendered inside a <RadioGroup> is missing its ' +
      '`value` prop. Group children MUST have a `value` to participate in ' +
      'selection; the Radio is skipped by the registry and will always ' +
      'appear unchecked. Provide `value="..."` or render the Radio ' +
      'standalone (outside a RadioGroup). This error is shown once per ' +
      'process.',
  );
}

/**
 * RG-1 · warn once if a RadioGroup registry contains duplicate item values.
 * Called from RadioGroup with the live items array (post-registration in a
 * useEffect). Duplicates violate the single-select invariant: `onSelect(v)`
 * would flip every duplicate to checked.
 *
 * Best-effort scan with stable behavior — callers pass an array of strings
 * (undefined entries are ignored / counted as "unregistered").
 */
export function warnDuplicateRadioValues(values: readonly (string | undefined)[]): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedDuplicateValues) return;
  const seen = new Set<string>();
  let dup: string | undefined;
  for (const v of values) {
    if (v === undefined) continue;
    if (seen.has(v)) {
      dup = v;
      break;
    }
    seen.add(v);
  }
  if (dup === undefined) return;
  _state!.warnedDuplicateValues = true;
  console.error(
    '[PrismUI] <RadioGroup> contains multiple <Radio> children with the ' +
      'same value="' +
      dup +
      '". Duplicate values violate the single-select invariant — ' +
      'selecting that value would mark every duplicate as checked. Each ' +
      'Radio inside a group must have a unique `value`. This error is ' +
      'shown once per process.',
  );
}

/**
 * Test-only reset for all Radio DEV invariant latches.
 */
export function __resetRadioInvariantWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!_state) return;
  _state.warnedAriaPressed = false;
  _state.warnedAriaSelected = false;
  _state.warnedButtonTypeOverride = false;
  _state.warnedMissingValue = false;
  _state.warnedDuplicateValues = false;
}
