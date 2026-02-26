# ADR-006: Reducer Commit Model / Reducer Commit 模型

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — redefines how state mutations happen, enables deterministic replay and audit

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** Critical —— 重定义 state mutation 的发生方式，使重放与审计成为确定性能力

---

## Context

## 背景（Context）

The original STAGE-001 design used a **handler + store** model:

最初的 STAGE-001 设计使用 **handler + store** 模型：

```typescript
type EventHandler = (event: RuntimeEvent, store: RuntimeStore) => void;
```

Handlers received the store directly and called `store.setState()` as a side effect. This was identified as the **architectural watershed** — without upgrading, STAGE-002 (Governance) would require core restructuring.

handler 直接接收 store 并以副作用方式调用 `store.setState()`。这被识别为一个 **架构分水岭** —— 若不升级，STAGE-002（Governance）将迫使 core 结构重构。

### Problems with handler + store model:

### handler + store 模型的问题：

1. **Handlers are impure** — calling `store.setState()` is a side effect
2. **Replay cannot guarantee consistency** — handler side effects are not reproducible
3. **Audit cannot capture precise state delta** — no clean prevState/nextState boundary
4. **Rollback is impossible** — partial mutations during handler errors corrupt state
5. **Transform verification is impossible** — cannot validate transformed event results
6. **Multiple `setState` calls per handler** — no atomic state transition guarantee

7. **handler 非纯** —— 调用 `store.setState()` 是副作用
8. **重放无法保证一致性** —— handler 副作用不可复现
9. **审计无法精确捕获 delta** —— 缺少清晰的 prevState/nextState 边界
10. **无法回滚** —— handler 出错时的部分 mutation 会污染 state
11. **无法验证 transform** —— 无法校验 transformed event 的结果
12. **单个 handler 多次 `setState`** —— 无原子状态迁移保证

---

## Decision

## 决策（Decision）

Replace handlers with **pure reducers**. Only the Scheduler's internal commit mechanism may write to the store.

用 **纯 reducers** 替代 handlers。只有 Scheduler 的内部 commit 机制可以写入 store。

### New model:

### 新模型：

```typescript
interface ReducerCommitResult {
  nextState: RuntimeState;
  sideEffects?: RuntimeEvent[]; // Events dispatched AFTER commit (declarative, not imperative)
}

/** Pure function: (event, prevState) → ReducerCommitResult. No side effects. */
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => ReducerCommitResult;
```

> **`sideEffects`:** Reducers are pure, but sometimes a state change must trigger follow-up events.
> Instead of dispatching inside reducers (impure), reducers **declare** side-effect events.
> The Scheduler dispatches them AFTER commit. This preserves reducer purity while enabling event chains.

> **`sideEffects`：** reducer 必须保持纯函数，但某些 state 变更需要触发后续事件。
> 因此 reducer 不在内部 dispatch（这会变成不纯），而是 **声明** 需要的副作用事件。
> Scheduler 会在 commit 之后 dispatch 这些事件，从而在保持纯度的同时支持事件链。

### Scheduler commit flow:

### Scheduler commit 流程：

```
1. prevState = store.getState()
2. result = reducer(event, prevState)         // pure computation
3. store.setState(() => result.nextState)     // commit (ONLY here)
4. for each result.sideEffects → bus.dispatch  // after commit
```

### State Mutation Rule (Constitutional):

### State Mutation 规则（宪法级）：

> `store.setState()` is called **ONLY** inside the Scheduler's commit step.  
> No reducer, middleware, component, or external code may call `store.setState()`.

> `store.setState()` **只能** 在 Scheduler 的 commit 步骤中调用。  
> 任何 reducer、middleware、组件或外部代码都不得调用 `store.setState()`。

### Error handling:

### 错误处理：

If a reducer throws:

如果 reducer 抛错：

1. Do NOT commit — state remains unchanged
2. Record Audit entry with error information
3. Dispatch `SYSTEM_ERROR` event (not processed by reducers — prevents loops)

4. 不要 commit —— state 保持不变
5. 记录带错误信息的 Audit 条目
6. dispatch `SYSTEM_ERROR` 事件（不经 reducers 处理 —— 防止循环）

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- **Deterministic by construction** — pure reducers: same input → same output, always
- **Replay is native** — replay event sequence through reducers, guaranteed same state
- **Audit is trivial** — prevState and nextState captured at commit boundary
- **Rollback is trivial** — don't call commit
- **Error safety** — reducer exceptions cannot corrupt state
- **Transform is verifiable** — can validate transformed event's nextState
- **Atomic transitions** — each event produces exactly one state change
- **Testable** — reducers are pure functions, trivially unit testable

