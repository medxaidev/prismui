# STAGE-001: Runtime Core / 运行时核心

**Status:** 🔄 In Progress  
**Start Date:** 2026-02-25  
**Priority:** Critical  
**Dependencies:** None (foundational stage)  
**Estimated Sessions:** 9  
**Estimated Tests:** ~107

**状态：** 🔄 进行中  
**开始日期：** 2026-02-25  
**优先级：** Critical（关键）  
**依赖：** 无（基础阶段）  
**预计 Sessions：** 9  
**预计测试：** ~107

---

## Executive Summary

Build the **minimal viable Interaction Runtime** — a framework-agnostic event-driven orchestration engine (Layer 0) with a React adapter (Layer 2) and minimal rendering binding (Layer 3). This stage proves that **pages, modals, and interactions can be controlled entirely through Runtime dispatch, not component state**.

构建**最小可用的 Interaction Runtime**——一个与框架无关、事件驱动的编排引擎（Layer 0），配套 React adapter（Layer 2）以及最小渲染绑定（Layer 3）。本阶段将证明：**页面、模态框与交互可以完全通过 Runtime dispatch 控制，而不是依赖组件状态**。

**Core Philosophy:**

> Stage-1 is not about UI. It is about building a deterministic, programmable Interaction Core.

**核心理念：**

> Stage-1 不是在做 UI，而是在构建一个确定性、可编程的 Interaction Core。

---

## Strategic Goals

### English

1. ✅ Framework-agnostic Interaction Core (pure TypeScript, zero dependencies)
2. ✅ Deterministic flow: `Event → Scheduler → [Middleware] → Reducer → Commit → Render`
3. ✅ Module injection pattern: Core is extensible without modification
4. ✅ React as a thin adapter layer (zero business logic in adapter)
5. ✅ Page + Modal as built-in modules (proving the module pattern works)
6. ✅ Minimal demo proving Runtime-controlled interaction flow

### 中文

1. ✅ 与框架无关的 Interaction Core（纯 TypeScript，零依赖）
2. ✅ 确定性流程：`Event → Scheduler → [Middleware] → Reducer → Commit → Render`
3. ✅ 模块注入模式：Core 无需修改即可扩展
4. ✅ React 作为薄适配层（adapter 中零业务逻辑）
5. ✅ Page + Modal 作为内建模块（证明 module pattern 可用）
6. ✅ 最小 Demo：证明 Runtime 可控的交互流程

---

## Architectural Position

Stage-1 implements:

Stage-1 实现以下内容：

| Layer       | Name                   | Package           | Status     |
| ----------- | ---------------------- | ----------------- | ---------- |
| **Layer 0** | Interaction Core       | `packages/core/`  | This stage |
| **Layer 2** | React Adapter          | `packages/react/` | This stage |
| **Layer 3** | Minimal Render Binding | `packages/demo/`  | This stage |

| 层级        | 名称                   | 包                | 状态   |
| ----------- | ---------------------- | ----------------- | ------ |
| **Layer 0** | Interaction Core       | `packages/core/`  | 本阶段 |
| **Layer 2** | React Adapter          | `packages/react/` | 本阶段 |
| **Layer 3** | Minimal Render Binding | `packages/demo/`  | 本阶段 |

**NOT implemented in this stage:**

**本阶段不实现：**

| Layer       | Name             | Deferred To |
| ----------- | ---------------- | ----------- |
| **Layer 1** | Governance Layer | STAGE-002   |

| 层级        | 名称                       | 延后到    |
| ----------- | -------------------------- | --------- |
| **Layer 1** | Governance Layer（治理层） | STAGE-002 |

---

## Stage Scope

### Included

### 包含范围

**Interaction Core (Layer 0 — pure infrastructure):**

**Interaction Core（Layer 0——纯基础设施）：**

- EventBus (dispatch, subscribe, type-filtered, history)
- RuntimeStore (immutable state, versioned snapshots, subscriber notification)
- Scheduler (Reducer Commit Engine, middleware chain, synchronous)
- Runtime Factory (`createInteractionRuntime()` with module/middleware injection)

- EventBus（dispatch、subscribe、按类型订阅、history）
- RuntimeStore（不可变状态、版本化快照、订阅者通知）
- Scheduler（Reducer Commit 引擎、middleware chain、同步处理）
- Runtime Factory（`createInteractionRuntime()`，支持 module/middleware 注入）

**Built-in Modules (Layer 0.5 — shipped with Core, plugged in via module system):**

**内建模块（Layer 0.5——随 Core 提供，通过 module system 插入）：**

- Page Module (`createPageModule()` — mount/unmount/transition/lock)
- Modal Module (`createModalModule()` — open/close/closeAll)

- Page Module（`createPageModule()`——mount/unmount/transition/lock）
- Modal Module（`createModalModule()`——open/close/closeAll）

**React Adapter (Layer 2):**

**React Adapter（Layer 2）：**

**English:**

- Provider + core hooks (`useRuntime`, `useRuntimeState`)
- Convenience hooks (`usePage`, `useModal`)

  **中文：**

- Provider + 核心 hooks（`useRuntime`、`useRuntimeState`）
- 便捷 hooks（`usePage`、`useModal`）

**Demo (Layer 3):**

**Demo（Layer 3）：**

**English:**

- Minimal Demo (4 scenarios)

  **中文：**

- 最小 Demo（4 个场景）

### Excluded (Explicit Non-Goals)

### 排除范围（明确非目标）

- ❌ Governance Layer (Policy, Audit, Replay) — STAGE-002
- ❌ Semantic Theme System — STAGE-003
- ❌ Advanced Interaction Modules (Drawer/Notification/Toast Runtime) — STAGE-004
- ❌ Component Library — not in scope for PrismUI 2.0
- ❌ Animation / Motion System
- ❌ Performance Optimization
- ❌ Concurrent / Priority Scheduling — STAGE-002
- ❌ DevTools — STAGE-008

