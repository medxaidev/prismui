// ---------------------------------------------------------------------------
// Audit Middleware — wraps reducer to capture prevState/nextState snapshots
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { SchedulerMiddleware } from '../scheduler';
import type { RuntimeStore } from '../store';
import type { AuditTrail } from './audit-trail';

/**
 * Create audit middleware that records every event processing into the AuditTrail.
 *
 * The middleware wraps around the reducer:
 * 1. Before: snapshot prevState
 * 2. Call next() (middleware chain continues → reducer executes → commit)
 * 3. After: snapshot nextState and record entry
 *
 * Note: Reducer errors are caught by the Scheduler's executeReducer try/catch
 * (which dispatches SYSTEM_ERROR). The error does NOT propagate to middleware.
 * We detect "no change" by comparing state versions before/after.
 * For explicit error tracking, subscribe to SYSTEM_ERROR events on the bus.
 */
export function createAuditMiddleware(
  audit: AuditTrail,
  store: RuntimeStore,
): SchedulerMiddleware {
  return (event, next) => {
    const prevState = store.getState();

    // Execute the rest of the middleware chain + reducer
    next();

    const nextState = store.getState();

    // Record the audit entry
    // If versions match, reducer either threw (no commit) or event had no reducer
    const stateChanged = nextState.version !== prevState.version;

    audit.record({
      event,
      prevState,
      nextState: stateChanged ? nextState : prevState,
    });
  };
}
