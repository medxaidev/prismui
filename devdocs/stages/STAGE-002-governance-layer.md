# STAGE-002: Governance Layer / 治理层

**Status:** Planned  
**Start Date:** TBD (after STAGE-001 complete)  
**Priority:** High  
**Dependencies:** STAGE-001 (Runtime Core with Reducer Commit Model)  
**Estimated Sessions:** ~8  
**Estimated Tests:** ~80

**状态：** 规划中  
**开始日期：** TBD（STAGE-001 完成后）  
**优先级：** High  
**依赖：** STAGE-001（带 Reducer Commit Model 的 Runtime Core）  
**预计 Sessions：** ~8  
**预计测试：** ~80

---

## Executive Summary

Add enterprise-grade control capabilities on top of the Interaction Core. The Governance Layer is implemented as **Scheduler middleware** — it intercepts events around the Reducer Commit Engine to evaluate policies, record audit entries, enable replay, and manage event priorities.

在 Interaction Core 之上增加企业级治理能力。Governance Layer 以 **Scheduler middleware** 的形式实现——围绕 Reducer Commit Engine 拦截事件，用于策略评估、审计记录、重放能力以及事件优先级管理。

**Core Philosophy:**

> Stage-2 adds control without changing the core. Governance is injected, not hardcoded.

**核心理念：**

> Stage-2 在不改变 core 的前提下增加控制能力。治理能力通过注入实现，而不是硬编码进 Core。

**Prerequisites from STAGE-001:**

The Reducer Commit Model (ADR-006) ensures that:

STAGE-001 的 Reducer Commit Model（ADR-006）保证：

- Reducers are pure: `(event, prevState) → nextState`
- `store.setState()` is called ONLY by Scheduler commit
- prevState and nextState are naturally available at the commit boundary
- Replay is deterministic by construction

- Reducer 是纯函数：`(event, prevState) → nextState`
- `store.setState()` 仅由 Scheduler 的 commit 步骤调用
- 在 commit 边界天然可获得 prevState 与 nextState
- 重放（Replay）天然具有确定性

Without these guarantees, Governance cannot function correctly.

没有这些保证，Governance 将无法正确工作。

---

## Strategic Goals

1. **Audit Trail** — immutable event logging with prevState/nextState snapshots (build FIRST)
2. **Replay System** — deterministic event replay with state hash verification (depends on Audit)
3. **Policy Engine** — rule-based event validation: allow/deny/transform (depends on deterministic foundation)
4. **Priority Scheduler** — event priority levels and conflict resolution (optional, preserves sync)

5. **Audit Trail** —— 不可变事件日志，包含 prevState/nextState 快照（必须最先实现）
6. **Replay System** —— 确定性事件重放，带 state hash 校验（依赖 Audit）
7. **Policy Engine** —— 基于规则的事件校验：allow/deny/transform（依赖确定性基础）
8. **Priority Scheduler** —— 事件优先级与冲突解决（可选，保持同步语义）

> **Critical ordering:** Audit → Replay → Policy → Priority.
> Do NOT build Policy first. Policy depends on deterministic guarantees that must be verified by Replay.

> **关键顺序：** Audit → Replay → Policy → Priority。
> 不要先做 Policy。Policy 依赖的确定性保证必须先通过 Replay 验证。

---

## Architectural Position

| Layer       | Component          | Status                | Middleware Position                 |
| ----------- | ------------------ | --------------------- | ----------------------------------- |
| **Layer 1** | Audit Trail        | This stage            | Wraps reducer (before + after)      |
| **Layer 1** | Replay System      | This stage            | Uses Audit history + reducers       |
| **Layer 1** | Policy Engine      | This stage            | Before reducer (can deny/transform) |
| **Layer 1** | Priority Scheduler | This stage (optional) | Before all middleware               |

