# STAGE-001: Runtime Core

**Status:** 🔄 In Progress  
**Start Date:** 2026-02-25  
**Priority:** Critical  
**Dependencies:** None (foundational stage)  
**Estimated Sessions:** 9  
**Estimated Tests:** ~107

---

## Executive Summary

Build the **minimal viable Interaction Runtime** — a framework-agnostic event-driven orchestration engine (Layer 0) with a React adapter (Layer 2) and minimal rendering binding (Layer 3). This stage proves that **pages, modals, and interactions can be controlled entirely through Runtime dispatch, not component state**.

**Core Philosophy:**

> Stage-1 is not about UI. It is about building a deterministic, programmable Interaction Core.

---

## Strategic Goals

1. ✅ Framework-agnostic Interaction Core (pure TypeScript, zero dependencies)
2. ✅ Deterministic flow: `Event → Scheduler → [Middleware] → Reducer → Commit → Render`
3. ✅ Module injection pattern: Core is extensible without modification
4. ✅ React as a thin adapter layer (zero business logic in adapter)
5. ✅ Page + Modal as built-in modules (proving the module pattern works)
6. ✅ Minimal demo proving Runtime-controlled interaction flow

---

## Architectural Position

Stage-1 implements:

| Layer       | Name                   | Package           | Status     |
| ----------- | ---------------------- | ----------------- | ---------- |
| **Layer 0** | Interaction Core       | `packages/core/`  | This stage |
| **Layer 2** | React Adapter          | `packages/react/` | This stage |
| **Layer 3** | Minimal Render Binding | `packages/demo/`  | This stage |

**NOT implemented in this stage:**

| Layer       | Name             | Deferred To |
| ----------- | ---------------- | ----------- |
| **Layer 1** | Governance Layer | STAGE-002   |

---

## Stage Scope

### Included

**Interaction Core (Layer 0 — pure infrastructure):**

- EventBus (dispatch, subscribe, type-filtered, history)
- RuntimeStore (immutable state, versioned snapshots, subscriber notification)
- Scheduler (Reducer Commit Engine, middleware chain, synchronous)
- Runtime Factory (`createInteractionRuntime()` with module/middleware injection)

**Built-in Modules (Layer 0.5 — shipped with Core, plugged in via module system):**

- Page Module (`createPageModule()` — mount/unmount/transition/lock)
- Modal Module (`createModalModule()` — open/close/closeAll)

**React Adapter (Layer 2):**

- Provider + core hooks (`useRuntime`, `useRuntimeState`)
- Convenience hooks (`usePage`, `useModal`)

**Demo (Layer 3):**

- Minimal Demo (4 scenarios)

### Excluded (Explicit Non-Goals)

- ❌ Governance Layer (Policy, Audit, Replay) — STAGE-002
- ❌ Semantic Theme System — STAGE-003
- ❌ Interaction Modules (Modal/Drawer/Notification Runtime) — STAGE-004
- ❌ Component Library — not in scope for PrismUI 2.0
- ❌ Animation / Motion System
- ❌ Performance Optimization
- ❌ Concurrent / Priority Scheduling — STAGE-002
- ❌ DevTools — STAGE-008

---

## Design Principles

### 1. Runtime First

All behavior flows through `runtime.dispatch(event)`.

```
❌ component.setState({ currentPage: 'Dashboard' })
✅ runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'Dashboard' } })
```

### 2. Deterministic Flow

```
Event → Scheduler → [Middleware] → Reducer → Commit → Subscribers → Render
```

No implicit side effects. No hidden state transitions.

### 3. Framework Isolation

`packages/core/` contains zero React, zero DOM, zero browser API imports. Verified by CI lint rule.

---

## Phase Breakdown

### Phase A: EventBus + RuntimeStore (2 sessions)

**Goal:** Build the foundational event system and state container.

---

#### Phase A1: EventBus (1 session)

**Files:**

- `packages/core/src/event-bus.ts`
- `packages/core/src/event-bus.test.ts`

**API Design:**

```typescript
interface RuntimeEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number; // Added by runtime.dispatch(), NOT by caller
  source?: string;
}

interface EventBus {
  dispatch<T>(event: RuntimeEvent<T>): void;
  subscribe(listener: (event: RuntimeEvent) => void): () => void;
  subscribe(type: string, listener: (event: RuntimeEvent) => void): () => void;
  getHistory(): readonly RuntimeEvent[];
  clear(): void;
}

function createEventBus(options?: { historySize?: number }): EventBus;
```

**Implementation Details:**

