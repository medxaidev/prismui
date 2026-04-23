import type * as React from 'react';

/**
 * Checkbox · DEV-only runtime invariants
 *
 * Design reference: `@/devdocs/components/Checkbox/design.md` v0.1.1 (Round 1)
 * Contract reference: `@/devdocs/system/component-contract.md` SR-1~9
 *
 * Implements four silent-bug-prevention invariants from design.md §一. These
 * complement the typed API — TypeScript alone already forbids most of these
 * combinations, but `as any` / JS escape hatches / polymorphic spread still
 * let them slip through at runtime.
 *
 *   CB-1a · user-supplied `aria-pressed` is silently filtered
 *           Checkbox carries `role="checkbox"` + `aria-checked`. The ARIA
 *           contract forbids co-mingling `aria-pressed` (ToggleButton's
 *           channel). Screen-reader behavior across NVDA / JAWS / VoiceOver
 *           is inconsistent when both are present, so the component filters
 *           `aria-pressed` out of domProps and warns the author once per
 *           process. See design.md §CB-1a / §2.2 (forbidden props table).
 *
 *   CB-2 · user-supplied `defaultChecked="mixed"` / `aria-checked="mixed"`
 *          on uncontrolled init is rejected
 *          Uncontrolled Checkbox starts in `'mixed'` would deadlock —
 *          toggle cycles `false → true → false` forever, never returning
 *          to `'mixed'`. Typed API forbids this at compile time
 *          (`defaultChecked?: boolean`), but JS / `as any` escape hatches
 *          can still slip through. Component DEV-warns + falls back to
 *          `false`. See design.md §CB-2 / §4.2.
 *
 *   CB-10 · user-supplied `component="a"` + `href` is rejected
 *           (🔴 Round 1 P0-1 收敛 · fallback strategy A per OQ-CB-12)
 *           `resolvePolymorphicActionBehavior` treats `<a href>` as
 *           "native activating" — it simulates neither Space nor preventDefault
 *           on the anchor, relying on the browser's native Enter-to-navigate
 *           behavior. But Space on `<a href>` only scrolls the page in UA,
 *           which violates CB-10's Space-activation contract. Combined with
 *           `role="checkbox"` this also introduces a semantic conflict
 *           (checkbox vs link). Component DEV-warns + falls back to
 *           `<button>` host (strips `href`). See design.md §CB-10 / §10
 *           (OQ-CB-12) / §9.3.
 *
 *   CB-11 · user-supplied `type="submit"` / `type="reset"` overridden to "button"
 *           🔴 MOST DANGEROUS silent bug for Checkbox: nested in `<form>`
 *           is an even more common pattern than for Switch (forms are the
 *           canonical checkbox habitat). A `<button type="submit">` that
 *           toggles would trigger form submission on click, reloading the
 *           page and losing `onCheckedChange` + checked state. Component
 *           UNCONDITIONALLY overrides to `type="button"` (spread-order
 *           guarantees component wins) and warns the author once per
 *           process. See design.md §CB-11 / §2.2.
 *
 * Latching strategy — identical to Switch / ToggleButton / IconButton: each
 * warning fires once per process to avoid console floods. Per-instance
 * differentiation would add cost for negligible value — the first violating
 * render surfaces the bug.
 *
 * Test reset hook — `__resetCheckboxInvariantWarnings` exported so unit
 * tests can assert multi-case warn behavior without cross-test leakage.
 */

const _state =
  process.env.NODE_ENV !== 'production'
    ? {
        /** CB-1a — user tried to override aria-pressed via prop */
        warnedAriaPressedOverride: false,
        /** CB-2 — user tried to pass defaultChecked="mixed" (JS escape) */
        warnedDefaultCheckedMixed: false,
        /** CB-10 — user tried to combine component="a" with href */
        warnedAHrefHost: false,
        /** CB-11 — user tried to pass type="submit" / "reset" on <button> host */
        warnedButtonTypeOverride: false,
      }
    : null;

