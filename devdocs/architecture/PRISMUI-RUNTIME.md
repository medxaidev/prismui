# Layer 0 — Interaction Core (Runtime Core)

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-001  
> **Location:** `packages/core/src/`

---

## Overview

The Interaction Core is the foundational layer of PrismUI 2.0. It is a **pure TypeScript, framework-agnostic, event-driven state machine** that orchestrates all UI interactions.

**Key properties:**

- Zero external dependencies
- No React, no DOM, no browser APIs
- Runs in Node.js, browser, SSR, CLI, or test environments
- Deterministic: same events → same state transitions

---

## Components

### 1. EventBus

The central nervous system. All communication flows through events.

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

**Design decisions:**

- **Type-filtered subscription** — subscribe to specific event types for efficiency
- **Event history** — configurable ring buffer for debugging and replay
- **Unsubscribe via return value** — `const unsub = bus.subscribe(fn); unsub();`
- **No async** — dispatch is synchronous for determinism

**Prohibited:**

- ❌ Direct component-to-component communication
- ❌ Event handlers that modify DOM directly

---

### 2. RuntimeStore

Centralized, immutable state container with versioned snapshots.

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

**Design decisions:**

- **Updater function pattern** — `setState(prev => ({...prev, ...changes}))`, not direct mutation
- **Version tracking** — auto-incremented on every state change
- **Immutable snapshots** — `getSnapshot()` returns a frozen copy
- **Subscriber notification** — called synchronously after each `setState`

**Prohibited:**

- ❌ Direct state mutation (`store.state.locked = true`)
- ❌ Multiple stores (single source of truth)

---

### 3. Scheduler (Reducer Commit Engine)

Event processing pipeline with **Reducer Commit Model**. The Scheduler is the **only** place where `store.setState()` is called.

```typescript
/** Pure function: (event, prevState) → nextState. No side effects. */
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => RuntimeState;

type SchedulerMiddleware = (event: RuntimeEvent, next: () => void) => void;

interface Scheduler {
  /** Process event through middleware → reducer → commit pipeline */
  process(event: RuntimeEvent): void;

  /** Register a pure reducer for a specific event type */
  registerReducer(type: string, reducer: EventReducer): () => void;

  /** Add middleware to the processing pipeline */
  use(middleware: SchedulerMiddleware): void;
}

function createScheduler(store: RuntimeStore, bus: EventBus): Scheduler;
```

**Processing flow (Reducer Commit):**

```
dispatch(event)
    → bus.dispatch(event)
    → scheduler.process(event)
    → middleware[0](event, next)
        → middleware[1](event, next)
            → reducer = reducers.get(event.type)
            → if reducer:
                → prevState = store.getState()
                → nextState = reducer(event, prevState)   // pure computation
                → store.setState(() => nextState)          // commit
                    → subscribers notified
```

**Design decisions:**

- **Reducer Commit Model** — reducers are pure: `(event, prevState) → nextState`. No store access.
- **Centralized commit** — only the Scheduler calls `store.setState()`. No other code path may write state.
- **Middleware chain** — Express/Koa-style, composable pipeline (STAGE-002 injects Policy + Audit here)
- **STAGE-001: synchronous** — no priority, no queue (added in STAGE-002)
- **Reducer lookup by event type** — one reducer per event type
- **Bus integration** — Scheduler listens to EventBus and processes events
- **Error safety** — if a reducer throws, state is NOT committed, `SYSTEM_ERROR` event is dispatched

---

### 4. PageOrchestrator (PageController)

Pages are Runtime Resources, not JSX trees.

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

**Event types:**
| Event | Effect |
|-------|--------|
| `PAGE_MOUNT` | Add page to `mountedPages`, set as `currentPage` |
| `PAGE_UNMOUNT` | Remove from `mountedPages`, clear if current |
| `PAGE_TRANSITION` | Change `currentPage` (must be mounted) |
| `PAGE_LOCK` | Set `locked = true` |
| `PAGE_UNLOCK` | Set `locked = false` |

**Design decisions:**

- **All operations dispatch events** — `mount()` dispatches `PAGE_MOUNT`, reducer returns new state
- **Lock prevents transition** — when locked, `PAGE_TRANSITION` is rejected
- **Pages are string IDs** — not React components, not JSX

---

## Runtime Factory

Composes all subsystems into a single entry point.

```typescript
interface InteractionRuntime {
  bus: EventBus;
  store: RuntimeStore;
  scheduler: Scheduler;
  page: PageController;

  dispatch(event: RuntimeEvent): void;
  getState(): Readonly<RuntimeState>;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  destroy(): void;
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

**`destroy()` cleanup:**

- Clears all event listeners
- Clears all store subscribers
- Clears event history
- Unregisters all handlers

---

## Deterministic Flow Guarantee

```
Event → Scheduler → [Middleware] → Reducer → Commit → Subscriber Notification
```

The **Reducer Commit Model** guarantees:

1. **Traceable** — every state change originates from a specific dispatched event
2. **Predictable** — same sequence of events + same initial state always produces identical final state
3. **Replayable** — event history can reproduce any state (reducers are pure functions)
4. **Serializable** — events contain no functions or closures
5. **Auditable** — prevState + nextState captured at commit boundary
6. **Rollback-safe** — if a reducer throws, state is unchanged

**State Mutation Rule:**

> `store.setState()` is called **only** inside the Scheduler's commit step.
> No other code — not reducers, not middleware, not components — may call `store.setState()`.