| 层级        | 组件               | 状态           | Middleware 位置                   |
| ----------- | ------------------ | -------------- | --------------------------------- |
| **Layer 1** | Audit Trail        | 本阶段         | 包裹 reducer（before + after）    |
| **Layer 1** | Replay System      | 本阶段         | 使用 Audit history + reducers     |
| **Layer 1** | Policy Engine      | 本阶段         | reducer 之前（可 deny/transform） |
| **Layer 1** | Priority Scheduler | 本阶段（可选） | 所有 middleware 之前              |

**Integration point:** All governance components integrate as Scheduler middleware in Layer 0.

**集成点：** 所有治理组件都以 Layer 0 的 Scheduler middleware 方式集成。

**Layer 0 changes:** NONE. The Reducer Commit Engine from STAGE-001 is untouched.

**对 Layer 0 的改动：** 无。STAGE-001 的 Reducer Commit Engine 保持不变。

---

## Middleware Order (MANDATORY)

## Middleware 顺序（强制）

```
dispatch(event)
    → EventBus records + distributes
    → Scheduler.process(event)
        → prevState = store.getState()
        → [1. Priority Middleware]      ← event ordering (optional)
        → [2. Policy Middleware]        ← evaluate: allow / deny / transform
        → [3. Audit Before]            ← snapshot prevState
        → Reducer(event, prevState)     ← pure computation (STAGE-001)
        → Commit(nextState)             ← store.setState() (STAGE-001)
        → [4. Audit After]             ← snapshot nextState, record entry
    → Store notifies subscribers
```

This order is not negotiable. Audit must wrap the reducer to get accurate snapshots.

该顺序不可协商。Audit 必须包裹 reducer，才能获取准确快照。

---

## Phase Breakdown

## 阶段拆解

### Phase A: Audit Trail (2 sessions)

**Goal:** Immutable event log with precise prevState/nextState snapshots.

**目标：** 不可变事件日志，精确记录 prevState/nextState 快照。

> Build Audit FIRST because it is the simplest governance component and provides the foundation for Replay verification.

> 优先构建 Audit，因为它是最简单的治理组件，并为 Replay 验证提供基础。

**Files:**

**文件：**

- `packages/core/src/governance/audit-trail.ts`
- `packages/core/src/governance/audit-trail.test.ts`
- `packages/core/src/governance/audit-middleware.ts`

**API Design:**

**API 设计：**

```typescript
interface AuditEntry {
  id: string;
  timestamp: number;
  event: RuntimeEvent;
  prevState: RuntimeState;
  nextState: RuntimeState | null; // null if reducer threw or event was denied
  error?: string; // if reducer threw
  policyResult?: PolicyResult; // added when Policy Engine exists
}

interface AuditTrail {
  record(entry: Omit<AuditEntry, "id" | "timestamp">): void;
  getEntries(filter?: AuditFilter): readonly AuditEntry[];
  getEntry(id: string): AuditEntry | undefined;
  getLatest(count: number): readonly AuditEntry[];
  clear(): void;
  export(): string; // JSON serialization
  size(): number;
}

interface AuditFilter {
  eventType?: string;
  since?: number; // timestamp
  until?: number;
}

function createAuditTrail(options?: { maxEntries?: number }): AuditTrail;
function createAuditMiddleware(audit: AuditTrail): SchedulerMiddleware;
```

**Implementation Details:**

**实现细节：**

- Audit middleware wraps the reducer: captures prevState before, nextState after
- Entries are immutable — once recorded, cannot be modified
- Ring buffer with configurable `maxEntries` (default: 1000)
- `export()` produces JSON array of all entries
- Middleware installs as two halves: "before" captures prevState, "after" captures nextState

- Audit middleware 包裹 reducer：在执行前捕获 prevState，在执行后捕获 nextState
- Entries 不可变——一旦记录不可修改
- 采用 ring buffer，`maxEntries` 可配置（默认：1000）
- `export()` 输出所有 entries 的 JSON 数组
- Middleware 以“before/after”两半安装：before 捕获 prevState，after 捕获 nextState

**Tests (~20):**

