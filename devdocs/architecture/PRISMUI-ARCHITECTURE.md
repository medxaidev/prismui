# PrismUI 2.0 Architecture (Constitutional) / PrismUI 2.0 架构（宪法级）

> **Status:** Active  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Authority:** Constitutional — all development MUST comply with this document.  
> **Supersedes:** PrismUI 1.x Architecture (ADR-011)

> **状态：** Active  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **权威性：** 宪法级 —— 所有开发必须遵循本文档。  
> **替代：** PrismUI 1.x Architecture（ADR-011）

This document defines **binding architectural rules** for PrismUI 2.0.
Any new module, feature, or refactor **MUST comply** with this document.
Violations require an Architecture Decision Record (ADR) and explicit approval.

本文档定义 PrismUI 2.0 的**强约束架构规则**。
任何新的模块、功能或重构都 **必须遵循** 本文档。
如需违反，必须提交 Architecture Decision Record（ADR）并获得明确批准。

---

## 1. Platform Definition

## 1. 平台定义

> **PrismUI 2.0 is a Framework-Agnostic Interaction Runtime — a programmable, deterministic UI orchestration engine.**

> **PrismUI 2.0 是一个与框架无关的交互运行时（Interaction Runtime）——可编程、确定性的 UI 编排引擎。**

PrismUI is **not**:

PrismUI **不是**：

- ❌ A component library
- ❌ A styling framework
- ❌ A design system

- ❌ 组件库
- ❌ 样式框架
- ❌ 设计系统

PrismUI **is**:

PrismUI **是**：

- ✅ A deterministic interaction orchestration engine
- ✅ A provider-centric runtime platform
- ✅ A semantic theme system with behavior derivation
- ✅ A programmable UI operating system kernel

- ✅ 确定性的交互编排引擎
- ✅ 以 Provider 为中心的 runtime 平台
- ✅ 带行为推导（Behavior Derivation）的语义主题系统
- ✅ 可编程的 UI 操作系统内核

See [ROADMAP.md](../ROADMAP.md) for the strategic vision.

战略愿景见 [ROADMAP.md](../ROADMAP.md)。

---

## 2. Core Principles (Constitutional)

## 2. 核心原则（宪法级）

### 2.1 Runtime First

### 2.1 Runtime 优先

The Runtime is the behavior layer. Components are the rendering layer.

Runtime 是行为层（behavior layer），组件是渲染层（rendering layer）。

```
Runtime owns:  state, scheduling, policies, lifecycle
Components own: rendering, styling, user event capture
```

**Enforcement:**

**约束：**

- ❌ Components MUST NOT hold global interaction state
- ❌ Components MUST NOT implement scheduling logic
- ✅ All behavior flows through `runtime.dispatch(event)`
- ✅ Components subscribe to Runtime state and render accordingly

- ❌ 组件不得持有全局交互状态
- ❌ 组件不得实现调度逻辑
- ✅ 所有行为必须通过 `runtime.dispatch(event)`
- ✅ 组件订阅 Runtime state 并据此渲染

---

### 2.2 Deterministic Flow

### 2.2 确定性流程

All interactions MUST follow a predictable, traceable, replayable pipeline:

所有交互必须遵循可预测、可追踪、可重放的管线：

```
Event → Scheduler → [Middleware] → Reducer → Commit → Render
```

**Prohibited:**

**禁止：**

```
Component → setState() → Side Effect           ❌
Handler → store.setState() directly              ❌
```

**Required:**

**必须：**

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

**约束：**

- Every state change MUST be traceable to a dispatched event
- Every event MUST have a `type` and optional `payload`
- Events MUST be serializable (for audit, replay, devtools)

- 每一次 state 变化都必须能追溯到一次已 dispatch 的事件
- 每个事件都必须有 `type`，并可选携带 `payload`
- 事件必须可序列化（用于 audit、replay、devtools）

---

### 2.3 Framework Isolation

### 2.3 框架隔离

The Interaction Core (Layer 0) MUST be completely framework-agnostic.

Interaction Core（Layer 0）必须完全与框架无关。