- **构造即确定性** —— 纯 reducer：相同输入 → 相同输出
- **重放原生支持** —— 通过 reducers 重放事件序列，保证同一 state
- **审计简单** —— commit 边界捕获 prevState 与 nextState
- **回滚简单** —— 不调用 commit 即可
- **错误安全** —— reducer 异常不会污染 state
- **transform 可验证** —— 可校验 transformed event 的 nextState
- **原子迁移** —— 每个事件产生且仅产生一次状态变更
- **可测试** —— reducer 为纯函数，易于单元测试

### Negative

### 负面

- Reducers cannot perform side effects (logging, analytics) — must use middleware
- Slightly more verbose than direct `store.setState()` in handler
- All existing STAGE-001 handler code must be refactored (but STAGE-001 is not yet implemented)

- reducer 不能做副作用（日志、分析）—— 必须使用 middleware
- 比 handler 内直接 `store.setState()` 略啰嗦
- 既有 STAGE-001 handler 代码需要重构（但 STAGE-001 尚未实现，因此成本为 0）

### Trade-off accepted

### 已接受的权衡

The verbosity cost is minimal. The deterministic guarantee is existential for Governance (STAGE-002).

啰嗦成本很小，但确定性保证对 Governance（STAGE-002）而言是生存级别的前提。

---

## Impact on STAGE-001

## 对 STAGE-001 的影响

This change is applied **before implementation begins**, so there is no refactoring cost. The Scheduler API changes from:

该变更发生在 **实现开始之前**，因此没有重构成本。Scheduler API 从以下形式变更：

```typescript
// OLD: handler + store
registerHandler(type: string, handler: EventHandler): () => void;

// NEW: reducer commit
registerReducer(type: string, reducer: EventReducer): () => void;
```

PageController registers reducers instead of handlers. Each reducer returns a new state instead of calling `store.setState()`.

PageController 将注册 reducers 而不是 handlers。每个 reducer 返回新的 state，而不是调用 `store.setState()`。

---

## Impact on STAGE-002

## 对 STAGE-002 的影响

Because STAGE-001 implements the Reducer Commit Model:

由于 STAGE-001 实现了 Reducer Commit Model：

- **Policy Engine** → middleware that runs before reducer (can deny/transform)
- **Audit Trail** → middleware that captures prevState (before) and nextState (after commit)
- **Replay** → re-dispatches events through same reducers, deterministic by construction
- **Priority Scheduler** → middleware that orders events before reducer execution

- **Policy Engine** → reducer 前运行的 middleware（可 deny/transform）
- **Audit Trail** → middleware：commit 前捕获 prevState，commit 后捕获 nextState
- **Replay** → 通过同一 reducers 重发事件，构造即确定性
- **Priority Scheduler** → reducer 执行前对事件排序的 middleware

STAGE-002 **only adds middleware modules**. Layer 0 core code remains unchanged.

STAGE-002 **只添加 middleware 模块**，Layer 0 core 代码保持不变。

---

## Architecture Maturity Progression

## 架构成熟度演进

| Stage                     | System Level                    |
| ------------------------- | ------------------------------- |
| Stage-001 (handler model) | Event-driven state system       |
| Stage-001 (reducer model) | **Deterministic state machine** |
| + Audit (Stage-002)       | Auditable kernel                |
| + Replay (Stage-002)      | Replayable engine               |
| + Policy (Stage-002)      | Governable platform             |

| Stage                      | 系统级别         |
| -------------------------- | ---------------- |
| Stage-001（handler model） | 事件驱动状态系统 |
| Stage-001（reducer model） | **确定性状态机** |
| + Audit（Stage-002）       | 可审计内核       |
| + Replay（Stage-002）      | 可重放引擎       |
| + Policy（Stage-002）      | 可治理平台       |

---

## Enforcement

## 约束与落地（Enforcement）

- **HC-11**: `store.setState()` is called ONLY by Scheduler commit
- **HC-12**: Reducers are pure: `(event, prevState) → nextState`, no side effects
- **Code review**: Any PR adding `store.setState()` outside Scheduler MUST be rejected
- **Testing**: Reducer purity verified by testing with frozen prevState

- **HC-11**：`store.setState()` 只能由 Scheduler commit 调用
- **HC-12**：reducer 纯函数：`(event, prevState) → nextState`，无副作用
- **代码审查：** 任何在 Scheduler 之外新增 `store.setState()` 的 PR 必须拒绝
- **测试：** 使用冻结的 prevState 验证 reducer 纯度

---

## References

## 参考资料（References）

- [ARCHITECTURE.md §2.2 Deterministic Flow, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [RUNTIME-CORE.md §3 Scheduler](../architecture/PRISMUI-RUNTIME.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [STAGE-001 Phase B1](../stages/STAGE-001-runtime-core.md)
- [ADR-003 Deterministic Principle](./DECISION-003-deterministic-principle.md)
- Architecture Consolidation Blueprint v1.0 (input document)