| #   | Test                                                                  | Group      |
| --- | --------------------------------------------------------------------- | ---------- |
| 1   | creates AuditTrail instance                                           | creation   |
| 2   | records entry with auto id and timestamp                              | record     |
| 3   | entries are immutable                                                 | record     |
| 4   | respects maxEntries limit                                             | retention  |
| 5   | getEntries returns all entries                                        | query      |
| 6   | getEntries filters by eventType                                       | query      |
| 7   | getEntries filters by time range                                      | query      |
| 8   | getEntry returns specific entry                                       | query      |
| 9   | getLatest returns N most recent                                       | query      |
| 10  | clear removes all entries                                             | clear      |
| 11  | export produces valid JSON                                            | export     |
| 12  | size returns entry count                                              | size       |
| 13  | middleware captures prevState                                         | middleware |
| 14  | middleware captures nextState after commit                            | middleware |
| 15  | middleware records entry on successful event                          | middleware |
| 16  | middleware records entry with null nextState on error                 | middleware |
| 17  | middleware does not interfere with reducer execution                  | middleware |
| 18  | middleware order: before captures prevState, after captures nextState | middleware |
| 19  | destroy cleans up audit records                                       | lifecycle  |
| 20  | has no React/DOM imports                                              | isolation  |

**测试（约 20 个）：**

| #   | 测试                                                         | 分组       |
| --- | ------------------------------------------------------------ | ---------- |
| 1   | 创建 AuditTrail 实例                                         | creation   |
| 2   | record 时自动生成 id 与 timestamp                            | record     |
| 3   | entries 不可变                                               | record     |
| 4   | maxEntries 限制生效                                          | retention  |
| 5   | getEntries 返回全部 entries                                  | query      |
| 6   | getEntries 支持按 eventType 过滤                             | query      |
| 7   | getEntries 支持按时间范围过滤                                | query      |
| 8   | getEntry 返回指定 entry                                      | query      |
| 9   | getLatest 返回最近 N 条                                      | query      |
| 10  | clear 移除全部 entries                                       | clear      |
| 11  | export 输出合法 JSON                                         | export     |
| 12  | size 返回 entry 数量                                         | size       |
| 13  | middleware 捕获 prevState                                    | middleware |
| 14  | commit 后 middleware 捕获 nextState                          | middleware |
| 15  | 成功事件会记录 entry                                         | middleware |
| 16  | error 时 nextState 为 null                                   | middleware |
| 17  | middleware 不干扰 reducer 执行                               | middleware |
| 18  | middleware 顺序：before 捕获 prevState，after 捕获 nextState | middleware |
| 19  | destroy 清理 audit 记录                                      | lifecycle  |
| 20  | 无 React/DOM imports                                         | isolation  |

**Acceptance Criteria:**

- [ ] Audit captures precise prevState + nextState at commit boundary
- [ ] Entries are immutable and serializable
- [ ] Middleware does not modify event or state flow
- [ ] Reducer errors recorded with `nextState: null` + error message
- [ ] 20 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Audit 在 commit 边界精确捕获 prevState + nextState
- [ ] Entries 不可变且可序列化
- [ ] Middleware 不修改 event 或 state flow
- [ ] reducer 出错时记录 `nextState: null` + error message
- [ ] 20 个测试通过，`tsc --noEmit` 通过

---

### Phase B: Replay System (2 sessions)

**Goal:** Deterministic event replay with state hash verification.

**目标：** 具备 state hash 校验的确定性事件重放。

> Build Replay SECOND because it validates the deterministic guarantee.

> 第二步构建 Replay，因为它用于验证系统的“确定性保证”。

**Files:**

**文件：**

- `packages/core/src/governance/replay-system.ts`
- `packages/core/src/governance/replay-system.test.ts`
- `packages/core/src/governance/state-hash.ts`

**API Design:**

**API 设计：**

