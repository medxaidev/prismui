# Runtime API Specification / Runtime API 规范

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Status:** Draft — finalized during STAGE-001 implementation

> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **状态：** Draft —— 将在 STAGE-001 实现过程中定稿

---

## 1. Package: `@prismui/core`

## 1. 包：`@prismui/core`

### 1.1 createInteractionRuntime()

### 1.1 createInteractionRuntime()

Main entry point. Creates a fully wired runtime instance.

主入口：创建一个完成 wiring 的 runtime 实例。

```typescript
interface RuntimeOptions {
  historySize?: number; // EventBus history buffer size (default: 100)
  initialState?: Partial<RuntimeState>; // Override initial state
  modules?: RuntimeModule[]; // Module injection (Page, Modal, etc.)
  middleware?: SchedulerMiddleware[]; // Additional Scheduler middleware
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

### 1.2 InteractionRuntime

### 1.2 InteractionRuntime（运行时实例）

```typescript
interface InteractionRuntime {
  /** EventBus instance */
  readonly bus: EventBus;

  /** RuntimeStore instance */
  readonly store: RuntimeStore;

  /** Scheduler instance */
  readonly scheduler: Scheduler;

  /** Module controllers, keyed by module name */
  readonly modules: Record<string, unknown>;

  /** Convenience: dispatch event through bus → scheduler pipeline */
  dispatch<T = unknown>(event: Omit<RuntimeEvent<T>, "timestamp">): void;

  /** Convenience: get current state snapshot */
  getState(): Readonly<RuntimeState>;

  /** Convenience: subscribe to state changes */
  subscribe(listener: (state: RuntimeState) => void): () => void;

  /** Cleanup all subscriptions, reducers, and history */
  destroy(): void;
}
```

---

### 1.3 EventBus

### 1.3 EventBus（事件总线）

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

### 1.4 RuntimeStore（运行时状态仓库）

```typescript
interface RuntimeState {
  version: number;
  [key: string]: unknown; // Module-contributed state slices
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

**Initial state defaults (Core only):**

**初始 state 默认值（仅 core）：**

```typescript
{
  version: 0;
}
```

> Module-contributed fields (e.g. `currentPage`, `mountedPages`, `modalStack`, `locked`)
> are merged by the Factory from each module's `initialState`.

> 模块贡献的字段（如 `currentPage`、`mountedPages`、`modalStack`、`locked`）
> 会在 Factory 中从每个 module 的 `initialState` 合并。

---

### 1.5 Scheduler (Reducer Commit Engine)

### 1.5 Scheduler（Reducer Commit 引擎）

```typescript
interface ReducerCommitResult {
  nextState: RuntimeState;
  sideEffects?: RuntimeEvent[]; // Events dispatched AFTER commit
}

/** Pure function: (event, prevState) → ReducerCommitResult. No side effects. */
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => ReducerCommitResult;

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

**Commit boundary:** Only the Scheduler calls `store.setState()`. Reducers receive `prevState` and return `ReducerCommitResult` — they never touch the store. `sideEffects` are dispatched after successful commit.

**Commit 边界：** 只有 Scheduler 可以调用 `store.setState()`。reducer 只接收 `prevState` 并返回 `ReducerCommitResult` —— 它们永远不直接触达 store。`sideEffects` 会在成功 commit 后被 dispatch。

**Error handling:** If a reducer throws, state is NOT committed and `sideEffects` are NOT dispatched. A `SYSTEM_ERROR` event is dispatched (not processed by reducers).

**错误处理：** 如果 reducer 抛错，则 state 不会 commit，`sideEffects` 也不会 dispatch。系统会 dispatch 一个 `SYSTEM_ERROR` 事件（不经 reducers 处理）。

### 1.6 RuntimeModule

### 1.6 RuntimeModule（运行时模块）

```typescript
interface RuntimeModule<TController = unknown> {
  /** Unique module identifier */
  name: string;

  /** State slice contributed by this module */
  initialState?: Partial<RuntimeState>;

  /** Reducers to register. Map<eventType, reducer>. */
  reducers?: Record<string, EventReducer>;

  /** Middleware to add to Scheduler pipeline */
  middleware?: SchedulerMiddleware[];

