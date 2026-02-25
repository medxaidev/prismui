# ADR-007: FSM as Module Pattern

> **Status:** Accepted  
> **Date:** 2026-02-26  
> **Deciders:** Architecture Team  
> **Relates to:** ADR-006 (Reducer Commit Model), ADR-005 (Page as Runtime Resource)

---

## Context

PrismUI 2.0 is an **event-driven + data-flow architecture**. FSM (Finite State Machine) is a **state-driven + transition-constraint model**. The two are structurally different but highly complementary at the "decision core" level.

### PrismUI strengths (current)

- Event-driven, component-decoupled, observable data flow
- Pluggable module system (`RuntimeModule` interface)
- Deterministic Reducer Commit pipeline (ADR-006)
- Governance-ready (Policy Engine, Audit Trail — STAGE-002)

### PrismUI gaps (without FSM)

- No **explicit state graph** — valid transitions are implicit in reducer logic
- No **static verifiability** — cannot detect dead states or unreachable transitions at design time
- No **declarative guard constraints** — guards are scattered across middleware/reducer code
- Complex workflows (multi-step procedures, wizard flows) lack a formal model

### FSM strengths

- State closure: all valid states are explicitly enumerated
- Transition exhaustiveness: every legal `(state, event) → nextState` is defined
- Behavior verifiability: dead states, unreachable states detectable statically
- Testable: `given state A, when event B, expect state C`

### FSM weaknesses (standalone)

- State explosion in high-dimensional UI
- Poor fit for dynamic, data-driven interfaces
- Composition complexity in nested hierarchies

---

## Decision

**FSM capabilities are absorbed into the existing Module System as `StateMachineModule` — not introduced as a separate architectural layer.**

### Why not a separate FSM Coordinator layer?

| Concern | Impact |
|---------|--------|
| **Dual authority** | A standalone FSM Coordinator would compete with Scheduler for `store.setState()` — violating ADR-006's single commit point |
| **Bypassed middleware** | Events processed by an external Coordinator skip the Scheduler's middleware chain (Policy, Audit) |
| **Parallel event paths** | Two processing pipelines introduce non-determinism |
| **Module System redundancy** | `RuntimeModule` already provides `initialState`, `reducers`, `middleware`, `controller` — all FSM needs |

### Core principle

> **FSM is a Module pattern, not an architecture layer.**
>
> It uses `RuntimeModule` to plug into the system, reuses the Scheduler pipeline for guard/transition/effect, and gains all existing infrastructure (audit, replay, policy, DevTools) for free.

---

## Design

### StateMachineModule interfaces

```typescript
/**
 * A single state node in the state graph.
 */
interface StateNode {
  on: Record<string, TransitionDef>;   // eventType → transition definition
}

/**
 * A transition definition: target state, optional guard, optional declarative side-effects.
 */
interface TransitionDef {
  target: string;                                                    // next state id
  guard?: (event: RuntimeEvent, state: Readonly<RuntimeState>) => boolean;  // must return true to allow
  sideEffects?: RuntimeEvent[];                                      // dispatched after commit (via ReducerCommitResult)
}

/**
 * Configuration for creating a StateMachineModule.
 */
interface StateMachineModuleConfig {
  name: string;              // module name, e.g. "dashboardFlow"
  initial: string;           // initial state id, e.g. "loading"
  states: Record<string, StateNode>;
  stateKey: string;          // key in RuntimeState, e.g. "dashboardFlowState"
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

`createStateMachineModule(config)` returns a `RuntimeModule<StateMachineController>` by auto-generating:

| RuntimeModule field | Generated from |
|---------------------|---------------|
| `name` | `config.name` |
| `initialState` | `{ [config.stateKey]: config.initial }` |
| `reducers` | One reducer per event type found in `config.states[*].on` — looks up current FSM state, validates transition exists, returns `{ nextState: { ...prev, [stateKey]: target }, sideEffects }` |
| `middleware` | One guard middleware — for each event, checks `guard()` function if defined; blocks event (stops `next()` call) if guard returns `false` |
| `createController` | Returns `StateMachineController` implementation that reads `store.getState()[stateKey]` |

### Architecture fit

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

### Three-tier FSM usage

| Tier | Scope | Implementation | RuntimeState? |
|------|-------|---------------|---------------|
| **Global** | Auth, network, session | `StateMachineModule` at runtime level | Yes |
| **Page-level** | Dashboard flow, wizard steps | `StateMachineModule` per page | Yes |
| **Component-level** | Chart interactions, form field states | Local `useReducer` or lightweight FSM library | **No** — avoids state explosion |

> **Hard constraint:** Component-level FSMs MUST NOT enter global RuntimeState. They are local concerns.

---

## Example

### Dashboard page flow

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
          sideEffects: [{ type: "AUDIT_LOG", payload: { action: "dashboard_edit_saved" } }],
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
flow.getCurrentState();    // "loading"
flow.can("FILTER_ACTIVATED"); // false — not in "ready" state
flow.allowedEvents();      // ["DASHBOARD_DATA_READY", "DASHBOARD_LOAD_ERROR"]
```

### Testing

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
  return Object.keys(graph).filter(id => !reachable.has(id) && id !== config.initial);
}
```

---

## Consequences

### Positive

- **Declarative state graphs** — valid states and transitions are explicit, not buried in reducer logic
- **Static verifiability** — dead states, unreachable transitions detectable at design time
- **Predictable testing** — `given state + event → expect state` pattern
- **Full infrastructure reuse** — audit, replay, policy, DevTools work automatically
- **Zero architecture disruption** — no new layers, no new commit points, no Scheduler changes
- **Gradual adoption** — teams can add FSM modules to specific flows without affecting others
- **Race condition prevention** — FSM rejects events that don't match current state

### Negative

- Additional abstraction for simple flows that don't need state constraints
- State graph must be maintained alongside reducer logic (dual definition risk for non-FSM reducers)
- Guard functions introduce conditional logic outside pure reducers (mitigated: guards only block, never mutate)

### Mitigation

- FSM modules are **opt-in** — only used where flow constraints add value
- Auto-generated reducers from state graph eliminate dual definition for FSM-managed flows
- Guards are pure predicates (no side effects) and are auditable via middleware chain

---

## Implementation Stage

**Target: STAGE-003 or later** (after Governance Layer is complete).

Not required for STAGE-001 (Runtime Core) or STAGE-002 (Governance). The Module System and Scheduler pipeline designed in STAGE-001 already support this pattern — no retroactive changes needed.

---

## References

- [ADR-006: Reducer Commit Model](./ADR-006-reducer-commit-model.md) — `ReducerCommitResult.sideEffects` enables FSM effects
- [ADR-005: Page as Runtime Resource](./ADR-005-page-as-runtime-resource.md) — Page Module is a precedent for domain modules
- [PRISMUI-RUNTIME.md §4 Module System](../architecture/PRISMUI-RUNTIME.md) — `RuntimeModule` interface
- [PRISMUI-GLOSSARY.md](../architecture/PRISMUI-GLOSSARY.md) — Term definitions
