/**
 * Stage-15 Phase 2 · LY-SCOPE-3 · Portal re-export.
 *
 * Contract (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.7 + ADR-006 Q3):
 *
 *   - **LY-SCOPE-3** — this file **ONLY re-exports** the existing
 *     Stage-11 Portal component from `@/core/overlay/portal/Portal`.
 *     It does NOT re-implement, wrap, alter behaviour, or introduce any
 *     DOM. The identity of the re-exported symbol is preserved:
 *     `ScopePortal === Portal` at runtime (strict reference equality).
 *   - **LY-SCOPE-4** — the re-export is given a distinct name
 *     (`ScopePortal`) so the public `@prismui/core` surface carries
 *     BOTH:
 *       * the historical `Portal` (reached via
 *         `core/overlay/portal/index.ts`) — kept to avoid breaking any
 *         existing consumer imports
 *       * the semantic `ScopePortal` (reached via this file) — the
 *         "Behavior Scope" entry point that pairs naturally with
 *         `<FocusScope>` / `<RemoveScroll>`
 *     v1 keeps both; v1.x will re-evaluate whether the overlay entry
 *     can be deprecated (ADR-006 R-7 trigger conditions).
 *
 * ## Why re-export under a different name?
 *
 * A Behavior Scope primitive's *semantic role* is "opens a boundary that
 * changes how the subtree participates in parent layout/focus/scroll".
 * Portal is the prototype: it relocates children to a different DOM
 * position without introducing any wrapper. Naming it `ScopePortal`
 * inside `primitives/scope` makes the intent explicit and groups it
 * with `FocusScope` / `RemoveScroll` at the namespace level.
 *
 * ## Identity contract
 *
 * `ScopePortal === Portal` is asserted in `index.test.ts`. This is a
 * structural invariant of LY-SCOPE-3 — any future refactor that breaks
 * reference equality (e.g. wrapping in a shim) would violate the "no
 * re-implementation" clause and fail the barrel test.
 */
export { Portal as ScopePortal } from '../../../core/overlay/portal/Portal';
export type { PortalProps as ScopePortalProps } from '../../../core/overlay/portal/Portal';