  /** Create controller exposed on runtime.modules[name] */
  createController?: (core: {
    bus: EventBus;
    scheduler: Scheduler;
    store: RuntimeStore;
  }) => TController;
}
```

### 1.7 Built-in Modules

### 1.7 内置模块（Built-in Modules）

#### Page Module (`createPageModule()`)

#### Page Module（`createPageModule()`）

```typescript
function createPageModule(): RuntimeModule<PageController>;

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
```

**Event types dispatched:**

**dispatch 的事件类型：**

| Method           | Event Type        | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | `undefined`          |
| `unlock()`       | `PAGE_UNLOCK`     | `undefined`          |

| 方法             | 事件类型          | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | `undefined`          |
| `unlock()`       | `PAGE_UNLOCK`     | `undefined`          |

#### Modal Module (`createModalModule()`)

#### Modal Module（`createModalModule()`）

```typescript
function createModalModule(): RuntimeModule<ModalController>;

interface ModalController {
  open(modalId: string): void;
  close(modalId?: string): void;
  closeAll(): void;
  isOpen(modalId: string): boolean;
  getStack(): string[];
}
```

**Event types dispatched:**

**dispatch 的事件类型：**

| Method       | Event Type        | Payload                |
| ------------ | ----------------- | ---------------------- |
| `open(id)`   | `MODAL_OPEN`      | `{ modalId: string }`  |
| `close(id?)` | `MODAL_CLOSE`     | `{ modalId?: string }` |
| `closeAll()` | `MODAL_CLOSE_ALL` | `undefined`            |

| 方法         | 事件类型          | Payload                |
| ------------ | ----------------- | ---------------------- |
| `open(id)`   | `MODAL_OPEN`      | `{ modalId: string }`  |
| `close(id?)` | `MODAL_CLOSE`     | `{ modalId?: string }` |
| `closeAll()` | `MODAL_CLOSE_ALL` | `undefined`            |

---

## 2. Package: `@prismui/react`

## 2. 包：`@prismui/react`

### 2.1 PrismUIProvider

### 2.1 PrismUIProvider（Provider）

```tsx
interface PrismUIProviderProps {
  runtime: InteractionRuntime;
  children: React.ReactNode;
}

function PrismUIProvider(props: PrismUIProviderProps): JSX.Element;
```

### 2.2 useRuntime()

### 2.2 useRuntime()（获取 runtime）

```typescript
/** Access the full runtime instance. Throws outside PrismUIProvider. */
function useRuntime(): InteractionRuntime;
```

### 2.3 useRuntimeState()

### 2.3 useRuntimeState()（订阅 runtime state）

```typescript
/** Reactive subscription to runtime state. Re-renders on change. */
function useRuntimeState(): Readonly<RuntimeState>;
```

### 2.4 usePage()

### 2.4 usePage()（页面模块 Hook）

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

### 2.5 useModal()（弹窗模块 Hook）

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

## 3. 事件类型常量

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

## 4. 错误信息

| Error                                                              | When                           |
| ------------------------------------------------------------------ | ------------------------------ |
| `[PrismUI] useRuntime must be used within a PrismUIProvider`       | Hook called outside provider   |
| `[PrismUI] Reducer for event type "${type}" is already registered` | Duplicate reducer registration |
| `[PrismUI] Page "${pageId}" is not mounted`                        | Transition to unmounted page   |
| `[PrismUI] Page transitions are locked`                            | Transition while locked        |
| `[PrismUI] Page "${pageId}" is already mounted`                    | Duplicate mount                |

| 错误                                                               | 触发场景                      |
| ------------------------------------------------------------------ | ----------------------------- |
| `[PrismUI] useRuntime must be used within a PrismUIProvider`       | hook 在 provider 外调用       |
| `[PrismUI] Reducer for event type "${type}" is already registered` | 重复注册 reducer              |
| `[PrismUI] Page "${pageId}" is not mounted`                        | transition 到未 mount 的 page |
| `[PrismUI] Page transitions are locked`                            | page 被锁定时 transition      |
| `[PrismUI] Page "${pageId}" is already mounted`                    | 重复 mount                    |
