# Layer 0 — Interaction Core (Runtime Core) / 第 0 层——交互核心（运行时核心）

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-001  
> **Location:** `packages/core/src/`

> **状态：** Active  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **实现于：** STAGE-001  
> **位置：** `packages/core/src/`

---

## Overview

The Interaction Core is the foundational layer of PrismUI 2.0. It is a **pure TypeScript, framework-agnostic, event-driven state machine** that orchestrates all UI interactions.

## 概览

交互核心是 PrismUI 2.0 的基础层。它是一个 **纯 TypeScript、与框架无关、事件驱动的状态机**，用于编排所有 UI 交互。

**Key properties:**

**关键属性：**

- Zero external dependencies
- No React, no DOM, no browser APIs
- Runs in Node.js, browser, SSR, CLI, or test environments
- Deterministic: same events → same state transitions

- 零外部依赖
- 不依赖 React、DOM 或浏览器 API
- 可运行于 Node.js、浏览器、SSR、CLI 或测试环境
- 确定性：相同事件 → 相同 state 迁移

---

## Components

## 组件

### 1. EventBus

### 1. 事件总线（EventBus）

The central nervous system. All communication flows through events.

中央神经系统。所有通信都通过事件流转。

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

**设计决策：**

- **Type-filtered subscription** — subscribe to specific event types for efficiency
- **Event history** — configurable ring buffer for debugging and replay
- **Unsubscribe via return value** — `const unsub = bus.subscribe(fn); unsub();`
- **No async** — dispatch is synchronous for determinism

- **按类型订阅** —— 可订阅特定事件类型以提升效率
- **事件历史** —— 可配置环形缓冲区，用于调试与重放
- **通过返回值取消订阅** —— `const unsub = bus.subscribe(fn); unsub();`
- **无异步** —— 为保证确定性，dispatch 同步执行

**Prohibited:**

**禁止：**

- ❌ Direct component-to-component communication
- ❌ Event handlers that modify DOM directly

- ❌ 组件之间直接通信
- ❌ 事件处理器直接修改 DOM

---

### 2. RuntimeStore

### 2. 运行时状态仓库（RuntimeStore）

Centralized, immutable state container with versioned snapshots.

集中式、不可变的状态容器，带版本化快照。

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

**设计决策：**

- **Updater function pattern** — `setState(prev => ({...prev, ...changes}))`, not direct mutation
- **Version tracking** — auto-incremented on every state change
- **Immutable snapshots** — `getSnapshot()` returns a frozen copy
- **Subscriber notification** — called synchronously after each `setState`

- **Updater 函数模式** —— `setState(prev => ({...prev, ...changes}))`，而不是直接 mutation
- **版本追踪** —— 每次 state 变更自动递增
- **不可变快照** —— `getSnapshot()` 返回冻结副本
- **订阅通知** —— 每次 `setState` 后同步通知

**Prohibited:**

**禁止：**

- ❌ Direct state mutation (`store.state.locked = true`)
- ❌ Multiple stores (single source of truth)

- ❌ 直接修改 state（`store.state.locked = true`）
- ❌ 多个 store（必须单一事实来源）

---

### 3. Scheduler (Reducer Commit Engine)

### 3. 调度器（Scheduler，Reducer Commit 引擎）

Event processing pipeline with **Reducer Commit Model**. The Scheduler is the **only** place where `store.setState()` is called.

基于 **Reducer Commit Model** 的事件处理管线。Scheduler 是系统中 **唯一** 调用 `store.setState()` 的位置。

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

  /** Register a pure reducer for a specific event type */
  registerReducer(type: string, reducer: EventReducer): () => void;

  /** Add middleware to the processing pipeline */
  use(middleware: SchedulerMiddleware): void;
}

function createScheduler(store: RuntimeStore, bus: EventBus): Scheduler;
```

**Processing flow (Reducer Commit):**

**处理流程（Reducer Commit）：**

```
dispatch(event)
    → bus.dispatch(event)
    → scheduler.process(event)
    → middleware[0](event, next)
        → middleware[1](event, next)
            → reducer = reducers.get(event.type)
            → if reducer:
                → prevState = store.getState()
                → result = reducer(event, prevState)      // pure computation
                → store.setState(() => result.nextState)   // commit
                    → subscribers notified
                → for each result.sideEffects → bus.dispatch // after commit