- Global subscribers stored in array, iterated on every dispatch
- Type-filtered subscribers stored in `Map<string, Array<Listener>>`
- History stored as ring buffer with configurable `historySize` (default: 100)
- `dispatch()` is synchronous — no async, no batching
- `subscribe()` returns unsubscribe function
- `clear()` removes all subscribers and clears history

**Tests (~15):**

| #   | Test                                              | Group     |
| --- | ------------------------------------------------- | --------- |
| 1   | creates EventBus instance                         | creation  |
| 2   | dispatches event to global subscribers            | dispatch  |
| 3   | dispatches event to type-filtered subscribers     | dispatch  |
| 4   | does not deliver to non-matching type subscribers | dispatch  |
| 5   | includes timestamp in dispatched event            | dispatch  |
| 6   | supports multiple global subscribers              | subscribe |
| 7   | supports multiple type-filtered subscribers       | subscribe |
| 8   | returns unsubscribe function                      | subscribe |
| 9   | unsubscribed listener does not receive events     | subscribe |
| 10  | records events in history                         | history   |
| 11  | respects historySize limit                        | history   |
| 12  | getHistory returns readonly array                 | history   |
| 13  | clear removes all subscribers                     | clear     |
| 14  | clear empties history                             | clear     |
| 15  | has no React/DOM imports                          | isolation |

**Acceptance Criteria:**

- [ ] `createEventBus()` returns a working EventBus
- [ ] Type-filtered subscription works
- [ ] History ring buffer respects size limit
- [ ] Zero React/DOM imports in file
- [ ] 15 tests pass, `tsc --noEmit` clean

---

#### Phase A2: RuntimeStore (1 session)

**Files:**

- `packages/core/src/store.ts`
- `packages/core/src/store.test.ts`

**API Design:**

```typescript
/**
 * Core state: minimal, extensible via modules.
 * Page/Modal fields are added by built-in modules, not hardcoded in Core.
 */
interface RuntimeState {
  version: number;
  [key: string]: unknown; // Module-contributed state (page, modal, etc.)
}

interface RuntimeStore {
  getState(): Readonly<RuntimeState>;
  setState(updater: (prev: RuntimeState) => RuntimeState): void;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  getSnapshot(): RuntimeState;
}

function createRuntimeStore(initial?: Partial<RuntimeState>): RuntimeStore;
```

> **Design Note:** `RuntimeState` only owns `version`. Business fields like `currentPage`, `mountedPages`,
> `modalStack`, `locked` are contributed by built-in modules (Page Module, Modal Module) via `initialState`
> in their module definition. This keeps Core generic — future modules add their own state slices
> without modifying Core types. TypeScript narrowing is done via module-specific interfaces that extend `RuntimeState`.

**Implementation Details:**

- State stored as plain object, never mutated directly
- `setState(updater)` creates new state via updater function, then notifies subscribers
- `version` auto-incremented on every `setState` call
- `getSnapshot()` returns `Object.freeze({ ...state })` (deep frozen)
- Subscribers called synchronously after state change
- Default initial state: `{ version: 0 }` (modules extend this via `initialState`)

**Tests (~15):**

| #   | Test                                                | Group     |
| --- | --------------------------------------------------- | --------- |
| 1   | creates store with default initial state            | creation  |
| 2   | creates store with custom initial state             | creation  |
| 3   | getState returns current state                      | getState  |
| 4   | getState returns readonly reference                 | getState  |
| 5   | setState applies updater function                   | setState  |
| 6   | setState does not mutate previous state             | setState  |
| 7   | setState increments version                         | setState  |
| 8   | multiple setState calls increment version correctly | setState  |
| 9   | subscribe is called on state change                 | subscribe |
| 10  | subscribe receives new state                        | subscribe |
| 11  | multiple subscribers all notified                   | subscribe |
| 12  | unsubscribe stops notifications                     | subscribe |
| 13  | getSnapshot returns frozen copy                     | snapshot  |
| 14  | getSnapshot is isolated from future changes         | snapshot  |
| 15  | has no React/DOM imports                            | isolation |

**Acceptance Criteria:**

- [ ] Immutable state updates via updater function
- [ ] Subscriber notification on every state change
- [ ] Version tracking auto-increments
- [ ] `getSnapshot()` returns frozen, isolated copy
- [ ] Zero React/DOM imports
- [ ] 15 tests pass, `tsc --noEmit` clean

---

### Phase B: Scheduler — Reducer Commit Engine (1 session)

**Goal:** Build the event processing pipeline with Reducer Commit Model.

**Files:**

- `packages/core/src/scheduler.ts`
- `packages/core/src/scheduler.test.ts`

**API Design (Reducer Commit Model):**

