# PrismUI 2.0 — Roadmap

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Status:** Active Development

---

## Vision

> **PrismUI 2.0 is a Framework-Agnostic Interaction Runtime — a programmable, deterministic UI orchestration engine.**

PrismUI 2.0 is not a component library. It is a **UI Operating System Kernel** that provides:

- **Interaction Runtime** — Modal, Drawer, Notification, Form, Workflow as a unified schedulable system
- **Constraint-Based UI** — Profile-driven rules for validation, layout rhythm, approval flows
- **Semantic Theme** — Token → Semantic Intent → Behavior Derivation (not just colors)
- **Programmable UI** — `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()`

---

## Why 2.0?

PrismUI 1.x evolved from a component library to a runtime platform (at STAGE-005). The key insight:

| Realization | Implication |
|-------------|-------------|
| Runtime controls behavior better than components | Rebuild with Runtime-first from Day 1 |
| React is just a rendering adapter | Core must be framework-agnostic TypeScript |
| Pages are resources, not JSX trees | Page Orchestration as a first-class concept |
| Theme is more than colors | Semantic Intent → Behavior Derivation |
| Governance is essential for enterprise | Policy, Audit, Replay built into Layer 1 |
| UI should be programmable | Interaction DSL for automation + AI agents |

---

## Three Pillars

### 1. Provider-Centric Architecture

- NOT a component library — not chasing component coverage or visual templates
- Runtime capabilities delivered via **Provider + Context + Module injection**
- Through injection, not wrapping

### 2. Semantic Theme System

- **Token Layer** — colors, spacing, typography (base variables)
- **Semantic Layer** — `intent.primary`, `intent.destructive`, `intent.safe` (meaning)
- **Behavior Derivation** — `if (intent === "destructive") → autoConfirm + auditLog + highContrast`

### 3. Unified Interaction Runtime

- Modal stack, Drawer stack, Notification queue, Confirm flow
- Async state management, Form Runtime, Workflow engine
- **Interaction DSL**: `ui.modal.open({...})`, `ui.confirm({...})`, `ui.workflow.start(...)`

---

## Four-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — Rendering Layer (React / Vue / WebComponent)     │
│  ModalRenderer, DrawerRenderer, NotificationRenderer        │
│  Pure rendering. No business logic.                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Framework Adapter (React Adapter)                │
│  Provider, useRuntime(), usePage(), useModal()              │
│  Thin bridge. Subscribe runtime → trigger re-render.        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Governance Layer (Pure TypeScript)               │
│  Policy Engine, Audit Trail, Replay, Priority Scheduling    │
│  Enterprise-grade control. Page Lock, Interaction Policy.   │
├─────────────────────────────────────────────────────────────┤
│  Layer 0 — Interaction Core (Pure TypeScript)               │
│  EventBus, RuntimeStore, Scheduler, PageOrchestrator        │
│  Framework-agnostic. Zero dependencies.                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Stage Plan

| Stage | Name | Status | Focus |
|-------|------|--------|-------|
| 1 | Runtime Core | 🔄 In Progress | EventBus, Store, Scheduler, PageController, React Adapter, Demo |
| 2 | Governance Layer | Planned | Policy Engine, Audit Trail, Replay, Priority Scheduler |
| 3 | Semantic Theme | Planned | Token Layer, Semantic Layer, Behavior Derivation |
| 4 | Interaction Modules | Planned | Modal Runtime, Drawer Runtime, Notification Runtime |
| 5 | Form & Async Runtime | Planned | Form State Runtime, Async State Runtime |
| 6 | Page Orchestration | Planned | Page lifecycle, Page scheduling, Page priority |
| 7 | Interaction DSL | Planned | `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()` |
| 8 | DevTools & Automation | Planned | Runtime Inspector, Event Replay UI, AI Agent interface |

---

## Long-Term Capabilities

### Programmable UI
```typescript
ui.runtime.dispatch({ type: "OPEN_MODAL", payload: { id: "approval" } })
```

- UI is schedulable, controllable, remotely operable, automatable
- AI agents can dispatch events
- Automated systems can trigger workflows
- Dashboard becomes a Runtime, not a static component tree

### Three-Layer Extension System
```typescript
// 1. Token Override (Static)
runtime.theme.overrideTokens({ color: { primary: 'indigo' } })

// 2. Semantic Override (Rules)
runtime.theme.overrideIntent("destructive", { requireConfirm: true })

// 3. Behavior Override (Runtime)
runtime.interaction.override("modal", { animation: 'none' })
```

### Cross-Framework
- Core runs without React — can be used with Vue, Svelte, or bare TypeScript
- Suitable for SSR, CLI tools, Dashboard engines, automated testing

---

## Relationship to PrismUI 1.x

PrismUI 1.x (legacy) built 12 stages of component infrastructure with 1674 tests. Key learnings preserved:

- **Runtime Kernel pattern** (from STAGE-005) → elevated to foundational Layer 0
- **Four-layer architecture** (from ADR-011) → generalized beyond overlays to all interactions
- **Module injection** (from PrismuiProvider) → expanded to full Interaction Runtime
- **Overlay/Dialog/Toast patterns** → will be reimplemented as Runtime modules in STAGE-004

PrismUI 2.0 is a **clean rewrite** — the architecture is designed Runtime-first, not bolted on.
