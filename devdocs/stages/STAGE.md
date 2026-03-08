# PrismUI 2.0 Development Stages / 开发阶段

This document defines the progressive stages of PrismUI 2.0 development.
Each stage builds upon the previous one and introduces new capabilities.

本文档定义 PrismUI 2.0 的渐进式开发阶段。
每个阶段都建立在前一阶段之上，并引入新的能力。

> **Version:** 2.0  
> **Last Updated:** 2026-03-08  
> **Total Tests:** 290

**Core Principle:** Each stage must be **complete before the next begins**. No partial infrastructure, no deferred core logic, no tails. The stage's core deliverables must be fully functional, tested, and documented.

**核心原则：** 每个阶段都必须在**下一个阶段开始之前完全完成**。不允许不完整的基础设施，不允许推迟核心逻辑，不允许“尾巴”。阶段的核心交付物必须可用、可测试、且文档齐全。

---

## Stage Overview

| Stage | Name                                                        | Status      | Focus                                                                                                          | Tests |
| ----- | ----------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| 1     | [Runtime Core](./STAGE-001-runtime-core.md)                 | ✅ Complete | EventBus, Store, Scheduler (Reducer Commit), Module System, Built-in Modules (Page+Modal), React Adapter, Demo | 110   |
| 2     | [Governance Layer](./STAGE-002-governance-layer.md)         | ✅ Complete | Audit Trail, Replay System, Policy Engine, Priority Scheduler                                                  | 79    |
| 3     | [Interaction Modules](./STAGE-003-interaction-modules.md)   | ✅ Complete | Drawer Module, Notification Module, React Hooks, Demo                                                          | 58    |
| 4     | [Lifecycle & Selectors](./STAGE-004-lifecycle-selectors.md) | ✅ Complete | State Selectors, Module Lifecycle (onInit/onDestroy), waitFor, useSelector                                     | 43    |
| 5     | Semantic Theme                                              | Planned     | Token Layer, Semantic Intent, Behavior Derivation                                                              | TBD   |
| 6     | Interaction DSL                                             | Planned     | `ui.modal.open()`, `ui.confirm()`, `ui.notify()`                                                               | TBD   |
| 7     | DevTools & Automation                                       | Planned     | Runtime Inspector, Event Replay UI, AI Agent interface                                                         | TBD   |

| 阶段 | 名称                                                   | 状态      | 重点                                                                                                     | 测试 |
| ---- | ------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- | ---- |
| 1    | [运行时核心](./STAGE-001-runtime-core.md)              | ✅ 已完成 | EventBus、Store、Scheduler（Reducer Commit）、Module System、内建模块（Page+Modal）、React Adapter、Demo | 110  |
| 2    | [治理层](./STAGE-002-governance-layer.md)              | ✅ 已完成 | Audit Trail、Replay System、Policy Engine、Priority Scheduler                                            | 79   |
| 3    | [交互模块](./STAGE-003-interaction-modules.md)         | ✅ 已完成 | Drawer Module、Notification Module、React Hooks、Demo                                                    | 58   |
| 4    | [生命周期与选择器](./STAGE-004-lifecycle-selectors.md) | ✅ 已完成 | 状态选择器、模块生命周期（onInit/onDestroy）、waitFor、useSelector                                       | 43   |
| 5    | 语义主题                                               | 规划中    | Token Layer、Semantic Intent、Behavior Derivation                                                        | TBD  |
| 6    | 交互 DSL                                               | 规划中    | `ui.modal.open()`、`ui.confirm()`、`ui.notify()`                                                         | TBD  |
| 7    | DevTools 与自动化                                      | 规划中    | Runtime Inspector、Event Replay UI、AI Agent 接口                                                        | TBD  |

---

## Stage 1: Runtime Core (Complete)

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

## Stage 2: Governance Layer (Complete)

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

## Stage 3: Interaction Modules (Complete)

**Goal:** Extend the Module System with Drawer and Notification modules. All modules are pure `packages/core/` — framework-agnostic.

**目标：** 扩展 Module System，新增 Drawer、Notification 模块。所有模块均为纯 `packages/core/` —— 与框架无关。

**Deliverables:**

**交付物：**

