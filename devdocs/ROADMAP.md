# PrismUI 2.0 — Roadmap / 路线图

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Status:** Active Development

> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **状态：** 活跃开发中

---

## Vision

## 愿景

> **PrismUI 2.0 is a Framework-Agnostic Interaction Runtime — a programmable, deterministic UI orchestration engine.**

> **PrismUI 2.0 是一个与框架无关的交互运行时（Interaction Runtime）——可编程、确定性的 UI 编排引擎。**

PrismUI 2.0 is not a component library. It is a **UI Operating System Kernel** that provides:

PrismUI 2.0 不是组件库。它更像一个 **UI 操作系统内核**，提供：

- **Interaction Runtime** — Modal, Drawer, Notification, Form, Workflow as a unified schedulable system
- **Constraint-Based UI** — Profile-driven rules for validation, layout rhythm, approval flows
- **Semantic Theme** — Token → Semantic Intent → Behavior Derivation (not just colors)
- **Programmable UI** — `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()`

- **交互运行时** — 将 Modal、Drawer、Notification、Form、Workflow 作为统一的可调度系统
- **约束式 UI** — 由 Profile 驱动的规则系统，用于校验、布局节奏、审批流程
- **语义主题** — Token → 语义意图（Semantic Intent）→ 行为推导（不仅是配色）
- **可编程 UI** — `ui.modal.open()`、`ui.confirm()`、`ui.workflow.start()`

---

## Why 2.0?

## 为什么是 2.0？

PrismUI 1.x evolved from a component library to a runtime platform (at STAGE-005). The key insight:

PrismUI 1.x 从组件库演进为运行时平台（在 STAGE-005）。核心洞察是：

| Realization                                      | Implication                                 |
| ------------------------------------------------ | ------------------------------------------- |
| Runtime controls behavior better than components | Rebuild with Runtime-first from Day 1       |
| React is just a rendering adapter                | Core must be framework-agnostic TypeScript  |
| Pages are resources, not JSX trees               | Page Orchestration as a first-class concept |
| Theme is more than colors                        | Semantic Intent → Behavior Derivation       |
| Governance is essential for enterprise           | Policy, Audit, Replay built into Layer 1    |
| UI should be programmable                        | Interaction DSL for automation + AI agents  |

| 认识                         | 含义                                   |
| ---------------------------- | -------------------------------------- |
| Runtime 比组件更适合控制行为 | 从第一天起以 Runtime-first 重建        |
| React 只是渲染适配器         | Core 必须是与框架无关的 TypeScript     |
| Page 是资源，不是 JSX 树     | 页面编排应是一等概念                   |
| Theme 不只是颜色             | 语义意图 → 行为推导                    |
| 企业场景需要治理能力         | Policy / Audit / Replay 内建在 Layer 1 |
| UI 应该可编程                | 用交互 DSL 支持自动化与 AI Agent       |

---

## Three Pillars

## 三大支柱

### 1. Provider-Centric Architecture

### 1. 以 Provider 为中心的架构

- NOT a component library — not chasing component coverage or visual templates
- Runtime capabilities delivered via **Provider + Context + Module injection**
- Through injection, not wrapping

- 不是组件库——不追求组件覆盖率或视觉模板
- 运行时能力通过 **Provider + Context + Module injection** 提供
- 通过注入（injection），而不是包裹（wrapping）

### 2. Semantic Theme System

### 2. 语义主题系统

- **Token Layer** — colors, spacing, typography (base variables)
- **Semantic Layer** — `intent.primary`, `intent.destructive`, `intent.safe` (meaning)
- **Behavior Derivation** — `if (intent === "destructive") → autoConfirm + auditLog + highContrast`

- **Token 层** — 颜色、间距、字体等基础变量
- **语义层** — `intent.primary`、`intent.destructive`、`intent.safe`（表达“含义”）
- **行为推导** — `if (intent === "destructive") → autoConfirm + auditLog + highContrast`

### 3. Unified Interaction Runtime

### 3. 统一交互运行时

- Modal stack, Drawer stack, Notification queue, Confirm flow
- Async state management, Form Runtime, Workflow engine
- **Interaction DSL**: `ui.modal.open({...})`, `ui.confirm({...})`, `ui.workflow.start(...)`

- Modal 栈、Drawer 栈、Notification 队列、Confirm 流程
- 异步状态管理、表单运行时、工作流引擎
- **交互 DSL**：`ui.modal.open({...})`、`ui.confirm({...})`、`ui.workflow.start(...)`

---

## Four-Layer Architecture

## 四层架构

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — Rendering Layer (React / Vue / WebComponent)     │
│  ModalRenderer, DrawerRenderer, NotificationRenderer        │
│  Pure rendering. No business logic.                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Framework Adapter (React Adapter)                │
│  Provider, useRuntime(), usePage(), useModal()              │
│  Thin bridge. Subscribe runtime → trigger re-render.        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Governance Layer (Pure TypeScript)               │
│  Policy Engine, Audit Trail, Replay, Priority Scheduling    │
│  Enterprise-grade control. Page Lock, Interaction Policy.   │
├─────────────────────────────────────────────────────────────┤
│  Layer 0 — Interaction Core (Pure TypeScript)               │
│  EventBus, RuntimeStore, Scheduler, Module System            │
│  Framework-agnostic. Zero dependencies.                     │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — 渲染层（React / Vue / WebComponent）              │
│  ModalRenderer, DrawerRenderer, NotificationRenderer        │
│  纯渲染。不包含业务逻辑。                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — 框架适配层（React Adapter）                       │
│  Provider, useRuntime(), usePage(), useModal()              │
│  薄桥接。订阅 runtime → 触发 re-render。                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — 治理层（Pure TypeScript）                         │
│  Policy Engine, Audit Trail, Replay, Priority Scheduling    │
│  企业级控制：Page Lock、交互策略。                            │
├─────────────────────────────────────────────────────────────┤
│  Layer 0 — 交互核心（Pure TypeScript）                       │
│  EventBus, RuntimeStore, Scheduler, Module System            │
│  与框架无关。零依赖。                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Stage Plan

