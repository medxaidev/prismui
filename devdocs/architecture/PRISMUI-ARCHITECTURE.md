# PrismUI 2.0 Architecture (Constitutional)

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Authority:** Constitutional — all development MUST comply with this document.  
> **Supersedes:** PrismUI 1.x Architecture (ADR-011)

This document defines **binding architectural rules** for PrismUI 2.0.
Any new module, feature, or refactor **MUST comply** with this document.
Violations require an Architecture Decision Record (ADR) and explicit approval.

---

## 1. Platform Definition

> **PrismUI 2.0 is a Framework-Agnostic Interaction Runtime — a programmable, deterministic UI orchestration engine.**

PrismUI is **not**:

- ❌ A component library
- ❌ A styling framework
- ❌ A design system

PrismUI **is**:

- ✅ A deterministic interaction orchestration engine
- ✅ A provider-centric runtime platform
- ✅ A semantic theme system with behavior derivation
- ✅ A programmable UI operating system kernel

See [ROADMAP.md](../ROADMAP.md) for the strategic vision.

---

## 2. Core Principles (Constitutional)

### 2.1 Runtime First

The Runtime is the behavior layer. Components are the rendering layer.

```
Runtime owns:  state, scheduling, policies, lifecycle
Components own: rendering, styling, user event capture
```

**Enforcement:**

- ❌ Components MUST NOT hold global interaction state
- ❌ Components MUST NOT implement scheduling logic
- ✅ All behavior flows through `runtime.dispatch(event)`
- ✅ Components subscribe to Runtime state and render accordingly

---

### 2.2 Deterministic Flow

All interactions MUST follow a predictable, traceable, replayable pipeline:

```
Event → Scheduler → [Middleware] → Reducer → Commit → Render
```

**Prohibited:**

```
Component → setState() → Side Effect           ❌
Handler → store.setState() directly              ❌
```

**Required:**

```
Component → runtime.dispatch(event)              ✅
         → Scheduler processes event
         → [Middleware: Policy, Audit, etc.]
         → Reducer(event, prevState) → ReducerCommitResult  ✅ (pure function)
         → Scheduler commits result.nextState to store     ✅ (only commit point)
         → Subscribers notified
         → React re-renders
```

**Enforcement:**

- Every state change MUST be traceable to a dispatched event
- Every event MUST have a `type` and optional `payload`
- Events MUST be serializable (for audit, replay, devtools)

---

### 2.3 Framework Isolation

The Interaction Core (Layer 0) MUST be completely framework-agnostic.

```
packages/core/    → Pure TypeScript, zero dependencies
packages/react/   → React adapter (thin bridge)
packages/vue/     → Future Vue adapter
packages/demo/    → Demo application
```

**Enforcement:**

- ❌ `packages/core/` MUST NOT import `react`, `react-dom`, or any framework
- ❌ `packages/core/` MUST NOT access `document`, `window`, or DOM APIs
- ✅ Core runs in Node.js, browser, SSR, CLI, or test environments
- ✅ Adapters are thin subscription bridges

---

### 2.4 Semantic Separation

Theme is not just variables. It is a three-layer derivation system:

```
┌─────────────────────────────────┐
│ Layer 3: Behavior Derivation    │  if (intent === "destructive")
│   autoConfirm, auditLog,       │    → requireConfirm()
│   highContrast, motionAdjust    │    → logAudit()
├─────────────────────────────────┤
│ Layer 2: Semantic Intent        │  intent.primary, intent.destructive,
│   Maps meaning to tokens        │  intent.safe, intent.warning
├─────────────────────────────────┤
│ Layer 1: Token Layer            │  color.primary = blue
│   Raw design variables          │  spacing.md = 8px, radius.lg = 12px
└─────────────────────────────────┘
```

**Enforcement:**

- ❌ Components MUST NOT reference tokens directly
- ✅ Components use `intent` (semantic), which derives from tokens
- ✅ Behavior Derivation layer can auto-trigger policies based on intent

---

### 2.5 Governance Built-in

Enterprise-grade systems require built-in governance capabilities:

- **Page Lock** — prevent navigation during critical flows
- **Interaction Policy** — rules governing what interactions are permitted
- **Priority Scheduling** — event ordering and conflict resolution
- **Audit Trail** — complete event history for compliance
- **Replay** — deterministic replay of interaction sequences

**Enforcement:**