- ❌ 治理层（Policy、Audit、Replay）—— STAGE-002
- ❌ 语义主题系统 —— STAGE-003
- ❌ 高级交互模块（Drawer/Notification/Toast Runtime）—— STAGE-004
- ❌ 组件库 —— 不属于 PrismUI 2.0 范畴
- ❌ 动画 / 动效系统
- ❌ 性能优化
- ❌ 并发 / 优先级调度 —— STAGE-002
- ❌ DevTools —— STAGE-008

---

## Design Principles

### 1. Runtime First

All behavior flows through `runtime.dispatch(event)`.

所有行为必须通过 `runtime.dispatch(event)` 流转。

```javascript
❌ component.setState({ currentPage: 'Dashboard' })
✅ runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'Dashboard' } })
```

### 2. Deterministic Flow

```javascript
Event → Scheduler → [Middleware] → Reducer → Commit → Subscribers → Render
```

No implicit side effects. No hidden state transitions.

禁止隐式副作用。禁止隐藏的状态迁移。

### 3. Framework Isolation

`packages/core/` contains zero React, zero DOM, zero browser API imports. Verified by CI lint rule.

`packages/core/` 必须零 React、零 DOM、零浏览器 API 导入。通过 CI lint 规则验证。

---

## Phase Breakdown

### Phase A: EventBus + RuntimeStore (2 sessions)

**Goal:** Build the foundational event system and state container.

**目标：** 构建基础事件系统与状态容器。

---

#### Phase A1: EventBus (1 session)

#### Phase A1：EventBus（1 session）

**Files:**

**文件：**

- `packages/core/src/event-bus.ts`
- `packages/core/src/event-bus.test.ts`

**API Design:**

**API 设计：**