```typescript
interface ReplayOptions {
  speed?: number; // 1 = realtime, 2 = 2x, 0 = instant
  onEvent?: (event: RuntimeEvent, index: number) => void;
  onComplete?: (result: ReplayResult) => void;
  disableSideEffects?: boolean; // default: true (no Audit recording during replay)
}

interface ReplayResult {
  success: boolean;
  eventsReplayed: number;
  finalState: RuntimeState;
  expectedStateHash?: string;
  actualStateHash?: string;
  mismatchIndex?: number; // first event where state diverged
}

interface ReplaySystem {
  replay(events: RuntimeEvent[], options?: ReplayOptions): void;
  replayFromAudit(audit: AuditTrail, options?: ReplayOptions): void;
  pause(): void;
  resume(): void;
  stop(): void;
  isReplaying(): boolean;
}

function createReplaySystem(runtime: InteractionRuntime): ReplaySystem;
function computeStateHash(state: RuntimeState): string;
```

**Implementation Details:**

**实现细节：**

- Replay resets state to initial, then re-dispatches each event through the full pipeline
- Side effects (Audit recording) disabled during replay by default
- State hash computed at each step for verification
- `replayFromAudit()` extracts events from audit trail entries
- Speed control: `0` = instant (synchronous loop), `>0` = setTimeout-based with ms interval

- Replay 会将 state 重置到 initial，然后将每个 event 重新 dispatch 走完整管线
- 默认禁用 side effects（例如：Replay 期间不写 Audit）
- 每一步都计算 state hash 用于校验
- `replayFromAudit()` 从 audit trail entries 提取 events
- 速度控制：`0` = instant（同步循环），`>0` = 基于 setTimeout 的间隔回放

**Replay Guarantee:**

**重放保证：**

```
Given: event sequence E₁, E₂, ..., Eₙ and initial state S₀
Replay: dispatch(E₁) → S₁, dispatch(E₂) → S₂, ..., dispatch(Eₙ) → Sₙ
Verify: hash(Sₙ) === hash(recorded Sₙ)
```

This works because reducers are pure functions (ADR-006).

其成立的前提是 reducers 为纯函数（ADR-006）。

**Tests (~20):**

| #   | Test                                           | Group     |
| --- | ---------------------------------------------- | --------- |
| 1   | creates ReplaySystem instance                  | creation  |
| 2   | replays single event                           | replay    |
| 3   | replays event sequence                         | replay    |
| 4   | replay produces identical final state          | replay    |
| 5   | replay resets state to initial before starting | replay    |
| 6   | instant replay (speed=0) is synchronous        | speed     |
| 7   | realtime replay respects timing                | speed     |
| 8   | pause stops replay                             | control   |
| 9   | resume continues replay                        | control   |
| 10  | stop cancels replay                            | control   |
| 11  | isReplaying returns correct status             | control   |
| 12  | onEvent callback fires for each event          | callback  |
| 13  | onComplete callback fires with result          | callback  |
| 14  | state hash is deterministic                    | hash      |
| 15  | state hash detects different states            | hash      |
| 16  | replayFromAudit extracts events correctly      | audit     |
| 17  | replay detects state mismatch                  | verify    |
| 18  | replay reports mismatch index                  | verify    |
| 19  | replay disables side effects by default        | isolation |
| 20  | has no React/DOM imports                       | isolation |

**测试（约 20 个）：**

| #   | 测试                              | 分组      |
| --- | --------------------------------- | --------- |
| 1   | 创建 ReplaySystem 实例            | creation  |
| 2   | 重放单个事件                      | replay    |
| 3   | 重放事件序列                      | replay    |
| 4   | 重放产生相同 final state          | replay    |
| 5   | 回放开始前将 state 重置到 initial | replay    |
| 6   | instant replay（speed=0）为同步   | speed     |
| 7   | realtime replay 遵守 timing       | speed     |
| 8   | pause 停止回放                    | control   |
| 9   | resume 继续回放                   | control   |
| 10  | stop 取消回放                     | control   |
| 11  | isReplaying 返回正确状态          | control   |
| 12  | onEvent 对每个事件触发            | callback  |
| 13  | onComplete 回调返回 result        | callback  |
| 14  | state hash 具备确定性             | hash      |
| 15  | state hash 能检测不同 state       | hash      |
| 16  | replayFromAudit 能正确提取事件    | audit     |
| 17  | replay 能检测 state mismatch      | verify    |
| 18  | replay 报告 mismatch index        | verify    |
| 19  | 默认禁用 side effects             | isolation |
| 20  | 无 React/DOM imports              | isolation |