- ✅ Governance is a first-class layer (Layer 1), not an afterthought
- ✅ All destructive interactions MUST pass through the policy engine
- ✅ Event history MUST be available for audit and replay

---

## 3. Four-Layer Architecture (MANDATORY)

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (User's app consuming PrismUI Runtime)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌───────────────────┐         ┌───────────────────┐
│  Layer 3           │         │  Semantic Theme   │
│  Rendering Layer   │◄────────│  System           │
│                    │         │                   │
│  ModalRenderer     │         │  Tokens           │
│  DrawerRenderer    │         │  Intents          │
│  NotifRenderer     │         │  Behavior Rules   │
└────────┬──────────┘         └───────────────────┘
         │
         ▼
┌───────────────────┐
│  Layer 2           │
│  Framework Adapter │
│                    │
│  React Provider    │
│  useRuntime()      │
│  usePage()         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Layer 1           │
│  Governance Layer  │
│                    │
│  Policy Engine     │
│  Audit Trail       │
│  Replay            │
│  Priority Sched.   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Layer 0           │
│  Interaction Core  │
│                    │
│  EventBus          │
│  RuntimeStore      │
│  Scheduler         │
│  Module System     │
└─────────┬─────────┘
          │
┌─────────┴─────────┐
│  Layer 0.5          │
│  Built-in Modules   │
│  (Page, Modal)      │
└───────────────────┘
```

---

### 3.2 Layer 0 — Interaction Core

**Location:** `packages/core/src/`  
**Language:** Pure TypeScript  
**Dependencies:** None  
**Detail:** [PRISMUI-RUNTIME.md](./PRISMUI-RUNTIME.md)

**Components (Core infrastructure only):**

- **EventBus** — dispatch, subscribe, type-filtered subscription, event history
- **RuntimeStore** — extensible immutable state, versioned snapshots, subscriber notification
- **Scheduler** — Reducer Commit Engine (`ReducerCommitResult`), middleware chain
- **Module System** — `RuntimeModule` interface for module/middleware injection

**Built-in Modules (Layer 0.5 — shipped with Core, plugged via Module System):**

- **Page Module** (`createPageModule()`) — page lifecycle (mount/unmount/transition/lock)
- **Modal Module** (`createModalModule()`) — modal stack (open/close/closeAll)

**Hard Constraints:**

- ❌ MUST NOT import React, DOM, or any framework
- ❌ MUST NOT access `window`, `document`, or browser APIs
- ✅ MUST be testable in pure Node.js
- ✅ MUST be usable by Vue, Svelte, or bare TypeScript

---

### 3.3 Layer 1 — Governance Layer

**Location:** `packages/core/src/governance/`  
**Language:** Pure TypeScript  
**Dependencies:** Layer 0 only  
**Detail:** [GOVERNANCE-LAYER.md](./GOVERNANCE-LAYER.md)

**Components:**

- **Policy Engine** — rule-based interaction validation
- **Audit Trail** — event history logging with metadata
- **Replay System** — deterministic event replay
- **Priority Scheduler** — event priority and conflict resolution

**Hard Constraints:**

- ❌ MUST NOT access Theme or rendering
- ❌ MUST NOT depend on any framework
- ✅ Policies are pure functions: `(event, state) → allow | deny | transform`
- ✅ Audit entries are immutable and serializable

---

### 3.4 Layer 2 — Framework Adapter

**Location:** `packages/react/src/`  
**Language:** TypeScript + React  
**Dependencies:** Layer 0, Layer 1, React  
**Detail:** [ADAPTER-LAYER.md](./ADAPTER-LAYER.md)

**Components:**

- **PrismUIProvider** — bridges Runtime to React Context
- **useRuntime()** — access the full runtime instance
- **useRuntimeState()** — reactive subscription to runtime state
- **usePage()** — page lifecycle convenience hook
- **useModal()** — modal stack convenience hook

**Hard Constraints:**

- ❌ MUST NOT contain business logic, scheduling, or policy
- ❌ MUST NOT modify state directly (only dispatch)
- ✅ Pure bridge: subscribe to Runtime → trigger re-render
- ✅ Hooks are thin wrappers around Runtime APIs

---

### 3.5 Layer 3 — Rendering Layer

**Location:** `packages/react/src/renderers/`  
**Language:** TypeScript + React + CSS  
**Dependencies:** Layer 2, Semantic Theme  
**Detail:** [RENDERING-LAYER.md](./RENDERING-LAYER.md)

**Components:**

- **ModalRenderer** — renders modal stack from Runtime state
- **DrawerRenderer** — renders drawer state
- **NotificationRenderer** — renders notification queue
- **PageRenderer** — renders current page based on Runtime

**Hard Constraints:**

- ❌ MUST NOT contain orchestration or scheduling logic
- ❌ MUST NOT call `setState()` for global interaction state
- ✅ Pure rendering based on Runtime state subscription
- ✅ Styling through Semantic Theme intents

---

## 4. Package Structure

```
packages/
├── core/                    # Layer 0 + Layer 1 (Pure TypeScript)
│   ├── src/
│   │   ├── event-bus.ts
│   │   ├── store.ts
│   │   ├── scheduler.ts
│   │   ├── page-controller.ts
│   │   ├── runtime.ts        # createInteractionRuntime() factory
│   │   ├── types.ts          # All public types
│   │   ├── governance/       # Layer 1 (future: STAGE-002)
│   │   └── index.ts
│   ├── __tests__/
│   └── package.json
│
├── react/                   # Layer 2 + Layer 3 (React Adapter)
│   ├── src/
│   │   ├── context.ts
│   │   ├── provider.tsx
│   │   ├── use-runtime.ts
│   │   ├── use-runtime-state.ts
│   │   ├── use-page.ts
│   │   ├── use-modal.ts
│   │   ├── renderers/       # Layer 3 (future: STAGE-004)
│   │   └── index.ts
│   ├── __tests__/
│   └── package.json
│
└── demo/                    # Minimal demo application
    ├── src/
    └── package.json
```

---

## 5. Interaction Flow (Complete Pipeline)

```
User Action (click, keypress)
    │
    ▼
Component captures event
    │
    ▼
runtime.dispatch({ type: "PAGE_TRANSITION", payload: "PatientDetail" })
    │
    ▼
EventBus distributes to Scheduler
    │
    ▼
Scheduler runs middleware chain
    │
    ▼
[STAGE-002] Policy Engine validates (allow / deny / transform)
    │
    ▼
Reducer computes: nextState = reducer(event, prevState)
    │
    ▼
Scheduler commits: store.setState(() => nextState)
    │
    ▼
[STAGE-002] Audit Trail records event + prevState + nextState
    │
    ▼
Store notifies subscribers
    │
    ▼
React Adapter receives state change
    │
    ▼
React re-renders affected components
```

---

## 6. Comparison with PrismUI 1.x

| Aspect              | PrismUI 1.x                         | PrismUI 2.0                                   |
| ------------------- | ----------------------------------- | --------------------------------------------- |
| **Core Identity**   | Component Library → Runtime bolt-on | Interaction Runtime from Day 1                |
| **Framework**       | React-dependent core                | Framework-Agnostic TypeScript                 |
| **Architecture**    | 5 layers (L0-L4) for overlays only  | 4 universal layers for ALL interactions       |
| **State**           | Component-local + React Context     | Centralized RuntimeStore                      |
| **Flow**            | Component → setState → effect       | Event → Scheduler → Policy → State → Render   |
| **Theme**           | Token + Variant colors              | Token → Semantic Intent → Behavior Derivation |
| **Page**            | JSX tree                            | Runtime Resource (mount/lock/transition)      |
| **Governance**      | None                                | Policy, Audit, Replay as Layer 1              |
| **Programmability** | Limited programmatic API            | Full Interaction DSL                          |

---

## 7. Hard Constraints Summary

| Rule      | Constraint                                                           |
| --------- | -------------------------------------------------------------------- |
| **HC-01** | `packages/core/` has zero framework imports                          |
| **HC-02** | All state changes flow through `runtime.dispatch()`                  |
| **HC-03** | Adapters contain zero business logic                                 |
| **HC-04** | Renderers contain zero orchestration logic                           |
| **HC-05** | Components MUST NOT hold global interaction state                    |
| **HC-06** | Theme tokens accessed only through semantic intent                   |
| **HC-07** | Destructive actions require policy approval                          |
| **HC-08** | Events are serializable (no functions/closures in payload)           |
| **HC-09** | Each layer communicates only through defined interfaces              |
| **HC-10** | No layer may bypass the layer below it                               |
| **HC-11** | `store.setState()` is called ONLY by Scheduler commit                |
| **HC-12** | Reducers are pure: `(event, prevState) → nextState`, no side effects |
