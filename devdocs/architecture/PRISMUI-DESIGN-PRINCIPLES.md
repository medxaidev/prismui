# Design Principles / 设计原则

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Authority:** Constitutional — guides all design decisions.

> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **权威性：** 宪法级 —— 指导所有设计决策。

---

## 1. Runtime First / 运行时优先

> Behavior is managed by the Runtime, not by components.

> 行为由 Runtime 管理，而不是由组件管理。

Components are rendering shells. The Runtime owns:

组件是渲染外壳。Runtime 负责：

- State (what is displayed)
- Scheduling (when things happen)
- Policies (what is permitted)
- Lifecycle (page mount, transition, lock)

- 状态（显示什么）
- 调度（何时发生）
- 策略（允许什么）
- 生命周期（page mount、transition、lock）

Components own:

组件负责：

- Visual rendering (JSX, CSS)
- User event capture (onClick → dispatch)
- Local UI state only (hover, focus ring — NOT page/modal state)

- 视觉渲染（JSX、CSS）
- 用户事件捕获（onClick → dispatch）
- 仅本地 UI state（hover、focus ring —— 不是 page/modal state）

**Test:** If a component is removed, does the Runtime still know the correct state? If yes, the principle is upheld.

**测试：** 如果移除某个组件，Runtime 是否仍能得知正确 state？若是，则该原则成立。

---

## 2. Determinism / 确定性

> Same inputs → same outputs. Always.

> 相同输入 → 相同输出。永远如此。

Every state transition must be:

每一次 state 迁移都必须是：

- **Traceable** — originated from a specific dispatched event
- **Predictable** — given the same event sequence, produce the same state
- **Replayable** — event history can reproduce any past state
- **Auditable** — every event is logged with before/after state

- **可追踪（Traceable）** —— 源自某个具体已 dispatch 的事件
- **可预测（Predictable）** —— 给定相同事件序列，产生相同 state
- **可重放（Replayable）** —— 事件历史可以复现任意过去 state
- **可审计（Auditable）** —— 每个事件都被记录，并包含 before/after state

**Enforced by Reducer Commit Model (ADR-006):**

**由 Reducer Commit Model（ADR-006）强制保证：**

- Reducers are pure: `(event, prevState) → nextState` — no side effects
- `store.setState()` called ONLY by Scheduler commit — single mutation point
- prevState + nextState captured at commit boundary — enables audit + rollback

- Reducers 为纯函数：`(event, prevState) → nextState` —— 无副作用
- `store.setState()` 仅由 Scheduler commit 调用 —— 唯一 mutation 点
- 在 commit 边界捕获 prevState + nextState —— 支持 audit + rollback

**Prohibited patterns:**

**禁止模式：**

- `Math.random()` in reducers
- `Date.now()` in reducers (timestamps added by EventBus, not reducers)
- `store.setState()` outside Scheduler
- Side effects in reducers (use middleware instead)

- reducer 中的 `Math.random()`
- reducer 中的 `Date.now()`（timestamp 由 EventBus 添加，而不是 reducer）
- 在 Scheduler 外调用 `store.setState()`
- reducer 中的副作用（用 middleware 替代）

---

## 3. Framework Agnosticism / 框架无关性

> The core runs anywhere TypeScript runs.

> Core 能运行在任何可运行 TypeScript 的环境中。

Layer 0 (Interaction Core) and Layer 1 (Governance) must work in:

Layer 0（Interaction Core）与 Layer 1（Governance）必须可运行于：

- Browser (React, Vue, Svelte)
- Node.js (SSR, CLI, testing)
- Web Workers
- AI agent environments
- Automated test runners

- 浏览器（React、Vue、Svelte）
- Node.js（SSR、CLI、测试）
- Web Workers
- AI agent 环境
- 自动化测试运行器

**The acid test:** Can you run the full event → state pipeline in a Node.js script with zero DOM?

**酸性测试：** 你能否在一个零 DOM 的 Node.js 脚本中运行完整的 event → state 管线？

---

## 4. Semantic Over Direct / 语义优先于直接

> Components use meaning, not values.

> 组件使用“意义”，而不是“具体值”。

```typescript
// ❌ Direct — component knows the color
<Button color="red">Delete</Button>

// ✅ Semantic — component knows the intent
<Button intent="destructive">Delete</Button>
```

The intent layer provides:

intent 层提供：

- Color (derived from tokens)
- Behavior (derived from rules)
- Accessibility (auto-contrast)
- Governance (auto-confirm for destructive)

- 颜色（由 tokens 推导）
- 行为（由规则推导）
- 可访问性（自动对比度）
- 治理（对 destructive 自动确认）

---

## 5. Composition Over Configuration / 组合优于配置

> Build capabilities by composing small, focused modules — not by adding props.

> 通过组合小而专注的模块来构建能力 —— 而不是不断增加 props。

