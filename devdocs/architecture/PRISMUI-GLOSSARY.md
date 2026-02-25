# Glossary / 术语表

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

---

## Core Concepts

| Term                    | Definition                                                                                                              | 定义                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Interaction Runtime** | The central orchestration engine that manages all UI behavior through event dispatch, scheduling, and state management. | 管理所有 UI 行为的中央编排引擎，通过事件分发、调度和状态管理实现。                                  |
| **Interaction Core**    | Layer 0. Pure TypeScript, framework-agnostic runtime kernel containing EventBus, Store, Scheduler, and PageController.  | 第 0 层。纯 TypeScript、与框架无关的运行时内核，包含 EventBus、Store、Scheduler 和 PageController。 |
| **Governance Layer**    | Layer 1. Enterprise-grade control including Policy Engine, Audit Trail, Replay, and Priority Scheduling.                | 第 1 层。企业级控制，包括策略引擎、审计追踪、重放和优先级调度。                                     |
| **Framework Adapter**   | Layer 2. Thin bridge between Runtime and a UI framework (React, Vue, etc.). Contains zero business logic.               | 第 2 层。运行时与 UI 框架之间的薄桥接层。不包含业务逻辑。                                           |
| **Rendering Layer**     | Layer 3. Pure rendering components that display Runtime state. No orchestration.                                        | 第 3 层。纯渲染组件，显示 Runtime 状态。无编排逻辑。                                                |
| **Semantic Theme**      | Three-layer theme system: Token → Semantic Intent → Behavior Derivation.                                                | 三层主题系统：Token → 语义意图 → 行为推导。                                                         |

---

## Runtime Components

| Term               | Definition                                                                                                              | 定义                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **EventBus**       | Central event dispatcher. All communication flows through typed events.                                                 | 中央事件分发器。所有通信通过类型化事件流转。                                 |
| **RuntimeEvent**   | A serializable message with `type`, optional `payload`, `timestamp`, and `source`.                                      | 可序列化消息，包含 `type`、可选 `payload`、`timestamp` 和 `source`。         |
| **RuntimeStore**   | Centralized, immutable state container with versioned snapshots and subscriber notification.                            | 集中式、不可变状态容器，带版本化快照和订阅者通知。                           |
| **RuntimeState**   | The shape of the global runtime state: `currentPage`, `mountedPages`, `modalStack`, `locked`, `version`.                | 全局运行时状态结构。                                                         |
| **Scheduler**      | Event processing pipeline with middleware chain and handler registration.                                               | 事件处理管线，带中间件链和处理器注册。                                       |
| **Middleware**     | Interceptor in the Scheduler pipeline. `(event, next) → void`. Used for logging, policy, audit.                         | Scheduler 管线中的拦截器。用于日志、策略、审计。                             |
| **EventReducer**   | Pure function: `(event, prevState) → nextState`. No side effects. Only way to compute state changes.                    | 纯函数。无副作用。唯一计算状态变更的方式。                                   |
| **Commit**         | The Scheduler's internal step that calls `store.setState()` with the reducer's result. Only commit point in the system. | Scheduler 内部步骤，用 reducer 结果调用 `store.setState()`。系统唯一提交点。 |
| **Transform**      | Policy verdict that modifies an event's payload before reducer execution. One-time only, cannot change event type.      | 策略裁决，在 reducer 执行前修改事件 payload。仅一次，不能更改事件类型。      |
| **SYSTEM_ERROR**   | Special event dispatched when a reducer throws. Not processed by reducers (prevents loops).                             | 当 reducer 抛出异常时分发的特殊事件。不被 reducer 处理（防止循环）。         |
| **PageController** | Manages page lifecycle: mount, unmount, transition, lock, unlock.                                                       | 管理页面生命周期：挂载、卸载、转换、锁定、解锁。                             |

---

## Governance Components

| Term                   | Definition                                                                     | 定义                                                                |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **Policy Engine**      | Rule-based event validator. Each rule returns `allow`, `deny`, or `transform`. | 基于规则的事件验证器。每条规则返回 `allow`、`deny` 或 `transform`。 |
| **PolicyRule**         | Pure function: `(event, state) → PolicyResult`. No side effects.               | 纯函数。无副作用。                                                  |
| **Audit Trail**        | Immutable log of all events with before/after state snapshots.                 | 所有事件的不可变日志，带前后状态快照。                              |
| **Replay System**      | Deterministic replay of event sequences for debugging and testing.             | 确定性重放事件序列，用于调试和测试。                                |
| **Priority Scheduler** | Enhanced Scheduler with event priority levels and conflict resolution.         | 增强型 Scheduler，带事件优先级和冲突解决。                          |

---

## Theme Concepts

| Term                    | Definition                                                                                                            | 定义                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Token**               | Raw design variable (color, spacing, radius, typography, shadow, motion).                                             | 原始设计变量。                                       |
| **Semantic Intent**     | Meaning-based reference to tokens (`primary`, `destructive`, `safe`). Components use intents, not tokens.             | 基于含义的 token 引用。组件使用 intent，而非 token。 |
| **Behavior Derivation** | Rules that auto-trigger runtime behaviors based on intent (e.g., `destructive` → `requireConfirm`).                   | 基于 intent 自动触发运行时行为的规则。               |
| **IntentColorSpec**     | Resolved color set for an intent: `main`, `light`, `dark`, `contrastText`, `background`, `border`, `hoverBackground`. | intent 的解析颜色集。                                |

---

## Architectural Patterns

| Term                         | Definition                                                                                                                                   | 定义                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Deterministic Flow**       | `Event → Scheduler → [Middleware] → Reducer → Commit → Render`. Same events always produce same state.                                       | 确定性流程。相同事件始终产生相同状态。                                                     |
| **Reducer Commit Model**     | Architectural pattern where reducers are pure functions and only the Scheduler may call `store.setState()`. Enables audit, replay, rollback. | 架构模式：reducer 为纯函数，仅 Scheduler 可调用 `store.setState()`。支持审计、重放、回滚。 |
| **Unidirectional Data Flow** | Data flows one direction: Event → State → View. View never writes state directly.                                                            | 单向数据流。视图永远不直接写入状态。                                                       |
| **Framework Isolation**      | Core runtime has zero framework dependencies. Adapters bridge to specific frameworks.                                                        | 核心运行时零框架依赖。适配器桥接到特定框架。                                               |
| **Dispatch Pattern**         | All state changes originate from `runtime.dispatch(event)`, never from direct mutation.                                                      | 所有状态变更源自 `runtime.dispatch(event)`，永不直接修改。                                 |
| **Commit Boundary**          | The single point where `store.setState()` is called — inside the Scheduler after reducer execution.                                          | `store.setState()` 被调用的唯一位置——Scheduler 中 reducer 执行之后。                       |
| **Page as Resource**         | Pages are runtime-managed entities with lifecycle, not JSX component trees.                                                                  | 页面是运行时管理的实体，而非 JSX 组件树。                                                  |

---

## Abbreviations

| Abbr.   | Full                         | 全称         |
| ------- | ---------------------------- | ------------ |
| **ADR** | Architecture Decision Record | 架构决策记录 |
| **DSL** | Domain-Specific Language     | 领域特定语言 |
| **SSR** | Server-Side Rendering        | 服务端渲染   |
| **HC**  | Hard Constraint              | 硬约束       |
| **SOP** | Standard Operating Procedure | 标准操作流程 |