```typescript
interface RuntimeEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number; // Added by EventBus.dispatch(), NOT by caller
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

**实现细节：**

- Global subscribers stored in array, iterated on every dispatch
- Type-filtered subscribers stored in `Map<string, Array<Listener>>`
- History stored as ring buffer with configurable `historySize` (default: 100)
- `dispatch()` is synchronous — no async, no batching
- `subscribe()` returns unsubscribe function
- `clear()` removes all subscribers and clears history

- 全局订阅者存放在数组中，每次 dispatch 都会遍历调用
- 按类型订阅者存放在 `Map<string, Array<Listener>>`
- History 采用 ring buffer，`historySize` 可配置（默认：100）
- `dispatch()` 同步执行——不允许 async，不允许 batching
- `subscribe()` 返回 unsubscribe 函数
- `clear()` 移除所有订阅者并清空历史

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

**测试（约 15 个）：**

| #   | 测试                           | 分组      |
| --- | ------------------------------ | --------- |
| 1   | 创建 EventBus 实例             | creation  |
| 2   | dispatch 事件到全局订阅者      | dispatch  |
| 3   | dispatch 事件到按类型订阅者    | dispatch  |
| 4   | 不向非匹配类型订阅者投递       | dispatch  |
| 5   | 被分发事件包含 timestamp       | dispatch  |
| 6   | 支持多个全局订阅者             | subscribe |
| 7   | 支持多个按类型订阅者           | subscribe |
| 8   | 返回 unsubscribe 函数          | subscribe |
| 9   | 取消订阅后不再接收事件         | subscribe |
| 10  | 事件记录到 history             | history   |
| 11  | historySize 限制生效           | history   |
| 12  | getHistory 返回 readonly array | history   |
| 13  | clear 移除所有订阅者           | clear     |
| 14  | clear 清空 history             | clear     |
| 15  | 无 React/DOM imports           | isolation |

**Acceptance Criteria:**

- [x] `createEventBus()` returns a working EventBus
- [x] Type-filtered subscription works
- [x] History ring buffer respects size limit
- [x] Zero React/DOM imports in file
- [x] 15 tests pass, `tsc --noEmit` clean

**验收标准：**

- [x] `createEventBus()` 返回可工作的 EventBus
- [x] 按类型订阅功能可用
- [x] History ring buffer 的 size limit 生效
- [x] 文件中零 React/DOM imports
- [x] 15 个测试通过，`tsc --noEmit` 通过

---

#### Phase A2: RuntimeStore (1 session)

#### Phase A2：RuntimeStore（1 session）

**Files:**

**文件：**

- `packages/core/src/store.ts`
- `packages/core/src/store.test.ts`

**API Design:**

**API 设计：**

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

> **设计说明：** `RuntimeState` 仅拥有 `version`。诸如 `currentPage`、`mountedPages`、`modalStack`、`locked`
> 等业务字段由内建模块（Page Module、Modal Module）通过 `initialState` 注入贡献。
> 这使得 Core 保持通用——未来模块可以添加自己的 state slices，而无需修改 Core 类型。
> TypeScript 的类型收窄通过模块侧接口（扩展 `RuntimeState`）实现。

**Implementation Details:**

**实现细节：**

- State stored as plain object, never mutated directly
- `setState(updater)` creates new state via updater function, then notifies subscribers
- `version` auto-incremented on every `setState` call
- `getSnapshot()` returns `Object.freeze({ ...state })` (shallow freeze — top-level immutable)
- Subscribers called synchronously after state change
- Default initial state: `{ version: 0 }` (modules extend this via `initialState`)

- State 以 plain object 存储，禁止直接 mutation
- `setState(updater)` 通过 updater 生成新 state，然后通知 subscribers
- 每次 `setState` 调用都会自动递增 `version`
- `getSnapshot()` 返回 `Object.freeze({ ...state })`（浅冻结——仅顶层不可变）
- 状态变更后同步调用 subscribers
- 默认初始状态：`{ version: 0 }`（模块通过 `initialState` 扩展）

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

**测试（约 15 个）：**

| #   | 测试                               | 分组      |
| --- | ---------------------------------- | --------- |
| 1   | 使用默认 initialState 创建 store   | creation  |
| 2   | 使用自定义 initialState 创建 store | creation  |
| 3   | getState 返回当前 state            | getState  |
| 4   | getState 返回 readonly 引用        | getState  |
| 5   | setState 应用 updater 函数         | setState  |
| 6   | setState 不会 mutate 旧 state      | setState  |
| 7   | setState 会递增 version            | setState  |
| 8   | 多次 setState 的 version 递增正确  | setState  |
| 9   | state change 时触发 subscribe      | subscribe |
| 10  | subscribe 收到新 state             | subscribe |
| 11  | 多个 subscribers 都会被通知        | subscribe |
| 12  | unsubscribe 后停止通知             | subscribe |
| 13  | getSnapshot 返回冻结副本           | snapshot  |
| 14  | getSnapshot 与后续变更隔离         | snapshot  |
| 15  | 无 React/DOM imports               | isolation |

**Acceptance Criteria:**

- [ ] Immutable state updates via updater function
- [ ] Subscriber notification on every state change
- [ ] Version tracking auto-increments
- [ ] `getSnapshot()` returns frozen, isolated copy
- [ ] Zero React/DOM imports
- [ ] 15 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] 通过 updater function 实现不可变更新
- [ ] 每次 state change 都通知 subscribers
- [ ] `version` 自动递增
- [ ] `getSnapshot()` 返回冻结且与后续变更隔离的副本
- [ ] 零 React/DOM imports
- [ ] 15 个测试通过，`tsc --noEmit` 通过

---

### Phase B: Scheduler — Reducer Commit Engine (1 session)

**Goal:** Build the event processing pipeline with Reducer Commit Model.

**目标：** 构建符合 Reducer Commit Model 的事件处理管线。

**Files:**

**文件：**

- `packages/core/src/scheduler.ts`
- `packages/core/src/scheduler.test.ts`

**API Design (Reducer Commit Model):**

**API 设计（Reducer Commit Model）：**

> **Critical upgrade from original design:** Handlers are replaced by **pure reducers**.
> Reducers MUST NOT access `store` directly. They receive `prevState` and return `ReducerCommitResult`.
> Only the Scheduler's internal commit mechanism writes to the store.
>
> **相对原始设计的关键升级：** 用 **纯 reducer** 取代 handler。
> Reducer **不得** 直接访问 `store`。它接收 `prevState` 并返回 `ReducerCommitResult`。
> 只有 Scheduler 内部的 commit 机制允许写入 store。

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
>
> **设计说明 — `sideEffects`：** Reducer 必须保持纯，但某些状态变化需要触发后续事件。
> 与其在 reducer 内部直接 dispatch（不纯），不如在 `ReducerCommitResult.sideEffects` 中**声明**这些事件。
> Scheduler 会在 commit 之后 dispatch 它们。STAGE-001 中该字段可选，可能为空。
> STAGE-002（Governance）与 STAGE-004（Interaction Modules）会进一步利用它。
>
> **简写：** 当 reducer 只需返回 state 时，可以返回 `{ nextState: newState }`。

**Implementation Details — Reducer Commit Model:**

The Scheduler is the **only place** where `store.setState()` is called. Reducers never touch the store.

**实现细节 — Reducer Commit Model：**

Scheduler 是系统中**唯一**允许调用 `store.setState()` 的位置。Reducer 永远不接触 store。

- Reducers stored in `Map<string, EventReducer>` — one reducer per event type
- Middleware stored in array, executed in registration order
- `process(event)` builds middleware chain ending with reducer lookup + **commit**
- If no reducer found for event type, event is silently dropped (no error)
- Middleware pattern: `(event, next) => { /* before */ next(); /* after */ }`
- Scheduler subscribes to EventBus on creation — processes every dispatched event
- After commit, if `result.sideEffects` is non-empty, dispatch each via `bus.dispatch()` (EventBus adds `timestamp`)

- Scheduler 在创建时订阅 EventBus —— 会处理每一个被 dispatch 的事件
- commit 之后，如果 `result.sideEffects` 非空，则通过 `bus.dispatch()` 逐个 dispatch（EventBus 会添加 `timestamp`）

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

| 旧模型（handler + store）                                      | 新模型（reducer commit）                          |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `handler(event, store)` —— handler 直接调用 `store.setState()` | `reducer(event, prevState) → nextState` —— 纯函数 |
| Handler 不纯（副作用：修改 store）                             | Reducer 纯（输入 → 输出）                         |
| 审计难以捕捉精确的状态差异                                     | 审计可直接记录 `prevState` + `nextState`          |
| 重放无法保证相同结果                                           | 重放天然确定性                                    |
| 无法回滚                                                       | 回滚 = 不 commit                                  |
| handler 出错可能导致 store 处于部分更新                        | reducer 出错 = 不 commit，状态不变                |

**Error Handling:**

If a reducer throws an exception:

1. **Do NOT commit** — state remains unchanged
2. **Log error** — `console.error` with event + prevState (Audit Trail deferred to STAGE-002)
3. **Dispatch SYSTEM_ERROR event** — `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
4. **SYSTEM_ERROR itself is NOT processed by reducers** — prevents infinite loops

**错误处理：**

如果 reducer 抛出异常：

