# Design Principles / 设计原则

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Authority:** Constitutional — guides all design decisions.

---

## 1. Runtime First / 运行时优先

> Behavior is managed by the Runtime, not by components.

Components are rendering shells. The Runtime owns:

- State (what is displayed)
- Scheduling (when things happen)
- Policies (what is permitted)
- Lifecycle (page mount, transition, lock)

Components own:

- Visual rendering (JSX, CSS)
- User event capture (onClick → dispatch)
- Local UI state only (hover, focus ring — NOT page/modal state)

**Test:** If a component is removed, does the Runtime still know the correct state? If yes, the principle is upheld.

---

## 2. Determinism / 确定性

> Same inputs → same outputs. Always.

Every state transition must be:

- **Traceable** — originated from a specific dispatched event
- **Predictable** — given the same event sequence, produce the same state
- **Replayable** — event history can reproduce any past state
- **Auditable** — every event is logged with before/after state

**Enforced by Reducer Commit Model (ADR-006):**

- Reducers are pure: `(event, prevState) → nextState` — no side effects
- `store.setState()` called ONLY by Scheduler commit — single mutation point
- prevState + nextState captured at commit boundary — enables audit + rollback

**Prohibited patterns:**

- `Math.random()` in reducers
- `Date.now()` in reducers (timestamps added by EventBus, not reducers)
- `store.setState()` outside Scheduler
- Side effects in reducers (use middleware instead)

---

## 3. Framework Agnosticism / 框架无关性

> The core runs anywhere TypeScript runs.

Layer 0 (Interaction Core) and Layer 1 (Governance) must work in:

- Browser (React, Vue, Svelte)
- Node.js (SSR, CLI, testing)
- Web Workers
- AI agent environments
- Automated test runners

**The acid test:** Can you run the full event → state pipeline in a Node.js script with zero DOM?

---

## 4. Semantic Over Direct / 语义优先于直接

> Components use meaning, not values.

```typescript
// ❌ Direct — component knows the color
<Button color="red">Delete</Button>

// ✅ Semantic — component knows the intent
<Button intent="destructive">Delete</Button>
```

The intent layer provides:

- Color (derived from tokens)
- Behavior (derived from rules)
- Accessibility (auto-contrast)
- Governance (auto-confirm for destructive)

---

## 5. Composition Over Configuration / 组合优于配置

> Build capabilities by composing small, focused modules — not by adding props.

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

---

## 6. Governance as Architecture / 治理即架构

> Security, compliance, and control are not afterthoughts — they are first-class layers.

Traditional approach: Add audit logging as a wrapper/decorator after the fact.  
PrismUI approach: Governance is Layer 1, built into the event pipeline.

This means:

- Every event passes through policy evaluation
- Every state change is auditable by default
- Page lock is a runtime primitive, not a component hack
- Replay is possible because the architecture enforces determinism

---

## 7. Minimal Coupling / 最小耦合

> Each layer communicates only through defined interfaces.

```
Layer 0 ← defines interfaces
Layer 1 ← implements middleware on Layer 0 interfaces
Layer 2 ← subscribes to Layer 0 state
Layer 3 ← renders from Layer 2 hooks
```

No layer may bypass the layer below it. No cross-layer direct references.

**Test:** Can you replace Layer 2 (React Adapter) with a Vue Adapter without changing Layer 0 or Layer 1? If yes, the coupling is minimal.

---

## 8. Progressive Disclosure / 渐进式暴露

> Simple things should be simple. Complex things should be possible.

**Simple usage:**

```typescript
const runtime = createInteractionRuntime();
runtime.page.mount("Dashboard");
runtime.page.transition("Settings");
```

**Advanced usage:**

```typescript
const runtime = createInteractionRuntime({
  middleware: [
    policyMiddleware({ rules: [...] }),
    auditMiddleware({ maxEntries: 10000 }),
    priorityMiddleware(),
  ],
});
```

The basic API requires no configuration. Advanced capabilities are opt-in via composition.

---

## 9. Programmability / 可编程性

> UI is not static — it is a programmable surface.

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

---

## 10. Incremental Adoption / 增量采用

> Start small, add capabilities as needed.

Stage 1 delivers a minimal runtime. Each subsequent stage adds capabilities without breaking existing code:

| Add...                           | Without changing...          |
| -------------------------------- | ---------------------------- |
| Governance (STAGE-002)           | Interaction Core (STAGE-001) |
| Semantic Theme (STAGE-003)       | Runtime or Governance        |
| Modal/Drawer modules (STAGE-004) | Core, Governance, or Theme   |

The architecture supports additive growth, not rewrites.
