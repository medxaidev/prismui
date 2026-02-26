# ADR-007: FSM as Module Pattern / FSM 作为模块模式

> **Status:** Accepted  
> **Date:** 2026-02-26  
> **Deciders:** Architecture Team  
> **Relates to:** ADR-006 (Reducer Commit Model), ADR-005 (Page as Runtime Resource)

> **状态：** Accepted  
> **日期：** 2026-02-26  
> **决策者：** Architecture Team  
> **关联：** ADR-006（Reducer Commit Model）、ADR-005（Page as Runtime Resource）

---

## Context

## 背景（Context）

PrismUI 2.0 is an **event-driven + data-flow architecture**. FSM (Finite State Machine) is a **state-driven + transition-constraint model**. The two are structurally different but highly complementary at the "decision core" level.

PrismUI 2.0 是一种 **事件驱动 + 数据流** 架构。FSM（Finite State Machine）是一种 **状态驱动 + 转移约束** 模型。二者结构不同，但在“决策核心”层面高度互补。

### PrismUI strengths (current)

### PrismUI 的优势（当前）

- Event-driven, component-decoupled, observable data flow
- Pluggable module system (`RuntimeModule` interface)
- Deterministic Reducer Commit pipeline (ADR-006)
- Governance-ready (Policy Engine, Audit Trail — STAGE-002)

- 事件驱动、组件解耦、可观测的数据流
- 可插拔模块系统（`RuntimeModule` 接口）
- 确定性的 Reducer Commit 管线（ADR-006）
- 治理就绪（Policy Engine、Audit Trail —— STAGE-002）

### PrismUI gaps (without FSM)

### PrismUI 的缺口（缺少 FSM 时）

- No **explicit state graph** — valid transitions are implicit in reducer logic
- No **static verifiability** — cannot detect dead states or unreachable transitions at design time
- No **declarative guard constraints** — guards are scattered across middleware/reducer code
- Complex workflows (multi-step procedures, wizard flows) lack a formal model

- 缺少 **显式状态图** —— 合法转移隐含在 reducer 逻辑中
- 缺少 **静态可验证性** —— 设计期无法发现死状态或不可达转移
- 缺少 **声明式 guard 约束** —— guard 分散在 middleware/reducer 中
- 复杂工作流（多步骤流程、向导流）缺少形式化模型

### FSM strengths

### FSM 的优势

- State closure: all valid states are explicitly enumerated
- Transition exhaustiveness: every legal `(state, event) → nextState` is defined
- Behavior verifiability: dead states, unreachable states detectable statically
- Testable: `given state A, when event B, expect state C`

- 状态闭包：所有合法状态都显式枚举
- 转移穷尽：每个合法的 `(state, event) → nextState` 都被定义
- 行为可验证：可静态检测死状态、不可达状态
- 可测试：`given state A, when event B, expect state C`

### FSM weaknesses (standalone)

### FSM 的劣势（单独使用时）

- State explosion in high-dimensional UI
- Poor fit for dynamic, data-driven interfaces
- Composition complexity in nested hierarchies

- 在高维 UI 中容易状态爆炸
- 对动态、数据驱动的界面拟合较差
- 在嵌套层级中组合复杂

---

## Decision

## 决策（Decision）

**FSM capabilities are absorbed into the existing Module System as `StateMachineModule` — not introduced as a separate architectural layer.**

**FSM 能力将以 `StateMachineModule` 的形式吸收进既有 Module System，而不是作为新的架构层引入。**

### Why not a separate FSM Coordinator layer?

### 为什么不引入独立的 FSM Coordinator 层？

| Concern                      | Impact                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Dual authority**           | A standalone FSM Coordinator would compete with Scheduler for `store.setState()` — violating ADR-006's single commit point |
| **Bypassed middleware**      | Events processed by an external Coordinator skip the Scheduler's middleware chain (Policy, Audit)                          |
| **Parallel event paths**     | Two processing pipelines introduce non-determinism                                                                         |
| **Module System redundancy** | `RuntimeModule` already provides `initialState`, `reducers`, `middleware`, `controller` — all FSM needs                    |