1. **不 commit** —— state 保持不变
2. **记录错误日志** —— 使用 `console.error` 记录 event + prevState（Audit Trail 延后到 STAGE-002）
3. **dispatch SYSTEM_ERROR 事件** —— `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
4. **SYSTEM_ERROR 不会被 reducers 处理** —— 防止无限循环

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

**测试（约 18 个）：**

| #   | 测试                                                 | 分组        |
| --- | ---------------------------------------------------- | ----------- |
| 1   | 创建 Scheduler 实例                                  | creation    |
| 2   | 将事件路由到已注册 reducer                           | reducer     |
| 3   | reducer 接收 event 与 prevState（不接触 store）      | reducer     |
| 4   | reducer 返回的 result.nextState 会被 commit 到 store | reducer     |
| 5   | 未注册的 event type 会被静默丢弃                     | reducer     |
| 6   | registerReducer 返回 unregister 函数                 | reducer     |
| 7   | unregister 后 reducer 不再接收事件                   | reducer     |
| 8   | store.setState 仅在 Scheduler commit 中被调用        | commit      |
| 9   | prevState 与 nextState 捕获正确                      | commit      |
| 10  | sideEffects 在 commit 后被 dispatch                  | sideEffects |
| 11  | sideEffects 为空/undefined 时不 dispatch             | sideEffects |
| 12  | middleware 在 reducer 前执行                         | middleware  |
| 13  | 多个 middleware 按顺序执行                           | middleware  |
| 14  | middleware 不调用 next 可中断链路                    | middleware  |
| 15  | middleware 能接收 event                              | middleware  |
| 16  | reducer error 不会 commit state                      | error       |
| 17  | 自动处理来自 EventBus 的事件                         | integration |
| 18  | 无 React/DOM imports                                 | isolation   |

**Acceptance Criteria:**

- [ ] Reducers are pure: `(event, prevState) → ReducerCommitResult` — no store access
- [ ] Only Scheduler calls `store.setState()` (commit boundary)
- [ ] `sideEffects` dispatched after successful commit (not before, not on error)
- [ ] Middleware chain executes in registration order
- [ ] Middleware can intercept (not call `next()`)
- [ ] Reducer errors do not corrupt state
- [ ] 18 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Reducer 纯函数：`(event, prevState) → ReducerCommitResult` —— 不允许访问 store
- [ ] 只有 Scheduler 可以调用 `store.setState()`（commit boundary）
- [ ] `sideEffects` 仅在 commit 成功后 dispatch（不在 commit 前，不在错误时）
- [ ] Middleware chain 按注册顺序执行
- [ ] Middleware 可拦截（不调用 `next()`）
- [ ] reducer 出错不会破坏 state
- [ ] 18 个测试通过，`tsc --noEmit` 通过

---

### Phase C: Runtime Factory + Module System (2 sessions)

**Goal:** Build the module injection system and compose everything into `createInteractionRuntime()`.

**目标：** 构建 module 注入系统，并将所有子系统组合为 `createInteractionRuntime()`。

---

#### Phase C1: Module System + Runtime Factory (1 session)

#### Phase C1：Module System + Runtime Factory（1 session）

**Files:**

**文件：**

- `packages/core/src/module.ts` (RuntimeModule interface)
- `packages/core/src/runtime.ts`
- `packages/core/src/types.ts` (consolidated public types)
- `packages/core/src/index.ts` (barrel exports)
- `packages/core/src/runtime.test.ts`

**API Design:**

**API 设计：**

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
>
> **设计说明 — 为什么使用 modules？** PageController 与 Modal 不是 Core 基础设施。
> 它们是随 Core 提供的内建交互模块（Built-in Interaction Modules）。采用该模式意味着：
>
> - **STAGE-002：** `createInteractionRuntime({ middleware: [createPolicyMiddleware()] })` —— 无需修改 Core
> - **STAGE-004：** `createInteractionRuntime({ modules: [createDrawerModule()] })` —— 无需修改 Core
> - **用户侧：** 消费者可以自行创建自定义 modules
>
> Core 只需要知道 EventBus、Store、Scheduler 与 Module contract。

**Implementation Details:**

- Factory collects all module `initialState` slices and merges them with `options.initialState`
- Factory creates: EventBus → RuntimeStore (with merged initial state) → Scheduler
- Factory iterates `options.modules`:
  1. _(initialState already merged above)_
  2. Register each module's `reducers` with Scheduler
  3. Add each module's `middleware` to Scheduler
  4. Call each module's `createController()` and store result in `runtime.modules[name]`
- Factory adds `options.middleware` to Scheduler (after module middleware)
- `dispatch()` convenience: delegates to `bus.dispatch()` (callers pass `Omit<RuntimeEvent, "timestamp">`)
  Timestamp is added by **EventBus.dispatch()** — the **single source of time** for all paths
  (runtime.dispatch, controller methods, and sideEffects all flow through EventBus)
- `getState()` convenience: delegates to `store.getState()`
- `subscribe()` convenience: delegates to `store.subscribe()`
- `destroy()`: calls `bus.clear()`, removes all store subscriptions, unregisters all reducers

**实现细节：**

- Factory 收集所有 module 的 `initialState` slices，并与 `options.initialState` 合并
- Factory 创建：EventBus → RuntimeStore（使用合并后的 initial state）→ Scheduler
- Factory 遍历 `options.modules`：
  1. （initialState 已在上一步合并）
  2. 将 module 的 `reducers` 注册到 Scheduler
  3. 将 module 的 `middleware` 添加到 Scheduler
  4. 调用 module 的 `createController()`，并将结果放入 `runtime.modules[name]`
- Factory 将 `options.middleware` 添加到 Scheduler（在 module middleware 之后）
- `dispatch()` 便捷方法：委托给 `bus.dispatch()`（调用方传入 `Omit<RuntimeEvent, "timestamp">`）
  timestamp 由 **EventBus.dispatch()** 统一添加，是所有路径的**单一时间源**
  （runtime.dispatch、controller methods、sideEffects 都通过 EventBus）
- `getState()` 便捷方法：委托给 `store.getState()`
- `subscribe()` 便捷方法：委托给 `store.subscribe()`
- `destroy()`：调用 `bus.clear()`，移除所有 store subscriptions，并注销所有 reducers

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

**测试（约 12 个）：**

| #   | 测试                                               | 分组        |
| --- | -------------------------------------------------- | ----------- |
| 1   | 创建 runtime（包含所有子系统）                     | creation    |
| 2   | dispatch 会添加 timestamp 并分发事件               | dispatch    |
| 3   | getState 返回当前 store state                      | convenience |
| 4   | subscribe 在 state change 时通知                   | convenience |
| 5   | 全链路：dispatch → reducer → commit → state update | integration |
| 6   | module initialState 合并进 store                   | modules     |
| 7   | module reducers 注册到 Scheduler                   | modules     |
| 8   | module middleware 添加到 Scheduler                 | modules     |
| 9   | module controller 可通过 runtime.modules 访问      | modules     |
| 10  | destroy 清理 subscriptions 与 reducers             | destroy     |
| 11  | 多个 runtime 实例彼此隔离                          | isolation   |
| 12  | 无 React/DOM imports                               | isolation   |

**Acceptance Criteria:**

- [ ] Factory composes Core from EventBus + Store + Scheduler
- [ ] Modules inject state, reducers, middleware, and controllers
- [ ] Convenience methods delegate correctly
- [ ] `destroy()` cleans up everything
- [ ] Multiple instances don't interfere
- [ ] Zero React/DOM imports in `packages/core/`
- [ ] 12 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Factory 使用 EventBus + Store + Scheduler 组合出 Core
- [ ] Modules 可注入 state、reducers、middleware、controllers
- [ ] 便捷方法（convenience methods）委托正确
- [ ] `destroy()` 能清理所有资源
- [ ] 多实例互不干扰
- [ ] `packages/core/` 零 React/DOM imports
- [ ] 12 个测试通过，`tsc --noEmit` 通过

---

#### Phase C2: Built-in Modules — Page + Modal (1 session)

**Goal:** Implement Page and Modal as `RuntimeModule` instances, proving the module pattern works.

**目标：** 将 Page 与 Modal 以 `RuntimeModule` 实例形式实现，用于证明 module pattern 可行。

> **Architectural Position:** These are **Layer 0.5 — Built-in Interaction Modules**.
> They ship with `packages/core/` but are NOT Core infrastructure.
> They plug in via the same `RuntimeModule` interface that any consumer module would use.
>
> **架构定位：** 它们属于 **Layer 0.5——内建交互模块（Built-in Interaction Modules）**。
> 它们随 `packages/core/` 一起发布，但**不是** Core 基础设施。
> 它们通过同一套 `RuntimeModule` 接口插入系统，和任何用户自定义模块的接入方式一致。

**Files:**

**文件：**

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

**实现细节 — Page Module：**

- `initialState`: `{ currentPage: null, mountedPages: [], locked: false }`
- Reducers registered for: `PAGE_MOUNT`, `PAGE_UNMOUNT`, `PAGE_TRANSITION`, `PAGE_LOCK`, `PAGE_UNLOCK`
- Each method dispatches an event via `bus.dispatch()` (EventBus adds `timestamp` — single source of time)
- Convenience getters (`getCurrent`, `getMounted`, `isLocked`) read directly from `store.getState()`

- 每个方法通过 `bus.dispatch()` 分发事件（EventBus 会添加 `timestamp`——单一时间源）
- 便捷 getters（`getCurrent`、`getMounted`、`isLocked`）直接读取 `store.getState()`

**Event Types — Page Module:**

**事件类型 — Page Module：**

| Method           | Event Type        | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | —                    |
| `unlock()`       | `PAGE_UNLOCK`     | —                    |

| 方法             | 事件类型          | Payload              |
| ---------------- | ----------------- | -------------------- |
| `mount(id)`      | `PAGE_MOUNT`      | `{ pageId: string }` |
| `unmount(id)`    | `PAGE_UNMOUNT`    | `{ pageId: string }` |
| `transition(id)` | `PAGE_TRANSITION` | `{ pageId: string }` |
| `lock()`         | `PAGE_LOCK`       | —                    |
| `unlock()`       | `PAGE_UNLOCK`     | —                    |

**Implementation Details — Modal Module:**

**实现细节 — Modal Module：**

- `initialState`: `{ modalStack: [] }`
- Reducers registered for: `MODAL_OPEN`, `MODAL_CLOSE`, `MODAL_CLOSE_ALL`
- Each method dispatches an event via `bus.dispatch()` (EventBus adds `timestamp` — single source of time)
- `open(id)` → pushes to `modalStack`; `close(id?)` → pops specific or top; `closeAll()` → empties stack

- 每个方法通过 `bus.dispatch()` 分发事件（EventBus 会添加 `timestamp`——单一时间源）
- `open(id)` → push 到 `modalStack`；`close(id?)` → pop 指定或 top；`closeAll()` → 清空栈

**Event Types — Modal Module:**

**事件类型 — Modal Module：**

| Method       | Event Type        | Payload                |
| ------------ | ----------------- | ---------------------- |
| `open(id)`   | `MODAL_OPEN`      | `{ modalId: string }`  |
| `close(id?)` | `MODAL_CLOSE`     | `{ modalId?: string }` |
| `closeAll()` | `MODAL_CLOSE_ALL` | —                      |

| 方法         | 事件类型          | Payload                |
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

**测试（约 20 个）：**

| #   | 测试                                       | 分组       |
| --- | ------------------------------------------ | ---------- |
| 1   | createPageModule 返回有效的 RuntimeModule  | creation   |
| 2   | page module 贡献 initialState              | module     |
| 3   | mount 将 page 加入 mountedPages            | mount      |
| 4   | mount 将 page 设置为 currentPage           | mount      |
| 5   | mount 会 dispatch PAGE_MOUNT 事件          | mount      |
| 6   | unmount 从 mountedPages 移除 page          | unmount    |
| 7   | unmount 若为 current 则清空 currentPage    | unmount    |
| 8   | transition 修改 currentPage                | transition |
| 9   | transition 仅对已 mount 的 pages 生效      | transition |
| 10  | locked 时 transition 被阻止                | transition |
| 11  | lock 将 locked 设为 true                   | lock       |
| 12  | unlock 将 locked 设为 false                | unlock     |
| 13  | createModalModule 返回有效的 RuntimeModule | creation   |
| 14  | modal module 贡献 initialState             | module     |
| 15  | open 将 modalId 加入 modalStack            | modal      |
| 16  | close 从 modalStack 移除                   | modal      |
| 17  | closeAll 清空 modalStack                   | modal      |
| 18  | isOpen 返回正确状态                        | modal      |
| 19  | getStack 返回当前 modal stack              | modal      |
| 20  | modules 无 React/DOM imports               | isolation  |

**Acceptance Criteria:**

- [ ] Both modules implement `RuntimeModule` interface
- [ ] Page + Modal state is contributed via `initialState` (not hardcoded in Core)
- [ ] All operations dispatch events (not direct state mutation)
- [ ] Lock prevents page transition
- [ ] All events visible in EventBus history
- [ ] 20 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] 两个模块都实现 `RuntimeModule` 接口
- [ ] Page + Modal 的 state 通过 `initialState` 贡献（不在 Core 中硬编码）
- [ ] 所有操作都以事件方式 dispatch（不直接修改状态）
- [ ] Lock 可以阻止页面切换
- [ ] 所有事件可在 EventBus history 中观察到
- [ ] 20 个测试通过，`tsc --noEmit` 通过

---

### Phase D: React Adapter (2 sessions)

**Goal:** Build the thin React bridge — Provider, hooks, zero business logic.

**目标：** 构建 React 的薄桥接层——Provider、hooks，并确保 adapter 中零业务逻辑。

---

#### Phase D1: Provider + Core Hooks (1 session)

#### Phase D1：Provider + Core Hooks（1 session）

**Files:**

**文件：**

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

- `RuntimeContext` 通过 `React.createContext<InteractionRuntime | null>(null)` 创建
- `PrismUIProvider` 将 runtime 存入 context，并渲染 children
- `useRuntime()` 读取 context；在 provider 外调用会抛出 `[PrismUI] useRuntime must be used within a PrismUIProvider`
- `useRuntimeState()` 使用 `useSyncExternalStore(store.subscribe, store.getState, store.getSnapshot)`
  （React 18 推荐模式——避免 tearing，无需手写 `useState` + `useEffect`）

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

| #   | 测试                                           | 分组            |
| --- | ---------------------------------------------- | --------------- |
| 1   | PrismUIProvider 渲染 children                  | provider        |
| 2   | PrismUIProvider 通过 context 提供 runtime      | provider        |
| 3   | useRuntime 返回 runtime 实例                   | useRuntime      |
| 4   | useRuntime 在 provider 外抛错                  | useRuntime      |
| 5   | useRuntime 跨渲染保持稳定引用                  | useRuntime      |
| 6   | useRuntimeState 返回当前 state                 | useRuntimeState |
| 7   | state change 时 useRuntimeState 触发 re-render | useRuntimeState |
| 8   | useRuntimeState 返回 readonly state            | useRuntimeState |
| 9   | page transition 时 useRuntimeState 更新        | useRuntimeState |
| 10  | page lock 时 useRuntimeState 更新              | useRuntimeState |
| 11  | unmount 时清理 subscription                    | useRuntimeState |
| 12  | 多个 useRuntimeState hooks 收到同一份 state    | useRuntimeState |
| 13  | provider 不在内部创建 runtime                  | provider        |
| 14  | provider 可接收不同 runtime 实例               | provider        |
| 15  | hooks 中不包含业务逻辑                         | isolation       |

**Acceptance Criteria:**

- [ ] Provider bridges runtime to React Context
- [ ] `useRuntime()` throws with descriptive message outside provider
- [ ] `useRuntimeState()` triggers re-render on state change
- [ ] State is read-only from hooks
- [ ] 15 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Provider 将 runtime 桥接到 React Context
- [ ] `useRuntime()` 在 provider 外抛出清晰错误信息
- [ ] `useRuntimeState()` 在 state change 时触发 re-render
- [ ] Hooks 返回的 state 为只读（read-only）
- [ ] 15 个测试通过，`tsc --noEmit` 通过

---

#### Phase D2: Convenience Hooks (1 session)

#### Phase D2：Convenience Hooks（1 session）

**Files:**

**文件：**

- `packages/react/src/use-page.ts`
- `packages/react/src/use-modal.ts`
- `packages/react/src/index.ts` (barrel exports)
- `packages/react/src/hooks.test.tsx`

**API Design:**

**API 设计：**

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

**实现细节：**

- `usePage()` combines `useRuntimeState()` for reactive data and `runtime.modules.page` controller for actions
- `useModal()` combines `useRuntimeState()` for `modalStack` and `runtime.modules.modal` controller for actions
- Action functions are stable references (wrapped in `useCallback` referencing runtime module controllers)

- `usePage()` 组合 `useRuntimeState()`（提供响应式数据）与 `runtime.modules.page` controller（提供动作）
- `useModal()` 组合 `useRuntimeState()`（读取 `modalStack`）与 `runtime.modules.modal` controller（提供动作）
- Action functions 使用 `useCallback` 包装，并引用 runtime module controllers，从而保持稳定引用

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

**测试（约 12 个）：**

| #   | 测试                                        | 分组      |
| --- | ------------------------------------------- | --------- |
| 1   | usePage 返回当前 page state                 | usePage   |
| 2   | usePage.transition 更新 currentPage         | usePage   |
| 3   | usePage.lock 设置 isLocked                  | usePage   |
| 4   | usePage.unlock 清除 isLocked                | usePage   |
| 5   | usePage.mount 将 pageId 加入 mountedPages   | usePage   |
| 6   | usePage.unmount 从 mountedPages 移除 pageId | usePage   |
| 7   | useModal 返回 modal stack                   | useModal  |
| 8   | useModal.open 将 modalId 加入 modalStack    | useModal  |
| 9   | useModal.close 从 modalStack 移除           | useModal  |
| 10  | useModal.closeAll 清空 modalStack           | useModal  |
| 11  | useModal.isOpen 返回正确状态                | useModal  |
| 12  | hooks 为薄封装（不包含业务逻辑）            | isolation |

**Acceptance Criteria (Phase D total):**

- [ ] All hooks are thin wrappers around runtime APIs
- [ ] State changes trigger re-render
- [ ] Actions delegate to module controllers or `runtime.dispatch()`
- [ ] 27 tests pass (D1: 15 + D2: 12), `tsc --noEmit` clean

**验收标准（Phase D 总计）：**

- [ ] 所有 hooks 都是对 runtime APIs 的薄封装
- [ ] state changes 会触发 re-render
- [ ] actions 委托给 module controllers 或 `runtime.dispatch()`
- [ ] 27 个测试通过（D1: 15 + D2: 12），`tsc --noEmit` 通过

---

### Phase E: Minimal Demo (1 session)

**Goal:** Prove the entire stack works end-to-end with a running application.

**目标：** 通过一个可运行的应用端到端证明整套栈可用。

**Files:**

**文件：**

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

**setup.ts（Module Injection Pattern）：**

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

**Demo 场景：**

| #   | Scenario            | User Action                         | Expected Result                                                                           |
| --- | ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | **Page Transition** | Click "Go to Patient Detail" button | Page module controller `.transition("PatientDetail")` → UI shows PatientDetail page       |
| 2   | **Modal Mount**     | Click "Open Confirm" button         | Modal module controller `.open("confirm")` → Modal appears                                |
| 3   | **Page Lock**       | Click "Lock Page" button            | Page module controller `.lock()` → All navigation disabled, status shows "LOCKED"         |
| 4   | **Event History**   | All of the above                    | EventLog shows: `type`, `timestamp`, `prevVersion → nextVersion` for each committed event |

| #   | 场景           | 用户操作                         | 期望结果                                                                           |
| --- | -------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **页面切换**   | 点击 "Go to Patient Detail" 按钮 | Page module controller `.transition("PatientDetail")` → UI 显示 PatientDetail 页面 |
| 2   | **Modal 挂载** | 点击 "Open Confirm" 按钮         | Modal module controller `.open("confirm")` → Modal 显示                            |
| 3   | **页面锁定**   | 点击 "Lock Page" 按钮            | Page module controller `.lock()` → 禁止所有导航，状态显示 "LOCKED"                 |
| 4   | **事件历史**   | 执行上述全部操作                 | EventLog 显示：每个 commit 事件的 `type`、`timestamp`、`prevVersion → nextVersion` |

> **EventLog Enhancement:** The Event History panel visualizes the Reducer Commit Model by showing
> `prevVersion → nextVersion` for each state change. This proves that every interaction flows through
> the deterministic pipeline: Event → Reducer → Commit → version increment.
>
> **EventLog 增强：** Event History 面板通过展示每次状态变化的 `prevVersion → nextVersion` 来可视化 Reducer Commit Model。
> 这证明每次交互都流经确定性管线：Event → Reducer → Commit → version increment。

**Key Constraint:** No `useState` for page/modal/lock state in any component. All interaction state comes from `useRuntimeState()`, `usePage()`, or `useModal()`.

**关键约束：** 任意组件都不得用 `useState` 存储 page/modal/lock 相关状态。所有交互状态必须来自 `useRuntimeState()`、`usePage()` 或 `useModal()`。

**Acceptance Criteria:**

- [ ] All 4 scenarios work visually
- [ ] Zero `useState` for page/modal/lock state in components
- [ ] All interactions flow through module controllers or `runtime.dispatch()`
- [ ] EventLog shows `type`, `timestamp`, `prevVersion → nextVersion` per event
- [ ] Demo runs with `pnpm dev`

**验收标准：**

- [ ] 4 个场景在界面上可用
- [ ] 组件中 page/modal/lock 状态零 `useState`
- [ ] 所有交互都通过 module controllers 或 `runtime.dispatch()` 流转
- [ ] EventLog 对每个事件显示 `type`、`timestamp`、`prevVersion → nextVersion`
- [ ] 使用 `pnpm dev` 可运行 Demo

---

### Phase F: Documentation + Verification (1 session)

**Goal:** Freeze documentation, run final verification, mark stage complete.

**目标：** 冻结文档，执行最终验证，标记阶段完成。

**Deliverables:**

**交付物：**

- [ ] This document (`STAGE-001-runtime-core.md`) updated with implementation notes for each phase
- [ ] `PRISMUI-ARCHITECTURE.md` verified accurate for Layer 0 + Layer 2
- [ ] `ADR-001` through `ADR-006` finalized
- [ ] `RULES.md` verified (all 17 rules applicable)
- [ ] `STAGE.md` overview table updated with final test count
- [ ] `RUNTIME-API-SPEC.md` finalized with actual implemented API

- [ ] 本文档（`STAGE-001-runtime-core.md`）补齐每个 phase 的实现说明
- [ ] `PRISMUI-ARCHITECTURE.md` 校验 Layer 0 + Layer 2 描述准确
- [ ] `ADR-001` 到 `ADR-006` 完成定稿
- [ ] `RULES.md` 校验（17 条规则均适用）
- [ ] `STAGE.md` 概览表更新最终测试数量
- [ ] `RUNTIME-API-SPEC.md` 按实际实现 API 定稿

**Verification Checklist:**

**验证清单：**

- [ ] `pnpm test` — all ~107 tests pass
- [ ] `pnpm typecheck` — `tsc --noEmit` clean across all packages
- [ ] Zero React/DOM imports in `packages/core/src/` (verified via grep)
- [ ] Demo runs successfully (`pnpm dev`)
- [ ] All devdocs frozen

- [ ] `pnpm test` —— 所有约 ~107 个测试通过
- [ ] `pnpm typecheck` —— 全仓库 `tsc --noEmit` 通过
- [ ] `packages/core/src/` 零 React/DOM imports（通过 grep 验证）
- [ ] Demo 可运行（`pnpm dev`）
- [ ] 所有 devdocs 冻结

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

| Phase  | 内容                            | Sessions | 新增测试 | 累计     |
| ------ | ------------------------------- | -------- | -------- | -------- |
| **A1** | EventBus                        | 1        | ~15      | ~15      |
| **A2** | RuntimeStore                    | 1        | ~15      | ~30      |
| **B**  | Scheduler（Reducer Commit）     | 1        | ~18      | ~48      |
| **C1** | Module System + Runtime Factory | 1        | ~12      | ~60      |
| **C2** | 内建模块（Page+Modal）          | 1        | ~20      | ~80      |
| **D1** | Provider + Core Hooks           | 1        | ~15      | ~95      |
| **D2** | Convenience Hooks               | 1        | ~12      | ~107     |
| **E**  | Minimal Demo                    | 1        | —        | ~107     |
| **F**  | 文档 + 验证                     | 1        | —        | **~107** |
|        | **合计**                        | **9**    | **~107** |          |

---

## Directory Structure

## 目录结构

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

```text
packages/
├── core/                          # Layer 0 — 交互核心（Interaction Core）
│   ├── src/
│   │   ├── event-bus.ts           # Phase A1
│   │   ├── event-bus.test.ts
│   │   ├── store.ts               # Phase A2
│   │   ├── store.test.ts
│   │   ├── scheduler.ts           # Phase B
│   │   ├── scheduler.test.ts
│   │   ├── module.ts              # Phase C1（RuntimeModule 接口）
│   │   ├── runtime.ts             # Phase C1（Factory + module wiring）
│   │   ├── runtime.test.ts
│   │   ├── types.ts               # Phase C1（对外 types 汇总）
│   │   ├── index.ts               # Phase C1（barrel exports）
│   │   └── modules/               # Layer 0.5 — 内建模块（Built-in Modules）
│   │       ├── page-module.ts     # Phase C2
│   │       ├── page-module.test.ts
│   │       ├── modal-module.ts    # Phase C2
│   │       ├── modal-module.test.ts
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── react/                         # Layer 2 — React 适配层（React Adapter）
│   ├── src/
│   │   ├── context.ts             # Phase D1
│   │   ├── provider.tsx           # Phase D1
│   │   ├── use-runtime.ts         # Phase D1
│   │   ├── use-runtime-state.ts   # Phase D1（useSyncExternalStore）
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
    │       └── EventLog.tsx       # 显示 type、timestamp、prevVersion → nextVersion
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

