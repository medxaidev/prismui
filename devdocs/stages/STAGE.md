# PrismUI 2.0 Development Stages / 开发阶段

This document defines the progressive stages of PrismUI 2.0 development.
Each stage builds upon the previous one and introduces new capabilities.

本文档定义 PrismUI 2.0 的渐进式开发阶段。
每个阶段都建立在前一阶段之上，并引入新的能力。

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

**Core Principle:** Each stage must be **complete before the next begins**. No partial infrastructure, no deferred core logic, no tails. The stage's core deliverables must be fully functional, tested, and documented.

**核心原则：** 每个阶段都必须在**下一个阶段开始之前完全完成**。不允许不完整的基础设施，不允许推迟核心逻辑，不允许“尾巴”。阶段的核心交付物必须可用、可测试、且文档齐全。

---

## Stage Overview

| Stage | Name                                                | Status         | Focus                                                                                                          | Tests |
| ----- | --------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| 1     | [Runtime Core](./STAGE-001-runtime-core.md)         | 🔄 In Progress | EventBus, Store, Scheduler (Reducer Commit), Module System, Built-in Modules (Page+Modal), React Adapter, Demo | ~107  |
| 2     | [Governance Layer](./STAGE-002-governance-layer.md) | Planned        | Policy Engine, Audit Trail, Replay, Priority Scheduler                                                         | ~80   |
| 3     | Semantic Theme                                      | Planned        | Token Layer, Semantic Intent, Behavior Derivation                                                              | ~60   |
| 4     | Interaction Modules                                 | Planned        | Modal Runtime, Drawer Runtime, Notification Runtime                                                            | TBD   |
| 5     | Form & Async Runtime                                | Planned        | Form State Runtime, Async State Runtime                                                                        | TBD   |
| 6     | Page Orchestration                                  | Planned        | Page lifecycle, scheduling, priority, workflow                                                                 | TBD   |
| 7     | Interaction DSL                                     | Planned        | `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()`                                                       | TBD   |
| 8     | DevTools & Automation                               | Planned        | Runtime Inspector, Event Replay UI, AI Agent interface                                                         | TBD   |

| 阶段 | 名称                                      | 状态      | 重点                                                                                                     | 测试 |
| ---- | ----------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- | ---- |
| 1    | [运行时核心](./STAGE-001-runtime-core.md) | 🔄 进行中 | EventBus、Store、Scheduler（Reducer Commit）、Module System、内建模块（Page+Modal）、React Adapter、Demo | ~107 |
| 2    | [治理层](./STAGE-002-governance-layer.md) | 规划中    | Policy Engine、Audit Trail、Replay、Priority Scheduler                                                   | ~80  |
| 3    | 语义主题                                  | 规划中    | Token Layer、Semantic Intent、Behavior Derivation                                                        | ~60  |
| 4    | 交互模块                                  | 规划中    | Modal Runtime、Drawer Runtime、Notification Runtime                                                      | TBD  |
| 5    | 表单与异步运行时                          | 规划中    | Form State Runtime、Async State Runtime                                                                  | TBD  |
| 6    | 页面编排                                  | 规划中    | Page 生命周期、调度、优先级、工作流                                                                      | TBD  |
| 7    | 交互 DSL                                  | 规划中    | `ui.modal.open()`、`ui.confirm()`、`ui.workflow.start()`                                                 | TBD  |
| 8    | DevTools 与自动化                         | 规划中    | Runtime Inspector、Event Replay UI、AI Agent 接口                                                        | TBD  |

---

## Stage 1: Runtime Core (In Progress)

**Goal:** Build the minimal viable Interaction Runtime — a framework-agnostic event-driven orchestration engine with React adapter and minimal demo.

**目标：** 构建最小可用的 Interaction Runtime —— 与框架无关、事件驱动的编排引擎，包含 React adapter 与最小 demo。

**Deliverables:**

**交付物：**

- EventBus (dispatch, subscribe, type-filtered, history)
- RuntimeStore (extensible immutable state, versioned snapshots)
- Scheduler (Reducer Commit Engine with `ReducerCommitResult`, middleware chain)
- Module System (`RuntimeModule` interface, module/middleware injection)
- Built-in Modules: Page Module (`createPageModule()`), Modal Module (`createModalModule()`)
- Runtime Factory (`createInteractionRuntime({ modules, middleware })`)
- React Adapter (Provider, useRuntime, useRuntimeState via `useSyncExternalStore`, usePage, useModal)
- Minimal Demo (page transition, modal mount, page lock, event history with version tracking)

