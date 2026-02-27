// ---------------------------------------------------------------------------
// @prismui/core — public API barrel exports
// ---------------------------------------------------------------------------

// Factories
export { createEventBus } from './event-bus';
export { createRuntimeStore } from './store';
export { createScheduler } from './scheduler';
export { createInteractionRuntime } from './runtime';

// Constants
export { SYSTEM_ERROR } from './scheduler';

// Types (re-exported from consolidated types module)
export type {
  RuntimeEvent,
  EventListener,
  EventBusOptions,
  EventBus,
  RuntimeState,
  StateListener,
  RuntimeStore,
  ReducerCommitResult,
  EventReducer,
  SchedulerMiddleware,
  Scheduler,
  RuntimeModule,
  InteractionRuntime,
  RuntimeOptions,
} from './types';

// Built-in Modules (Layer 0.5)
export { createPageModule } from './modules/page-module';
export type { PageModuleState, PageController } from './modules/page-module';
export { createModalModule } from './modules/modal-module';
export type { ModalModuleState, ModalController } from './modules/modal-module';
