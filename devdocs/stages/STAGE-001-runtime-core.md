# STAGE-001: Runtime Core

**Status:** 🔄 In Progress  
**Start Date:** 2026-02-25  
**Priority:** Critical  
**Dependencies:** None (foundational stage)  
**Estimated Sessions:** 9  
**Estimated Tests:** ~98

---

## Executive Summary

Build the **minimal viable Interaction Runtime** — a framework-agnostic event-driven orchestration engine (Layer 0) with a React adapter (Layer 2) and minimal rendering binding (Layer 3). This stage proves that **pages, modals, and interactions can be controlled entirely through Runtime dispatch, not component state**.

**Core Philosophy:**

> Stage-1 is not about UI. It is about building a deterministic, programmable Interaction Core.

---

## Strategic Goals

1. ✅ Framework-agnostic Interaction Core (pure TypeScript, zero dependencies)
2. ✅ Deterministic flow: `Event → Scheduler → State Update → Render`
3. ✅ React as a thin adapter layer (zero business logic in adapter)
4. ✅ Page as Runtime Resource (mount/unmount/transition/lock)
5. ✅ Minimal demo proving Runtime-controlled page flow

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

- EventBus (dispatch, subscribe, type-filtered, history)
- RuntimeStore (immutable state, versioned snapshots, subscriber notification)
- Basic Scheduler (Reducer Commit Engine, middleware chain, synchronous)
- PageController (mount/unmount/transition/lock/unlock)
- Runtime Factory (`createInteractionRuntime()`)
- React Provider + core hooks
- Minimal Demo (3 scenarios)

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
  timestamp: number;
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
interface RuntimeState {
  currentPage: string | null;
  mountedPages: string[];
  modalStack: string[];
  locked: boolean;
  version: number;
}

interface RuntimeStore {
  getState(): Readonly<RuntimeState>;
  setState(updater: (prev: RuntimeState) => RuntimeState): void;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  getSnapshot(): RuntimeState;
}

function createRuntimeStore(initial?: Partial<RuntimeState>): RuntimeStore;
```

**Implementation Details:**

- State stored as plain object, never mutated directly
- `setState(updater)` creates new state via updater function, then notifies subscribers
- `version` auto-incremented on every `setState` call
- `getSnapshot()` returns `Object.freeze({ ...state })` (deep frozen)
- Subscribers called synchronously after state change
- Default initial state: `{ currentPage: null, mountedPages: [], modalStack: [], locked: false, version: 0 }`

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

### Phase B: Scheduler + PageController (2 sessions)

**Goal:** Build the event processing pipeline and page lifecycle manager.

---

#### Phase B1: Scheduler + Reducer Commit Engine (1 session)

**Files:**

- `packages/core/src/scheduler.ts`
- `packages/core/src/scheduler.test.ts`

**API Design (Reducer Commit Model):**

> **Critical upgrade from original design:** Handlers are replaced by **pure reducers**.
> Reducers MUST NOT access `store` directly. They receive `prevState` and return `nextState`.
> Only the Scheduler's internal commit mechanism writes to the store.

```typescript
/** Pure function: (event, prevState) → nextState. No side effects. */
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => RuntimeState;

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

**Implementation Details — Reducer Commit Model:**

The Scheduler is the **only place** where `store.setState()` is called. Reducers never touch the store.

- Reducers stored in `Map<string, EventReducer>` — one reducer per event type
- Middleware stored in array, executed in registration order
- `process(event)` builds middleware chain ending with reducer lookup + **commit**
- If no reducer found for event type, event is silently dropped (no error)
- Middleware pattern: `(event, next) => { /* before */ next(); /* after */ }`
- Scheduler subscribes to EventBus on creation — processes every dispatched event

**Processing Flow (Reducer Commit):**

