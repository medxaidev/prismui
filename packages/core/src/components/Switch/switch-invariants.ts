import type * as React from 'react';

/**
 * Switch · DEV-only runtime invariants
 *
 * Design reference: `@/devdocs/components/Switch/design.md` v0.1.2 Round 3.1
 * Contract reference: `@/devdocs/system/component-contract.md` SR-1~9
 *
 * Implements three of the silent-bug-prevention invariants from design.md §一:
 *
 *   S-1a · user-supplied `aria-pressed` is silently overridden
 *          Switch carries `role="switch"` + `aria-checked`. The ARIA contract
 *          forbids co-mingling `aria-pressed` (which belongs to ToggleButton /
 *          plain button). Screen-reader behavior across NVDA / JAWS / VoiceOver
 *          is inconsistent when BOTH are present, so the component filters
 *          `aria-pressed` out of domProps and warns the author once per
 *          process. See design.md §S-1a / §2.2 (forbidden props table).
 *
 *   S-10 · user-supplied `indeterminate` / `aria-checked="mixed"` rejected
 *          Switch is strictly binary (S-1). A user who typed `indeterminate`
 *          is confusing Switch with Checkbox. We DEV-warn once and ignore —
 *          the TypeScript layer already refuses the prop, so this branch only
 *          catches JS / `as any` escape hatches.
 *
 *   S-10a · user-supplied `component="a"` + `href` is rejected
 *           🔴 Round 1 audit closure (landed together with Checkbox v1.0).
 *           `resolvePolymorphicActionBehavior` treats `<a href>` as "native
 *           activating" — it simulates neither Space nor preventDefault on
 *           the anchor, relying on the browser's native Enter-to-navigate
 *           behavior. But Space on `<a href>` only scrolls the page in UA,
 *           which violates S-10's Space-activation contract. Combined with
 *           `role="switch"` this also introduces a semantic conflict
 *           (switch vs link). Component DEV-warns + falls back to
 *           `<button>` host (strips `href`). Mirrors Checkbox CB-10 /
 *           OQ-CB-12 strategy A (see Checkbox/design.md §CB-10 / §10).
 *
 *   S-11 · user-supplied `type="submit"` / `type="reset"` overridden to "button"
 *          🔴 MOST DANGEROUS silent bug: a Switch inside a <form> that renders
 *          as <button type="submit"> will trigger form submission on click,
 *          reloading the page and losing `onCheckedChange` + checked state
 *          before the component can flush. Component UNCONDITIONALLY overrides
 *          to `type="button"` (spread-order ensures the component wins) and
 *          warns the author once per process. See design.md §S-11 / §2.2.
 *
 * Latching strategy — identical to ToggleButton / IconButton: each warning
 * fires once per process to avoid console floods. Per-instance differentiation
 * would add cost for negligible value — the first violating render surfaces
 * the bug.
 *
 * Test reset hook — `__resetSwitchInvariantWarnings` exported so unit tests
 * can assert multi-case warn behavior without cross-test leakage.
 */

const _state =
  process.env.NODE_ENV !== 'production'
    ? {
        /** S-1a — user tried to override aria-pressed via prop */
        warnedAriaPressedOverride: false,
        /** S-10 — user tried to pass indeterminate / aria-checked="mixed" */
        warnedIndeterminate: false,
        /** S-10a — user tried to combine component="a" with href */
        warnedAHrefHost: false,
        /** S-11 — user tried to pass type="submit" / "reset" on a <button> host */
        warnedButtonTypeOverride: false,
      }
    : null;

/**
 * S-1a · warn once if the user passed `aria-pressed` as a prop. The component
 * destructures `aria-pressed` out of domProps BEFORE spreading, so the prop
 * never reaches the DOM. This warning surfaces the divergence so authors do
 * not ship code that looks right in JSX but differs in the rendered DOM.
 *
 * Accepts the raw domProps bag; matches by string key presence so both
 * `aria-pressed={true}` and `aria-pressed="mixed"` are caught.
 */
