# Dataflow Architecture / 数据流架构

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25

> **状态：** Active  
> **版本：** 2.0  
> **最后更新：** 2026-02-25

---

## Overview

PrismUI 2.0 enforces a **unidirectional, deterministic dataflow**. All state changes originate from dispatched events and flow through a predictable pipeline.

## 概览

PrismUI 2.0 强制执行 **单向、确定性的数据流**。所有 state 变更都源自被 dispatch 的事件，并沿着可预测的管线流转。

---

## Primary Flow

## 主流程

```
┌──────────┐     dispatch()     ┌──────────┐
│  User    │ ─────────────────► │ EventBus │
│  Action  │                    └────┬─────┘
└──────────┘                         │
                                     ▼
                         ┌──────────────────┐
                         │  Scheduler          │
                         │                      │
                         │  1. Middleware Chain  │
                         │     (Policy, Audit)  │
                         │                      │
                         │  2. Reducer           │
                         │     prevState         │
                         │     → nextState       │
                         │                      │
                         │  3. Commit            │
                         │     store.setState()  │
                         └─────────┬────────┘
                                  │
                           notify subscribers
                                  │
                   ┌───────────┴───────────┐
                   │                       │
                   ▼                       ▼
            ┌─────────────┐        ┌─────────────┐
            │ React       │        │ Other       │
            │ Adapter     │        │ Subscribers │
            │ (re-render) │        │ (logging,   │
            └─────────────┘        │  analytics) │
                                   └─────────────┘
```

**Key architectural rule:** `store.setState()` is called **only** inside the Scheduler's commit step (step 3). No reducer, middleware, or component may call it directly.

**关键架构规则：** `store.setState()` **只能** 在 Scheduler 的 commit 步骤（第 3 步）中调用。任何 reducer、middleware 或组件都不得直接调用它。

---

## Flow Rules

## 流程规则

### 1. Unidirectional

### 1. 单向性

Data flows in **one direction only**: Event → Process → State → View.

数据只允许 **单向** 流动：Event → Process → State → View。

```
❌ View → State (prohibited)
❌ State → Event (prohibited)
✅ Event → State → View (required)
```

### 2. Single Source of Truth

### 2. 单一事实来源（Single Source of Truth）

All interaction state lives in **one RuntimeStore**. There is no secondary state.

所有交互 state 都存在于 **唯一的 RuntimeStore** 中，不存在第二套 state。

```
❌ Component-local modal state
❌ Context-based page state
❌ Redux store alongside Runtime
✅ RuntimeStore only
```

### 3. Immutable Updates via Reducer

### 3. 通过 Reducer 的不可变更新

State is never mutated directly. Every change is computed by a **pure reducer** and committed by the Scheduler.

state 从不允许被直接 mutation。每一次变更都必须由 **纯 reducer** 计算，并由 Scheduler 进行 commit。

```typescript
// ❌ Direct mutation
state.locked = true;

// ❌ Handler calling store directly (old model)
handler(event, store) { store.setState(prev => ({ ...prev, locked: true })); }

// ✅ Pure reducer (new model) — returns ReducerCommitResult
const lockReducer: EventReducer = (event, prevState) => ({
  nextState: { ...prevState, locked: true },
});
// Scheduler commits: store.setState(() => result.nextState)
// Then dispatches result.sideEffects (if any)
```

### 4. Event Serialization

### 4. 事件可序列化

All events MUST be serializable (JSON-compatible). No functions, no class instances, no DOM references.

所有事件必须可序列化（JSON 兼容）。禁止函数、class 实例、DOM 引用。

```typescript
// ❌ Non-serializable
{ type: 'CLICK', payload: { callback: () => {} } }

// ✅ Serializable
{ type: 'PAGE_TRANSITION', payload: { pageId: 'Dashboard' } }
```

---

## Event Lifecycle (Reducer Commit)

## 事件生命周期（Reducer Commit）

```
1.  Component calls runtime.dispatch(event)
2.  EventBus records event in history
3.  EventBus notifies global subscribers
4.  Scheduler receives event via EventBus subscription
5.  Scheduler captures prevState = store.getState()
6.  Scheduler runs middleware chain:
      [STAGE-002] Policy Engine evaluates → allow/deny/transform
      [STAGE-002] If denied → stop, log denial reason, done
      [STAGE-002] If transform → replace event (one-time, no re-evaluation)
7.  Reducer = reducers.get(event.type)
8.  If no reducer → silently drop, done
9.  result = reducer(event, prevState)         // pure computation → ReducerCommitResult
10. If reducer throws → do NOT commit, do NOT dispatch sideEffects, dispatch SYSTEM_ERROR, done
11. Scheduler commits: store.setState(() => result.nextState)   // ONLY commit point
12. Store increments version
13. Store notifies all subscribers
14. Scheduler dispatches result.sideEffects (if any) via bus.dispatch
15. [STAGE-002] Audit Trail records { event, prevState, nextState }
16. React Adapter re-renders affected components
```

---

## Cross-Cutting Concerns

## 横切关注点（Cross-Cutting Concerns）

### Middleware

### Middleware（中间件）

Middleware intercepts events **before reducer execution**. Used for:

Middleware 在 **reducer 执行前** 拦截事件，常用于：

- Logging
- Governance (Policy + Audit)
- Analytics
- DevTools integration

**Required middleware order (STAGE-002):**

**必须的 middleware 顺序（STAGE-002）：**

```
1. Priority Layer     (event ordering)
2. Policy Layer       (allow / deny / transform)
3. Audit Before       (capture prevState)
4. [Reducer + Commit] (core processing)
5. Audit After        (capture nextState)
```

```typescript
scheduler.use((event, next) => {
  console.log("[event]", event.type);
  next(); // continue to next middleware / reducer
});
```

### Subscriptions

### 订阅（Subscriptions）

Multiple subscribers can listen to store changes:

多个 subscriber 可以监听 store 的变更：

| Subscriber       | Purpose                  |
| ---------------- | ------------------------ |
| React Adapter    | Trigger re-renders       |
| Audit Trail      | Record state transitions |
| DevTools         | Inspector updates        |
| Analytics        | Usage tracking           |
| External Systems | Remote monitoring        |

| Subscriber       | 目的           |
| ---------------- | -------------- |
| React Adapter    | 触发 re-render |
| Audit Trail      | 记录状态迁移   |
| DevTools         | 检查器更新     |
| Analytics        | 使用情况追踪   |
| External Systems | 远程监控       |