```
packages/core/    → Pure TypeScript, zero dependencies
packages/react/   → React adapter (thin bridge)
packages/vue/     → Future Vue adapter
packages/demo/    → Demo application
```

**Enforcement:**

**约束：**

- ❌ `packages/core/` MUST NOT import `react`, `react-dom`, or any framework
- ❌ `packages/core/` MUST NOT access `document`, `window`, or DOM APIs
- ✅ Core runs in Node.js, browser, SSR, CLI, or test environments
- ✅ Adapters are thin subscription bridges

- ❌ `packages/core/` 不得导入 `react`、`react-dom` 或任何框架
- ❌ `packages/core/` 不得访问 `document`、`window` 或 DOM API
- ✅ Core 可运行于 Node.js、浏览器、SSR、CLI、测试环境
- ✅ 适配层是薄订阅桥接层

---

### 2.4 Semantic Separation

### 2.4 语义分离

Theme is not just variables. It is a three-layer derivation system:

Theme 不仅是变量集合，它是一个三层推导系统：

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

**约束：**

- ❌ Components MUST NOT reference tokens directly
- ✅ Components use `intent` (semantic), which derives from tokens
- ✅ Behavior Derivation layer can auto-trigger policies based on intent

- ❌ 组件不得直接引用 tokens
- ✅ 组件使用由 tokens 推导的 `intent`（语义层）
- ✅ Behavior Derivation 层可以基于 intent 自动触发策略

---

### 2.5 Governance Built-in

### 2.5 内建治理能力

Enterprise-grade systems require built-in governance capabilities:

企业级系统需要内建治理能力：

- **Page Lock** — prevent navigation during critical flows
- **Interaction Policy** — rules governing what interactions are permitted
- **Priority Scheduling** — event ordering and conflict resolution
- **Audit Trail** — complete event history for compliance
- **Replay** — deterministic replay of interaction sequences

- **页面锁（Page Lock）** —— 在关键流程期间阻止导航
- **交互策略（Interaction Policy）** —— 规定哪些交互被允许的规则
- **优先级调度（Priority Scheduling）** —— 事件排序与冲突解决
- **审计轨迹（Audit Trail）** —— 用于合规的完整事件历史
- **重放（Replay）** —— 对交互序列进行确定性重放

**Enforcement:**

- ✅ Governance is a first-class layer (Layer 1), not an afterthought
- ✅ All destructive interactions MUST pass through the policy engine
- ✅ Event history MUST be available for audit and replay

- ✅ Governance 是一等公民层（Layer 1），而不是事后补丁
- ✅ 所有破坏性交互都必须通过 policy engine
- ✅ 必须提供可用于 audit 与 replay 的事件历史

---

## 3. Four-Layer Architecture (MANDATORY)

## 3. 四层架构（强制）

### 3.1 Architecture Diagram

### 3.1 架构图

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

### 3.2 Layer 0 —— 交互核心（Interaction Core）

**Location:** `packages/core/src/`  
**Language:** Pure TypeScript  
**Dependencies:** None  
**Detail:** [PRISMUI-RUNTIME.md](./PRISMUI-RUNTIME.md)

**位置：** `packages/core/src/`  
**语言：** 纯 TypeScript  
**依赖：** 无  
**详情：** [PRISMUI-RUNTIME.md](./PRISMUI-RUNTIME.md)

**Components (Core infrastructure only):**

**组件（仅 Core 基础设施）：**

- **EventBus** — dispatch, subscribe, type-filtered subscription, event history
- **RuntimeStore** — extensible immutable state, versioned snapshots, subscriber notification
- **Scheduler** — Reducer Commit Engine (`ReducerCommitResult`), middleware chain
- **Module System** — `RuntimeModule` interface for module/middleware injection

- **事件总线（EventBus）** —— dispatch、subscribe、按类型过滤订阅、事件历史
- **运行时存储（RuntimeStore）** —— 可扩展不可变 state、版本化快照、订阅者通知
- **调度器（Scheduler）** —— Reducer Commit Engine（`ReducerCommitResult`）、middleware chain
- **模块系统（Module System）** —— 用于 module/middleware 注入的 `RuntimeModule` 接口

