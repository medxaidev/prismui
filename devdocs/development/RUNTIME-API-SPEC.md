# Runtime API Specification

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Status:** Draft — finalized during STAGE-001 implementation

---

## 1. Package: `@prismui/core`

### 1.1 createInteractionRuntime()

Main entry point. Creates a fully wired runtime instance.

```typescript
interface RuntimeOptions {
  historySize?: number; // EventBus history buffer size (default: 100)
  initialState?: Partial<RuntimeState>; // Override initial state
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

### 1.2 InteractionRuntime

```typescript
interface InteractionRuntime {
  /** EventBus instance */
  readonly bus: EventBus;

  /** RuntimeStore instance */
  readonly store: RuntimeStore;

  /** Scheduler instance */
  readonly scheduler: Scheduler;

  /** PageController instance */
  readonly page: PageController;

  /** Convenience: dispatch event through bus → scheduler pipeline */
  dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, "timestamp">): void;

  /** Convenience: get current state snapshot */
  getState(): Readonly<RuntimeState>;

  /** Convenience: subscribe to state changes */
  subscribe(listener: (state: RuntimeState) => void): () => void;

  /** Cleanup all subscriptions, handlers, and history */
  destroy(): void;
}
```

---

### 1.3 EventBus

```typescript
interface RuntimeEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number;
  source?: string;
}

interface EventBus {
  /** Dispatch an event to all subscribers */
  dispatch<T>(event: RuntimeEvent<T>): void;

  /** Subscribe to all events */
  subscribe(listener: (event: RuntimeEvent) => void): () => void;

  /** Subscribe to events of a specific type */
  subscribe(type: string, listener: (event: RuntimeEvent) => void): () => void;

  /** Get event history (readonly) */
  getHistory(): readonly RuntimeEvent[];

  /** Clear history and all subscriptions */
  clear(): void;
}

function createEventBus(options?: { historySize?: number }): EventBus;
```

---

### 1.4 RuntimeStore

```typescript
interface RuntimeState {
  currentPage: string | null;
  mountedPages: string[];
  modalStack: string[];
  locked: boolean;
  version: number;
}

interface RuntimeStore {
  /** Get current state (readonly reference) */
  getState(): Readonly<RuntimeState>;

  /** Update state via updater function */
  setState(updater: (prev: RuntimeState) => RuntimeState): void;

  /** Subscribe to state changes */
  subscribe(listener: (state: RuntimeState) => void): () => void;

  /** Get immutable snapshot (deep frozen) */
  getSnapshot(): RuntimeState;
}

function createRuntimeStore(initial?: Partial<RuntimeState>): RuntimeStore;
```

**Initial state defaults:**

```typescript
{
  currentPage: null,
  mountedPages: [],
  modalStack: [],
  locked: false,
  version: 0,
}
```

---

### 1.5 Scheduler (Reducer Commit Engine)

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

  /** Register a pure reducer for a specific event type. Returns unregister function. */
  registerReducer(type: string, reducer: EventReducer): () => void;

  /** Add middleware to the processing pipeline */
  use(middleware: SchedulerMiddleware): void;
}

function createScheduler(store: RuntimeStore, bus: EventBus): Scheduler;
```

**Commit boundary:** Only the Scheduler calls `store.setState()`. Reducers receive `prevState` and return `nextState` — they never touch the store.

**Error handling:** If a reducer throws, state is NOT committed. A `SYSTEM_ERROR` event is dispatched (not processed by reducers).

### 1.6 PageController

```typescript
interface PageController {
  /** Register a page as available */
  mount(pageId: string): void;

  /** Remove a page from registry */
  unmount(pageId: string): void;

  /** Set a mounted page as current */
  transition(pageId: string): void;

  /** Lock all page transitions */
  lock(): void;

  /** Unlock page transitions */
  unlock(): void;

  /** Get current page ID */
  getCurrent(): string | null;

  /** Get all mounted page IDs */
  getMounted(): string[];

  /** Check if transitions are locked */
  isLocked(): boolean;
}

function createPageController(
  bus: EventBus,
  scheduler: Scheduler,
  store: RuntimeStore,
): PageController;
```

**Event types dispatched:**

| Method           | Event Type        | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | `undefined`          |
| `unlock()`       | `PAGE_UNLOCK`     | `undefined`          |

---

## 2. Package: `@prismui/react`

### 2.1 PrismUIProvider

```tsx
interface PrismUIProviderProps {
  runtime: InteractionRuntime;
  children: React.ReactNode;
}

function PrismUIProvider(props: PrismUIProviderProps): JSX.Element;
```

### 2.2 useRuntime()

```typescript
/** Access the full runtime instance. Throws outside PrismUIProvider. */
function useRuntime(): InteractionRuntime;
```

### 2.3 useRuntimeState()

```typescript
/** Reactive subscription to runtime state. Re-renders on change. */
function useRuntimeState(): Readonly<RuntimeState>;
```

### 2.4 usePage()

```typescript
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
```

### 2.5 useModal()

```typescript
interface UseModalReturn {
  modalStack: string[];
  isOpen: (modalId: string) => boolean;
  open: (modalId: string) => void;
  close: (modalId?: string) => void;
  closeAll: () => void;
}

function useModal(): UseModalReturn;
```

---

## 3. Event Type Constants

```typescript
// Page events
const PAGE_MOUNT = "PAGE_MOUNT";
const PAGE_UNMOUNT = "PAGE_UNMOUNT";
const PAGE_TRANSITION = "PAGE_TRANSITION";
const PAGE_LOCK = "PAGE_LOCK";
const PAGE_UNLOCK = "PAGE_UNLOCK";

// Modal events
const MODAL_OPEN = "MODAL_OPEN";
const MODAL_CLOSE = "MODAL_CLOSE";
const MODAL_CLOSE_ALL = "MODAL_CLOSE_ALL";
```

---

## 4. Error Messages

| Error                                                              | When                           |
| ------------------------------------------------------------------ | ------------------------------ |
| `[PrismUI] useRuntime must be used within a PrismUIProvider`       | Hook called outside provider   |
| `[PrismUI] Handler for event type "${type}" is already registered` | Duplicate handler registration |
| `[PrismUI] Page "${pageId}" is not mounted`                        | Transition to unmounted page   |
| `[PrismUI] Page transitions are locked`                            | Transition while locked        |
| `[PrismUI] Page "${pageId}" is already mounted`                    | Duplicate mount                |
