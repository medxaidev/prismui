# PrismUI 2.0 Development Stages

This document defines the progressive stages of PrismUI 2.0 development.
Each stage builds upon the previous one and introduces new capabilities.

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

**Core Principle:** Each stage must be **complete before the next begins**. No partial infrastructure, no deferred core logic, no tails. The stage's core deliverables must be fully functional, tested, and documented.

---

## Stage Overview

| Stage | Name                                                | Status         | Focus                                                                                                          | Tests |
| ----- | --------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| 1     | [Runtime Core](./STAGE-001-runtime-core.md)         | 🔄 In Progress | EventBus, Store, Scheduler (Reducer Commit), Module System, Built-in Modules (Page+Modal), React Adapter, Demo | ~107  |
| 2     | [Governance Layer](./STAGE-002-governance-layer.md) | Planned        | Policy Engine, Audit Trail, Replay, Priority Scheduler                                                         | ~80   |
| 3     | Semantic Theme                                      | Planned        | Token Layer, Semantic Intent, Behavior Derivation                                                              | ~60   |
| 4     | Interaction Modules                                 | Planned        | Modal Runtime, Drawer Runtime, Notification Runtime                                                            | TBD   |
| 5     | Form & Async Runtime                                | Planned        | Form State Runtime, Async State Runtime                                                                        | TBD   |
| 6     | Page Orchestration                                  | Planned        | Page lifecycle, scheduling, priority, workflow                                                                 | TBD   |
| 7     | Interaction DSL                                     | Planned        | `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()`                                                       | TBD   |
| 8     | DevTools & Automation                               | Planned        | Runtime Inspector, Event Replay UI, AI Agent interface                                                         | TBD   |

---

## Stage 1: Runtime Core (In Progress)

**Goal:** Build the minimal viable Interaction Runtime — a framework-agnostic event-driven orchestration engine with React adapter and minimal demo.

**Deliverables:**

- EventBus (dispatch, subscribe, type-filtered, history)
- RuntimeStore (extensible immutable state, versioned snapshots)
- Scheduler (Reducer Commit Engine with `ReducerCommitResult`, middleware chain)
- Module System (`RuntimeModule` interface, module/middleware injection)
- Built-in Modules: Page Module (`createPageModule()`), Modal Module (`createModalModule()`)
- Runtime Factory (`createInteractionRuntime({ modules, middleware })`)
- React Adapter (Provider, useRuntime, useRuntimeState via `useSyncExternalStore`, usePage, useModal)
- Minimal Demo (page transition, modal mount, page lock, event history with version tracking)

**Dependencies:** None (foundational stage)  
**Detail:** [STAGE-001-runtime-core.md](./STAGE-001-runtime-core.md)

---

## Stage 2: Governance Layer (Planned)

**Goal:** Add enterprise-grade control capabilities as Scheduler middleware around the Reducer Commit Engine.

**Deliverables (in order):**

1. Audit Trail (immutable event log with prevState/nextState snapshots)
2. Replay System (deterministic event replay with state hash verification)
3. Policy Engine (rule-based event validation: allow/deny/transform)
4. Priority Scheduler (event priority levels, conflict resolution — optional)

**Prerequisites:** Stage 1 complete with Reducer Commit Model (ADR-006)  
**Detail:** [STAGE-002-governance-layer.md](./STAGE-002-governance-layer.md)

---

## Stage 3: Semantic Theme (Planned)

**Goal:** Implement the three-layer theme derivation system.

**Deliverables:**

- Token Layer (colors, spacing, typography, radius, shadow, motion)
- Semantic Intent Layer (intent.primary, intent.destructive, etc.)
- Behavior Derivation Layer (intent → runtime behaviors)
- Theme override APIs (token, semantic, behavior)
- `useTheme()` hook for React adapter

**Dependencies:** Stage 2 complete

---

## Stage 4: Interaction Modules (Planned)

**Goal:** Build runtime-controlled interaction modules.

**Deliverables:**

- Modal Runtime (modal stack, z-index, escape handling)
- Drawer Runtime (drawer stack, positioning)
- Notification Runtime (notification queue, auto-dismiss)
- Minimal renderers for React

**Dependencies:** Stage 3 complete

---

## Stage 5: Form & Async Runtime (Planned)

**Goal:** Runtime-managed form state and async operation lifecycle.

**Deliverables:**

- Form State Runtime (validation, submission, field tracking)
- Async State Runtime (loading, success, error lifecycle)
- Integration with Policy Engine for form validation rules

**Dependencies:** Stage 4 complete

---

## Stage 6: Page Orchestration (Planned)

**Goal:** Advanced page lifecycle management.

**Deliverables:**

- Page priority scheduling
- Page lifecycle hooks (onMount, onUnmount, onTransition)
- Inter-page communication via Runtime events
- Workflow engine (sequential page flows)

**Dependencies:** Stage 5 complete

---

## Stage 7: Interaction DSL (Planned)

**Goal:** High-level API for common interaction patterns.

**Deliverables:**

- `ui.modal.open({ ... })` — programmatic modal control
- `ui.confirm({ ... })` — confirmation dialog with Promise
- `ui.notify({ ... })` — notification dispatch
- `ui.workflow.start({ ... })` — workflow initiation
- DSL type safety and autocomplete

**Dependencies:** Stage 6 complete

---

## Stage 8: DevTools & Automation (Planned)

**Goal:** Developer tooling and automation interfaces.

**Deliverables:**

- Runtime Inspector (visual state viewer)
- Event Replay UI (time-travel debugging)
- AI Agent interface (event dispatch API for automated systems)
- Performance monitoring

**Dependencies:** Stage 7 complete

---

## Stage Completion Criteria (ENFORCED)

A stage is considered complete **only when ALL of the following are true**:

1. **All planned deliverables are implemented** — no partial infrastructure
2. **All code has comprehensive tests** — meeting coverage targets
3. **`tsc --noEmit` is clean** — zero TypeScript errors
4. **Documentation is complete** — stage doc, architecture updates, ADRs
5. **No regressions** — all previous stage tests still pass
6. **Stage document is frozen** — no further changes after completion

---

## Stage Transition Rules (ENFORCED)

- **MUST NOT** start Stage N+1 until Stage N is complete
- **MUST NOT** defer core infrastructure to later phases within a stage
- **MUST** document any stage scope changes in ADR
- **MUST** update this document when stages change
- **MAY** add deliverables to current stage if needed by MedXAI