**Built-in Modules (Layer 0.5 — shipped with Core, plugged via Module System):**

**内建模块（Layer 0.5 —— 随 Core 交付，通过 Module System 插接）：**

- **Page Module** (`createPageModule()`) — page lifecycle (mount/unmount/transition/lock)
- **Modal Module** (`createModalModule()`) — modal stack (open/close/closeAll)

- **Page 模块**（`createPageModule()`）—— 页面生命周期（mount/unmount/transition/lock）
- **Modal 模块**（`createModalModule()`）—— modal stack（open/close/closeAll）

**Hard Constraints:**

**硬性约束：**

- ❌ MUST NOT import React, DOM, or any framework
- ❌ MUST NOT access `window`, `document`, or browser APIs
- ✅ MUST be testable in pure Node.js
- ✅ MUST be usable by Vue, Svelte, or bare TypeScript

- ❌ 不得导入 React、DOM 或任何框架
- ❌ 不得访问 `window`、`document` 或浏览器 API
- ✅ 必须可在纯 Node.js 中测试
- ✅ 必须可被 Vue、Svelte 或纯 TypeScript 使用

---

### 3.3 Layer 1 — Governance Layer

### 3.3 Layer 1 —— 治理层（Governance Layer）

**Location:** `packages/core/src/governance/`  
**Language:** Pure TypeScript  
**Dependencies:** Layer 0 only  
**Detail:** [GOVERNANCE-LAYER.md](./GOVERNANCE-LAYER.md)

**位置：** `packages/core/src/governance/`  
**语言：** 纯 TypeScript  
**依赖：** 仅 Layer 0  
**详情：** [GOVERNANCE-LAYER.md](./GOVERNANCE-LAYER.md)

**Components:**

**组件：**

- **Policy Engine** — rule-based interaction validation
- **Audit Trail** — event history logging with metadata
- **Replay System** — deterministic event replay
- **Priority Scheduler** — event priority and conflict resolution

- **策略引擎（Policy Engine）** —— 基于规则的交互校验
- **审计轨迹（Audit Trail）** —— 带元数据的事件历史记录
- **重放系统（Replay System）** —— 确定性事件重放
- **优先级调度器（Priority Scheduler）** —— 事件优先级与冲突解决

**Hard Constraints:**

- ❌ MUST NOT access Theme or rendering
- ❌ MUST NOT depend on any framework
- ✅ Policies are pure functions: `(event, state) → allow | deny | transform`
- ✅ Audit entries are immutable and serializable

- ❌ 不得访问 Theme 或渲染层
- ❌ 不得依赖任何框架
- ✅ Policies 为纯函数：`(event, state) → allow | deny | transform`
- ✅ Audit entries 不可变且可序列化

---

### 3.4 Layer 2 — Framework Adapter

### 3.4 Layer 2 —— 框架适配层（Framework Adapter）

**Location:** `packages/react/src/`  
**Language:** TypeScript + React  
**Dependencies:** Layer 0, Layer 1, React  
**Detail:** [ADAPTER-LAYER.md](./ADAPTER-LAYER.md)

**位置：** `packages/react/src/`  
**语言：** TypeScript + React  
**依赖：** Layer 0、Layer 1、React  
**详情：** [ADAPTER-LAYER.md](./ADAPTER-LAYER.md)

**Components:**

- **PrismUIProvider** — bridges Runtime to React Context
- **useRuntime()** — access the full runtime instance
- **useRuntimeState()** — reactive subscription to runtime state
- **usePage()** — page lifecycle convenience hook
- **useModal()** — modal stack convenience hook

- **PrismUIProvider** —— 将 Runtime 桥接到 React Context
- **useRuntime()** —— 访问完整 runtime 实例
- **useRuntimeState()** —— 对 runtime state 的响应式订阅
- **usePage()** —— 页面生命周期便捷 hook
- **useModal()** —— modal stack 的便捷 hook

**Hard Constraints:**

- ❌ MUST NOT contain business logic, scheduling, or policy
- ❌ MUST NOT modify state directly (only dispatch)
- ✅ Pure bridge: subscribe to Runtime → trigger re-render
- ✅ Hooks are thin wrappers around Runtime APIs