| 关注点              | 影响                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **双重权威**        | 独立 FSM Coordinator 会与 Scheduler 争夺 `store.setState()` —— 违反 ADR-006 的单一 commit 点   |
| **绕过 middleware** | 外部 Coordinator 处理事件会跳过 Scheduler 的 middleware 链（Policy、Audit）                    |
| **并行事件路径**    | 两条处理管线将引入非确定性                                                                     |
| **模块系统冗余**    | `RuntimeModule` 已提供 `initialState`、`reducers`、`middleware`、`controller` —— 覆盖 FSM 所需 |

### Core principle

### 核心原则

> **FSM is a Module pattern, not an architecture layer.**
>
> It uses `RuntimeModule` to plug into the system, reuses the Scheduler pipeline for guard/transition/effect, and gains all existing infrastructure (audit, replay, policy, DevTools) for free.

> **FSM 是一种模块模式（Module pattern），而不是架构层（architecture layer）。**
>
> 它通过 `RuntimeModule` 插入系统，复用 Scheduler 管线完成 guard/transition/effect，并免费获得既有基础设施（audit、replay、policy、DevTools）。

---

## Design

## 设计（Design）

### StateMachineModule interfaces

### StateMachineModule 接口

```typescript
/**
 * A single state node in the state graph.
 */
interface StateNode {
  on: Record<string, TransitionDef>; // eventType → transition definition
}

/**
 * A transition definition: target state, optional guard, optional declarative side-effects.
 */
interface TransitionDef {
  target: string; // next state id
  guard?: (event: RuntimeEvent, state: Readonly<RuntimeState>) => boolean; // must return true to allow
  sideEffects?: RuntimeEvent[]; // dispatched after commit (via ReducerCommitResult)
}

/**
 * Configuration for creating a StateMachineModule.
 */
interface StateMachineModuleConfig {
  name: string; // module name, e.g. "dashboardFlow"
  initial: string; // initial state id, e.g. "loading"
  states: Record<string, StateNode>;
  stateKey: string; // key in RuntimeState, e.g. "dashboardFlowState"
}

/**
 * Controller exposed on runtime.modules[name].
 */
interface StateMachineController {
  /** Current FSM state id */
  getCurrentState(): string;
  /** Check if a transition is allowed from current state for given event type */
  can(eventType: string): boolean;
  /** Get all valid event types from current state */
  allowedEvents(): string[];
  /** Get the full state graph definition (for DevTools / static analysis) */
  getStateGraph(): Record<string, StateNode>;
}
```

### How it maps to RuntimeModule

### 如何映射到 RuntimeModule

`createStateMachineModule(config)` returns a `RuntimeModule<StateMachineController>` by auto-generating:

`createStateMachineModule(config)` 会通过自动生成以下内容来返回 `RuntimeModule<StateMachineController>`：

| RuntimeModule field | Generated from                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`              | `config.name`                                                                                                                                                                              |
| `initialState`      | `{ [config.stateKey]: config.initial }`                                                                                                                                                    |
| `reducers`          | One reducer per event type found in `config.states[*].on` — looks up current FSM state, validates transition exists, returns `{ nextState: { ...prev, [stateKey]: target }, sideEffects }` |
| `middleware`        | One guard middleware — for each event, checks `guard()` function if defined; blocks event (stops `next()` call) if guard returns `false`                                                   |
| `createController`  | Returns `StateMachineController` implementation that reads `store.getState()[stateKey]`                                                                                                    |

| RuntimeModule 字段 | 由何处生成                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`             | `config.name`                                                                                                                                                            |
| `initialState`     | `{ [config.stateKey]: config.initial }`                                                                                                                                  |
| `reducers`         | 为 `config.states[*].on` 中出现的每个 eventType 生成一个 reducer —— 读取当前 FSM state，验证转移存在，返回 `{ nextState: { ...prev, [stateKey]: target }, sideEffects }` |
| `middleware`       | 生成一个 guard middleware —— 对每个 event，如果定义了 `guard()` 则执行；若返回 `false` 则阻断事件（不调用 `next()`）                                                     |
| `createController` | 返回 `StateMachineController` 实现，并读取 `store.getState()[stateKey]`                                                                                                  |

### Architecture fit

### 架构契合点

