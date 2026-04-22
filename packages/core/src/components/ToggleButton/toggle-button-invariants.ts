/**
 * ToggleButton · DEV-only runtime invariants
 *
 * Scope — this module implements two design invariants from design.md §一:
 *
 *   T-8 · `defaultPressed` must not be `'mixed'`
 *         `'mixed'` is a tri-state that only makes sense in controlled mode
 *         (a parent explicitly tracks "indeterminate" logic such as "selection
 *         contains a mix of bolded and un-bolded text"). In uncontrolled
 *         mode there is no natural toggle action that would LEAVE the mixed
 *         state on click — the WAI-ARIA guidance `mixed → true → false` only
 *         works once you have an observer tracking external truth. Silently
 *         accepting `defaultPressed='mixed'` would therefore strand the
 *         button in mixed forever, which is almost always a bug. We warn in
 *         DEV and fall back to `false` at the call site (`useControllableState`
 *         is called with `defaultValue: defaultPressed ?? false`).
 *
 *   T-1 · user-supplied `aria-pressed` is silently overridden
 *         The component ALWAYS writes `aria-pressed` based on its own
 *         resolved pressed state. A user passing `aria-pressed="true"` as
 *         a prop almost certainly expects it to stick; they are confusing
 *         ToggleButton with plain Button + aria. We emit a DEV warning so
 *         they discover the divergence immediately instead of shipping a
 *         stale attribute that looks correct in props but differs in DOM.
 *
 * Latching strategy — identical to IconButton's `icon-button-invariants`:
 * each warning fires once per process. This matches how developers
 * experience warnings in their console (one notification, not a flood per
 * render). Per-instance differentiation would add cost for negligible
 * value — the first violating render is already enough to surface the bug.
 *
 * Test reset hook — `__resetToggleButtonInvariantWarnings` exported so unit
 * tests can assert multi-case warn behavior without leakage.
 */

const _state =
  process.env.NODE_ENV !== 'production'
    ? {
        /** T-8 — defaultPressed === 'mixed' */
        warnedMixedDefault: false,
        /** T-1 — user tried to override aria-pressed via prop */
        warnedAriaPressedOverride: false,
      }
    : null;

/**
 * T-8 · warn once if `defaultPressed` is the string `'mixed'`. Typed API
 * forbids this at compile time (`defaultPressed?: boolean`), but JS
 * consumers / `as any` escape hatches can still slip through.
 */
export function warnMixedDefaultPressed(defaultPressed: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedMixedDefault) return;
  if (defaultPressed !== 'mixed') return;
  _state!.warnedMixedDefault = true;
  console.error(
    '[PrismUI] <ToggleButton defaultPressed="mixed"> is not supported. ' +
      'The tri-state `"mixed"` value is valid ONLY in controlled mode (via ' +
      'the `pressed` prop), where a parent owns the indeterminate logic. ' +
      'Falling back to `defaultPressed=false`. Use `pressed="mixed"` + ' +
      '`onPressedChange` if you need tri-state. This error is shown once ' +
      'per process.',
  );
}

/**
 * T-1 · warn once if the user passed `aria-pressed` as a prop. The component
 * always overrides this attribute based on its own resolved pressed state,
 * so a user-supplied value is silently ignored — we call that out so the
 * divergence between props and DOM does not silently confuse assumers.
 *
 * Accepts the raw domProps bag (checked by string key presence to catch
 * both `aria-pressed={true}` and `aria-pressed="mixed"`).
 */
export function warnAriaPressedOverride(
  domProps: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedAriaPressedOverride) return;
  if (!('aria-pressed' in domProps)) return;
  _state!.warnedAriaPressedOverride = true;
  console.error(
    '[PrismUI] <ToggleButton> received an `aria-pressed` prop, which will ' +
      'be overridden. ToggleButton always writes aria-pressed based on its ' +
      'own resolved pressed state (controlled via `pressed` prop or uncontrolled ' +
      'via `defaultPressed` + internal state). To change the visual/a11y ' +
      'pressed state, use `pressed` or `defaultPressed`. This error is shown ' +
      'once per process.',
  );
}

/**
 * Test-only reset for all DEV invariant latches. Unused in production builds.
 */
export function __resetToggleButtonInvariantWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!_state) return;
  _state.warnedMixedDefault = false;
  _state.warnedAriaPressedOverride = false;
}
