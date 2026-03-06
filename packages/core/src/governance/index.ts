// ---------------------------------------------------------------------------
// Governance Layer — barrel exports (STAGE-002)
// ---------------------------------------------------------------------------

// Types
export type {
  AuditEntry,
  AuditFilter,
  PolicyResult,
  PolicyVerdict,
  EventPriority,
} from './types';

// Audit Trail
export { createAuditTrail } from './audit-trail';
export type { AuditTrail, AuditTrailOptions } from './audit-trail';
export { createAuditMiddleware } from './audit-middleware';

// Replay System
export { createReplaySystem } from './replay-system';
export type {
  ReplaySystem,
  ReplayOptions,
  ReplayResult,
} from './replay-system';
export { computeStateHash } from './state-hash';

// Policy Engine
export { createPolicyEngine } from './policy-engine';
export type { PolicyEngine, PolicyRule } from './policy-engine';
export { createPolicyMiddleware } from './policy-middleware';

// Priority Scheduler
export { createPriorityScheduler, createPriorityMiddleware } from './priority-scheduler';
export type {
  PriorityScheduler,
  PriorityConfig,
  ConflictStrategy,
  ConflictRule,
} from './priority-scheduler';