---

## Definition of Done

## 完成定义（DoD）

Stage-1 is complete when **ALL** of the following are true:

当且仅当满足以下所有条件时，Stage-1 才算完成：

1. [ ] Page flow controlled entirely by Runtime dispatch
2. [ ] Components hold zero global interaction state
3. [ ] React adapter contains zero business logic
4. [ ] `packages/core/` has zero React/DOM imports
5. [ ] ~107 tests passing
6. [ ] `tsc --noEmit` clean across all packages
7. [ ] Demo runs with all 4 scenarios working
8. [ ] All devdocs frozen and reviewed

9. [ ] 页面流转完全由 Runtime dispatch 控制
10. [ ] 组件不持有任何全局交互状态
11. [ ] React adapter 中零业务逻辑
12. [ ] `packages/core/` 零 React/DOM imports
13. [ ] 约 ~107 个测试全部通过
14. [ ] 全仓库 `tsc --noEmit` 通过
15. [ ] Demo 可运行且 4 个场景均可用
16. [ ] 所有 devdocs 冻结并完成 review

---

## Risks & Mitigations

## 风险与缓解

| Risk                                   | Severity | Mitigation                                                          |
| -------------------------------------- | -------- | ------------------------------------------------------------------- |
| **Over-engineering**                   | Medium   | Stick to minimal viable APIs. No premature optimization.            |
| **React dependency leaking into core** | High     | CI lint rule + grep verification in Phase F.                        |
| **Components bypassing Runtime**       | High     | RULES.md Rule 2 + code review.                                      |
| **Scheduler too simple**               | Low      | Phase B includes middleware extensibility. STAGE-002 adds priority. |
| **State management conflicts**         | Medium   | Single RuntimeStore, single source of truth.                        |