- ❌ 不得包含业务逻辑、调度或策略
- ❌ 不得直接修改 state（只能 dispatch）
- ✅ 纯桥接：订阅 Runtime → 触发 re-render
- ✅ Hooks 是对 Runtime APIs 的薄封装

---

### 3.5 Layer 3 — Rendering Layer

### 3.5 Layer 3 —— 渲染层（Rendering Layer）

**Location:** `packages/react/src/renderers/`  
**Language:** TypeScript + React + CSS  
**Dependencies:** Layer 2, Semantic Theme  
**Detail:** [RENDERING-LAYER.md](./RENDERING-LAYER.md)

**位置：** `packages/react/src/renderers/`  
**语言：** TypeScript + React + CSS  
**依赖：** Layer 2、Semantic Theme  
**详情：** [RENDERING-LAYER.md](./RENDERING-LAYER.md)

**Components:**

- **ModalRenderer** — renders modal stack from Runtime state
- **DrawerRenderer** — renders drawer state
- **NotificationRenderer** — renders notification queue
- **PageRenderer** — renders current page based on Runtime

- **ModalRenderer** —— 基于 Runtime state 渲染 modal stack
- **DrawerRenderer** —— 渲染 drawer state
- **NotificationRenderer** —— 渲染通知队列
- **PageRenderer** —— 基于 Runtime 渲染当前页面

**Hard Constraints:**

- ❌ MUST NOT contain orchestration or scheduling logic
- ❌ MUST NOT call `setState()` for global interaction state
- ✅ Pure rendering based on Runtime state subscription
- ✅ Styling through Semantic Theme intents

- ❌ 不得包含编排或调度逻辑
- ❌ 不得对全局交互状态调用 `setState()`
- ✅ 基于对 Runtime state 的订阅进行纯渲染
- ✅ 通过 Semantic Theme intents 进行样式应用

---

## 4. Package Structure

## 4. 包结构

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

## 5. 交互流（完整管线）

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

## 6. 与 PrismUI 1.x 的对比

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

| 维度         | PrismUI 1.x                      | PrismUI 2.0                                   |
| ------------ | -------------------------------- | --------------------------------------------- |
| **核心定位** | 组件库 → Runtime 事后补丁        | 从 Day 1 起即为 Interaction Runtime           |
| **框架依赖** | Core 依赖 React                  | 框架无关的 TypeScript                         |
| **架构**     | 仅为 overlays 提供 5 层（L0-L4） | 面向所有交互的通用 4 层                       |
| **状态**     | 组件本地 + React Context         | 中心化 RuntimeStore                           |
| **流程**     | Component → setState → effect    | Event → Scheduler → Policy → State → Render   |
| **主题**     | Token + Variant colors           | Token → Semantic Intent → Behavior Derivation |
| **Page**     | JSX tree                         | Runtime Resource（mount/lock/transition）     |
| **治理**     | 无                               | Layer 1：Policy、Audit、Replay                |
| **可编程性** | 有限的 programmatic API          | 完整的 Interaction DSL                        |

---

## 7. Hard Constraints Summary

## 7. 硬性约束汇总

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

| 规则      | 约束                                                          |
| --------- | ------------------------------------------------------------- |
| **HC-01** | `packages/core/` 零框架 imports                               |
| **HC-02** | 所有 state 变更必须通过 `runtime.dispatch()`                  |
| **HC-03** | 适配层零业务逻辑                                              |
| **HC-04** | 渲染层零编排逻辑                                              |
| **HC-05** | 组件不得持有全局交互状态                                      |
| **HC-06** | 主题 tokens 只能通过 semantic intent 访问                     |
| **HC-07** | 破坏性动作需要策略审批                                        |
| **HC-08** | 事件必须可序列化（payload 不含函数/闭包）                     |
| **HC-09** | 各层只能通过定义好的接口通信                                  |
| **HC-10** | 任何层不得绕过其下层                                          |
| **HC-11** | `store.setState()` 只能由 Scheduler commit 调用               |
| **HC-12** | Reducers 为纯函数：`(event, prevState) → nextState`，无副作用 |