```
bus.dispatch(event)
    → scheduler.process(event)
    → middleware[0](event, next)
        → middleware[1](event, next)
            → reducer = reducers.get(event.type)
            → if reducer:
                → prevState = store.getState()
                → nextState = reducer(event, prevState)   // pure computation
                → store.setState(() => nextState)          // commit (only here)
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

**Tests (~16):**

| #   | Test                                              | Group       |
| --- | ------------------------------------------------- | ----------- |
| 1   | creates Scheduler instance                        | creation    |
| 2   | routes event to registered reducer                | reducer     |
| 3   | reducer receives event and prevState (not store)  | reducer     |
| 4   | reducer return value is committed to store        | reducer     |
| 5   | unregistered event types are silently dropped     | reducer     |
| 6   | registerReducer returns unregister function       | reducer     |
| 7   | unregistered reducer no longer receives events    | reducer     |
| 8   | store.setState is only called by Scheduler commit | commit      |
| 9   | prevState and nextState are captured correctly    | commit      |
| 10  | middleware executes before reducer                | middleware  |
| 11  | multiple middleware execute in order              | middleware  |
| 12  | middleware can stop chain by not calling next     | middleware  |
| 13  | middleware receives the event                     | middleware  |
| 14  | reducer error does not commit state               | error       |
| 15  | processes events from EventBus automatically      | integration |
| 16  | has no React/DOM imports                          | isolation   |

**Acceptance Criteria:**

- [ ] Reducers are pure: `(event, prevState) → nextState` — no store access
- [ ] Only Scheduler calls `store.setState()` (commit boundary)
- [ ] Middleware chain executes in registration order
- [ ] Middleware can intercept (not call `next()`)
- [ ] Reducer errors do not corrupt state
- [ ] 16 tests pass, `tsc --noEmit` clean

---

#### Phase B2: PageController (1 session)

**Files:**

- `packages/core/src/page-controller.ts`
- `packages/core/src/page-controller.test.ts`

**API Design:**

```typescript
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

function createPageController(
  bus: EventBus,
  scheduler: Scheduler,
  store: RuntimeStore,
): PageController;
```

**Implementation Details:**

- Each method dispatches an event via `bus.dispatch()`
- Reducers registered with Scheduler during `createPageController()`
- `mount(id)` → dispatches `PAGE_MOUNT` → reducer returns new state with page added to `mountedPages` + set as `currentPage`
- `unmount(id)` → dispatches `PAGE_UNMOUNT` → reducer returns new state with page removed from `mountedPages`
- `transition(id)` → dispatches `PAGE_TRANSITION` → reducer returns new state with `currentPage` changed (only if mounted and not locked)
- `lock()` → dispatches `PAGE_LOCK` → reducer returns new state with `locked = true`
- `unlock()` → dispatches `PAGE_UNLOCK` → reducer returns new state with `locked = false`
- Convenience getters (`getCurrent`, `getMounted`, `isLocked`) read directly from `store.getState()`

**Event Types:**

| Method           | Event Type        | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | —                    |
| `unlock()`       | `PAGE_UNLOCK`     | —                    |

**Tests (~15):**

| #   | Test                                         | Group      |
| --- | -------------------------------------------- | ---------- |
| 1   | creates PageController instance              | creation   |
| 2   | mount adds page to mountedPages              | mount      |
| 3   | mount sets page as currentPage               | mount      |
| 4   | mount dispatches PAGE_MOUNT event            | mount      |
| 5   | unmount removes page from mountedPages       | unmount    |
| 6   | unmount clears currentPage if it was current | unmount    |
| 7   | transition changes currentPage               | transition |
| 8   | transition only works for mounted pages      | transition |
| 9   | transition is blocked when locked            | transition |
| 10  | lock sets locked to true                     | lock       |
| 11  | lock dispatches PAGE_LOCK event              | lock       |
| 12  | unlock sets locked to false                  | unlock     |
| 13  | getCurrent returns current page              | getters    |
| 14  | getMounted returns mounted pages list        | getters    |
| 15  | isLocked returns lock status                 | getters    |

**Acceptance Criteria:**

- [ ] All page operations dispatch events (not direct state mutation)
- [ ] Lock prevents transition
- [ ] Convenience getters reflect current state
- [ ] All events visible in EventBus history
- [ ] 15 tests pass, `tsc --noEmit` clean

---

### Phase C: Runtime Factory (1 session)

**Goal:** Compose all core pieces into a single `createInteractionRuntime()` factory.

**Files:**

- `packages/core/src/runtime.ts`
- `packages/core/src/types.ts` (consolidated public types)
- `packages/core/src/index.ts` (barrel exports)
- `packages/core/src/runtime.test.ts`

**API Design:**

```typescript
interface InteractionRuntime {
  readonly bus: EventBus;
  readonly store: RuntimeStore;
  readonly scheduler: Scheduler;
  readonly page: PageController;

  dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, "timestamp">): void;
  getState(): Readonly<RuntimeState>;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  destroy(): void;
}

interface RuntimeOptions {
  historySize?: number;
  initialState?: Partial<RuntimeState>;
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

**Implementation Details:**

- Factory creates: EventBus → RuntimeStore → Scheduler → PageController
- `dispatch()` convenience: adds `timestamp: Date.now()` then delegates to `bus.dispatch()`
- `getState()` convenience: delegates to `store.getState()`
- `subscribe()` convenience: delegates to `store.subscribe()`
- `destroy()`: calls `bus.clear()`, removes all store subscriptions, unregisters all reducers

**Tests (~10):**

| #   | Test                                                      | Group       |
| --- | --------------------------------------------------------- | ----------- |
| 1   | creates runtime with all subsystems                       | creation    |
| 2   | dispatch adds timestamp and dispatches event              | dispatch    |
| 3   | getState returns current store state                      | convenience |
| 4   | subscribe notifies on state change                        | convenience |
| 5   | page operations work through runtime                      | integration |
| 6   | full pipeline: dispatch → reducer → commit → state update | integration |
| 7   | destroy cleans up all subscriptions                       | destroy     |
| 8   | destroy clears event history                              | destroy     |
| 9   | multiple runtime instances are isolated                   | isolation   |
| 10  | has no React/DOM imports                                  | isolation   |

**Acceptance Criteria:**

- [ ] Single factory creates complete, wired runtime
- [ ] Convenience methods delegate correctly
- [ ] `destroy()` cleans up everything
- [ ] Multiple instances don't interfere
- [ ] Zero React/DOM imports in `packages/core/`
- [ ] 10 tests pass, `tsc --noEmit` clean

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
- `useRuntimeState()` uses `useState` + `useEffect` to subscribe to store changes

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

- `usePage()` combines `useRuntimeState()` for reactive data and `useRuntime().page` for actions
- `useModal()` combines `useRuntimeState()` for `modalStack` and dispatches modal events
- Action functions are stable references (wrapped in `useCallback` referencing runtime)

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
- [ ] Actions delegate to `runtime.page.*` or `runtime.dispatch()`
- [ ] 27 tests pass (D1: 15 + D2: 12), `tsc --noEmit` clean

---

### Phase E: Minimal Demo (1 session)

**Goal:** Prove the entire stack works end-to-end with a running application.

**Files:**

- `packages/demo/src/main.tsx` (entry point)
- `packages/demo/src/App.tsx` (root with PrismUIProvider)
- `packages/demo/src/setup.ts` (runtime creation)
- `packages/demo/src/pages/Dashboard.tsx`
- `packages/demo/src/pages/PatientDetail.tsx`
- `packages/demo/src/components/ConfirmModal.tsx`
- `packages/demo/src/components/EventLog.tsx`
- `packages/demo/package.json`
- `packages/demo/vite.config.ts`

**Demo Scenarios:**

| #   | Scenario            | User Action                         | Expected Result                                                                             |
| --- | ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Page Transition** | Click "Go to Patient Detail" button | `runtime.page.transition("PatientDetail")` → UI shows PatientDetail page                    |
| 2   | **Modal Mount**     | Click "Open Confirm" button         | `runtime.dispatch({ type: 'MODAL_OPEN', payload: { modalId: 'confirm' } })` → Modal appears |
| 3   | **Page Lock**       | Click "Lock Page" button            | `runtime.page.lock()` → All navigation buttons disabled, status shows "LOCKED"              |
| 4   | **Event History**   | All of the above                    | EventLog component shows dispatched event history from `bus.getHistory()`                   |

**Key Constraint:** No `useState` for page/modal/lock state in any component. All interaction state comes from `useRuntimeState()`, `usePage()`, or `useModal()`.

**Acceptance Criteria:**

- [ ] All 4 scenarios work visually
- [ ] Zero `useState` for page/modal/lock state in components
- [ ] All interactions flow through `runtime.dispatch()` or `runtime.page.*`
- [ ] Event history panel shows all dispatched events
- [ ] Demo runs with `pnpm dev`

---

### Phase F: Documentation + Verification (1 session)

**Goal:** Freeze documentation, run final verification, mark stage complete.

**Deliverables:**

- [ ] This document (`STAGE-001-runtime-core.md`) updated with implementation notes for each phase
- [ ] `ARCHITECTURE.md` verified accurate for Layer 0 + Layer 2
- [ ] `ADR-001` through `ADR-005` finalized
- [ ] `RULES.md` verified (all 16 rules applicable)
- [ ] `STAGE.md` overview table updated with final test count
- [ ] `RUNTIME-API-SPEC.md` finalized with actual implemented API

**Verification Checklist:**

- [ ] `pnpm test` — all ~98 tests pass
- [ ] `pnpm typecheck` — `tsc --noEmit` clean across all packages
- [ ] Zero React/DOM imports in `packages/core/src/` (verified via grep)
- [ ] Demo runs successfully (`pnpm dev`)
- [ ] All devdocs frozen

---

## Summary Table

| Phase  | Content               | Sessions | New Tests | Cumulative |
| ------ | --------------------- | -------- | --------- | ---------- |
| **A1** | EventBus              | 1        | ~15       | ~15        |
| **A2** | RuntimeStore          | 1        | ~15       | ~30        |
| **B1** | Scheduler (Reducer)   | 1        | ~16       | ~46        |
| **B2** | PageController        | 1        | ~15       | ~61        |
| **C**  | Runtime Factory       | 1        | ~10       | ~71        |
| **D1** | Provider + Core Hooks | 1        | ~15       | ~86        |
| **D2** | Convenience Hooks     | 1        | ~12       | ~98        |
| **E**  | Minimal Demo          | 1        | —         | ~98        |
| **F**  | Docs + Verification   | 1        | —         | **~98**    |
|        | **Total**             | **9**    | **~98**   |            |

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
│   │   ├── scheduler.ts           # Phase B1
│   │   ├── scheduler.test.ts
│   │   ├── page-controller.ts     # Phase B2
│   │   ├── page-controller.test.ts
│   │   ├── runtime.ts             # Phase C
│   │   ├── runtime.test.ts
│   │   ├── types.ts               # Phase C (consolidated types)
│   │   └── index.ts               # Phase C (barrel exports)
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── react/                         # Layer 2 — React Adapter
│   ├── src/
│   │   ├── context.ts             # Phase D1
│   │   ├── provider.tsx           # Phase D1
│   │   ├── use-runtime.ts         # Phase D1
│   │   ├── use-runtime-state.ts   # Phase D1
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
    │   ├── setup.ts
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   └── PatientDetail.tsx
    │   └── components/
    │       ├── ConfirmModal.tsx
    │       └── EventLog.tsx
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

---

## Definition of Done

Stage-1 is complete when **ALL** of the following are true:

1. ✅ Page flow controlled entirely by Runtime dispatch
2. ✅ Components hold zero global interaction state
3. ✅ React adapter contains zero business logic
4. ✅ `packages/core/` has zero React/DOM imports
5. ✅ ~98 tests passing
6. ✅ `tsc --noEmit` clean across all packages
7. ✅ Demo runs with all 4 scenarios working
8. ✅ All devdocs frozen and reviewed

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

1. **Runtime can control pages** — mount, unmount, transition, lock
2. **React is just a rendering layer** — zero business logic in adapter
3. **Interactions are abstractable** — all behavior through dispatch
4. **System is extensible** — middleware slot ready for Governance (STAGE-002)
5. **Framework isolation works** — core runs without React
6. **Reducer Commit Model works** — state mutation is centralized, deterministic, auditable

---

## Next Stage Preview

**STAGE-002: Governance Layer** will add:

- Policy Engine (interaction rules: allow/deny/transform) — as Scheduler middleware
- Audit Trail (immutable event logging with prevState/nextState snapshots) — trivial because Reducer Commit captures both
- Replay System (deterministic event replay) — guaranteed by pure reducers
- Priority Scheduler (event priority levels, conflict resolution) — optional, preserves synchronous semantics

Because STAGE-001 implements the Reducer Commit Model, STAGE-002 **only adds middleware modules** — Layer 0 core remains unchanged.