| 风险                      | 严重性 | 缓解措施                                                    |
| ------------------------- | ------ | ----------------------------------------------------------- |
| **过度设计**              | Medium | 坚持最小可用 API，不做过早优化。                            |
| **React 依赖泄漏到 core** | High   | 在 Phase F 用 CI lint 规则 + grep 校验。                    |
| **组件绕过 Runtime**      | High   | RULES.md Rule 2 + code review。                             |
| **Scheduler 过于简单**    | Low    | Phase B 包含 middleware 可扩展性。STAGE-002 增加 priority。 |
| **状态管理冲突**          | Medium | 单一 RuntimeStore，单一事实来源。                           |

---

## What Stage-1 Proves

## Stage-1 证明了什么

If successful, this stage proves:

如果成功，本阶段将证明：

1. **Runtime can control pages + modals** — via built-in modules, not hardcoded Core
2. **Module system works** — Page and Modal plug in via `RuntimeModule` interface
3. **React is just a rendering layer** — zero business logic in adapter
4. **Interactions are abstractable** — all behavior through dispatch
5. **System is extensible** — modules + middleware injection, no Core modification needed
6. **Framework isolation works** — core runs without React
7. **Reducer Commit Model works** — state mutation is centralized, deterministic, auditable
8. **ReducerCommitResult.sideEffects** — declarative event chain is ready for STAGE-002+

