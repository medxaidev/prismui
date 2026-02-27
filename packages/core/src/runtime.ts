// ---------------------------------------------------------------------------
// InteractionRuntime — Factory that composes EventBus + Store + Scheduler
// with module injection support.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import { createEventBus, type RuntimeEvent, type EventBus } from './event-bus';
import { createRuntimeStore, type RuntimeState, type RuntimeStore } from './store';
import { createScheduler, type SchedulerMiddleware, type Scheduler } from './scheduler';
import type { RuntimeModule } from './module';

/**
 * The assembled Interaction Runtime.
 * Provides convenience methods delegating to subsystems.
 */
export interface InteractionRuntime {
  readonly bus: EventBus;
  readonly store: RuntimeStore;
  readonly scheduler: Scheduler;

  /** Module controllers, keyed by module name */
  readonly modules: Record<string, unknown>;

  /** Dispatch an event. Timestamp is added by EventBus. */
  dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, 'timestamp'>): void;

  /** Get current state (convenience for store.getState()). */
  getState(): Readonly<RuntimeState>;

  /** Subscribe to state changes (convenience for store.subscribe()). */
  subscribe(listener: (state: RuntimeState) => void): () => void;

  /** Clean up all subscriptions, reducers, and history. */
  destroy(): void;
}

/** Options for createInteractionRuntime(). */
export interface RuntimeOptions {
  historySize?: number;
  initialState?: Partial<RuntimeState>;
  modules?: RuntimeModule[];
  middleware?: SchedulerMiddleware[];
}

/**
 * Create an InteractionRuntime instance.
 *
 * Assembly order:
 * 1. Merge all module initialState + options.initialState
 * 2. Create EventBus → RuntimeStore (merged state) → Scheduler
 * 3. Register module reducers, middleware, controllers
 * 4. Add options.middleware (after module middleware)
 */
export function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime {
  const modules = options?.modules ?? [];
  const extraMiddleware = options?.middleware ?? [];

  // 1. Merge initial state: module initialState slices + options.initialState
  let mergedInitialState: Partial<RuntimeState> = {};
  for (const mod of modules) {
    if (mod.initialState) {
      mergedInitialState = { ...mergedInitialState, ...mod.initialState };
    }
  }
  if (options?.initialState) {
    mergedInitialState = { ...mergedInitialState, ...options.initialState };
  }

  // 2. Create subsystems
  const bus = createEventBus({ historySize: options?.historySize });
  const store = createRuntimeStore(mergedInitialState);
  const scheduler = createScheduler(store, bus);

  // 3. Wire modules
  const moduleControllers: Record<string, unknown> = {};
  const unregisterFns: (() => void)[] = [];

  for (const mod of modules) {
    // Register reducers
    if (mod.reducers) {
      for (const [type, reducer] of Object.entries(mod.reducers)) {
        const unreg = scheduler.registerReducer(type, reducer);
        unregisterFns.push(unreg);
      }
    }

    // Add middleware
    if (mod.middleware) {
      for (const mw of mod.middleware) {
        scheduler.use(mw);
      }
    }

    // Create controller
    if (mod.createController) {
      moduleControllers[mod.name] = mod.createController({ bus, scheduler, store });
    }
  }

  // 4. Add extra middleware (after module middleware)
  for (const mw of extraMiddleware) {
    scheduler.use(mw);
  }

  // Track store subscriptions for destroy
  const storeUnsubs: (() => void)[] = [];

  const runtime: InteractionRuntime = {
    bus,
    store,
    scheduler,
    modules: moduleControllers,

    dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, 'timestamp'>): void {
      bus.dispatch(event as Omit<RuntimeEvent, 'timestamp'>);
    },

    getState(): Readonly<RuntimeState> {
      return store.getState();
    },

    subscribe(listener: (state: RuntimeState) => void): () => void {
      const unsub = store.subscribe(listener);
      storeUnsubs.push(unsub);
      return unsub;
    },

    destroy(): void {
      // Unregister all reducers
      for (const unreg of unregisterFns) {
        unreg();
      }
      unregisterFns.length = 0;

      // Unsubscribe all store listeners registered via runtime.subscribe
      for (const unsub of storeUnsubs) {
        unsub();
      }
      storeUnsubs.length = 0;

      // Clear bus (removes all subscribers + history)
      bus.clear();
    },
  };

  return runtime;
}
