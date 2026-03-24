// ---------------------------------------------------------------------------
// Scheduler — Reducer Commit Engine
// The ONLY place where store.setState() is called.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent, EventBus } from './event-bus';
import type { RuntimeState, RuntimeStore } from './store';
import { isNamespacedActionType } from './action-types';

/**
 * Reducer return type. Supports declarative side-effect events.
 * Reducers remain pure — they don't dispatch events themselves,
 * they declare what events SHOULD be dispatched after commit.
 */
export interface ReducerCommitResult {
  nextState: RuntimeState;
  sideEffects?: RuntimeEvent[];
}

/**
 * Pure function: (event, prevState) → ReducerCommitResult.
 * Reducers MUST NOT access store directly.
 */
export type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => ReducerCommitResult;

/** Middleware: (event, next) => void. Call next() to continue chain. */
export type SchedulerMiddleware = (event: RuntimeEvent, next: () => void) => void;

/** Event type dispatched when a reducer throws. Never processed by reducers. */
export const SYSTEM_ERROR = 'SYSTEM_ERROR';

/**
 * The Scheduler is the event processing pipeline.
 *
 * Flow: bus.dispatch(event) → scheduler.process(event)
 *       → middleware chain → reducer lookup → commit → sideEffects dispatch
 */
export interface Scheduler {
  /** Process an event through middleware → reducer → commit pipeline. */
  process(event: RuntimeEvent): void;

  /** Register a reducer for a specific event type. Returns unregister function. */
  registerReducer(type: string, reducer: EventReducer): () => void;

  /** Add middleware to the processing pipeline. */
  use(middleware: SchedulerMiddleware): void;
}

/**
 * Create a Scheduler instance.
 *
 * - Subscribes to EventBus on creation — processes every dispatched event.
 * - Only the Scheduler calls store.setState() (commit boundary).
 * - Reducer errors do NOT corrupt state.
 */
export function createScheduler(store: RuntimeStore, bus: EventBus): Scheduler {
  const reducers = new Map<string, EventReducer>();
  const middlewareStack: SchedulerMiddleware[] = [];

  function process(event: RuntimeEvent): void {
    // SYSTEM_ERROR is never processed by reducers — prevents infinite loops
    if (event.type === SYSTEM_ERROR) return;

    // Build middleware chain ending with reducer execution
    let index = 0;

    function next(): void {
      if (index < middlewareStack.length) {
        const mw = middlewareStack[index++];
        mw(event, next);
      } else {
        // End of middleware chain — execute reducer
        executeReducer(event);
      }
    }

    next();
  }

  function executeReducer(event: RuntimeEvent): void {
    const reducer = reducers.get(event.type);
    if (!reducer) return; // Silently drop unregistered event types

    const prevState = store.getState();

    try {
      const result = reducer(event, prevState);

      // Commit — the ONLY place store.setState() is called
      store.setState(() => result.nextState);

      // Dispatch side effects AFTER commit
      if (result.sideEffects && result.sideEffects.length > 0) {
        for (let i = 0; i < result.sideEffects.length; i++) {
          bus.dispatch(result.sideEffects[i]);
        }
      }
    } catch (error) {
      // Do NOT commit — state remains unchanged
      console.error('[Scheduler] Reducer error:', { event, prevState, error });

      // Dispatch SYSTEM_ERROR event (will not be processed by reducers)
      bus.dispatch({
        type: SYSTEM_ERROR,
        payload: { originalEvent: event, error },
      });
    }
  }

  // Subscribe to EventBus — process every dispatched event
  bus.subscribe((event: RuntimeEvent) => {
    process(event);
  });

  const scheduler: Scheduler = {
    process,

    registerReducer(type: string, reducer: EventReducer): () => void {
      if (!isNamespacedActionType(type) && type !== SYSTEM_ERROR) {
        console.warn(
          `[Scheduler] Action type "${type}" does not follow namespaced format (module/action). ` +
          `Consider using createModuleActions().`,
        );
      }

      if (reducers.has(type)) {
        console.warn(
          `[Scheduler] Reducer conflict: type "${type}" is already registered. ` +
          `The new reducer will overwrite the existing one.`,
        );
      }

      reducers.set(type, reducer);
      return () => {
        reducers.delete(type);
      };
    },

    use(middleware: SchedulerMiddleware): void {
      middlewareStack.push(middleware);
    },
  };

  return scheduler;
}