> **Critical upgrade from original design:** Handlers are replaced by **pure reducers**.
> Reducers MUST NOT access `store` directly. They receive `prevState` and return `ReducerCommitResult`.
> Only the Scheduler's internal commit mechanism writes to the store.

```typescript
/**
 * Reducer return type. Supports declarative side-effect events.
 * Reducers remain pure — they don't dispatch events themselves,
 * they declare what events SHOULD be dispatched after commit.
 */
interface ReducerCommitResult {
  nextState: RuntimeState;
  sideEffects?: RuntimeEvent[]; // Events to dispatch AFTER commit (STAGE-002+)
}

/** Pure function: (event, prevState) → ReducerCommitResult. No side effects. */
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => ReducerCommitResult;

type SchedulerMiddleware = (event: RuntimeEvent, next: () => void) => void;

interface Scheduler {
  /** Process an event through middleware → reducer → commit pipeline */
  process(event: RuntimeEvent): void;

  /** Register a reducer for a specific event type. Returns unregister function. */
  registerReducer(type: string, reducer: EventReducer): () => void;

  /** Add middleware to the processing pipeline */
  use(middleware: SchedulerMiddleware): void;
}

function createScheduler(store: RuntimeStore, bus: EventBus): Scheduler;
```

> **Design Note — `sideEffects`:** Reducers are pure, but sometimes a state change must trigger
> follow-up events (e.g., `PAGE_UNMOUNT` after lock timeout). Instead of dispatching inside reducers
> (impure), reducers **declare** side-effect events in `ReducerCommitResult.sideEffects`.
> The Scheduler dispatches them AFTER commit. In STAGE-001, this field is optional and may be empty.
> STAGE-002 (Governance) and STAGE-004 (Interaction Modules) will leverage it.
>
> **Shorthand:** When a reducer only needs to return state, it can return `{ nextState: newState }`.

**Implementation Details — Reducer Commit Model:**

The Scheduler is the **only place** where `store.setState()` is called. Reducers never touch the store.

- Reducers stored in `Map<string, EventReducer>` — one reducer per event type
- Middleware stored in array, executed in registration order
- `process(event)` builds middleware chain ending with reducer lookup + **commit**
- If no reducer found for event type, event is silently dropped (no error)
- Middleware pattern: `(event, next) => { /* before */ next(); /* after */ }`
- Scheduler subscribes to EventBus on creation — processes every dispatched event
- After commit, if `result.sideEffects` is non-empty, dispatch each via `bus.dispatch()`

**Processing Flow (Reducer Commit):**

```
bus.dispatch(event)
    → scheduler.process(event)
    → middleware[0](event, next)
        → middleware[1](event, next)
            → reducer = reducers.get(event.type)
            → if reducer:
                → prevState = store.getState()
                → result = reducer(event, prevState)          // pure computation
                → store.setState(() => result.nextState)      // commit (only here)
                → for each result.sideEffects → bus.dispatch  // after commit
```

**Why Reducer Commit (see ADR-006):**

| Old Model (handler + store)                                         | New Model (reducer commit)                              |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `handler(event, store)` — handler calls `store.setState()` directly | `reducer(event, prevState) → nextState` — pure function |
| Handler is impure (side effect: store mutation)                     | Reducer is pure (input → output)                        |
| Audit cannot capture precise state delta                            | Audit captures `prevState` + `nextState` trivially      |
| Replay cannot guarantee identical results                           | Replay is deterministic by construction                 |
| Rollback is impossible                                              | Rollback = don't commit                                 |
| Error during handler leaves store in partial state                  | Error during reducer = no commit, state unchanged       |

**Error Handling:**

If a reducer throws an exception:

1. **Do NOT commit** — state remains unchanged
2. **Record audit entry** — log the error with event + prevState
3. **Dispatch SYSTEM_ERROR event** — `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
4. **SYSTEM_ERROR itself is NOT processed by reducers** — prevents infinite loops

**Tests (~18):**

| #   | Test                                              | Group       |
| --- | ------------------------------------------------- | ----------- |
| 1   | creates Scheduler instance                        | creation    |
| 2   | routes event to registered reducer                | reducer     |
| 3   | reducer receives event and prevState (not store)  | reducer     |
| 4   | reducer result.nextState is committed to store    | reducer     |
| 5   | unregistered event types are silently dropped     | reducer     |
| 6   | registerReducer returns unregister function       | reducer     |
| 7   | unregistered reducer no longer receives events    | reducer     |
| 8   | store.setState is only called by Scheduler commit | commit      |
| 9   | prevState and nextState are captured correctly    | commit      |
| 10  | sideEffects are dispatched after commit           | sideEffects |
| 11  | sideEffects are not dispatched if empty/undefined | sideEffects |
| 12  | middleware executes before reducer                | middleware  |
| 13  | multiple middleware execute in order              | middleware  |
| 14  | middleware can stop chain by not calling next     | middleware  |
| 15  | middleware receives the event                     | middleware  |
| 16  | reducer error does not commit state               | error       |
| 17  | processes events from EventBus automatically      | integration |
| 18  | has no React/DOM imports                          | isolation   |

**Acceptance Criteria:**

- [ ] Reducers are pure: `(event, prevState) → ReducerCommitResult` — no store access
- [ ] Only Scheduler calls `store.setState()` (commit boundary)
- [ ] `sideEffects` dispatched after successful commit (not before, not on error)
- [ ] Middleware chain executes in registration order
- [ ] Middleware can intercept (not call `next()`)
- [ ] Reducer errors do not corrupt state
- [ ] 18 tests pass, `tsc --noEmit` clean

---

### Phase C: Runtime Factory + Module System (2 sessions)

**Goal:** Build the module injection system and compose everything into `createInteractionRuntime()`.

---

#### Phase C1: Module System + Runtime Factory (1 session)

**Files:**

- `packages/core/src/module.ts` (RuntimeModule interface)
- `packages/core/src/runtime.ts`
- `packages/core/src/types.ts` (consolidated public types)
- `packages/core/src/index.ts` (barrel exports)
- `packages/core/src/runtime.test.ts`

**API Design:**

```typescript
/**
 * A RuntimeModule plugs into the Factory.
 * It contributes: initial state, reducers, middleware, and an optional controller.
 * Modules are the extension mechanism — Core never needs modification.
 */
interface RuntimeModule<TController = unknown> {
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

interface InteractionRuntime {
  readonly bus: EventBus;
  readonly store: RuntimeStore;
  readonly scheduler: Scheduler;

  /** Module controllers, keyed by module name */
  readonly modules: Record<string, unknown>;

  dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, "timestamp">): void;
  getState(): Readonly<RuntimeState>;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  destroy(): void;
}

