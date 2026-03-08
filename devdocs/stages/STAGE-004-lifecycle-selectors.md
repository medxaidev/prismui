# STAGE-004: Lifecycle & Selectors / 生命周期与选择器

**Status:** ✅ Complete  
**Start Date:** 2026-03-08  
**Completion Date:** 2026-03-08  
**Priority:** High  
**Dependencies:** STAGE-003 (Interaction Modules)  
**Sessions:** 1  
**Tests:** 43 new (290 cumulative)

**状态：** ✅ 已完成  
**开始日期：** 2026-03-08  
**完成日期：** 2026-03-08  
**优先级：** High  
**依赖：** STAGE-003（交互模块）  
**Sessions：** 1  
**测试：** 43 新增（累计 290）

---

## Executive Summary

Enrich the runtime platform with three missing infrastructure capabilities:

1. **State Selectors** — efficient partial state subscriptions that prevent unnecessary re-renders
2. **Module Lifecycle** — `onInit`/`onDestroy` hooks and status tracking for modules
3. **Inter-module Communication** — `waitFor` pattern for event-driven coordination between modules

All additions are pure `packages/core/` (zero React, zero DOM) except React adapter hooks.

丰富运行时平台，补充三个缺失的基础设施能力：

1. **状态选择器** — 高效的部分状态订阅，防止不必要的重新渲染
2. **模块生命周期** — 模块的 `onInit`/`onDestroy` 钩子与状态追踪
3. **模块间通信** — 基于事件驱动的 `waitFor` 协调模式

除 React adapter hooks 外，所有新增均为纯 `packages/core/`（零 React、零 DOM）。

**Core Philosophy:**

> The runtime must support efficient state observation and coordinated module behavior
> without coupling modules to each other or to any framework.
>
> 运行时必须支持高效的状态观察和模块间协调行为，
> 同时不将模块耦合到彼此或任何框架。

---

## Phase Breakdown

### Phase A: State Selectors (~20 tests)

**Goal:** Provide a `createSelector` utility and a `store.select()` method for efficient partial state subscription. Selectors only notify when the selected slice changes (referential equality check).

**目标：** 提供 `createSelector` 工具函数和 `store.select()` 方法，实现高效的部分状态订阅。选择器仅在所选切片发生变化时通知（引用相等性检查）。

**Files:**

- `packages/core/src/selector.ts` — `createSelector`, `StateSelector` type
- `packages/core/src/selector.test.ts` — tests

**Problem being solved:**

Currently `useRuntimeState()` re-renders on EVERY state change, even if the consumer only cares about `notifications`. With 4+ modules, this means opening a modal triggers re-render in notification consumers. This is architecturally unsound for large-scale apps.

当前 `useRuntimeState()` 在每次状态变更时都会重新渲染，即使消费者只关注 `notifications`。有 4 个以上模块时，打开模态框会导致通知消费者重新渲染。这对大规模应用来说架构上不合理。

**API Design:**

```typescript
/** Selector function: extract a slice from RuntimeState */
type StateSelector<T> = (state: Readonly<RuntimeState>) => T;

/**
 * Subscribe to a derived slice of state.
 * Listener is called only when selector(state) changes (Object.is comparison).
 * Returns unsubscribe function.
 */
function selectFromStore<T>(
  store: RuntimeStore,
  selector: StateSelector<T>,
  listener: (selected: T) => void,
): () => void;

/**
 * createSelector — memoized selector with multiple input selectors.
 * Re-computes result only when any input changes.
 * Similar to Reselect pattern but minimal.
 */
function createSelector<TInputs extends readonly unknown[], TResult>(
  inputSelectors: { [K in keyof TInputs]: StateSelector<TInputs[K]> },
  resultFn: (...inputs: TInputs) => TResult,
): StateSelector<TResult>;
```

**Test Plan:**

| #   | Test                                              | Category    |
| --- | ------------------------------------------------- | ----------- |
| 1   | selectFromStore calls listener with initial value | basic       |
| 2   | selectFromStore calls listener on relevant change | basic       |
| 3   | selectFromStore skips irrelevant state changes    | efficiency  |
| 4   | selectFromStore uses Object.is comparison         | equality    |
| 5   | selectFromStore unsubscribe stops notifications   | cleanup     |
| 6   | multiple selectors on same store are independent  | isolation   |
| 7   | selector receives readonly state                  | safety      |
| 8   | createSelector with single input                  | memoization |
| 9   | createSelector with multiple inputs               | memoization |
| 10  | createSelector recomputes when input changes      | memoization |
| 11  | createSelector skips recompute when inputs stable | memoization |
| 12  | createSelector composes with selectFromStore      | integration |
| 13  | has no React/DOM imports                          | isolation   |