```
Event → EventBus → Scheduler
                      │
                      ├─ Middleware chain
                      │    ├─ [FSM Guard middleware — auto-generated]
                      │    ├─ [Policy middleware — STAGE-002]
                      │    └─ [Audit middleware — STAGE-002]
                      │
                      ├─ Reducer lookup
                      │    └─ [FSM Transition reducer — auto-generated]
                      │
                      ├─ Commit: store.setState(result.nextState)
                      │
                      └─ sideEffects dispatch (ReducerCommitResult.sideEffects)
```

**Zero new architectural layers. Zero new commit points. Full Scheduler pipeline reuse.**

**零新增架构层。零新增 commit 点。完全复用 Scheduler 管线。**

### Three-tier FSM usage

### 三层级 FSM 用法

| Tier                | Scope                                 | Implementation                                | RuntimeState?                   |
| ------------------- | ------------------------------------- | --------------------------------------------- | ------------------------------- |
| **Global**          | Auth, network, session                | `StateMachineModule` at runtime level         | Yes                             |
| **Page-level**      | Dashboard flow, wizard steps          | `StateMachineModule` per page                 | Yes                             |
| **Component-level** | Chart interactions, form field states | Local `useReducer` or lightweight FSM library | **No** — avoids state explosion |

| 层级                | 范围                         | 实现方式                            | 进入 RuntimeState？    |
| ------------------- | ---------------------------- | ----------------------------------- | ---------------------- |
| **Global**          | Auth、network、session       | runtime 级别的 `StateMachineModule` | 是                     |
| **Page-level**      | Dashboard flow、wizard steps | 每个页面一个 `StateMachineModule`   | 是                     |
| **Component-level** | 图表交互、表单字段状态       | 本地 `useReducer` 或轻量 FSM 库     | **否** —— 避免状态爆炸 |

> **Hard constraint:** Component-level FSMs MUST NOT enter global RuntimeState. They are local concerns.

> **硬约束：** 组件级 FSM 不得进入全局 RuntimeState，它们属于本地关注点。

---

## Example

## 示例（Example）

### Dashboard page flow

### Dashboard 页面流

```typescript
const dashboardFlow = createStateMachineModule({
  name: "dashboardFlow",
  initial: "loading",
  stateKey: "dashboardFlowState",
  states: {
    loading: {
      on: {
        DASHBOARD_DATA_READY: { target: "ready" },
        DASHBOARD_LOAD_ERROR: { target: "error" },
      },
    },
    ready: {
      on: {
        FILTER_ACTIVATED: { target: "filtering" },
        CHART_DRILLDOWN: { target: "drilldown" },
        EDIT_MODE_ENTER: {
          target: "editing",
          guard: (event, state) => state.userRole === "admin",
        },
      },
    },
    filtering: {
      on: {
        FILTER_APPLIED: { target: "ready" },
        FILTER_CANCELLED: { target: "ready" },
      },
    },
    drilldown: {
      on: {
        DRILLDOWN_BACK: { target: "ready" },
      },
    },
    editing: {
      on: {
        EDIT_SAVED: {
          target: "ready",
          sideEffects: [
            { type: "AUDIT_LOG", payload: { action: "dashboard_edit_saved" } },
          ],
        },
        EDIT_CANCELLED: { target: "ready" },
      },
    },
    error: {
      on: {
        DASHBOARD_RETRY: { target: "loading" },
      },
    },
  },
});

// Usage
const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule(), dashboardFlow],
});

const flow = runtime.modules.dashboardFlow as StateMachineController;
flow.getCurrentState(); // "loading"
flow.can("FILTER_ACTIVATED"); // false — not in "ready" state
flow.allowedEvents(); // ["DASHBOARD_DATA_READY", "DASHBOARD_LOAD_ERROR"]
```

### Testing

### 测试

```typescript
describe("Dashboard FSM", () => {
  it("rejects FILTER_ACTIVATED when in loading state", () => {
    const runtime = createInteractionRuntime({ modules: [dashboardFlow] });
    runtime.dispatch({ type: "FILTER_ACTIVATED" });
    expect(runtime.getState().dashboardFlowState).toBe("loading"); // unchanged
  });

  it("transitions loading → ready on DASHBOARD_DATA_READY", () => {
    const runtime = createInteractionRuntime({ modules: [dashboardFlow] });
    runtime.dispatch({ type: "DASHBOARD_DATA_READY" });
    expect(runtime.getState().dashboardFlowState).toBe("ready");
  });

  it("blocks EDIT_MODE_ENTER when guard fails", () => {
    const runtime = createInteractionRuntime({
      modules: [dashboardFlow],
      initialState: { userRole: "viewer" },
    });
    runtime.dispatch({ type: "DASHBOARD_DATA_READY" }); // → ready
    runtime.dispatch({ type: "EDIT_MODE_ENTER" });
    expect(runtime.getState().dashboardFlowState).toBe("ready"); // guard rejected
  });
});
```

