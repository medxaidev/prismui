/**
 * Stage-12 · L0 Transition Foundation · aggregator barrel
 *
 * Single primitive (ADR-004 Decision 1):
 *   · presence  (Phase 1 ✅)
 *
 * Sibling primitive备案 (升级路径 · 入 backlog):
 *   · `<AutoSize>` (OQ-PR-3 C · ≥ 3 components need height auto)
 *   · `<PresenceGroup>` (OQ-PR-5 B · ≥ 3 components need group coordination)
 *   · React 19 ViewTransition adapter (OQ-PR-6 · observe v1.x)
 *
 * Each primitive owns its own sub-barrel; this aggregator only re-exports.
 */

export * from './presence';
