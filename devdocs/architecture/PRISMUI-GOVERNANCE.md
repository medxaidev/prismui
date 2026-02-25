# Layer 1 — Governance Layer

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-002  
> **Location:** `packages/core/src/governance/`

---

## Overview

The Governance Layer provides enterprise-grade control capabilities on top of the Interaction Core. It is **pure TypeScript, framework-agnostic**, and depends only on Layer 0.

Governance is not an afterthought — it is a **first-class architectural layer** that enables:

- Controlled interaction flows in enterprise applications
- Compliance and audit requirements
- Deterministic debugging and replay
- Priority-based event scheduling

---

## Components

### 1. Policy Engine

Rule-based interaction validation. Every event passes through the policy engine before execution.

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

- **Policies are pure functions** — `(event, state) → verdict`, no side effects
- **Three verdicts** — `allow` (proceed), `deny` (block + reason), `transform` (modify event)
- **Named rules** — each rule has a unique name for debugging and removal
- **Ordered evaluation** — rules execute in registration order, first `deny` wins

**Example policies:**

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

Immutable event history logging with metadata for compliance and debugging.

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

---

### 3. Replay System

Deterministic event replay for debugging, testing, and time-travel debugging.

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

---

### 4. Priority Scheduler (Enhanced)

Upgrades the basic STAGE-001 Scheduler with priority queuing and conflict resolution.

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

---

## Integration with Layer 0 (Reducer Commit Model)

The Governance Layer integrates as **Scheduler middleware** around the Reducer Commit Engine:

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

The order is critical. Audit must wrap the reducer to capture accurate prevState/nextState.

| Order | Middleware           | Purpose                              |
| ----- | -------------------- | ------------------------------------ |
| 1     | Priority             | Event ordering, queue management     |
| 2     | Policy               | Evaluate rules: allow/deny/transform |
| 3     | Audit (before)       | Snapshot prevState                   |
| —     | **Reducer + Commit** | Core processing (not middleware)     |
| 4     | Audit (after)        | Snapshot nextState, record entry     |

### Transform Rules (MANDATORY)

Policy `transform` can be dangerous if not constrained:

1. **Transform is ONE-TIME** — the transformed event does NOT re-enter the Policy pipeline
2. **Transformed events carry a `_transformed: true` flag** — prevents recursive evaluation
3. **Transform can only modify `payload`** — cannot change `type` (would break reducer routing)
4. **If transform produces an invalid event, treat as `deny`**

### Error Handling (MANDATORY)

When a reducer throws during processing:

1. **Do NOT commit** — state remains at prevState
2. **Record Audit entry** — `{ event, prevState, stateAfter: null, error }`
3. **Dispatch `SYSTEM_ERROR` event** — `{ type: 'SYSTEM_ERROR', payload: { originalEvent, error } }`
4. **`SYSTEM_ERROR` is NOT processed by reducers** — only EventBus subscribers receive it (prevents infinite loops)

This ensures Replay fidelity — errors are recorded, not silently dropped.

### Key Design Points

- STAGE-001 works without Governance (middleware slot is empty)
- STAGE-002 adds Governance as middleware without changing Layer 0 core
- Policy + Audit are injected, not hardcoded
- Reducer Commit Model makes Audit trivial (prevState/nextState at commit boundary)
- Replay is deterministic because reducers are pure functions

---

## Use Cases

### Medical Application (MedXAI)

- **Approval Flow** — medication orders require policy approval
- **Audit Compliance** — all patient data access logged
- **Page Lock** — prevent navigation during active procedures
- **Role-Based Policies** — different interaction rules per user role

### Dashboard Automation

- **Remote Control** — external systems dispatch events to control UI
- **Workflow Engine** — sequential page transitions enforced by policy
- **State Replay** — reproduce user sessions for debugging