**Acceptance Criteria:**

- [x] `selectFromStore` provides efficient partial subscriptions
- [x] `createSelector` provides memoized derived state
- [x] Object.is comparison prevents unnecessary notifications
- [x] 13 tests pass, `tsc --noEmit` clean

---

### Phase B: Module Lifecycle (~20 tests)

**Goal:** Extend `RuntimeModule` with `onInit`/`onDestroy` lifecycle hooks and add module status tracking to the runtime.

**目标：** 扩展 `RuntimeModule`，增加 `onInit`/`onDestroy` 生命周期钩子，并在运行时中添加模块状态追踪。

**Files:**

- `packages/core/src/module.ts` — extend `RuntimeModule` interface
- `packages/core/src/runtime.ts` — invoke lifecycle hooks, track module status
- `packages/core/src/lifecycle.ts` — `ModuleStatus` type, lifecycle event constants
- `packages/core/src/lifecycle.test.ts` — tests

**Problem being solved:**

Modules currently have no initialization or cleanup hooks. A notification module might need to start timers on init, or a form module might need to flush state on destroy. The runtime also has no way to know if a module is active.

模块当前没有初始化或清理钩子。通知模块可能需要在初始化时启动定时器，表单模块可能需要在销毁时清空状态。运行时也无法知道模块是否处于活动状态。

**API Design:**

```typescript
// Extended RuntimeModule interface
export interface RuntimeModule<TController = unknown> {
  name: string;
  initialState?: Partial<RuntimeState>;
  reducers?: Record<string, EventReducer>;
  middleware?: SchedulerMiddleware[];
  createController?: (core: {
    bus: EventBus;
    scheduler: Scheduler;
    store: RuntimeStore;
  }) => TController;

  /** Called after module is wired into runtime. Receives core subsystems. */
  onInit?: (core: {
    bus: EventBus;
    scheduler: Scheduler;
    store: RuntimeStore;
  }) => void;

  /** Called when runtime.destroy() is invoked. Cleanup opportunity. */
  onDestroy?: () => void;
}

// Module status tracking
type ModuleStatus = "registered" | "active" | "destroyed";

// Lifecycle events dispatched by runtime
const MODULE_INIT = "MODULE_INIT"; // payload: { moduleName: string }
const MODULE_DESTROY = "MODULE_DESTROY"; // payload: { moduleName: string }

// InteractionRuntime extension
interface InteractionRuntime {
  // ... existing ...
  /** Get status of all registered modules */
  getModuleStatus(): Record<string, ModuleStatus>;
}
```

**Test Plan:**

| #   | Test                                            | Category   |
| --- | ----------------------------------------------- | ---------- |
| 1   | onInit called after module wired                | lifecycle  |
| 2   | onInit receives core subsystems                 | lifecycle  |
| 3   | onInit called in module registration order      | lifecycle  |
| 4   | onDestroy called on runtime.destroy()           | lifecycle  |
| 5   | onDestroy called in reverse order               | lifecycle  |
| 6   | module without onInit/onDestroy works fine      | compat     |
| 7   | MODULE_INIT event dispatched per module         | events     |
| 8   | MODULE_DESTROY event dispatched per module      | events     |
| 9   | getModuleStatus returns active after init       | status     |
| 10  | getModuleStatus returns destroyed after destroy | status     |
| 11  | lifecycle events tracked by audit               | governance |
| 12  | lifecycle events subject to policy              | governance |
| 13  | onInit can dispatch events                      | advanced   |
| 14  | onDestroy errors don't prevent other cleanups   | resilience |
| 15  | has no React/DOM imports                        | isolation  |

**Acceptance Criteria:**

- [x] `onInit`/`onDestroy` lifecycle hooks work correctly
- [x] Module status tracking (registered → active → destroyed)
- [x] Lifecycle events dispatched (`MODULE_INIT`, `MODULE_DESTROY`)
- [x] Backward compatible — existing modules without hooks still work
- [x] 15 tests pass, `tsc --noEmit` clean

---

### Phase C: Inter-module Communication (~12 tests)

**Goal:** Provide a `waitFor` utility for event-driven coordination between modules without coupling them.

**目标：** 提供 `waitFor` 工具函数，实现模块间基于事件驱动的协调，而不产生耦合。

**Files:**

- `packages/core/src/wait-for.ts` — `waitFor` utility
- `packages/core/src/wait-for.test.ts` — tests

**Problem being solved:**

Modules currently can't coordinate. Example: a "save" operation in a form module should wait until the notification module has confirmed. Without a coordination primitive, consumers resort to ad-hoc setTimeout or polling.

模块当前无法协调。例如：表单模块的"保存"操作应等待通知模块确认完成。缺少协调原语时，消费者只能依赖临时的 setTimeout 或轮询。