**Acceptance Criteria:**

- [ ] Replay produces identical final state from same event sequence
- [ ] State hash verification detects divergence
- [ ] Side effects disabled during replay
- [ ] Pause/resume/stop work correctly
- [ ] 20 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] 相同事件序列重放得到相同 final state
- [ ] state hash 校验能够检测分歧
- [ ] 回放期间禁用 side effects
- [ ] pause/resume/stop 行为正确
- [ ] 20 个测试通过，`tsc --noEmit` 通过

---

### Phase C: Policy Engine (2 sessions)

**Goal:** Rule-based event validation as Scheduler middleware.

**目标：** 作为 Scheduler middleware 的规则式事件校验。

> Build Policy THIRD. Policy depends on deterministic guarantees verified by Replay.

> 第三步构建 Policy。Policy 依赖 Replay 已验证的确定性保证。

**Files:**

**文件：**

- `packages/core/src/governance/policy-engine.ts`
- `packages/core/src/governance/policy-engine.test.ts`
- `packages/core/src/governance/policy-middleware.ts`

**API Design:**

**API 设计：**

```typescript
type PolicyVerdict = "allow" | "deny" | "transform";

interface PolicyResult {
  verdict: PolicyVerdict;
  reason?: string;
  transformedEvent?: RuntimeEvent;
}

type PolicyRule = (
  event: RuntimeEvent,
  state: Readonly<RuntimeState>,
) => PolicyResult;

interface PolicyEngine {
  addRule(name: string, rule: PolicyRule): void;
  removeRule(name: string): void;
  evaluate(event: RuntimeEvent, state: Readonly<RuntimeState>): PolicyResult;
  getRules(): string[];
}

function createPolicyEngine(): PolicyEngine;
function createPolicyMiddleware(
  policy: PolicyEngine,
  store: RuntimeStore,
): SchedulerMiddleware;
```

**Transform Rules (MANDATORY):**

**Transform 规则（强制）：**

1. Transform is **ONE-TIME** — transformed event does NOT re-enter Policy pipeline
2. Transformed events carry `_transformed: true` flag
3. Transform can only modify `payload` — cannot change `type`
4. Invalid transform result → treated as `deny`

5. Transform **仅一次** —— transform 后的 event 不再进入 Policy pipeline
6. transform 后的事件携带 `_transformed: true` 标记
7. transform 只能修改 `payload` —— 不能修改 `type`
8. transform 结果非法 → 视为 `deny`

**Evaluation Rules:**

**评估规则：**

- Rules execute in registration order
- First `deny` wins (short-circuit)
- If no `deny`, first `transform` wins
- If no `deny` or `transform`, result is `allow`

- 规则按注册顺序执行
- 首个 `deny` 直接生效（短路）
- 若没有 `deny`，首个 `transform` 生效
- 若无 `deny` 且无 `transform`，结果为 `allow`

**Tests (~20):**

| #   | Test                                           | Group       |
| --- | ---------------------------------------------- | ----------- |
| 1   | creates PolicyEngine instance                  | creation    |
| 2   | addRule registers named rule                   | rule        |
| 3   | removeRule removes named rule                  | rule        |
| 4   | getRules returns rule names                    | rule        |
| 5   | evaluate returns allow by default              | evaluate    |
| 6   | evaluate returns deny when rule denies         | evaluate    |
| 7   | deny includes reason                           | evaluate    |
| 8   | first deny wins (short-circuit)                | evaluate    |
| 9   | evaluate returns transform with modified event | evaluate    |
| 10  | transform can only modify payload              | transform   |
| 11  | transform cannot change event type             | transform   |
| 12  | transformed event carries \_transformed flag   | transform   |
| 13  | transform is one-time (no re-evaluation)       | transform   |
| 14  | invalid transform treated as deny              | transform   |
| 15  | middleware blocks denied events                | middleware  |
| 16  | middleware passes allowed events to reducer    | middleware  |
| 17  | middleware applies transform before reducer    | middleware  |
| 18  | policy rules are pure functions                | purity      |
| 19  | policy result recorded in Audit entry          | integration |
| 20  | has no React/DOM imports                       | isolation   |

