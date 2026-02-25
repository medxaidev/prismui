# STAGE-002: Governance Layer

**Status:** Planned  
**Start Date:** TBD (after STAGE-001 complete)  
**Priority:** High  
**Dependencies:** STAGE-001 (Runtime Core with Reducer Commit Model)  
**Estimated Sessions:** ~8  
**Estimated Tests:** ~80

---

## Executive Summary

Add enterprise-grade control capabilities on top of the Interaction Core. The Governance Layer is implemented as **Scheduler middleware** — it intercepts events around the Reducer Commit Engine to evaluate policies, record audit entries, enable replay, and manage event priorities.

**Core Philosophy:**

> Stage-2 adds control without changing the core. Governance is injected, not hardcoded.

**Prerequisites from STAGE-001:**

The Reducer Commit Model (ADR-006) ensures that:

- Reducers are pure: `(event, prevState) → nextState`
- `store.setState()` is called ONLY by Scheduler commit
- prevState and nextState are naturally available at the commit boundary
- Replay is deterministic by construction

Without these guarantees, Governance cannot function correctly.

---

## Strategic Goals

1. **Audit Trail** — immutable event logging with prevState/nextState snapshots (build FIRST)
2. **Replay System** — deterministic event replay with state hash verification (depends on Audit)
3. **Policy Engine** — rule-based event validation: allow/deny/transform (depends on deterministic foundation)
4. **Priority Scheduler** — event priority levels and conflict resolution (optional, preserves sync)

> **Critical ordering:** Audit → Replay → Policy → Priority.
> Do NOT build Policy first. Policy depends on deterministic guarantees that must be verified by Replay.

---

## Architectural Position

| Layer       | Component          | Status                | Middleware Position                 |
| ----------- | ------------------ | --------------------- | ----------------------------------- |
| **Layer 1** | Audit Trail        | This stage            | Wraps reducer (before + after)      |
| **Layer 1** | Replay System      | This stage            | Uses Audit history + reducers       |
| **Layer 1** | Policy Engine      | This stage            | Before reducer (can deny/transform) |
| **Layer 1** | Priority Scheduler | This stage (optional) | Before all middleware               |

**Integration point:** All governance components integrate as Scheduler middleware in Layer 0.

**Layer 0 changes:** NONE. The Reducer Commit Engine from STAGE-001 is untouched.

---

## Middleware Order (MANDATORY)

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

---

## Phase Breakdown

### Phase A: Audit Trail (2 sessions)

**Goal:** Immutable event log with precise prevState/nextState snapshots.

> Build Audit FIRST because it is the simplest governance component and provides the foundation for Replay verification.

**Files:**

- `packages/core/src/governance/audit-trail.ts`
- `packages/core/src/governance/audit-trail.test.ts`
- `packages/core/src/governance/audit-middleware.ts`

**API Design:**

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

- Audit middleware wraps the reducer: captures prevState before, nextState after
- Entries are immutable — once recorded, cannot be modified
- Ring buffer with configurable `maxEntries` (default: 1000)
- `export()` produces JSON array of all entries
- Middleware installs as two halves: "before" captures prevState, "after" captures nextState

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

**Acceptance Criteria:**

- [ ] Audit captures precise prevState + nextState at commit boundary
- [ ] Entries are immutable and serializable
- [ ] Middleware does not modify event or state flow
- [ ] Reducer errors recorded with `nextState: null` + error message
- [ ] 20 tests pass, `tsc --noEmit` clean

---

### Phase B: Replay System (2 sessions)

**Goal:** Deterministic event replay with state hash verification.

> Build Replay SECOND because it validates the deterministic guarantee.

**Files:**

- `packages/core/src/governance/replay-system.ts`
- `packages/core/src/governance/replay-system.test.ts`
- `packages/core/src/governance/state-hash.ts`

**API Design:**

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

- Replay resets state to initial, then re-dispatches each event through the full pipeline
- Side effects (Audit recording) disabled during replay by default
- State hash computed at each step for verification
- `replayFromAudit()` extracts events from audit trail entries
- Speed control: `0` = instant (synchronous loop), `>0` = setTimeout-based with ms interval

**Replay Guarantee:**

```
Given: event sequence E₁, E₂, ..., Eₙ and initial state S₀
Replay: dispatch(E₁) → S₁, dispatch(E₂) → S₂, ..., dispatch(Eₙ) → Sₙ
Verify: hash(Sₙ) === hash(recorded Sₙ)
```

This works because reducers are pure functions (ADR-006).

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

**Acceptance Criteria:**

- [ ] Replay produces identical final state from same event sequence
- [ ] State hash verification detects divergence
- [ ] Side effects disabled during replay
- [ ] Pause/resume/stop work correctly
- [ ] 20 tests pass, `tsc --noEmit` clean

---

### Phase C: Policy Engine (2 sessions)

**Goal:** Rule-based event validation as Scheduler middleware.

> Build Policy THIRD. Policy depends on deterministic guarantees verified by Replay.

**Files:**

