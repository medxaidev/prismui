/**
 * Stage-11 · L0 Overlay Foundation · aggregator barrel
 *
 * Three primitives (orthogonal — ADR-003 Decision 1):
 *   · portal     (Phase 1 — this delivery)
 *   · floating   (Phase 2 — pending)
 *   · dismissal  (Phase 3 — pending)
 *
 * Each primitive owns its own sub-barrel; this aggregator only re-exports.
 */

export * from './portal';
