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
export { createDrawerModule } from './modules/drawer-module';
export type { DrawerModuleState, DrawerController, DrawerEntry, DrawerAnchor } from './modules/drawer-module';
export { createNotificationModule } from './modules/notification-module';
export type {
  NotificationModuleState,
  NotificationController,
  NotificationEntry,
  NotificationType,
  NotificationModuleOptions,
} from './modules/notification-module';

// Form Module (STAGE-005)
export { createFormModule } from './modules/form-module';
export type {
  FormModuleState,
  FormController,
  FieldState,
  FormValidator,
} from './modules/form-module';
export {
  FORM_REGISTER_FIELD,
  FORM_UNREGISTER_FIELD,
  FORM_SET_VALUE,
  FORM_SET_ERROR,
  FORM_SET_TOUCHED,
  FORM_VALIDATE,
  FORM_SUBMIT_START,
  FORM_SUBMIT_SUCCESS,
  FORM_SUBMIT_ERROR,
  FORM_RESET,
} from './modules/form-module';

// Async Module (STAGE-005)
export { createAsyncModule } from './modules/async-module';
export type {
  AsyncModuleState,
  AsyncController,
  AsyncOperation,
  AsyncStatus,
} from './modules/async-module';
export {
  ASYNC_START,
  ASYNC_SUCCESS,
  ASYNC_ERROR,
  ASYNC_RESET,
} from './modules/async-module';

// Interaction DSL (STAGE-006)
export { createInteractionDSL } from './interaction-dsl';
export type {
  InteractionDSL,
  ModalDSL,
  DrawerDSL,
  NotifyDSL,
  FormDSL,
  AsyncDSL,
  NotifyOptions,
} from './interaction-dsl';

// State Selectors (STAGE-004)
export { selectFromStore, createSelector } from './selector';
export type { StateSelector } from './selector';

// Module Lifecycle (STAGE-004)
export { MODULE_INIT, MODULE_DESTROY } from './lifecycle';
export type { ModuleStatus } from './lifecycle';

// Inter-module Communication (STAGE-004)
export { waitFor, WaitForTimeoutError } from './wait-for';
export type { WaitForOptions } from './wait-for';

// DevTools & Automation (STAGE-007)
export { createDevToolsModule, buildStateTree, diffSnapshots } from './devtools';
export type { DevToolsModuleState } from './devtools';
export {
  DEVTOOLS_SNAPSHOT_CAPTURED,
  DEVTOOLS_TIMELINE_CLEARED,
  DEVTOOLS_METRICS_RESET,
} from './devtools';
export { createRuntimeInspector } from './devtools';
export type {
  RuntimeInspector,
  DevToolsOptions,
  DevToolsController,
  TimelineEntry,
  TimelineFilter,
  PerformanceMetrics,
  DevToolsSnapshot,
  StateDiff,
  StateTreeNode,
  AgentInterface,
} from './devtools';

// Governance Layer (Layer 1 — STAGE-002)
export {
  createAuditTrail,
  createAuditMiddleware,
  createReplaySystem,
  computeStateHash,
  createPolicyEngine,
  createPolicyMiddleware,
  createPriorityScheduler,
  createPriorityMiddleware,
} from './governance';
export type {
  AuditEntry,
  AuditFilter,
  AuditTrail,
  AuditTrailOptions,
  PolicyResult,
  PolicyVerdict,
  PolicyEngine,
  PolicyRule,
  ReplaySystem,
  ReplayOptions,
  ReplayResult,
  EventPriority,
  PriorityScheduler,
  PriorityConfig,
  ConflictStrategy,
  ConflictRule,
} from './governance';
