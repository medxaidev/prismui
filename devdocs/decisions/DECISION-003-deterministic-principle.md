# ADR-003: Deterministic Interaction Principle

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — defines the fundamental guarantee that all state transitions are traceable, predictable, and replayable

---

## Context

In traditional component-based UI development, state changes can originate from:

- Component-local `setState()` calls
- Context updates propagating through the tree
- Side effects in `useEffect()` hooks
- Direct DOM manipulation
- Third-party library callbacks

This leads to **non-deterministic UI behavior**: the same user actions can produce different results depending on timing, render order, or hidden state. Debugging requires stepping through the component tree, which is impractical in large applications.

For MedXAI (a medical application), non-determinism is not just inconvenient — it is a **compliance risk**. Auditors must be able to trace exactly what happened and why.

---

## Decision

All interactions in PrismUI 2.0 MUST follow a **deterministic, auditable pipeline**:

```
Event → Scheduler → [Middleware] → Reducer → Commit → Render
```

### Core guarantees:

1. **Traceable** — Every state change originates from a specific dispatched `RuntimeEvent` with a `type`, `payload`, `timestamp`, and `source`
2. **Predictable** — Given the same sequence of events and initial state, the runtime always produces the same final state
3. **Replayable** — The event history can reproduce any past state exactly
4. **Serializable** — All events are JSON-compatible (no functions, closures, or DOM references in payloads)

### Prohibited patterns:

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

### Required patterns:

```typescript
// ✅ Explicit event dispatch
runtime.dispatch({ type: "PAGE_TRANSITION", payload: { pageId: "Dashboard" } });

// ✅ Deterministic pure reducer (Reducer Commit Model)
const pageTransitionReducer: EventReducer = (event, prevState) => ({
  ...prevState,
  currentPage: event.payload.pageId,
});
// Scheduler commits: store.setState(() => pageTransitionReducer(event, prevState))

// ✅ Timestamps added by EventBus (single source of time)
// EventBus automatically adds `timestamp: Date.now()` on dispatch
```

---

## Consequences

### Positive

- **Debugging**: Any bug can be reproduced by replaying the event sequence
- **Auditing**: Complete interaction history with before/after state snapshots
- **Testing**: Pure reducers are trivially testable (input → output, no mocks needed)
- **DevTools**: Time-travel debugging becomes possible
- **Compliance**: Medical regulatory requirements for audit trails are met by architecture

### Negative

- More verbose than direct `setState()` — every action requires an event type definition
- Timestamps must come from EventBus, not from handlers (single time source)
- Some React patterns (optimistic updates, transitions) require adapter-level workarounds

### Trade-off accepted

- Verbosity is worth the guarantee of traceability
- The Interaction DSL (STAGE-007) will reduce verbosity for common patterns

---

## Enforcement

- **Rule 2** in RULES.md: All behavior flows through Runtime dispatch
- **Rule 4** in RULES.md: Deterministic flow is mandatory
- **Rule 8** in RULES.md: Components MUST NOT implement scheduling logic
- **HC-02**: All state changes flow through `runtime.dispatch()`
- **HC-08**: Events are serializable
- **HC-11**: `store.setState()` is called ONLY by Scheduler commit
- **HC-12**: Reducers are pure: `(event, prevState) → nextState`, no side effects
- **ADR-006**: Reducer Commit Model (formalizes deterministic state mutation)

---

## References

- [ARCHITECTURE.md §2.2 Deterministic Flow, HC-11, HC-12](../architecture/PRISMUI-ARCHITECTURE.md)
- [DATAFLOW.md](../architecture/PRISMUI-DATAFLOW.md)
- [DESIGN-PRINCIPLES.md §2 Determinism](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- [GOVERNANCE-LAYER.md — Audit Trail](../architecture/PRISMUI-GOVERNANCE.md)
- [ADR-006 Reducer Commit Model](./ADR-006-reducer-commit-model.md)