**测试（约 20 个）：**

| #   | 测试                                    | 分组        |
| --- | --------------------------------------- | ----------- |
| 1   | 创建 PolicyEngine 实例                  | creation    |
| 2   | addRule 注册具名规则                    | rule        |
| 3   | removeRule 移除具名规则                 | rule        |
| 4   | getRules 返回规则名称列表               | rule        |
| 5   | evaluate 默认返回 allow                 | evaluate    |
| 6   | 规则 deny 时 evaluate 返回 deny         | evaluate    |
| 7   | deny 包含 reason                        | evaluate    |
| 8   | 首个 deny 生效（短路）                  | evaluate    |
| 9   | evaluate 返回 transform（修改 event）   | evaluate    |
| 10  | transform 只能修改 payload              | transform   |
| 11  | transform 不能修改 event type           | transform   |
| 12  | transform 后事件携带 \_transformed 标记 | transform   |
| 13  | transform 仅一次（不重复评估）          | transform   |
| 14  | 非法 transform 视为 deny                | transform   |
| 15  | middleware 阻止被 deny 的事件           | middleware  |
| 16  | middleware 允许 allow 事件进入 reducer  | middleware  |
| 17  | middleware 在 reducer 前应用 transform  | middleware  |
| 18  | policy rules 为纯函数                   | purity      |
| 19  | policy result 记录进 Audit entry        | integration |
| 20  | 无 React/DOM imports                    | isolation   |

**Acceptance Criteria:**

- [ ] Policies are pure functions: `(event, state) → result`
- [ ] Deny blocks event from reaching reducer
- [ ] Transform is one-time, payload-only
- [ ] Middleware integrates at correct position (before Audit, before Reducer)
- [ ] 20 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Policies 为纯函数：`(event, state) → result`
- [ ] deny 会阻止事件进入 reducer
- [ ] transform 仅一次且仅修改 payload
- [ ] middleware 集成位置正确（在 Audit 前、Reducer 前）
- [ ] 20 个测试通过，`tsc --noEmit` 通过

---

### Phase D: Priority Scheduler (2 sessions, optional)

**Goal:** Event priority levels and conflict resolution. **Optional** — can be deferred if not needed by MedXAI.

**目标：** 事件优先级与冲突解决。**可选** —— 若 MedXAI 不需要可延后。

> Build Priority LAST. It is the only governance component that may affect synchronous semantics.

> 最后构建 Priority，因为它是唯一可能影响同步语义的治理组件。

**Files:**

**文件：**

- `packages/core/src/governance/priority-scheduler.ts`
- `packages/core/src/governance/priority-scheduler.test.ts`
- `packages/core/src/governance/priority-middleware.ts`

**API Design:**

**API 设计：**

```typescript
type EventPriority = "critical" | "high" | "normal" | "low" | "idle";

interface PriorityConfig {
  defaultPriority?: EventPriority; // default: 'normal'
  typePriorities?: Record<string, EventPriority>; // per-type defaults
}

function createPriorityMiddleware(config?: PriorityConfig): SchedulerMiddleware;
```

**Design Decisions:**

**设计决策：**

- **Critical events bypass queue** — processed immediately (e.g., `PAGE_LOCK`, `SYSTEM_ERROR`)
- **Default priority: normal** — backward compatible with STAGE-001
- **Idle events deferred** — processed when queue is empty
- **Synchronous semantics preserved** — priority only affects ORDER, not timing
- **No async dispatch** — this is explicitly out of scope (see §9 of consolidation blueprint)