**API Design:**

```typescript
/**
 * Wait for a specific event type on the bus.
 * Returns a promise that resolves with the matching event.
 * Optional timeout (ms) rejects with TimeoutError.
 * Optional predicate for fine-grained matching.
 */
function waitFor(
  bus: EventBus,
  eventType: string,
  options?: {
    timeout?: number;
    predicate?: (event: RuntimeEvent) => boolean;
  },
): Promise<RuntimeEvent>;
```

**Test Plan:**

| #   | Test                                                | Category  |
| --- | --------------------------------------------------- | --------- |
| 1   | waitFor resolves on matching event                  | basic     |
| 2   | waitFor ignores non-matching events                 | filtering |
| 3   | waitFor with predicate filters correctly            | predicate |
| 4   | waitFor times out and rejects                       | timeout   |
| 5   | waitFor cleans up subscription after resolve        | cleanup   |
| 6   | waitFor cleans up subscription after timeout        | cleanup   |
| 7   | waitFor without timeout waits indefinitely          | basic     |
| 8   | multiple waitFor on same type resolve independently | isolation |
| 9   | waitFor resolves only once (first match)            | semantics |
| 10  | has no React/DOM imports                            | isolation |

**Acceptance Criteria:**

- [x] `waitFor` resolves on matching event type
- [x] Predicate filtering works correctly
- [x] Timeout rejection with cleanup
- [x] Subscriptions cleaned up after resolve/reject
- [x] 10 tests pass, `tsc --noEmit` clean

---

### Phase D: React Adapter Hooks (~8 tests)

**Goal:** Add `useSelector()` hook for efficient partial state subscription in React.

**目标：** 新增 `useSelector()` hook，在 React 中实现高效的部分状态订阅。

**Files:**

- `packages/react/src/use-selector.ts` — `useSelector` hook
- `packages/react/src/hooks.test.tsx` — extend with new tests

**API Design:**

```typescript
/**
 * Subscribe to a derived slice of RuntimeState.
 * Only re-renders when the selected value changes (Object.is).
 * Uses useSyncExternalStore for tear-free reads.
 */
function useSelector<T>(selector: StateSelector<T>): T;
```

**Test Plan:**

| #   | Test                                             | Category   |
| --- | ------------------------------------------------ | ---------- |
| 1   | useSelector returns selected slice               | basic      |
| 2   | useSelector re-renders on relevant change        | reactivity |
| 3   | useSelector skips re-render on irrelevant change | efficiency |
| 4   | useSelector with createSelector                  | composed   |
| 5   | useSelector stable reference for unchanged slice | stability  |
| 6   | multiple useSelector hooks independent           | isolation  |
| 7   | hooks are thin wrappers (updated isolation test) | isolation  |

**Acceptance Criteria:**

- [x] `useSelector` provides efficient partial subscriptions
- [x] Integrates with `useSyncExternalStore`
- [x] Composes with `createSelector`
- [x] 5 tests pass (+ 1 updated isolation test), `tsc --noEmit` clean

---

### Phase E: Barrel Exports

**Goal:** Update `packages/core/src/index.ts` and `packages/react/src/index.ts`.

---

## Directory Structure

```
packages/core/src/
├── selector.ts          # Phase A
├── selector.test.ts
├── lifecycle.ts         # Phase B (constants + types)
├── lifecycle.test.ts
├── wait-for.ts          # Phase C
├── wait-for.test.ts
├── module.ts            # Phase B (extended)
└── runtime.ts           # Phase B (extended)

packages/react/src/
├── use-selector.ts      # Phase D
└── hooks.test.tsx        # Phase D (extended)
```

---

## Definition of Done

Stage-4 is complete when **ALL** of the following are true:

1. [x] State selectors provide efficient partial subscriptions
2. [x] createSelector provides memoized derived state
3. [x] Module lifecycle hooks (onInit, onDestroy) work correctly
4. [x] Module status tracking (registered → active → destroyed)
5. [x] Lifecycle events dispatched and governance-compatible
6. [x] waitFor utility enables inter-module coordination
7. [x] useSelector hook added for React adapter
8. [x] Backward compatible — all existing modules unchanged
9. [x] 43 new tests passing (290 cumulative with previous stages)
10. [x] `tsc --noEmit` clean (core, react, demo)
11. [x] All devdocs updated
12. [x] Demo synced

---

## References

- [STAGE-003 Interaction Modules](./STAGE-003-interaction-modules.md) — Module pattern reference
- [STAGE-001 Runtime Core](./STAGE-001-runtime-core.md) — Store, Scheduler, Module System
- [STAGE-002 Governance Layer](./STAGE-002-governance-layer.md) — Audit/Policy integration
