/**
 * Stage-11 · L0 Overlay Foundation · aggregator barrel
 *
 * Three primitives (orthogonal — ADR-003 Decision 1):
 *   · portal     (Phase 1 ✅)
 *   · floating   (Phase 2 ✅)
 *   · dismissal  (Phase 3 ✅)
 *
 * Each primitive owns its own sub-barrel; this aggregator only re-exports.
 */

export * from './portal';
export * from './floating';
export * from './dismissal';
