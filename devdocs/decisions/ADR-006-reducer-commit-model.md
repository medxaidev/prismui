# ADR-006: Reducer Commit Model

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — redefines how state mutations happen, enables deterministic replay and audit

---

## Context

The original STAGE-001 design used a **handler + store** model:

```typescript
type EventHandler = (event: RuntimeEvent, store: RuntimeStore) => void;
```

Handlers received the store directly and called `store.setState()` as a side effect. This was identified as the **architectural watershed** — without upgrading, STAGE-002 (Governance) would require core restructuring.

### Problems with handler + store model:

1. **Handlers are impure** — calling `store.setState()` is a side effect
2. **Replay cannot guarantee consistency** — handler side effects are not reproducible
3. **Audit cannot capture precise state delta** — no clean prevState/nextState boundary
4. **Rollback is impossible** — partial mutations during handler errors corrupt state
5. **Transform verification is impossible** — cannot validate transformed event results
6. **Multiple `setState` calls per handler** — no atomic state transition guarantee

---

## Decision

Replace handlers with **pure reducers**. Only the Scheduler's internal commit mechanism may write to the store.

### New model:

```typescript
/** Pure function: (event, prevState) → nextState. No side effects. */
type EventReducer = (event: RuntimeEvent, prevState: Readonly<RuntimeState>) => RuntimeState;
```

### Scheduler commit flow:

```
1. prevState = store.getState()
2. nextState = reducer(event, prevState)     // pure computation
3. store.setState(() => nextState)            // commit (ONLY here)
```

### State Mutation Rule (Constitutional):

> `store.setState()` is called **ONLY** inside the Scheduler's commit step.  
> No reducer, middleware, component, or external code may call `store.setState()`.

### Error handling:

If a reducer throws:
1. Do NOT commit — state remains unchanged
2. Record Audit entry with error information
3. Dispatch `SYSTEM_ERROR` event (not processed by reducers — prevents loops)

---

## Consequences

### Positive

- **Deterministic by construction** — pure reducers: same input → same output, always
- **Replay is native** — replay event sequence through reducers, guaranteed same state
- **Audit is trivial** — prevState and nextState captured at commit boundary
- **Rollback is trivial** — don't call commit
- **Error safety** — reducer exceptions cannot corrupt state
- **Transform is verifiable** — can validate transformed event's nextState
- **Atomic transitions** — each event produces exactly one state change
- **Testable** — reducers are pure functions, trivially unit testable

### Negative

- Reducers cannot perform side effects (logging, analytics) — must use middleware
- Slightly more verbose than direct `store.setState()` in handler
- All existing STAGE-001 handler code must be refactored (but STAGE-001 is not yet implemented)

### Trade-off accepted

The verbosity cost is minimal. The deterministic guarantee is existential for Governance (STAGE-002).

---

## Impact on STAGE-001

This change is applied **before implementation begins**, so there is no refactoring cost. The Scheduler API changes from:

```typescript
// OLD: handler + store
registerHandler(type: string, handler: EventHandler): () => void;

// NEW: reducer commit
registerReducer(type: string, reducer: EventReducer): () => void;
```

PageController registers reducers instead of handlers. Each reducer returns a new state instead of calling `store.setState()`.

---

## Impact on STAGE-002

Because STAGE-001 implements the Reducer Commit Model:

- **Policy Engine** → middleware that runs before reducer (can deny/transform)
- **Audit Trail** → middleware that captures prevState (before) and nextState (after commit)
- **Replay** → re-dispatches events through same reducers, deterministic by construction
- **Priority Scheduler** → middleware that orders events before reducer execution

STAGE-002 **only adds middleware modules**. Layer 0 core code remains unchanged.

---

## Architecture Maturity Progression

| Stage | System Level |
|-------|-------------|
| Stage-001 (handler model) | Event-driven state system |
| Stage-001 (reducer model) | **Deterministic state machine** |
| + Audit (Stage-002) | Auditable kernel |
| + Replay (Stage-002) | Replayable engine |
| + Policy (Stage-002) | Governable platform |

---

## Enforcement

- **HC-11**: `store.setState()` is called ONLY by Scheduler commit
- **HC-12**: Reducers are pure: `(event, prevState) → nextState`, no side effects
- **Code review**: Any PR adding `store.setState()` outside Scheduler MUST be rejected
- **Testing**: Reducer purity verified by testing with frozen prevState

---

## References

- [ARCHITECTURE.md §2.2 Deterministic Flow, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [RUNTIME-CORE.md §3 Scheduler](../architecture/PRISMUI-RUNTIME.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [STAGE-001 Phase B1](../stages/STAGE-001-runtime-core.md)
- [ADR-003 Deterministic Principle](./DECISION-003-deterministic-principle.md)
- Architecture Consolidation Blueprint v1.0 (input document)
