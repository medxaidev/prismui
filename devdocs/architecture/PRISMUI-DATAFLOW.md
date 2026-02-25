# Dataflow Architecture

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25

---

## Overview

PrismUI 2.0 enforces a **unidirectional, deterministic dataflow**. All state changes originate from dispatched events and flow through a predictable pipeline.

---

## Primary Flow

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

---

## Flow Rules

### 1. Unidirectional

Data flows in **one direction only**: Event → Process → State → View.

```
❌ View → State (prohibited)
❌ State → Event (prohibited)
✅ Event → State → View (required)
```

### 2. Single Source of Truth

All interaction state lives in **one RuntimeStore**. There is no secondary state.

```
❌ Component-local modal state
❌ Context-based page state
❌ Redux store alongside Runtime
✅ RuntimeStore only
```

### 3. Immutable Updates via Reducer

State is never mutated directly. Every change is computed by a **pure reducer** and committed by the Scheduler.

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

All events MUST be serializable (JSON-compatible). No functions, no class instances, no DOM references.

```typescript
// ❌ Non-serializable
{ type: 'CLICK', payload: { callback: () => {} } }

// ✅ Serializable
{ type: 'PAGE_TRANSITION', payload: { pageId: 'Dashboard' } }
```

---

## Event Lifecycle (Reducer Commit)

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

### Middleware

Middleware intercepts events **before reducer execution**. Used for:

- Logging
- Governance (Policy + Audit)
- Analytics
- DevTools integration

**Required middleware order (STAGE-002):**

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

Multiple subscribers can listen to store changes:

| Subscriber       | Purpose                  |
| ---------------- | ------------------------ |
| React Adapter    | Trigger re-renders       |
| Audit Trail      | Record state transitions |
| DevTools         | Inspector updates        |
| Analytics        | Usage tracking           |
| External Systems | Remote monitoring        |
