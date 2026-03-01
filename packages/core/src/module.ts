// ---------------------------------------------------------------------------
// RuntimeModule — the extension contract for the Interaction Runtime
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { EventBus } from './event-bus';
import type { RuntimeState, RuntimeStore } from './store';
import type { EventReducer, SchedulerMiddleware, Scheduler } from './scheduler';

/**
 * A RuntimeModule plugs into the Factory.
 * It contributes: initial state, reducers, middleware, and an optional controller.
 * Modules are the extension mechanism — Core never needs modification.
 */
export interface RuntimeModule<TController = unknown> {
  /** Unique module identifier */
  name: string;

  /** State slice contributed by this module (merged into RuntimeState) */
  initialState?: Partial<RuntimeState>;

  /** Reducers to register with Scheduler. Map<eventType, reducer>. */
  reducers?: Record<string, EventReducer>;

  /** Middleware to add to Scheduler pipeline */
  middleware?: SchedulerMiddleware[];

  /**
   * Factory function to create the module's controller.
   * Called after Core is wired. Receives Core subsystems.
   * Returns a controller object exposed on `runtime.modules[name]`.
   */
  createController?: (core: {
    bus: EventBus;
    scheduler: Scheduler;
    store: RuntimeStore;
  }) => TController;
}
