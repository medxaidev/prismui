# Layer 1 — Governance Layer / 第 1 层——治理层

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-002  
> **Location:** `packages/core/src/governance/`

> **状态：** Planned  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **实现于：** STAGE-002  
> **位置：** `packages/core/src/governance/`

---

## Overview

The Governance Layer provides enterprise-grade control capabilities on top of the Interaction Core. It is **pure TypeScript, framework-agnostic**, and depends only on Layer 0.

## 概览

治理层在交互核心之上提供企业级控制能力。它是 **纯 TypeScript、与框架无关** 的，并且只依赖 Layer 0。

Governance is not an afterthought — it is a **first-class architectural layer** that enables:

治理不是事后补丁 —— 它是一个 **一等公民架构层**，可实现：

- Controlled interaction flows in enterprise applications
- Compliance and audit requirements
- Deterministic debugging and replay
- Priority-based event scheduling

- 企业应用中的受控交互流程
- 合规与审计要求
- 确定性的调试与重放
- 基于优先级的事件调度

---

## Components

## 组件

### 1. Policy Engine

### 1. 策略引擎（Policy Engine）

Rule-based interaction validation. Every event passes through the policy engine before execution.

基于规则的交互校验。每个事件在执行前都必须通过策略引擎。

```typescript
type PolicyVerdict = "allow" | "deny" | "transform";

interface PolicyResult {
  verdict: PolicyVerdict;
  reason?: string;
  transformedEvent?: RuntimeEvent;
}

type PolicyRule = (event: RuntimeEvent, state: RuntimeState) => PolicyResult;

interface PolicyEngine {
  addRule(name: string, rule: PolicyRule): void;
  removeRule(name: string): void;
  evaluate(event: RuntimeEvent, state: RuntimeState): PolicyResult;
  getRules(): string[];
}

function createPolicyEngine(): PolicyEngine;
```

**Design decisions:**

**设计决策：**

- **Policies are pure functions** — `(event, state) → verdict`, no side effects
- **Three verdicts** — `allow` (proceed), `deny` (block + reason), `transform` (modify event)
- **Named rules** — each rule has a unique name for debugging and removal
- **Ordered evaluation** — rules execute in registration order, first `deny` wins

- **策略为纯函数** —— `(event, state) → verdict`，无副作用
- **三种裁决** —— `allow`（放行）、`deny`（阻断 + 原因）、`transform`（修改事件）
- **具名规则** —— 每条规则都有唯一名称，便于调试与移除
- **有序求值** —— 按注册顺序执行，首个 `deny` 生效

**Example policies:**

**示例策略：**

```typescript
// Prevent navigation when page is locked
policyEngine.addRule("lock-guard", (event, state) => {
  if (event.type === "PAGE_TRANSITION" && state.locked) {
    return { verdict: "deny", reason: "Page is locked" };
  }
  return { verdict: "allow" };
});

// Require confirmation for destructive actions
policyEngine.addRule("destructive-guard", (event, state) => {
  if (event.type === "DELETE_RECORD" && !event.payload?.confirmed) {
    return { verdict: "deny", reason: "Confirmation required" };
  }
  return { verdict: "allow" };
});
```

---

### 2. Audit Trail

### 2. 审计轨迹（Audit Trail）

Immutable event history logging with metadata for compliance and debugging.

带元数据的不可变事件历史记录，用于合规与调试。

```typescript
interface AuditEntry {
  id: string;
  timestamp: number;
  event: RuntimeEvent;
  stateBefore: RuntimeState;
  stateAfter: RuntimeState;
  policyResult: PolicyResult;
  metadata?: Record<string, unknown>;
}

interface AuditTrail {
  record(entry: Omit<AuditEntry, "id" | "timestamp">): void;
  getEntries(filter?: AuditFilter): readonly AuditEntry[];
  getEntry(id: string): AuditEntry | undefined;
  clear(): void;
  export(): string; // JSON serialization
}

function createAuditTrail(options?: { maxEntries?: number }): AuditTrail;
```

**Design decisions:**

- **Immutable entries** — once recorded, entries cannot be modified
- **State snapshots** — both `stateBefore` and `stateAfter` for full traceability
- **Serializable** — `export()` produces JSON for external logging systems
- **Configurable retention** — `maxEntries` prevents unbounded memory growth

