/**
 * IconButton · DEV-only runtime invariants
 *
 * Scope — this module implements two design invariants from design.md §一:
 *
 *   D-3 · aria-label enforcement
 *         IconButton has NO text fallback (unlike Button, where visible text
 *         supplies the accessible name). If the user forgets `aria-label`
 *         AND `aria-labelledby`, assistive tech announces a bare "button" —
 *         a silent a11y bug. We emit a DEV `console.error` so it shows up
 *         during development without crashing production. `title` is NOT
 *         accepted as a valid accessible-name source here (it is for Button,
 *         which has text children; IconButton's stricter design surface
 *         means we want the explicit aria contract).
 *
 *   D-7 · children is exactly one non-string element
 *         IconButton's whole semantic is "one icon." Multiple children, a
 *         string child, or zero children all violate the API contract and
 *         would need slot/gap/layout rules IconButton does not have. We
 *         validate at render time in DEV and log — we do NOT throw, because
 *         (a) production builds should never crash on a content shape bug
 *         and (b) CSS already degrades gracefully (children still render
 *         left-to-right via flex-center; they just may overflow).
 *
 * Latching strategy — identical to Button's `warnIconOnlyButtonOnce`: each
 * warning fires once per process. This matches how developers experience
 * warnings in their console (one notification, not a flood across every
 * render). Per-instance differentiation is not worth the bookkeeping; the
 * first violating render is enough to surface the bug.
 *
 * Test reset hooks — `__resetIconButtonInvariantWarnings` is exported so
 * unit tests can assert multi-case warn behavior without leakage.
 */
import * as React from 'react';

const _state =
  process.env.NODE_ENV !== 'production'
    ? {
        /** D-3 — missing accessible name */
        warnedMissingAriaLabel: false,
        /** D-7 — children count !== 1 */
        warnedChildrenCount: false,
        /** D-7 — children is a string */
        warnedStringChild: false,
      }
    : null;

/**
 * D-3 · warn once if the element lacks both `aria-label` and
 * `aria-labelledby`. Caller is expected to pass the raw domProps bag so we
 * don't have to reach into the element post-render.
 */
export function warnMissingAriaLabel(
  ariaLabel: unknown,
  ariaLabelledBy: unknown,
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (_state!.warnedMissingAriaLabel) return;
  const hasLabel =
    (typeof ariaLabel === 'string' && ariaLabel.length > 0) ||
    (typeof ariaLabelledBy === 'string' && ariaLabelledBy.length > 0);
  if (hasLabel) return;
  _state!.warnedMissingAriaLabel = true;
  // `console.error` (not `warn`) — this is a load-bearing a11y contract.
  // Screen reader users cannot recover from a nameless button; matching the
  // severity to React's own prop-validation errors puts it on the dev's
  // radar at the same level.
  console.error(
    '[PrismUI] <IconButton> requires an accessible name, but none was provided. ' +
      'Pass `aria-label="…"` (or `aria-labelledby="…"` pointing at a visible ' +
      'label). Without one, screen readers announce a nameless "button", which ' +
      'fails WCAG 4.1.2. This error is shown once per process.',
  );
}

/**
 * D-7 · warn once per violation class.
 * Two separate latches so a codebase with both bugs receives both warnings
 * (rather than the second being silently suppressed by the first).
 */
export function warnChildrenInvariant(children: React.ReactNode): void {
  if (process.env.NODE_ENV === 'production') return;
  const count = React.Children.count(children);
  if (count !== 1) {
    if (!_state!.warnedChildrenCount) {
      _state!.warnedChildrenCount = true;
      console.error(
        '[PrismUI] <IconButton> expects exactly one child (the icon), but got ' +
          `${count}. Multiple children would require slot / gap / layout rules ` +
          'IconButton does not have — use <Button leftSection={…}> for icon + ' +
          'text. This error is shown once per process.',
      );
    }
    return;
  }
  // Count is 1 — check the type. React.Children.toArray normalizes Fragment
  // and filters null/false/undefined, so a single string child lands at [0].
  const only = React.Children.toArray(children)[0];
  if (typeof only === 'string' || typeof only === 'number') {
    if (!_state!.warnedStringChild) {
      _state!.warnedStringChild = true;
      console.error(
        '[PrismUI] <IconButton> child must be an icon element, not text. ' +
          'Received a string/number child — IconButton has zero typography ' +
          'consumption (D-6) and will not style text correctly. For icon + ' +
          'text use <Button leftSection={…}>. This error is shown once per process.',
      );
    }
  }
}

/**
 * Test-only reset for all DEV invariant latches. Unused in production builds.
 */
export function __resetIconButtonInvariantWarnings(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!_state) return;
  _state.warnedMissingAriaLabel = false;
  _state.warnedChildrenCount = false;
  _state.warnedStringChild = false;
}