9. **Runtime 能控制 pages + modals** —— 通过内建模块实现，而不是在 Core 内硬编码
10. **Module system 可用** —— Page 与 Modal 通过 `RuntimeModule` 接口插入系统
11. **React 只是渲染层** —— adapter 中零业务逻辑
12. **交互可抽象** —— 所有行为都通过 dispatch
13. **系统可扩展** —— modules + middleware 注入，无需修改 Core
14. **框架隔离有效** —— core 可脱离 React 运行
15. **Reducer Commit Model 可用** —— 状态变更集中、确定、可审计
16. **ReducerCommitResult.sideEffects** —— 声明式事件链为 STAGE-002+ 做好准备

---

## Next Stage Preview

## 下一阶段预览

**STAGE-002: Governance Layer** will add via module/middleware injection:

**STAGE-002：治理层（Governance Layer）** 将通过 module/middleware 注入添加：

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

- Policy Engine（交互规则：allow/deny/transform）—— 作为 Scheduler middleware
- Audit Trail（不可变事件日志，包含 prevState/nextState 快照）—— 因 Reducer Commit 捕获两者而变得简单
- Replay System（确定性事件重放）—— 由纯 reducers 保证
- Priority Scheduler（事件优先级与冲突解决）—— 可选，保持同步语义

Because STAGE-001 implements the Module System + Reducer Commit Model, STAGE-002 **only adds middleware** — Layer 0 Core remains unchanged.

由于 STAGE-001 已实现 Module System + Reducer Commit Model，STAGE-002 **只需要增加 middleware** —— Layer 0 Core 保持不变。