- EventBus（dispatch、subscribe、按类型订阅、history）
- RuntimeStore（可扩展的不可变状态、版本化快照）
- Scheduler（Reducer Commit 引擎，支持 `ReducerCommitResult`，包含 middleware chain）
- Module System（`RuntimeModule` 接口，支持 module/middleware 注入）
- 内建模块：Page Module（`createPageModule()`）、Modal Module（`createModalModule()`）
- Runtime Factory（`createInteractionRuntime({ modules, middleware })`）
- React Adapter（Provider、useRuntime、基于 `useSyncExternalStore` 的 useRuntimeState、usePage、useModal）
- 最小 Demo（页面切换、modal 挂载、页面锁、带版本追踪的事件历史）

**Dependencies:** None (foundational stage)  
 **Detail:** [STAGE-001-runtime-core.md](./STAGE-001-runtime-core.md)

**依赖：** 无（基础阶段）  
 **详情：** [STAGE-001-runtime-core.md](./STAGE-001-runtime-core.md)

---

## Stage 2: Governance Layer (Planned)

**Goal:** Add enterprise-grade control capabilities as Scheduler middleware around the Reducer Commit Engine.

**目标：** 围绕 Reducer Commit 引擎，以 Scheduler middleware 的方式增加企业级治理能力。

**Deliverables (in order):**

**交付物（按顺序）：**

1.  Audit Trail (immutable event log with prevState/nextState snapshots)
2.  Replay System (deterministic event replay with state hash verification)
3.  Policy Engine (rule-based event validation: allow/deny/transform)
4.  Priority Scheduler (event priority levels, conflict resolution — optional)

5.  Audit Trail（不可变事件日志，包含 prevState/nextState 快照）
6.  Replay System（确定性事件重放，包含 state hash 校验）
7.  Policy Engine（基于规则的事件校验：allow/deny/transform）
8.  Priority Scheduler（事件优先级与冲突解决——可选）

**Prerequisites:** Stage 1 complete with Reducer Commit Model (ADR-006)  
 **Detail:** [STAGE-002-governance-layer.md](./STAGE-002-governance-layer.md)

**前置条件：** Stage 1 完成 Reducer Commit Model（ADR-006）  
 **详情：** [STAGE-002-governance-layer.md](./STAGE-002-governance-layer.md)

---

## Stage 3: Semantic Theme (Planned)

**Goal:** Implement the three-layer theme derivation system.

**目标：** 实现三层主题推导系统。

**Deliverables:**

**交付物：**

- Token Layer (colors, spacing, typography, radius, shadow, motion)
- Semantic Intent Layer (intent.primary, intent.destructive, etc.)
- Behavior Derivation Layer (intent → runtime behaviors)
- Theme override APIs (token, semantic, behavior)
- `useTheme()` hook for React adapter

- Token Layer（颜色、间距、字体、圆角、阴影、动效等）
- Semantic Intent Layer（intent.primary、intent.destructive 等）
- Behavior Derivation Layer（intent → runtime behaviors）
- Theme override APIs（token、semantic、behavior）
- React adapter 的 `useTheme()` hook

**Dependencies:** Stage 2 complete

**依赖：** Stage 2 完成

---

## Stage 4: Interaction Modules (Planned)

**Goal:** Build runtime-controlled interaction modules.

**目标：** 构建由 runtime 控制的交互模块。

**Deliverables:**

**交付物：**

- Modal Runtime (modal stack, z-index, escape handling)
- Drawer Runtime (drawer stack, positioning)
- Notification Runtime (notification queue, auto-dismiss)
- Minimal renderers for React

- Modal Runtime（modal 栈、z-index、escape 处理）
- Drawer Runtime（drawer 栈、定位）
- Notification Runtime（通知队列、自动关闭）
- React 的最小 renderers

**Dependencies:** Stage 3 complete

**依赖：** Stage 3 完成

---

## Stage 5: Form & Async Runtime (Planned)

**Goal:** Runtime-managed form state and async operation lifecycle.

**目标：** runtime 管理表单状态与异步操作生命周期。