- **不可变条目** —— 一旦记录即不可修改
- **状态快照** —— 同时记录 `stateBefore` 与 `stateAfter`，保证可追溯
- **可序列化** —— `export()` 输出 JSON，便于接入外部日志系统
- **可配置保留策略** —— `maxEntries` 防止内存无限增长

---

### 3. Replay System

### 3. 重放系统（Replay System）

Deterministic event replay for debugging, testing, and time-travel debugging.

用于调试、测试与时间旅行调试的确定性事件重放。

```typescript
interface ReplayOptions {
  speed?: number; // 1 = realtime, 2 = 2x, 0 = instant
  onEvent?: (event: RuntimeEvent, index: number) => void;
  onComplete?: () => void;
}

interface ReplaySystem {
  replay(events: RuntimeEvent[], options?: ReplayOptions): void;
  pause(): void;
  resume(): void;
  stop(): void;
  isReplaying(): boolean;
}

function createReplaySystem(runtime: InteractionRuntime): ReplaySystem;
```

**Design decisions:**

- **Replay dispatches events through the full pipeline** — but with side effects disabled (no real Audit recording during replay)
- **Replay uses the same reducers** — deterministic because reducers are pure functions
- **State hash verification** — replay can compare final state hash against recorded state
- **Speed control** — real-time for debugging, instant for testing
- **Pause/resume** — for step-by-step debugging
- **Event callback** — for UI progress indicators during replay

- **重放通过完整管线 dispatch 事件** —— 但禁用副作用（重放时不进行真实 Audit 记录）
- **重放使用同一套 reducers** —— reducer 为纯函数，因此是确定性的
- **状态哈希校验** —— 可将重放后的最终 state hash 与记录值对比
- **速度控制** —— 调试时实时、测试时瞬时
- **暂停/恢复** —— 支持逐步调试
- **事件回调** —— 为重放过程提供 UI 进度提示

---

### 4. Priority Scheduler (Enhanced)

### 4. 优先级调度器（增强版 Priority Scheduler）

Upgrades the basic STAGE-001 Scheduler with priority queuing and conflict resolution.

在 STAGE-001 Scheduler 基础上增加优先级队列与冲突解决。

```typescript
type EventPriority = "critical" | "high" | "normal" | "low" | "idle";

interface PriorityEvent extends RuntimeEvent {
  priority?: EventPriority;
}

interface PriorityScheduler extends Scheduler {
  setPriority(type: string, priority: EventPriority): void;
  getQueue(): readonly PriorityEvent[];
  flush(): void;
}
```

**Design decisions:**

- **Default priority: normal** — backward compatible with STAGE-001
- **Critical events bypass queue** — processed immediately (e.g., `PAGE_LOCK`)
- **Idle events deferred** — processed when queue is empty
- **Conflict resolution** — configurable strategy per event type

- **默认优先级：normal** —— 与 STAGE-001 向后兼容
- **Critical 事件绕过队列** —— 立即处理（例如 `PAGE_LOCK`）
- **Idle 事件延后处理** —— 队列清空后执行
- **冲突解决** —— 可针对不同事件类型配置策略

---

## Integration with Layer 0 (Reducer Commit Model)

## 与 Layer 0 的集成（Reducer Commit Model）

The Governance Layer integrates as **Scheduler middleware** around the Reducer Commit Engine:

治理层以 **Scheduler middleware** 的形式集成在 Reducer Commit 引擎周围：

```
dispatch(event)
    → EventBus records + distributes
    → Scheduler.process(event)
        → prevState = store.getState()
        → [1. Priority Middleware]      ← event ordering (optional)
        → [2. Policy Middleware]        ← evaluate: allow / deny / transform
            → if 'deny': block, Audit records denial, done
            → if 'transform': replace event (ONE TIME, no re-evaluation)
            → if 'allow': continue
        → [3. Audit Before Middleware]  ← capture prevState snapshot
        → Reducer(event, prevState)     ← pure computation
        → Commit(nextState)             ← store.setState(() => nextState)
        → [4. Audit After Middleware]   ← capture nextState, record entry
    → Store notifies subscribers
```

### Middleware Order (MANDATORY)

### Middleware 顺序（强制）

The order is critical. Audit must wrap the reducer to capture accurate prevState/nextState.

顺序至关重要。Audit 必须包裹 reducer，才能准确捕获 prevState/nextState。

