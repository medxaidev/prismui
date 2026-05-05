/**
 * Stage-15 Phase 2 · Behavior Scope primitives namespace barrel.
 *
 * Exports (Phase 2 · landing in sequence):
 *   - ScopePortal   · ✅ landed (re-export of Stage-11 Portal · LY-SCOPE-3/4)
 *   - RemoveScroll  · ✅ landed (LY-SCOPE-2 · LY-SCOPE-5)
 *   - FocusScope    · ⏳ pending
 *
 * Contract (ADR-006 §6.1): this barrel MUST NOT re-export anything outside
 * the three Behavior Scope primitives. Layout / Section live in sibling
 * barrels. The shape of this barrel is part of the R-1 P0 dissolution
 * condition (Phase 2 PR diff must match §6.1 whitelist exactly).
 *
 * Behavior Scope primitives share a common property (LY-SCOPE-5): **they
 * do NOT produce visible DOM**. FocusScope / RemoveScroll render their
 * children transparently; Portal relocates them via React.createPortal
 * with no wrapper. This is the defining characteristic that distinguishes
 * the `scope` namespace from `layout` (which always emits a host element).
 */

export { ScopePortal } from './portal';
export type { ScopePortalProps } from './portal';

export { RemoveScroll } from './RemoveScroll';
export type { RemoveScrollProps } from './RemoveScroll';