### Static analysis (DevTools)

### 静态分析（DevTools）

```typescript
// Dead state detection — can run at build time or in DevTools
function findDeadStates(graph: Record<string, StateNode>): string[] {
  const reachable = new Set<string>();
  // BFS/DFS from all states' transition targets
  for (const node of Object.values(graph)) {
    for (const t of Object.values(node.on)) {
      reachable.add(t.target);
    }
  }
  return Object.keys(graph).filter(
    (id) => !reachable.has(id) && id !== config.initial,
  );
}
```

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- **Declarative state graphs** — valid states and transitions are explicit, not buried in reducer logic
- **Static verifiability** — dead states, unreachable transitions detectable at design time
- **Predictable testing** — `given state + event → expect state` pattern
- **Full infrastructure reuse** — audit, replay, policy, DevTools work automatically
- **Zero architecture disruption** — no new layers, no new commit points, no Scheduler changes
- **Gradual adoption** — teams can add FSM modules to specific flows without affecting others
- **Race condition prevention** — FSM rejects events that don't match current state

- **声明式状态图** —— 合法状态与转移显式可见，而非埋在 reducer 逻辑中
- **静态可验证性** —— 设计期可检测死状态、不可达转移
- **可预测测试** —— `given state + event → expect state` 模式
- **基础设施复用** —— audit、replay、policy、DevTools 自动可用
- **零架构扰动** —— 不新增层、不新增 commit 点、不改 Scheduler
- **渐进采用** —— 团队可只在特定流程引入 FSM module
- **防竞态** —— FSM 会拒绝与当前 state 不匹配的事件

### Negative

### 负面

- Additional abstraction for simple flows that don't need state constraints
- State graph must be maintained alongside reducer logic (dual definition risk for non-FSM reducers)
- Guard functions introduce conditional logic outside pure reducers (mitigated: guards only block, never mutate)

- 对不需要状态约束的简单流程而言，增加了一层抽象
- 需要维护状态图（对非 FSM reducer 存在双重定义风险）
- guard 函数将条件逻辑放在纯 reducer 之外（缓解：guard 只阻断，不做 mutation）

### Mitigation

### 缓解措施

- FSM modules are **opt-in** — only used where flow constraints add value
- Auto-generated reducers from state graph eliminate dual definition for FSM-managed flows
- Guards are pure predicates (no side effects) and are auditable via middleware chain

- FSM module **按需启用（opt-in）** —— 仅在流程约束有价值时使用
- 对 FSM 管理的流程，由状态图自动生成 reducer，从而避免双重定义
- guard 为纯谓词（无副作用），并可通过 middleware 链进行审计

---

## Implementation Stage

## 实施阶段（Implementation Stage）

**Target: STAGE-003 or later** (after Governance Layer is complete).

**目标：STAGE-003 或之后**（在 Governance Layer 完成之后）。

Not required for STAGE-001 (Runtime Core) or STAGE-002 (Governance). The Module System and Scheduler pipeline designed in STAGE-001 already support this pattern — no retroactive changes needed.

对 STAGE-001（Runtime Core）或 STAGE-002（Governance）并非必需。STAGE-001 设计的 Module System 与 Scheduler 管线已经支持该模式 —— 无需追溯式改造。

---

## References

## 参考资料（References）

- [ADR-006: Reducer Commit Model](./ADR-006-reducer-commit-model.md) — `ReducerCommitResult.sideEffects` enables FSM effects
- [ADR-005: Page as Runtime Resource](./ADR-005-page-as-runtime-resource.md) — Page Module is a precedent for domain modules
- [PRISMUI-RUNTIME.md §4 Module System](../architecture/PRISMUI-RUNTIME.md) — `RuntimeModule` interface
- [PRISMUI-GLOSSARY.md](../architecture/PRISMUI-GLOSSARY.md) — Term definitions