## 阶段规划

| Stage | Name                  | Status         | Focus                                                           |
| ----- | --------------------- | -------------- | --------------------------------------------------------------- |
| 1     | Runtime Core          | 🔄 In Progress | EventBus, Store, Scheduler, PageController, React Adapter, Demo |
| 2     | Governance Layer      | Planned        | Policy Engine, Audit Trail, Replay, Priority Scheduler          |
| 3     | Semantic Theme        | Planned        | Token Layer, Semantic Layer, Behavior Derivation                |
| 4     | Interaction Modules   | Planned        | Modal Runtime, Drawer Runtime, Notification Runtime             |
| 5     | Form & Async Runtime  | Planned        | Form State Runtime, Async State Runtime                         |
| 6     | Page Orchestration    | Planned        | Page lifecycle, Page scheduling, Page priority                  |
| 7     | Interaction DSL       | Planned        | `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()`        |
| 8     | DevTools & Automation | Planned        | Runtime Inspector, Event Replay UI, AI Agent interface          |

| 阶段 | 名称              | 状态      | 重点                                                            |
| ---- | ----------------- | --------- | --------------------------------------------------------------- |
| 1    | 运行时核心        | 🔄 进行中 | EventBus、Store、Scheduler、PageController、React Adapter、Demo |
| 2    | 治理层            | 规划中    | Policy Engine、Audit Trail、Replay、Priority Scheduler          |
| 3    | 语义主题          | 规划中    | Token Layer、Semantic Layer、Behavior Derivation                |
| 4    | 交互模块          | 规划中    | Modal Runtime、Drawer Runtime、Notification Runtime             |
| 5    | 表单与异步运行时  | 规划中    | Form State Runtime、Async State Runtime                         |
| 6    | 页面编排          | 规划中    | 页面生命周期、页面调度、页面优先级                              |
| 7    | 交互 DSL          | 规划中    | `ui.modal.open()`、`ui.confirm()`、`ui.workflow.start()`        |
| 8    | DevTools 与自动化 | 规划中    | Runtime Inspector、Event Replay UI、AI Agent 接口               |

---

## Long-Term Capabilities

## 长期能力

### Programmable UI

### 可编程 UI

```typescript
ui.runtime.dispatch({ type: "OPEN_MODAL", payload: { id: "approval" } });
```

- UI is schedulable, controllable, remotely operable, automatable
- AI agents can dispatch events
- Automated systems can trigger workflows
- Dashboard becomes a Runtime, not a static component tree

- UI 可被调度、可被控制、可远程操作、可自动化
- AI Agent 可以 dispatch 事件
- 自动化系统可以触发工作流
- Dashboard 将成为 Runtime，而不是静态组件树

### Three-Layer Extension System

### 三层扩展系统

```typescript
// 1. Token Override (Static)
runtime.theme.overrideTokens({ color: { primary: "indigo" } });

// 2. Semantic Override (Rules)
runtime.theme.overrideIntent("destructive", { requireConfirm: true });

// 3. Behavior Override (Runtime)
runtime.interaction.override("modal", { animation: "none" });
```

上述代码块为接口示例。

### Cross-Framework

### 跨框架

- Core runs without React — can be used with Vue, Svelte, or bare TypeScript
- Suitable for SSR, CLI tools, Dashboard engines, automated testing

- Core 不依赖 React —— 可用于 Vue、Svelte 或纯 TypeScript
- 适用于 SSR、CLI 工具、Dashboard 引擎、自动化测试

---

## Relationship to PrismUI 1.x

## 与 PrismUI 1.x 的关系

PrismUI 1.x (legacy) built 12 stages of component infrastructure with 1674 tests. Key learnings preserved:

PrismUI 1.x（legacy）构建了 12 个阶段的组件基础设施，并积累了 1674 个测试。我们保留的关键经验：

- **Runtime Kernel pattern** (from STAGE-005) → elevated to foundational Layer 0
- **Four-layer architecture** (from ADR-011) → generalized beyond overlays to all interactions
- **Module injection** (from PrismuiProvider) → expanded to full Interaction Runtime
- **Overlay/Dialog/Toast patterns** → will be reimplemented as Runtime modules in STAGE-004

PrismUI 2.0 is a **clean rewrite** — the architecture is designed Runtime-first, not bolted on.

- **Runtime Kernel 模式**（来自 STAGE-005）→ 提升为基础的 Layer 0
- **四层架构**（来自 ADR-011）→ 从 overlay 推广到所有交互
- **模块注入**（来自 PrismuiProvider）→ 扩展为完整的 Interaction Runtime
- **Overlay/Dialog/Toast 模式** → 将在 STAGE-004 以 Runtime modules 形式重做

PrismUI 2.0 是一次 **干净重写**——架构从 Runtime-first 出发设计，而不是后期“打补丁”。