1. ✅ Drawer Module (drawer stack, anchor positioning, reducers + controller) — 21 tests
2. ✅ Notification Module (notification queue, auto-dismiss, maxNotifications, reducers + controller) — 24 tests
3. ✅ React adapter hooks (useDrawer, useNotification) — 13 tests
4. ✅ Barrel exports updated (core + react)
5. ✅ Demo synced (DrawerPanel, NotificationPanel, StatusBar)

6. ✅ Drawer 模块（drawer 栈、锚点定位、reducers + controller）— 21 测试
7. ✅ Notification 模块（通知队列、自动关闭、maxNotifications、reducers + controller）— 24 测试
8. ✅ React adapter hooks（useDrawer、useNotification）— 13 测试
9. ✅ Barrel exports 已更新（core + react）
10. ✅ Demo 已同步（DrawerPanel、NotificationPanel、StatusBar）

**Dependencies:** Stage 2 complete  
**Detail:** [STAGE-003-interaction-modules.md](./STAGE-003-interaction-modules.md)

**依赖：** Stage 2 完成  
**详情：** [STAGE-003-interaction-modules.md](./STAGE-003-interaction-modules.md)

---

## Stage 4: Lifecycle & Selectors (Complete)

**Goal:** Enrich the runtime platform with state selectors, module lifecycle hooks, and inter-module communication.

**目标：** 丰富运行时平台，增加状态选择器、模块生命周期钩子与模块间通信。

**Deliverables:**

**交付物：**

1. ✅ State Selectors (`selectFromStore`, `createSelector`) — 13 tests
2. ✅ Module Lifecycle (`onInit`/`onDestroy`, `getModuleStatus`, `MODULE_INIT`/`MODULE_DESTROY` events) — 15 tests
3. ✅ Inter-module Communication (`waitFor` with predicate + timeout) — 10 tests
4. ✅ React adapter hook (`useSelector` with `useSyncExternalStore`) — 5 tests
5. ✅ Barrel exports updated (core + react)

6. ✅ 状态选择器（`selectFromStore`、`createSelector`）— 13 测试
7. ✅ 模块生命周期（`onInit`/`onDestroy`、`getModuleStatus`、`MODULE_INIT`/`MODULE_DESTROY` 事件）— 15 测试
8. ✅ 模块间通信（`waitFor`，支持 predicate + timeout）— 10 测试
9. ✅ React adapter hook（`useSelector`，使用 `useSyncExternalStore`）— 5 测试
10. ✅ Barrel exports 已更新（core + react）

**Dependencies:** Stage 3 complete  
**Detail:** [STAGE-004-lifecycle-selectors.md](./STAGE-004-lifecycle-selectors.md)

**依赖：** Stage 3 完成  
**详情：** [STAGE-004-lifecycle-selectors.md](./STAGE-004-lifecycle-selectors.md)

---

## Stage 5: Semantic Theme (Planned)

**Goal:** Implement the three-layer theme derivation system. By this stage the full runtime exists, enabling Behavior Derivation to integrate with Policy Engine and all interaction modules.

**目标：** 实现三层主题推导系统。在此阶段完整运行时已存在，Behavior Derivation 可与 Policy Engine 及所有交互模块集成。

**Deliverables:**

**交付物：**

- Token Layer (colors, spacing, typography, radius, shadow, motion)
- Semantic Intent Layer (intent.primary, intent.destructive, etc.)
- Behavior Derivation Layer (intent → runtime behaviors + policy triggers)
- Theme override APIs (token, semantic, behavior)
- `useTheme()` hook for React adapter

- Token Layer（颜色、间距、字体、圆角、阴影、动效等）
- Semantic Intent Layer（intent.primary、intent.destructive 等）
- Behavior Derivation Layer（intent → runtime behaviors + policy triggers）
- Theme override APIs（token、semantic、behavior）
- React adapter 的 `useTheme()` hook

**Dependencies:** Stage 4 complete

**依赖：** Stage 4 完成

---

## Stage 6: Interaction DSL (Planned)

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

**Dependencies:** Stage 5 complete

**依赖：** Stage 5 完成

---

## Stage 7: DevTools & Automation (Planned)

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

**Dependencies:** Stage 6 complete

**依赖：** Stage 6 完成

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