```typescript
// ❌ Configuration explosion
<PrismUIProvider
  enableOverlay
  enableDialog
  enableToast
  enableAudit
  enableReplay
>

// ✅ Composition
const runtime = createInteractionRuntime({
  middleware: [policyMiddleware(), auditMiddleware()],
});
```

Each capability is an independent, testable unit that composes with others.

每个能力都是独立、可测试的单元，并可与其它能力组合。

---

## 6. Governance as Architecture / 治理即架构

> Security, compliance, and control are not afterthoughts — they are first-class layers.

> 安全、合规与控制不是事后补丁 —— 它们是一等公民层。

Traditional approach: Add audit logging as a wrapper/decorator after the fact.  
PrismUI approach: Governance is Layer 1, built into the event pipeline.

传统做法：事后用 wrapper/decorator 的方式添加审计日志。  
PrismUI 做法：治理是 Layer 1，内建到事件管线中。

This means:

这意味着：

- Every event passes through policy evaluation
- Every state change is auditable by default
- Page lock is a runtime primitive, not a component hack
- Replay is possible because the architecture enforces determinism

- 每个事件都会经过策略评估（policy evaluation）
- 默认情况下每次 state 变更都是可审计的
- Page lock 是 runtime 原语，而不是组件层 hack
- 由于架构强制确定性，Replay 才成为可能

---

## 7. Minimal Coupling / 最小耦合

> Each layer communicates only through defined interfaces.

> 每一层只通过定义好的接口通信。

```
Layer 0 ← defines interfaces
Layer 1 ← implements middleware on Layer 0 interfaces
Layer 2 ← subscribes to Layer 0 state
Layer 3 ← renders from Layer 2 hooks
```

No layer may bypass the layer below it. No cross-layer direct references.

任何层都不得绕过其下层。禁止跨层直接引用。

**Test:** Can you replace Layer 2 (React Adapter) with a Vue Adapter without changing Layer 0 or Layer 1? If yes, the coupling is minimal.

**测试：** 在不修改 Layer 0 或 Layer 1 的前提下，你能否把 Layer 2（React Adapter）替换为 Vue Adapter？若可以，则耦合最小。

---

## 8. Progressive Disclosure / 渐进式暴露

> Simple things should be simple. Complex things should be possible.

> 简单的事情应当简单；复杂的事情应当可行。

**Simple usage:**

**简单用法：**

```typescript
const runtime = createInteractionRuntime({
  modules: [createPageModule()],
});
const page = runtime.modules.page as PageController;
page.mount("Dashboard");
page.transition("Settings");
```

**Advanced usage:**

**高级用法：**

```typescript
const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
  middleware: [
    policyMiddleware({ rules: [...] }),
    auditMiddleware({ maxEntries: 10000 }),
    priorityMiddleware(),
  ],
});
```

The basic API requires no configuration. Advanced capabilities are opt-in via composition.

基础 API 不需要配置。高级能力通过组合方式按需启用（opt-in）。

---

## 9. Programmability / 可编程性

> UI is not static — it is a programmable surface.

> UI 不是静态的 —— 它是一个可编程的表面。

```typescript
// External system controls UI
runtime.dispatch({ type: "OPEN_MODAL", payload: { id: "approval" } });

// AI agent triggers workflow
runtime.dispatch({
  type: "START_WORKFLOW",
  payload: { flow: "patient-intake" },
});

// Automated test drives UI
runtime.dispatch({ type: "PAGE_TRANSITION", payload: "Dashboard" });
assert(runtime.getState().currentPage === "Dashboard");
```

Because the Runtime is framework-agnostic and event-driven, any system that can dispatch events can control the UI.

由于 Runtime 与框架无关且事件驱动，任何能够 dispatch 事件的系统都可以控制 UI。

---

## 10. Incremental Adoption / 增量采用

> Start small, add capabilities as needed.

> 从小开始，按需增加能力。

Stage 1 delivers a minimal runtime. Each subsequent stage adds capabilities without breaking existing code:

Stage 1 交付最小 runtime。后续每个 stage 都在不破坏既有代码的前提下增加能力：

| Add...                           | Without changing...          |
| -------------------------------- | ---------------------------- |
| Governance (STAGE-002)           | Interaction Core (STAGE-001) |
| Semantic Theme (STAGE-003)       | Runtime or Governance        |
| Modal/Drawer modules (STAGE-004) | Core, Governance, or Theme   |

| 添加……                            | 不改变……                      |
| --------------------------------- | ----------------------------- |
| Governance（STAGE-002）           | Interaction Core（STAGE-001） |
| Semantic Theme（STAGE-003）       | Runtime 或 Governance         |
| Modal/Drawer modules（STAGE-004） | Core、Governance 或 Theme     |

The architecture supports additive growth, not rewrites.

该架构支持“增量式增长”，而不是“推倒重写”。