- `packages/core/src/governance/policy-engine.ts`
- `packages/core/src/governance/policy-engine.test.ts`
- `packages/core/src/governance/policy-middleware.ts`

**API Design:**

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

1. Transform is **ONE-TIME** — transformed event does NOT re-enter Policy pipeline
2. Transformed events carry `_transformed: true` flag
3. Transform can only modify `payload` — cannot change `type`
4. Invalid transform result → treated as `deny`

**Evaluation Rules:**

- Rules execute in registration order
- First `deny` wins (short-circuit)
- If no `deny`, first `transform` wins
- If no `deny` or `transform`, result is `allow`

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

**Acceptance Criteria:**

- [ ] Policies are pure functions: `(event, state) → result`
- [ ] Deny blocks event from reaching reducer
- [ ] Transform is one-time, payload-only
- [ ] Middleware integrates at correct position (before Audit, before Reducer)
- [ ] 20 tests pass, `tsc --noEmit` clean

---

### Phase D: Priority Scheduler (2 sessions, optional)

**Goal:** Event priority levels and conflict resolution. **Optional** — can be deferred if not needed by MedXAI.

> Build Priority LAST. It is the only governance component that may affect synchronous semantics.

**Files:**

- `packages/core/src/governance/priority-scheduler.ts`
- `packages/core/src/governance/priority-scheduler.test.ts`
- `packages/core/src/governance/priority-middleware.ts`

**API Design:**

```typescript
type EventPriority = "critical" | "high" | "normal" | "low" | "idle";

interface PriorityConfig {
  defaultPriority?: EventPriority; // default: 'normal'
  typePriorities?: Record<string, EventPriority>; // per-type defaults
}

function createPriorityMiddleware(config?: PriorityConfig): SchedulerMiddleware;
```

**Design Decisions:**

- **Critical events bypass queue** — processed immediately (e.g., `PAGE_LOCK`, `SYSTEM_ERROR`)
- **Default priority: normal** — backward compatible with STAGE-001
- **Idle events deferred** — processed when queue is empty
- **Synchronous semantics preserved** — priority only affects ORDER, not timing
- **No async dispatch** — this is explicitly out of scope (see §9 of consolidation blueprint)

**Tests (~20):**

| #     | Test                                              | Group       |
| ----- | ------------------------------------------------- | ----------- |
| 1-5   | Creation, configuration, defaults                 | creation    |
| 6-10  | Priority ordering, critical bypass, idle deferral | ordering    |
| 11-15 | Conflict resolution, queue inspection, flush      | conflict    |
| 16-18 | Integration with other middleware                 | integration |
| 19    | Synchronous semantics preserved                   | sync        |
| 20    | Has no React/DOM imports                          | isolation   |

**Acceptance Criteria:**

- [ ] Priority ordering works correctly
- [ ] Critical events bypass queue
- [ ] Synchronous semantics NOT broken
- [ ] 20 tests pass, `tsc --noEmit` clean

---

## Destroy Lifecycle (STAGE-002 additions)

`runtime.destroy()` must clean up all Governance resources:

- [ ] Audit Trail entries cleared
- [ ] Policy Engine rules removed
- [ ] Priority queue flushed
- [ ] Replay stopped
- [ ] All middleware removed

Failure to clean up → memory leaks.

---

## Explicit Non-Goals (STAGE-002)

The following are **explicitly prohibited** in this stage:

- ❌ Async dispatch
- ❌ Concurrent event processing
- ❌ Cross-thread / cross-worker state
- ❌ Automatic batching
- ❌ Distributed events
- ❌ DevTools UI (STAGE-008)

These would break the deterministic foundation.

---

## Summary Table

| Phase | Content                       | Sessions | New Tests | Cumulative |
| ----- | ----------------------------- | -------- | --------- | ---------- |
| **A** | Audit Trail                   | 2        | ~20       | ~20        |
| **B** | Replay System                 | 2        | ~20       | ~40        |
| **C** | Policy Engine                 | 2        | ~20       | ~60        |
| **D** | Priority Scheduler (optional) | 2        | ~20       | ~80        |
|       | **Total**                     | **8**    | **~80**   |            |

---

## Directory Structure

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

Stage-2 is complete when **ALL** of the following are true:

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

---

## Architecture Maturity After STAGE-002

| Capability                  | Status                        |
| --------------------------- | ----------------------------- |
| Event-driven state system   | ✅ STAGE-001                  |
| Deterministic state machine | ✅ STAGE-001 (Reducer Commit) |
| Auditable kernel            | ✅ STAGE-002 Phase A          |
| Replayable engine           | ✅ STAGE-002 Phase B          |
| Governable platform         | ✅ STAGE-002 Phase C          |

---

## References

- [GOVERNANCE-LAYER.md](../architecture/PRISMUI-GOVERNANCE.md)
- [ARCHITECTURE.md §3.3, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [ADR-006 Reducer Commit Model](../decisions/ADR-006-reducer-commit-model.md)
- [ADR-003 Deterministic Principle](../decisions/DECISION-003-deterministic-principle.md)
- Architecture Consolidation Blueprint v1.0