- **Critical events 绕过队列** —— 立即处理（例如 `PAGE_LOCK`、`SYSTEM_ERROR`）
- **默认优先级：normal** —— 与 STAGE-001 向后兼容
- **Idle 事件延后处理** —— 仅当队列为空时处理
- **保持同步语义** —— priority 只影响顺序，不影响时序
- **禁止 async dispatch** —— 明确不在范围内（见 consolidation blueprint §9）

**Tests (~20):**

| #     | Test                                              | Group       |
| ----- | ------------------------------------------------- | ----------- |
| 1-5   | Creation, configuration, defaults                 | creation    |
| 6-10  | Priority ordering, critical bypass, idle deferral | ordering    |
| 11-15 | Conflict resolution, queue inspection, flush      | conflict    |
| 16-18 | Integration with other middleware                 | integration |
| 19    | Synchronous semantics preserved                   | sync        |
| 20    | Has no React/DOM imports                          | isolation   |

**测试（约 20 个）：**

| #     | 测试                                 | 分组        |
| ----- | ------------------------------------ | ----------- |
| 1-5   | 创建、配置、默认值                   | creation    |
| 6-10  | 优先级排序、critical 绕过、idle 延后 | ordering    |
| 11-15 | 冲突解决、队列检查、flush            | conflict    |
| 16-18 | 与其他 middleware 集成               | integration |
| 19    | 保持同步语义                         | sync        |
| 20    | 无 React/DOM imports                 | isolation   |

**Acceptance Criteria:**

- [ ] Priority ordering works correctly
- [ ] Critical events bypass queue
- [ ] Synchronous semantics NOT broken
- [ ] 20 tests pass, `tsc --noEmit` clean

**验收标准：**

- [ ] Priority 排序逻辑正确
- [ ] Critical events 绕过队列
- [ ] 不破坏同步语义
- [ ] 20 个测试通过，`tsc --noEmit` 通过

---

## Destroy Lifecycle (STAGE-002 additions)

## Destroy 生命周期（STAGE-002 增量）

`runtime.destroy()` must clean up all Governance resources:

`runtime.destroy()` 必须清理所有 Governance 资源：

- [ ] Audit Trail entries cleared
- [ ] Policy Engine rules removed
- [ ] Priority queue flushed
- [ ] Replay stopped
- [ ] All middleware removed

- [ ] 清空 Audit Trail entries
- [ ] 移除 Policy Engine rules
- [ ] flush Priority queue
- [ ] 停止 Replay
- [ ] 移除所有 middleware

Failure to clean up → memory leaks.

若未清理 → 内存泄漏。

---

## Explicit Non-Goals (STAGE-002)

## 明确非目标（STAGE-002）

The following are **explicitly prohibited** in this stage:

本阶段 **明确禁止**：

- ❌ Async dispatch
- ❌ Concurrent event processing
- ❌ Cross-thread / cross-worker state
- ❌ Automatic batching
- ❌ Distributed events
- ❌ DevTools UI (STAGE-008)

- ❌ 异步 dispatch
- ❌ 并发事件处理
- ❌ 跨线程 / 跨 worker state
- ❌ 自动 batching
- ❌ 分布式 events
- ❌ DevTools UI（STAGE-008）

These would break the deterministic foundation.

这些会破坏确定性基础。

---

## Summary Table

## 汇总表

| Phase | Content                       | Sessions | New Tests | Cumulative |
| ----- | ----------------------------- | -------- | --------- | ---------- |
| **A** | Audit Trail                   | 2        | ~20       | ~20        |
| **B** | Replay System                 | 2        | ~20       | ~40        |
| **C** | Policy Engine                 | 2        | ~20       | ~60        |
| **D** | Priority Scheduler (optional) | 2        | ~20       | ~80        |
|       | **Total**                     | **8**    | **~80**   |            |

