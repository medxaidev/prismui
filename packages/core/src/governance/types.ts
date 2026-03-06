// ---------------------------------------------------------------------------
// Shared governance types for STAGE-002
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { RuntimeState } from '../store';

/**
 * A single audit log entry capturing an event and its state transition.
 */
export interface AuditEntry {
  /** Unique entry identifier */
  id: string;
  /** Timestamp when the entry was recorded */
  timestamp: number;
  /** The event that was processed */
  event: RuntimeEvent;
  /** State before the reducer executed */
  prevState: RuntimeState;
  /** State after commit, or null if reducer threw or event was denied */
  nextState: RuntimeState | null;
  /** Error message if the reducer threw */
  error?: string;
  /** Policy evaluation result, if Policy Engine is active */
  policyResult?: PolicyResult;
}

/**
 * Filter criteria for querying audit entries.
 */
export interface AuditFilter {
  /** Filter by event type */
  eventType?: string;
  /** Filter entries after this timestamp */
  since?: number;
  /** Filter entries before this timestamp */
  until?: number;
}

/**
 * Policy evaluation verdict.
 */
export type PolicyVerdict = 'allow' | 'deny' | 'transform';

/**
 * Result of policy evaluation for an event.
 */
export interface PolicyResult {
  verdict: PolicyVerdict;
  reason?: string;
  transformedEvent?: RuntimeEvent;
}

/**
 * Event priority levels for the Priority Scheduler.
 */
export type EventPriority = 'critical' | 'high' | 'normal' | 'low' | 'idle';
