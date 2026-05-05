/**
 * Stage-15 Primitives root barrel.
 *
 * Three orthogonal namespaces (ADR-006 decision 1):
 *   - ./layout   · Layout primitives (geometry)         · Phase 1
 *   - ./scope    · Behavior scope primitives (no DOM)   · Phase 2
 *   - ./section  · Token-driven Section primitives      · Phase 3
 *
 * Each sub-barrel enforces its own §6.1 import whitelist; this root file
 * just re-exports the public surfaces.
 */
export * from './layout';
export * from './scope';
export * from './section';