**Deliverables:**

**交付物：**

- Form State Runtime (validation, submission, field tracking)
- Async State Runtime (loading, success, error lifecycle)
- Integration with Policy Engine for form validation rules

- Form State Runtime（校验、提交、字段追踪）
- Async State Runtime（loading / success / error 生命周期）
- 与 Policy Engine 集成，用于表单校验规则

**Dependencies:** Stage 4 complete

**依赖：** Stage 4 完成

---

## Stage 6: Page Orchestration (Planned)

**Goal:** Advanced page lifecycle management.

**目标：** 高级页面生命周期管理。

**Deliverables:**

**交付物：**

- Page priority scheduling
- Page lifecycle hooks (onMount, onUnmount, onTransition)
- Inter-page communication via Runtime events
- Workflow engine (sequential page flows)

- 页面优先级调度
- 页面生命周期 hooks（onMount、onUnmount、onTransition）
- 通过 Runtime events 的跨页面通信
- 工作流引擎（顺序页面流）

**Dependencies:** Stage 5 complete

**依赖：** Stage 5 完成

---

## Stage 7: Interaction DSL (Planned)

**Goal:** High-level API for common interaction patterns.

**目标：** 为常见交互模式提供更高层 API。

**Deliverables:**

**交付物：**

- `ui.modal.open({ ... })` — programmatic modal control
- `ui.confirm({ ... })` — confirmation dialog with Promise
- `ui.notify({ ... })` — notification dispatch
- `ui.workflow.start({ ... })` — workflow initiation
- DSL type safety and autocomplete

- `ui.modal.open({ ... })` — 以程序方式控制 modal
- `ui.confirm({ ... })` — 返回 Promise 的确认对话框
- `ui.notify({ ... })` — 分发通知
- `ui.workflow.start({ ... })` — 启动工作流
- DSL 类型安全与自动补全

**Dependencies:** Stage 6 complete

**依赖：** Stage 6 完成

---

## Stage 8: DevTools & Automation (Planned)

**Goal:** Developer tooling and automation interfaces.

**目标：** 开发者工具与自动化接口。

**Deliverables:**

**交付物：**

- Runtime Inspector (visual state viewer)
- Event Replay UI (time-travel debugging)
- AI Agent interface (event dispatch API for automated systems)
- Performance monitoring

- Runtime Inspector（可视化状态查看器）
- Event Replay UI（时间旅行调试）
- AI Agent 接口（为自动化系统提供 event dispatch API）
- 性能监控

**Dependencies:** Stage 7 complete

**依赖：** Stage 7 完成

---

## Stage Completion Criteria (ENFORCED)

A stage is considered complete **only when ALL of the following are true**:

**阶段完成标准（强制）：** 仅当满足以下所有条件时，阶段才算完成：

1.  **All planned deliverables are implemented** — no partial infrastructure
2.  **All code has comprehensive tests** — meeting coverage targets
3.  **`tsc --noEmit` is clean** — zero TypeScript errors
4.  **Documentation is complete** — stage doc, architecture updates, ADRs
5.  **No regressions** — all previous stage tests still pass
6.  **Stage document is frozen** — no further changes after completion

7.  **所有计划交付物都已实现** —— 不允许不完整的基础设施
8.  **所有代码都有完整测试** —— 满足覆盖率目标
9.  **`tsc --noEmit` 通过** —— 零 TypeScript 错误
10. **文档完整** —— stage 文档、架构更新、ADRs
11. **无回归** —— 之前阶段的测试全部仍通过
12. **阶段文档冻结** —— 完成后不再修改

---

## Stage Transition Rules (ENFORCED)

- **MUST NOT** start Stage N+1 until Stage N is complete
- **MUST NOT** defer core infrastructure to later phases within a stage
- **MUST** document any stage scope changes in ADR
- **MUST** update this document when stages change
- **MAY** add deliverables to current stage if needed by MedXAI

## 阶段切换规则（强制）

- **不得** 在 Stage N 未完成时开始 Stage N+1
- **不得** 在同一阶段内将核心基础设施推迟到后续 phase
- **必须** 用 ADR 记录任何阶段范围（scope）变更
- **必须** 当阶段变更时更新本文档
- **可以** 如果 MedXAI 需要，在当前阶段增加交付物