interface RuntimeOptions {
  historySize?: number;
  initialState?: Partial<RuntimeState>;
  modules?: RuntimeModule[]; // ← module injection
  middleware?: SchedulerMiddleware[]; // ← additional middleware
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

> **Design Note — Why modules?** PageController and Modal are not Core infrastructure.
> They are built-in Interaction Modules that happen to ship with Core. This pattern means:
>
> - **STAGE-002:** `createInteractionRuntime({ middleware: [createPolicyMiddleware()] })` — no Core changes
> - **STAGE-004:** `createInteractionRuntime({ modules: [createDrawerModule()] })` — no Core changes
> - **User-land:** Custom modules can be created by consumers
>
> Core only knows about EventBus, Store, Scheduler, and the Module contract.

**Implementation Details:**

- Factory creates: EventBus → RuntimeStore → Scheduler
- Factory iterates `options.modules`:
  1. Merge each module's `initialState` into the store's initial state
  2. Register each module's `reducers` with Scheduler
  3. Add each module's `middleware` to Scheduler
  4. Call each module's `createController()` and store result in `runtime.modules[name]`
- Factory adds `options.middleware` to Scheduler (after module middleware)
- `dispatch()` convenience: adds `timestamp: Date.now()` then delegates to `bus.dispatch()`
  (callers pass `Omit<RuntimeEvent, "timestamp">` — the timestamp is the **single source of time**)
- `getState()` convenience: delegates to `store.getState()`
- `subscribe()` convenience: delegates to `store.subscribe()`
- `destroy()`: calls `bus.clear()`, removes all store subscriptions, unregisters all reducers

**Tests (~12):**

| #   | Test                                                      | Group       |
| --- | --------------------------------------------------------- | ----------- |
| 1   | creates runtime with all subsystems                       | creation    |
| 2   | dispatch adds timestamp and dispatches event              | dispatch    |
| 3   | getState returns current store state                      | convenience |
| 4   | subscribe notifies on state change                        | convenience |
| 5   | full pipeline: dispatch → reducer → commit → state update | integration |
| 6   | module initialState is merged into store                  | modules     |
| 7   | module reducers are registered with Scheduler             | modules     |
| 8   | module middleware is added to Scheduler                   | modules     |
| 9   | module controller is accessible via runtime.modules       | modules     |
| 10  | destroy cleans up all subscriptions and reducers          | destroy     |
| 11  | multiple runtime instances are isolated                   | isolation   |
| 12  | has no React/DOM imports                                  | isolation   |

**Acceptance Criteria:**

- [ ] Factory composes Core from EventBus + Store + Scheduler
- [ ] Modules inject state, reducers, middleware, and controllers
- [ ] Convenience methods delegate correctly
- [ ] `destroy()` cleans up everything
- [ ] Multiple instances don't interfere
- [ ] Zero React/DOM imports in `packages/core/`
- [ ] 12 tests pass, `tsc --noEmit` clean

---

#### Phase C2: Built-in Modules — Page + Modal (1 session)

**Goal:** Implement Page and Modal as `RuntimeModule` instances, proving the module pattern works.

> **Architectural Position:** These are **Layer 0.5 — Built-in Interaction Modules**.
> They ship with `packages/core/` but are NOT Core infrastructure.
> They plug in via the same `RuntimeModule` interface that any consumer module would use.

**Files:**

- `packages/core/src/modules/page-module.ts`
- `packages/core/src/modules/page-module.test.ts`
- `packages/core/src/modules/modal-module.ts`
- `packages/core/src/modules/modal-module.test.ts`

**Page Module API:**

```typescript
interface PageModuleState {
  currentPage: string | null;
  mountedPages: string[];
  locked: boolean;
}

interface PageController {
  mount(pageId: string): void;
  unmount(pageId: string): void;
  transition(pageId: string): void;
  lock(): void;
  unlock(): void;
  getCurrent(): string | null;
  getMounted(): string[];
  isLocked(): boolean;
}

function createPageModule(): RuntimeModule<PageController>;
```

**Modal Module API:**

```typescript
interface ModalModuleState {
  modalStack: string[];
}

interface ModalController {
  open(modalId: string): void;
  close(modalId?: string): void;
  closeAll(): void;
  isOpen(modalId: string): boolean;
  getStack(): string[];
}

function createModalModule(): RuntimeModule<ModalController>;
```

**Usage (in setup.ts):**

```typescript
const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
});

// Access controllers via typed helpers
const page = runtime.modules.page as PageController;
const modal = runtime.modules.modal as ModalController;

page.transition("Dashboard");
modal.open("confirm");
```

**Implementation Details — Page Module:**

- `initialState`: `{ currentPage: null, mountedPages: [], locked: false }`
- Reducers registered for: `PAGE_MOUNT`, `PAGE_UNMOUNT`, `PAGE_TRANSITION`, `PAGE_LOCK`, `PAGE_UNLOCK`
- Each method dispatches an event via `bus.dispatch()`
- Convenience getters (`getCurrent`, `getMounted`, `isLocked`) read directly from `store.getState()`

**Event Types — Page Module:**

| Method           | Event Type        | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | —                    |
| `unlock()`       | `PAGE_UNLOCK`     | —                    |

**Implementation Details — Modal Module:**

- `initialState`: `{ modalStack: [] }`
- Reducers registered for: `MODAL_OPEN`, `MODAL_CLOSE`, `MODAL_CLOSE_ALL`
- Each method dispatches an event via `bus.dispatch()`
- `open(id)` → pushes to `modalStack`; `close(id?)` → pops specific or top; `closeAll()` → empties stack

**Event Types — Modal Module:**

| Method       | Event Type        | Payload                |
| ------------ | ----------------- | ---------------------- |
| `open(id)`   | `MODAL_OPEN`      | `{ modalId: string }`  |
| `close(id?)` | `MODAL_CLOSE`     | `{ modalId?: string }` |
| `closeAll()` | `MODAL_CLOSE_ALL` | —                      |

**Tests (~20):**

| #   | Test                                          | Group      |
| --- | --------------------------------------------- | ---------- |
| 1   | createPageModule returns valid RuntimeModule  | creation   |
| 2   | page module contributes initialState          | module     |
| 3   | mount adds page to mountedPages               | mount      |
| 4   | mount sets page as currentPage                | mount      |
| 5   | mount dispatches PAGE_MOUNT event             | mount      |
| 6   | unmount removes page from mountedPages        | unmount    |
| 7   | unmount clears currentPage if it was current  | unmount    |
| 8   | transition changes currentPage                | transition |
| 9   | transition only works for mounted pages       | transition |
| 10  | transition is blocked when locked             | transition |
| 11  | lock sets locked to true                      | lock       |
| 12  | unlock sets locked to false                   | unlock     |
| 13  | createModalModule returns valid RuntimeModule | creation   |
| 14  | modal module contributes initialState         | module     |
| 15  | open adds to modalStack                       | modal      |
| 16  | close removes from modalStack                 | modal      |
| 17  | closeAll empties modalStack                   | modal      |
| 18  | isOpen returns correct status                 | modal      |
| 19  | getStack returns current modal stack          | modal      |
| 20  | modules have no React/DOM imports             | isolation  |

**Acceptance Criteria:**

- [ ] Both modules implement `RuntimeModule` interface
- [ ] Page + Modal state is contributed via `initialState` (not hardcoded in Core)
- [ ] All operations dispatch events (not direct state mutation)
- [ ] Lock prevents page transition
- [ ] All events visible in EventBus history
- [ ] 20 tests pass, `tsc --noEmit` clean

---

### Phase D: React Adapter (2 sessions)

**Goal:** Build the thin React bridge — Provider, hooks, zero business logic.

---

#### Phase D1: Provider + Core Hooks (1 session)

**Files:**

- `packages/react/src/context.ts`
- `packages/react/src/provider.tsx`
- `packages/react/src/use-runtime.ts`
- `packages/react/src/use-runtime-state.ts`
- `packages/react/src/provider.test.tsx`

**API Design:**

```tsx
// Provider
<PrismUIProvider runtime={runtime}>
  <App />
</PrismUIProvider>;

// Core hooks
const runtime = useRuntime(); // full runtime access, throws outside provider
const state = useRuntimeState(); // reactive read-only state
```

**Implementation Details:**

- `RuntimeContext` created via `React.createContext<InteractionRuntime | null>(null)`
- `PrismUIProvider` stores runtime in context, renders children
- `useRuntime()` reads context, throws `[PrismUI] useRuntime must be used within a PrismUIProvider`
- `useRuntimeState()` uses `useSyncExternalStore(store.subscribe, store.getState, store.getSnapshot)`
  (React 18 recommended pattern — avoids tearing, no manual `useState` + `useEffect`)

**Tests (~15):**

| #   | Test                                               | Group           |
| --- | -------------------------------------------------- | --------------- |
| 1   | PrismUIProvider renders children                   | provider        |
| 2   | PrismUIProvider provides runtime via context       | provider        |
| 3   | useRuntime returns runtime instance                | useRuntime      |
| 4   | useRuntime throws outside provider                 | useRuntime      |
| 5   | useRuntime returns stable reference across renders | useRuntime      |
| 6   | useRuntimeState returns current state              | useRuntimeState |
| 7   | useRuntimeState re-renders on state change         | useRuntimeState |
| 8   | useRuntimeState returns readonly state             | useRuntimeState |
| 9   | useRuntimeState updates when page transitions      | useRuntimeState |
| 10  | useRuntimeState updates when page is locked        | useRuntimeState |
| 11  | useRuntimeState cleans up subscription on unmount  | useRuntimeState |
| 12  | multiple useRuntimeState hooks receive same state  | useRuntimeState |
| 13  | provider does not create runtime internally        | provider        |
| 14  | provider accepts different runtime instances       | provider        |
| 15  | hooks contain no business logic                    | isolation       |

**Acceptance Criteria:**

- [ ] Provider bridges runtime to React Context
- [ ] `useRuntime()` throws with descriptive message outside provider
- [ ] `useRuntimeState()` triggers re-render on state change
- [ ] State is read-only from hooks
- [ ] 15 tests pass, `tsc --noEmit` clean

---

#### Phase D2: Convenience Hooks (1 session)

**Files:**

- `packages/react/src/use-page.ts`
- `packages/react/src/use-modal.ts`
- `packages/react/src/index.ts` (barrel exports)
- `packages/react/src/hooks.test.tsx`

**API Design:**

```typescript
// usePage
interface UsePageReturn {
  currentPage: string | null;
  mountedPages: string[];
  isLocked: boolean;
  mount: (pageId: string) => void;
  unmount: (pageId: string) => void;
  transition: (pageId: string) => void;
  lock: () => void;
  unlock: () => void;
}
function usePage(): UsePageReturn;

// useModal
interface UseModalReturn {
  modalStack: string[];
  isOpen: (modalId: string) => boolean;
  open: (modalId: string) => void;
  close: (modalId?: string) => void;
  closeAll: () => void;
}
function useModal(): UseModalReturn;
```

**Implementation Details:**

- `usePage()` combines `useRuntimeState()` for reactive data and `runtime.modules.page` controller for actions
- `useModal()` combines `useRuntimeState()` for `modalStack` and `runtime.modules.modal` controller for actions
- Action functions are stable references (wrapped in `useCallback` referencing runtime module controllers)

**Tests (~12):**

| #   | Test                                        | Group     |
| --- | ------------------------------------------- | --------- |
| 1   | usePage returns current page state          | usePage   |
| 2   | usePage.transition updates currentPage      | usePage   |
| 3   | usePage.lock sets isLocked                  | usePage   |
| 4   | usePage.unlock clears isLocked              | usePage   |
| 5   | usePage.mount adds to mountedPages          | usePage   |
| 6   | usePage.unmount removes from mountedPages   | usePage   |
| 7   | useModal returns modal stack                | useModal  |
| 8   | useModal.open adds to modalStack            | useModal  |
| 9   | useModal.close removes from modalStack      | useModal  |
| 10  | useModal.closeAll empties modalStack        | useModal  |
| 11  | useModal.isOpen returns correct status      | useModal  |
| 12  | hooks are thin wrappers (no business logic) | isolation |

**Acceptance Criteria (Phase D total):**

- [ ] All hooks are thin wrappers around runtime APIs
- [ ] State changes trigger re-render
- [ ] Actions delegate to module controllers or `runtime.dispatch()`
- [ ] 27 tests pass (D1: 15 + D2: 12), `tsc --noEmit` clean

---

### Phase E: Minimal Demo (1 session)

**Goal:** Prove the entire stack works end-to-end with a running application.

**Files:**

- `packages/demo/src/main.tsx` (entry point)
- `packages/demo/src/App.tsx` (root with PrismUIProvider)
- `packages/demo/src/setup.ts` (runtime creation with module injection)
- `packages/demo/src/pages/Dashboard.tsx`
- `packages/demo/src/pages/PatientDetail.tsx`
- `packages/demo/src/components/ConfirmModal.tsx`
- `packages/demo/src/components/EventLog.tsx`
- `packages/demo/package.json`
- `packages/demo/vite.config.ts`

**setup.ts (Module Injection Pattern):**

```typescript
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
} from "@prismui/core";

export const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
});
```

**Demo Scenarios:**

| #   | Scenario            | User Action                         | Expected Result                                                                           |
| --- | ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | **Page Transition** | Click "Go to Patient Detail" button | Page module controller `.transition("PatientDetail")` → UI shows PatientDetail page       |
| 2   | **Modal Mount**     | Click "Open Confirm" button         | Modal module controller `.open("confirm")` → Modal appears                                |
| 3   | **Page Lock**       | Click "Lock Page" button            | Page module controller `.lock()` → All navigation disabled, status shows "LOCKED"         |
| 4   | **Event History**   | All of the above                    | EventLog shows: `type`, `timestamp`, `prevVersion → nextVersion` for each committed event |

> **EventLog Enhancement:** The Event History panel visualizes the Reducer Commit Model by showing
> `prevVersion → nextVersion` for each state change. This proves that every interaction flows through
> the deterministic pipeline: Event → Reducer → Commit → version increment.

**Key Constraint:** No `useState` for page/modal/lock state in any component. All interaction state comes from `useRuntimeState()`, `usePage()`, or `useModal()`.

**Acceptance Criteria:**

- [ ] All 4 scenarios work visually
- [ ] Zero `useState` for page/modal/lock state in components
- [ ] All interactions flow through module controllers or `runtime.dispatch()`
- [ ] EventLog shows `type`, `timestamp`, `prevVersion → nextVersion` per event
- [ ] Demo runs with `pnpm dev`

---

### Phase F: Documentation + Verification (1 session)

**Goal:** Freeze documentation, run final verification, mark stage complete.

**Deliverables:**

- [ ] This document (`STAGE-001-runtime-core.md`) updated with implementation notes for each phase
- [ ] `PRISMUI-ARCHITECTURE.md` verified accurate for Layer 0 + Layer 2
- [ ] `ADR-001` through `ADR-006` finalized
- [ ] `RULES.md` verified (all 17 rules applicable)
- [ ] `STAGE.md` overview table updated with final test count
- [ ] `RUNTIME-API-SPEC.md` finalized with actual implemented API

**Verification Checklist:**

- [ ] `pnpm test` — all ~107 tests pass
- [ ] `pnpm typecheck` — `tsc --noEmit` clean across all packages
- [ ] Zero React/DOM imports in `packages/core/src/` (verified via grep)
- [ ] Demo runs successfully (`pnpm dev`)
- [ ] All devdocs frozen

---

## Summary Table

| Phase  | Content                         | Sessions | New Tests | Cumulative |
| ------ | ------------------------------- | -------- | --------- | ---------- |
| **A1** | EventBus                        | 1        | ~15       | ~15        |
| **A2** | RuntimeStore                    | 1        | ~15       | ~30        |
| **B**  | Scheduler (Reducer Commit)      | 1        | ~18       | ~48        |
| **C1** | Module System + Runtime Factory | 1        | ~12       | ~60        |
| **C2** | Built-in Modules (Page+Modal)   | 1        | ~20       | ~80        |
| **D1** | Provider + Core Hooks           | 1        | ~15       | ~95        |
| **D2** | Convenience Hooks               | 1        | ~12       | ~107       |
| **E**  | Minimal Demo                    | 1        | —         | ~107       |
| **F**  | Docs + Verification             | 1        | —         | **~107**   |
|        | **Total**                       | **9**    | **~107**  |            |

---

## Directory Structure

```
packages/
├── core/                          # Layer 0 — Interaction Core
│   ├── src/
│   │   ├── event-bus.ts           # Phase A1
│   │   ├── event-bus.test.ts
│   │   ├── store.ts               # Phase A2
│   │   ├── store.test.ts
│   │   ├── scheduler.ts           # Phase B
│   │   ├── scheduler.test.ts
│   │   ├── module.ts              # Phase C1 (RuntimeModule interface)
│   │   ├── runtime.ts             # Phase C1 (Factory + module wiring)
│   │   ├── runtime.test.ts
│   │   ├── types.ts               # Phase C1 (consolidated types)
│   │   ├── index.ts               # Phase C1 (barrel exports)
│   │   └── modules/               # Layer 0.5 — Built-in Modules
│   │       ├── page-module.ts     # Phase C2
│   │       ├── page-module.test.ts
│   │       ├── modal-module.ts    # Phase C2
│   │       ├── modal-module.test.ts
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── react/                         # Layer 2 — React Adapter
│   ├── src/
│   │   ├── context.ts             # Phase D1
│   │   ├── provider.tsx           # Phase D1
│   │   ├── use-runtime.ts         # Phase D1
│   │   ├── use-runtime-state.ts   # Phase D1 (useSyncExternalStore)
│   │   ├── use-page.ts            # Phase D2
│   │   ├── use-modal.ts           # Phase D2
│   │   ├── provider.test.tsx      # Phase D1
│   │   ├── hooks.test.tsx         # Phase D2
│   │   └── index.ts               # Phase D2
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
└── demo/                          # Phase E — Demo
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── setup.ts               # Module injection pattern
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   └── PatientDetail.tsx
    │   └── components/
    │       ├── ConfirmModal.tsx
    │       └── EventLog.tsx       # Shows type, timestamp, prevVersion → nextVersion
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

---

## Definition of Done

Stage-1 is complete when **ALL** of the following are true:

1. [ ] Page flow controlled entirely by Runtime dispatch
2. [ ] Components hold zero global interaction state
3. [ ] React adapter contains zero business logic
4. [ ] `packages/core/` has zero React/DOM imports
5. [ ] ~107 tests passing
6. [ ] `tsc --noEmit` clean across all packages
7. [ ] Demo runs with all 4 scenarios working
8. [ ] All devdocs frozen and reviewed

---

## Risks & Mitigations

| Risk                                   | Severity | Mitigation                                                           |
| -------------------------------------- | -------- | -------------------------------------------------------------------- |
| **Over-engineering**                   | Medium   | Stick to minimal viable APIs. No premature optimization.             |
| **React dependency leaking into core** | High     | CI lint rule + grep verification in Phase F.                         |
| **Components bypassing Runtime**       | High     | RULES.md Rule 2 + code review.                                       |
| **Scheduler too simple**               | Low      | Phase B1 includes middleware extensibility. STAGE-002 adds priority. |
| **State management conflicts**         | Medium   | Single RuntimeStore, single source of truth.                         |

---

## What Stage-1 Proves

If successful, this stage proves:

1. **Runtime can control pages + modals** — via built-in modules, not hardcoded Core
2. **Module system works** — Page and Modal plug in via `RuntimeModule` interface
3. **React is just a rendering layer** — zero business logic in adapter
4. **Interactions are abstractable** — all behavior through dispatch
5. **System is extensible** — modules + middleware injection, no Core modification needed
6. **Framework isolation works** — core runs without React
7. **Reducer Commit Model works** — state mutation is centralized, deterministic, auditable
8. **ReducerCommitResult.sideEffects** — declarative event chain is ready for STAGE-002+

---

## Next Stage Preview

**STAGE-002: Governance Layer** will add via module/middleware injection:

```typescript
createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
  middleware: [createPolicyMiddleware(), createAuditMiddleware()],
});
```

- Policy Engine (interaction rules: allow/deny/transform) — as Scheduler middleware
- Audit Trail (immutable event logging with prevState/nextState snapshots) — trivial because Reducer Commit captures both
- Replay System (deterministic event replay) — guaranteed by pure reducers
- Priority Scheduler (event priority levels, conflict resolution) — optional, preserves synchronous semantics

Because STAGE-001 implements the Module System + Reducer Commit Model, STAGE-002 **only adds middleware** — Layer 0 Core remains unchanged.
