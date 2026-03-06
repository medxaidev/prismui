// ---------------------------------------------------------------------------
// Policy Middleware — intercepts events for policy evaluation before reducer
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { SchedulerMiddleware } from '../scheduler';
import type { RuntimeStore } from '../store';
import type { PolicyEngine } from './policy-engine';
import type { AuditTrail } from './audit-trail';

/**
 * Create policy middleware that evaluates events against the PolicyEngine.
 *
 * Behavior:
 * - 'allow': call next() — event proceeds to reducer.
 * - 'deny': do NOT call next() — event is silently dropped.
 * - 'transform': mutate the event in-place with transformedEvent fields, then call next().
 *
 * If an AuditTrail is provided, denied events are recorded with nextState = null.
 */
export function createPolicyMiddleware(
  policy: PolicyEngine,
  store: RuntimeStore,
  audit?: AuditTrail,
): SchedulerMiddleware {
  return (event, next) => {
    const state = store.getState();
    const result = policy.evaluate(event, state);

    if (result.verdict === 'deny') {
      // Record denied event in audit trail if available
      if (audit) {
        audit.record({
          event,
          prevState: state,
          nextState: null,
          policyResult: result,
        });
      }
      // Do NOT call next() — event is dropped
      return;
    }

    if (result.verdict === 'transform' && result.transformedEvent) {
      // Mutate event in-place so downstream middleware/reducer sees transformed version
      const transformed = result.transformedEvent;
      (event as any).type = transformed.type;
      (event as any).payload = transformed.payload;
      if (transformed.source !== undefined) {
        (event as any).source = transformed.source;
      }
    }

    // 'allow' or 'transform' — proceed
    next();
  };
}