export function warnAriaPressedOverride(
  domProps: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedAriaPressedOverride) return;
  if (!('aria-pressed' in domProps)) return;
  _state!.warnedAriaPressedOverride = true;
  console.error(
    '[PrismUI] <Switch> received an `aria-pressed` prop, which is filtered ' +
      'out. Switch carries `role="switch"` + `aria-checked`; `aria-pressed` ' +
      'belongs to ToggleButton / plain button. Screen readers give ' +
      'inconsistent results when both are present. To change the visual / ' +
      'a11y state, use `checked` or `defaultChecked`. This error is shown ' +
      'once per process.',
  );
}

/**
 * S-10 · warn once if the user passed a mixed / indeterminate signal. Switch
 * is strictly binary. Typed API forbids this at compile time, but JS
 * consumers / `as any` escape hatches can still slip through.
 */
export function warnIndeterminate(domProps: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedIndeterminate) return;
  const hasIndeterminate = 'indeterminate' in domProps;
  const hasMixed = domProps['aria-checked'] === 'mixed';
  if (!hasIndeterminate && !hasMixed) return;
  _state!.warnedIndeterminate = true;
  console.error(
    '[PrismUI] <Switch> received `indeterminate` or `aria-checked="mixed"`, ' +
      'which is not supported. Switch is strictly binary (on / off). For ' +
      'tri-state semantics use <Checkbox> or <ToggleButton pressed="mixed">. ' +
      'This error is shown once per process.',
  );
}

/**
 * S-10a · warn once if the user combined `component="a"` with `href`.
 * 🔴 Round 1 audit closure. Component falls back to `<button>` host
 * (strategy A · mirrors Checkbox CB-10 / OQ-CB-12) — `href` is stripped,
 * role="switch" is emitted on the button, and Space activation works
 * normally.
 *
 * @param Element  — resolved polymorphic host element
 * @param hasHref  — `true` when domProps contains `href` (any value,
 *                   including `""` — any presence triggers the escape)
 */
export function warnAHrefHost(
  Element: React.ElementType,
  hasHref: boolean,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedAHrefHost) return;
  if (Element !== 'a') return;
  if (!hasHref) return;
  _state!.warnedAHrefHost = true;
  console.error(
    '[PrismUI] <Switch component="a" href="..."> is not supported — ' +
      '`<a href>` is treated as "native activating" by the polymorphic ' +
      'action hook, which means Space does NOT simulate click (it only ' +
      'scrolls the page in UA). This would silently break S-10\'s Space ' +
      'activation contract and conflicts with `role="switch"` (switch vs ' +
      'link semantics). Switch has fallen back to `<button>` host — ' +
      '`href` is stripped, `role="switch"` is emitted, Space works. To ' +
      'use <a> as the Switch host, omit `href`. To navigate on toggle, ' +
      'call `router.push` / `history.push` from `onCheckedChange`. This ' +
      'error is shown once per process.',
  );
}

/**
 * S-11 · warn once if the user passed `type="submit"` / `type="reset"` on a
 * Switch rendered as a `<button>`. The component UNCONDITIONALLY overrides
 * to `type="button"` to prevent silent form submission. Polymorphic hosts
 * (non-button) don't care about `type` and are not warned.
 */
export function warnButtonTypeOverride(
  Element: React.ElementType,
  userType: unknown,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedButtonTypeOverride) return;
  if (Element !== 'button') return;
  if (userType !== 'submit' && userType !== 'reset') return;
  _state!.warnedButtonTypeOverride = true;
  console.error(
    '[PrismUI] <Switch type="' +
      userType +
      '"> is overridden to `type="button"` to prevent accidental form ' +
      'submission — a <button type="submit"> inside a <form> would trigger ' +
      'submit + page navigation on toggle click, losing `onCheckedChange` ' +
      'and `checked` state. Remove the `type` prop or use `<button>` ' +
      'directly if you need form submit semantics. This error is shown once ' +
      'per process.',
  );
}

/**
 * Test-only reset for all DEV invariant latches. Unused in production builds.
 */
export function __resetSwitchInvariantWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!_state) return;
  _state.warnedAriaPressedOverride = false;
  _state.warnedIndeterminate = false;
  _state.warnedAHrefHost = false;
  _state.warnedButtonTypeOverride = false;
}

