/**
 * Stage-10 · L2 Interaction Events · DEV invariant warnings
 *
 * Latched-once-per-process `console.warn` helpers for upstream contract violations.
 * PROD build is silent (process.env.NODE_ENV check at the call site).
 *
 * Contract anchors:
 *   · R-1 missing gating resolution (interaction-events.md §9.5)
 *   · C-5 duplicate pressstart on same pointerId (interaction-events.md §10.2)
 *
 * Design convention (aligned with `switch-invariants.ts` · Switch v1.0.2):
 *   · Each warning has its own latch flag · fires once per process.
 *   · `__resetPressInvariantWarnings()` clears all flags for test isolation.
 *   · Warnings are pure side-effects · callers gate with `process.env.NODE_ENV !== 'production'`.
 */

let warnedMissingGating = false;
let warnedDuplicatePressStart = false;

/**
 * R-1 · Missing gating resolution.
 *
 * Fires when `usePress` is invoked with `isInteractiveDisabled === undefined`.
 * Consumers must pre-resolve gating semantics via `resolveInteractive` and pass the
 * boolean through. Direct passthrough of `props.disabled` is a silent-bug vector
 * because it omits Field / readOnly / loading semantics.
 */
export function warnMissingGating(): void {
  if (warnedMissingGating) return;
  warnedMissingGating = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[PrismUI · usePress] missing gating resolution: `isInteractiveDisabled` is undefined.\n' +
      'Did you forget to call `resolveInteractive({ disabled, loading, readOnly? }, strategy)` ' +
      'and pass the result?\n' +
      'See @/devdocs/system/interaction-events.md §9.2 for Action/Control surface patterns.',
  );
}

/**
 * C-5 · Duplicate pressstart on the same pointerId.
 *
 * Fires when a second `pointerdown` arrives for a pointerId that already has an
 * `active` / `suspended` FSM. This usually indicates a missed `pointerup` /
 * `pointercancel` from the upstream layer or browser-quirk double delivery.
 * The hook layer ignores the illegal input and keeps the existing FSM intact.
 */
export function warnDuplicatePressStart(): void {
  if (warnedDuplicatePressStart) return;
  warnedDuplicatePressStart = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[PrismUI · usePress] duplicate pressstart ignored: a second `pointerdown` arrived ' +
      'for a pointerId that already has an active/suspended press.\n' +
      'This often indicates a lost `pointerup`/`pointercancel` or a browser quirk. ' +
      'The existing press is preserved; the duplicate is dropped.',
  );
}

/** Test-only · clears all latch flags so each test can assert warn behavior independently. */
export function __resetPressInvariantWarnings(): void {
  warnedMissingGating = false;
  warnedDuplicatePressStart = false;
}