| Order | Middleware           | Purpose                              |
| ----- | -------------------- | ------------------------------------ |
| 1     | Priority             | Event ordering, queue management     |
| 2     | Policy               | Evaluate rules: allow/deny/transform |
| 3     | Audit (before)       | Snapshot prevState                   |
| —     | **Reducer + Commit** | Core processing (not middleware)     |
| 4     | Audit (after)        | Snapshot nextState, record entry     |

| 顺序 | Middleware           | 目的                           |
| ---- | -------------------- | ------------------------------ |
| 1    | Priority             | 事件排序、队列管理             |
| 2    | Policy               | 规则求值：allow/deny/transform |
| 3    | Audit（before）      | 快照 prevState                 |
| —    | **Reducer + Commit** | 核心处理（非 middleware）      |
| 4    | Audit（after）       | 快照 nextState，记录条目       |

### Transform Rules (MANDATORY)

### Transform 规则（强制）

Policy `transform` can be dangerous if not constrained:

如果不加约束，Policy 的 `transform` 可能非常危险：

1. **Transform is ONE-TIME** — the transformed event does NOT re-enter the Policy pipeline
2. **Transformed events carry a `_transformed: true` flag** — prevents recursive evaluation
3. **Transform can only modify `payload`** — cannot change `type` (would break reducer routing)
4. **If transform produces an invalid event, treat as `deny`**

5. **Transform 只执行一次** —— transformed event 不会重新进入 Policy 管线
6. **Transformed event 携带 `_transformed: true` 标记** —— 防止递归求值
7. **Transform 只能修改 `payload`** —— 不得改变 `type`（否则会破坏 reducer 路由）
8. **若 transform 产出无效事件，则按 `deny` 处理**

### Error Handling (MANDATORY)

### 错误处理（强制）

When a reducer throws during processing:

当 reducer 在处理过程中抛错时：

1. **Do NOT commit** — state remains at prevState
2. **Record Audit entry** — `{ event, prevState, stateAfter: null, error }`
3. **Dispatch `SYSTEM_ERROR` event** — `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
4. **`SYSTEM_ERROR` is NOT processed by reducers** — only EventBus subscribers receive it (prevents infinite loops)

5. **不要 commit** —— state 保持为 prevState
6. **记录 Audit 条目** —— `{ event, prevState, stateAfter: null, error }`
7. **dispatch `SYSTEM_ERROR` 事件** —— `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
8. **`SYSTEM_ERROR` 不经 reducers 处理** —— 仅 EventBus subscriber 接收（避免无限循环）

This ensures Replay fidelity — errors are recorded, not silently dropped.

这能保证 Replay 的保真度 —— 错误会被记录，而不是悄悄丢弃。

### Key Design Points

### 关键设计要点

- STAGE-001 works without Governance (middleware slot is empty)
- STAGE-002 adds Governance as middleware without changing Layer 0 core
- Policy + Audit are injected, not hardcoded
- Reducer Commit Model makes Audit trivial (prevState/nextState at commit boundary)
- Replay is deterministic because reducers are pure functions

- STAGE-001 可在无 Governance 情况下运行（middleware 槽位为空）
- STAGE-002 以 middleware 方式添加 Governance，而不改变 Layer 0 core
- Policy + Audit 通过注入实现，而不是硬编码
- Reducer Commit Model 使 Audit 变得简单（在 commit 边界捕获 prevState/nextState）
- 由于 reducer 是纯函数，Replay 是确定性的

---

## Use Cases

## 使用场景

### Medical Application (MedXAI)

### 医疗应用（MedXAI）

- **Approval Flow** — medication orders require policy approval
- **Audit Compliance** — all patient data access logged
- **Page Lock** — prevent navigation during active procedures
- **Role-Based Policies** — different interaction rules per user role

- **审批流程** —— 用药医嘱需要策略审批
- **审计合规** —— 访问患者数据必须记录
- **页面锁定** —— 在进行中操作时禁止导航
- **基于角色的策略** —— 不同用户角色使用不同交互规则

### Dashboard Automation

### 仪表盘自动化

- **Remote Control** — external systems dispatch events to control UI
- **Workflow Engine** — sequential page transitions enforced by policy
- **State Replay** — reproduce user sessions for debugging

- **远程控制** —— 外部系统 dispatch 事件控制 UI
- **工作流引擎** —— 通过策略强制顺序页面跳转
- **状态重放** —— 为调试复现用户会话
