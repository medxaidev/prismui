# ADR-003: Deterministic Interaction Principle / 确定性交互原则

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — defines the fundamental guarantee that all state transitions are traceable, predictable, and replayable

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** Critical —— 定义所有 state 迁移必须可追踪、可预测、可重放的根本保证

---

## Context

## 背景（Context）

In traditional component-based UI development, state changes can originate from:

在传统的组件式 UI 开发中，state 变更可能来源于：

- Component-local `setState()` calls
- Context updates propagating through the tree
- Side effects in `useEffect()` hooks
- Direct DOM manipulation
- Third-party library callbacks

- 组件本地 `setState()` 调用
- Context 更新在组件树中传播
- `useEffect()` 中的副作用
- 直接 DOM 操作
- 第三方库回调

This leads to **non-deterministic UI behavior**: the same user actions can produce different results depending on timing, render order, or hidden state. Debugging requires stepping through the component tree, which is impractical in large applications.

这会导致 **非确定性 UI 行为**：相同用户操作可能因时序、渲染顺序或隐藏 state 不同而产生不同结果。调试往往需要逐步排查组件树，这在大型应用中并不现实。

For MedXAI (a medical application), non-determinism is not just inconvenient — it is a **compliance risk**. Auditors must be able to trace exactly what happened and why.

对于 MedXAI（医疗应用）而言，非确定性不仅是麻烦 —— 更是 **合规风险**。审计人员必须能够精确追踪发生了什么以及为何发生。

---

## Decision

## 决策（Decision）

All interactions in PrismUI 2.0 MUST follow a **deterministic, auditable pipeline**:

PrismUI 2.0 的所有交互必须遵循 **确定性、可审计的管线**：

```
Event → Scheduler → [Middleware] → Reducer → Commit → Render
```

### Core guarantees:

### 核心保证：

1. **Traceable** — Every state change originates from a specific dispatched `RuntimeEvent` with a `type`, `payload`, `timestamp`, and `source`
2. **Predictable** — Given the same sequence of events and initial state, the runtime always produces the same final state
3. **Replayable** — The event history can reproduce any past state exactly
4. **Serializable** — All events are JSON-compatible (no functions, closures, or DOM references in payloads)

5. **可追踪（Traceable）** —— 每次 state 变更都来自某个具体已 dispatch 的 `RuntimeEvent`（含 `type`、`payload`、`timestamp`、`source`）
6. **可预测（Predictable）** —— 相同事件序列 + 相同初始 state 必然得到相同最终 state
7. **可重放（Replayable）** —— 事件历史可精确复现任意过去 state
8. **可序列化（Serializable）** —— 所有事件 JSON 兼容（payload 中无函数、闭包或 DOM 引用）

### Prohibited patterns:

### 禁止模式：

```typescript
// ❌ Implicit side effect
useEffect(() => {
  if (someCondition) navigate("/dashboard");
}, [someCondition]);

// ❌ Direct state mutation
globalState.currentPage = "Dashboard";

// ❌ Non-serializable event payload
runtime.dispatch({ type: "CLICK", payload: { callback: () => {} } });

// ❌ Non-deterministic reducer
const badReducer: EventReducer = (event, prevState) => {
  return { ...prevState, timestamp: Date.now() }; // Date.now() is non-deterministic
};

// ❌ Handler calling store directly (violates Reducer Commit Model)
function handleEvent(event, store) {
  store.setState((prev) => ({ ...prev, currentPage: event.payload.pageId }));
}
```

上面的模式会引入隐式副作用、不可序列化 payload 或绕过 Scheduler commit，从而破坏确定性。

### Required patterns:

### 推荐/必需模式：

```typescript
// ✅ Explicit event dispatch
runtime.dispatch({ type: "PAGE_TRANSITION", payload: { pageId: "Dashboard" } });

// ✅ Deterministic pure reducer (Reducer Commit Model)
const pageTransitionReducer: EventReducer = (event, prevState) => ({
  nextState: { ...prevState, currentPage: event.payload.pageId },
});
// Scheduler commits: store.setState(() => result.nextState)
// Then dispatches result.sideEffects (if any)

// ✅ Timestamps added by EventBus (single source of time)
// EventBus automatically adds `timestamp: Date.now()` on dispatch
```

这些模式保证所有变更可通过事件历史与纯 reducer 完整复现。

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- **Debugging**: Any bug can be reproduced by replaying the event sequence
- **Auditing**: Complete interaction history with before/after state snapshots
- **Testing**: Pure reducers are trivially testable (input → output, no mocks needed)
- **DevTools**: Time-travel debugging becomes possible
- **Compliance**: Medical regulatory requirements for audit trails are met by architecture

- **调试：** 通过重放事件序列可复现任意 bug
- **审计：** 完整交互历史，包含 before/after state 快照
- **测试：** 纯 reducer 可直接测试（输入 → 输出，无需 mock）
- **DevTools：** 支持时间旅行调试
- **合规：** 架构层面满足医疗监管对审计轨迹的要求

### Negative

### 负面

- More verbose than direct `setState()` — every action requires an event type definition
- Timestamps must come from EventBus, not from handlers (single time source)
- Some React patterns (optimistic updates, transitions) require adapter-level workarounds

- 相比直接 `setState()` 更啰嗦 —— 每个动作都需要事件类型定义
- timestamp 必须来自 EventBus，而不能来自 handler（单一时间源）
- 一些 React 模式（乐观更新、transition）需要 adapter 层的折中方案

### Trade-off accepted

### 已接受的权衡

- Verbosity is worth the guarantee of traceability
- The Interaction DSL (STAGE-007) will reduce verbosity for common patterns

- 为获得可追踪性保证，接受一定的啰嗦
- 交互 DSL（STAGE-007）将为常见模式降低样板代码

---

## Enforcement

## 约束与落地（Enforcement）

- **Rule 2** in RULES.md: All behavior flows through Runtime dispatch
- **Rule 4** in RULES.md: Deterministic flow is mandatory
- **Rule 8** in RULES.md: Components MUST NOT implement scheduling logic
- **HC-02**: All state changes flow through `runtime.dispatch()`
- **HC-08**: Events are serializable
- **HC-11**: `store.setState()` is called ONLY by Scheduler commit
- **HC-12**: Reducers are pure: `(event, prevState) → nextState`, no side effects
- **ADR-006**: Reducer Commit Model (formalizes deterministic state mutation)

- RULES.md **Rule 2**：所有行为必须通过 Runtime dispatch
- RULES.md **Rule 4**：确定性流程是强制的
- RULES.md **Rule 8**：组件不得实现调度逻辑
- **HC-02**：所有状态变更通过 `runtime.dispatch()`
- **HC-08**：事件必须可序列化
- **HC-11**：`store.setState()` 只能由 Scheduler commit 调用
- **HC-12**：reducer 纯函数：`(event, prevState) → nextState`，无副作用
- **ADR-006**：Reducer Commit Model（形式化确定性 state mutation）

---

## References

## 参考资料（References）

- [ARCHITECTURE.md §2.2 Deterministic Flow, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [DESIGN-PRINCIPLES.md §2 Determinism](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- [GOVERNANCE-LAYER.md — Audit Trail](../architecture/PRISMUI-GOVERNANCE.md)
- [ADR-006 Reducer Commit Model](./ADR-006-reducer-commit-model.md)