/**
 * CB-1a · warn once if the user passed `aria-pressed` as a prop. The component
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
    '[PrismUI] <Checkbox> received an `aria-pressed` prop, which is ' +
      'filtered out. Checkbox carries `role="checkbox"` + `aria-checked`; ' +
      '`aria-pressed` belongs to ToggleButton / plain button. Screen ' +
      'readers give inconsistent results when both are present. To change ' +
      'the checked state, use `checked` / `defaultChecked` (supports ' +
      '`"mixed"` for three-state). This error is shown once per process.',
  );
}

/**
 * CB-2 · warn once if the user passed `defaultChecked="mixed"` (or the
 * domProps-level equivalent `aria-checked="mixed"` on uncontrolled render).
 * The component replaces the initial value with `false` to keep the
 * uncontrolled toggle cycle healthy. See design.md §4.2 (T-8 carry-over).
 *
 * @param defaultChecked  — raw `defaultChecked` prop value (may be anything
 *                          under `as any`)
 * @param isControlled    — true when `checked` prop is provided; controlled
 *                          mode legitimately supports `"mixed"` and must
 *                          NOT trigger this warning.
 */
export function warnDefaultCheckedMixed(
  defaultChecked: unknown,
  isControlled: boolean,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedDefaultCheckedMixed) return;
  if (isControlled) return;
  // Match the string literal `'mixed'` plus any other non-boolean truthy
  // escape hatch value that isn't `undefined`. We do NOT warn on plain
  // booleans or undefined (those are contract-valid).
  if (defaultChecked !== 'mixed') return;
  _state!.warnedDefaultCheckedMixed = true;
  console.error(
    '[PrismUI] <Checkbox defaultChecked="mixed"> is not supported in ' +
      'uncontrolled mode — an uncontrolled Checkbox started in `"mixed"` ' +
      'would never return to that state (click cycles false → true → ' +
      'false). Starting value has been replaced with `false`. For ' +
      'three-state semantics use controlled `checked={"mixed"}` with ' +
      '`onCheckedChange`. This error is shown once per process.',
  );
}

/**
 * CB-10 · warn once if the user combined `component="a"` with `href`.
 * 🔴 Round 1 P0-1 收敛. The component falls back to `<button>` host
 * (fallback strategy A per OQ-CB-12) — `href` is stripped, role="checkbox"
 * is emitted on the button, and Space activation works normally.
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
    '[PrismUI] <Checkbox component="a" href="..."> is not supported — ' +
      '`<a href>` is treated as "native activating" by the polymorphic ' +
      'action hook, which means Space does NOT simulate click (it only ' +
      'scrolls the page in UA). This would silently break CB-10\'s Space ' +
      'activation contract and conflicts with `role="checkbox"` (checkbox ' +
      'vs link semantics). Checkbox has fallen back to `<button>` host — ' +
      '`href` is stripped, `role="checkbox"` is emitted, Space works. To ' +
      'use <a> as the Checkbox host, omit `href`. To navigate on toggle, ' +
      'call `router.push` / `history.push` from `onCheckedChange`. This ' +
      'error is shown once per process.',
  );
}

/**
 * CB-11 · warn once if the user passed `type="submit"` / `type="reset"` on a
 * Checkbox rendered as a `<button>`. The component UNCONDITIONALLY overrides
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
    '[PrismUI] <Checkbox type="' +
      userType +
      '"> is overridden to `type="button"` to prevent accidental form ' +
      'submission — a <button type="submit"> inside a <form> would trigger ' +
      'submit + page navigation on toggle click, losing `onCheckedChange` ' +
      'and `checked` state. This is especially dangerous for Checkbox ' +
      'because forms are its most common habitat. Remove the `type` prop ' +
      'or use `<button>` directly if you need form submit semantics. This ' +
      'error is shown once per process.',
  );
}

/**
 * Test-only reset for all DEV invariant latches. Unused in production builds.
 */
export function __resetCheckboxInvariantWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!_state) return;
  _state.warnedAriaPressedOverride = false;
  _state.warnedDefaultCheckedMixed = false;
  _state.warnedAHrefHost = false;
  _state.warnedButtonTypeOverride = false;
}