```

**Design decisions:**

**设计决策：**

- **Reducer Commit Model** — reducers are pure: `(event, prevState) → ReducerCommitResult`. No store access.
- **Centralized commit** — only the Scheduler calls `store.setState()`. No other code path may write state.
- **Middleware chain** — Express/Koa-style, composable pipeline (STAGE-002 injects Policy + Audit here)
- **STAGE-001: synchronous** — no priority, no queue (added in STAGE-002)
- **Reducer lookup by event type** — one reducer per event type
- **Bus integration** — Scheduler listens to EventBus and processes events
- **Error safety** — if a reducer throws, state is NOT committed, `SYSTEM_ERROR` event is dispatched

- **Reducer Commit Model** —— reducer 为纯函数：`(event, prevState) → ReducerCommitResult`。不访问 store。
- **集中式提交** —— 只有 Scheduler 调用 `store.setState()`。任何其他路径都不得写 state。
- **中间件链** —— Express/Koa 风格，可组合管线（STAGE-002 在此注入 Policy + Audit）
- **STAGE-001：同步** —— 无优先级、无队列（STAGE-002 增加）
- **按事件类型查找 reducer** —— 每个事件类型一个 reducer
- **与 Bus 集成** —— Scheduler 监听 EventBus 并处理事件
- **错误安全** —— reducer 抛错则不 commit，并 dispatch `SYSTEM_ERROR`

---

### 4. Module System

### 4. 模块系统（Module System）

Modules are the extension mechanism. Core never needs modification.

模块是扩展机制。Core 无需为扩展而修改。

```typescript
interface RuntimeModule<TController = unknown> {
  name: string;
  initialState?: Partial<RuntimeState>;
  reducers?: Record<string, EventReducer>;
  middleware?: SchedulerMiddleware[];
  createController?: (core: {
    bus: EventBus;
    scheduler: Scheduler;
    store: RuntimeStore;
  }) => TController;
}
```

**Built-in modules (Layer 0.5):**

**内置模块（Layer 0.5）：**

- `createPageModule()` — page lifecycle (mount/unmount/transition/lock)
- `createModalModule()` — modal stack (open/close/closeAll)

- `createPageModule()` —— 页面生命周期（mount/unmount/transition/lock）
- `createModalModule()` —— 模态栈（open/close/closeAll）

These ship with Core but plug in via the same `RuntimeModule` interface as any consumer module.

它们随 Core 一起发布，但通过与业务模块相同的 `RuntimeModule` 接口进行插拔。

---

## Runtime Factory

## Runtime 工厂（Runtime Factory）

Composes Core subsystems + modules into a single entry point.

将 Core 的各子系统与 modules 组合为单一入口。

```typescript
interface RuntimeOptions {
  historySize?: number;
  initialState?: Partial<RuntimeState>;
  modules?: RuntimeModule[];
  middleware?: SchedulerMiddleware[];
}

interface InteractionRuntime {
  bus: EventBus;
  store: RuntimeStore;
  scheduler: Scheduler;
  modules: Record<string, unknown>;

  dispatch(event: RuntimeEvent): void;
  getState(): Readonly<RuntimeState>;
  subscribe(listener: (state: RuntimeState) => void): () => void;
  destroy(): void;
}

function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime;
```

**Factory wiring order:**

**工厂装配顺序：**

1. Create EventBus → RuntimeStore → Scheduler
2. For each module: merge `initialState`, register `reducers`, add `middleware`, create controller
3. Add `options.middleware` (after module middleware)

4. 创建 EventBus → RuntimeStore → Scheduler
5. 对每个 module：合并 `initialState`、注册 `reducers`、添加 `middleware`、创建 controller
6. 添加 `options.middleware`（位于 module middleware 之后）

**`destroy()` cleanup:**

**`destroy()` 清理：**

- Clears all event listeners
- Clears all store subscribers
- Clears event history
- Unregisters all reducers

- 清除所有事件监听
- 清除所有 store subscriber
- 清空事件历史
- 注销所有 reducer

---

## Deterministic Flow Guarantee

## 确定性流程保证

```
Event → Scheduler → [Middleware] → Reducer → Commit → Subscriber Notification
```

The **Reducer Commit Model** guarantees:

**Reducer Commit Model** 保证：

1. **Traceable** — every state change originates from a specific dispatched event
2. **Predictable** — same sequence of events + same initial state always produces identical final state
3. **Replayable** — event history can reproduce any state (reducers are pure functions)
4. **Serializable** — events contain no functions or closures
5. **Auditable** — prevState + nextState captured at commit boundary
6. **Rollback-safe** — if a reducer throws, state is unchanged

7. **可追踪（Traceable）** —— 每次 state 变更都源自某个具体已 dispatch 的事件
8. **可预测（Predictable）** —— 相同事件序列 + 相同初始 state 必然产生相同最终 state
9. **可重放（Replayable）** —— 事件历史可复现任意 state（reducer 为纯函数）
10. **可序列化（Serializable）** —— 事件不包含函数或闭包
11. **可审计（Auditable）** —— 在 commit 边界捕获 prevState + nextState
12. **可回滚安全（Rollback-safe）** —— reducer 抛错时 state 不改变

**State Mutation Rule:**

**State Mutation 规则：**

> `store.setState()` is called **only** inside the Scheduler's commit step.
> No other code — not reducers, not middleware, not components — may call `store.setState()`.

> `store.setState()` **只能** 在 Scheduler 的 commit 步骤中调用。
> 任何其他代码 —— 无论 reducer、middleware 还是组件 —— 都不得调用 `store.setState()`。