| Phase | 内容                       | Sessions | 新增测试 | 累计 |
| ----- | -------------------------- | -------- | -------- | ---- |
| **A** | Audit Trail                | 2        | ~20      | ~20  |
| **B** | Replay System              | 2        | ~20      | ~40  |
| **C** | Policy Engine              | 2        | ~20      | ~60  |
| **D** | Priority Scheduler（可选） | 2        | ~20      | ~80  |
|       | **合计**                   | **8**    | **~80**  |      |

---

## Directory Structure

## 目录结构

```
packages/core/src/governance/
├── audit-trail.ts          # Phase A
├── audit-trail.test.ts
├── audit-middleware.ts
├── replay-system.ts        # Phase B
├── replay-system.test.ts
├── state-hash.ts
├── policy-engine.ts        # Phase C
├── policy-engine.test.ts
├── policy-middleware.ts
├── priority-scheduler.ts   # Phase D
├── priority-scheduler.test.ts
├── priority-middleware.ts
├── types.ts                # Shared governance types
└── index.ts                # Barrel exports
```

---

## Definition of Done

## 完成定义（DoD）

Stage-2 is complete when **ALL** of the following are true:

当且仅当满足以下所有条件时，Stage-2 才算完成：

1. ✅ All governance components work as Scheduler middleware
2. ✅ Layer 0 (Interaction Core) code is UNCHANGED
3. ✅ Reducer Commit Model guarantees preserved
4. ✅ Audit captures accurate prevState + nextState
5. ✅ Replay produces identical state from same event sequence
6. ✅ Policy deny/transform works correctly
7. ✅ Transform is one-time, payload-only
8. ✅ Error handling: reducer exceptions don't commit state
9. ✅ Middleware order enforced
10. ✅ ~80 new tests passing (cumulative ~178 with STAGE-001)
11. ✅ `tsc --noEmit` clean
12. ✅ All devdocs updated

13. ✅ 所有治理组件都能以 Scheduler middleware 方式工作
14. ✅ Layer 0（Interaction Core）代码保持不变
15. ✅ Reducer Commit Model 的保证被保留
16. ✅ Audit 捕获准确的 prevState + nextState
17. ✅ Replay 对同一事件序列产生一致状态
18. ✅ Policy deny/transform 行为正确
19. ✅ Transform 仅一次且仅修改 payload
20. ✅ 错误处理：reducer 异常不会 commit state
21. ✅ Middleware 顺序被强制执行
22. ✅ 约 ~80 个新增测试通过（累计约 ~178，含 STAGE-001）
23. ✅ `tsc --noEmit` 通过
24. ✅ 所有 devdocs 更新完成

---

## Architecture Maturity After STAGE-002

## STAGE-002 后的架构成熟度

| Capability                  | Status                        |
| --------------------------- | ----------------------------- |
| Event-driven state system   | ✅ STAGE-001                  |
| Deterministic state machine | ✅ STAGE-001 (Reducer Commit) |
| Auditable kernel            | ✅ STAGE-002 Phase A          |
| Replayable engine           | ✅ STAGE-002 Phase B          |
| Governable platform         | ✅ STAGE-002 Phase C          |

| 能力             | 状态                           |
| ---------------- | ------------------------------ |
| 事件驱动状态系统 | ✅ STAGE-001                   |
| 确定性状态机     | ✅ STAGE-001（Reducer Commit） |
| 可审计内核       | ✅ STAGE-002 Phase A           |
| 可重放引擎       | ✅ STAGE-002 Phase B           |
| 可治理平台       | ✅ STAGE-002 Phase C           |

---

## References

## 参考

- [GOVERNANCE-LAYER.md](../architecture/PRISMUI-GOVERNANCE.md)
- [ARCHITECTURE.md §3.3, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [ADR-006 Reducer Commit Model](../decisions/ADR-006-reducer-commit-model.md)
- [ADR-003 Deterministic Principle](../decisions/DECISION-003-deterministic-principle.md)
- Architecture Consolidation Blueprint v1.0
