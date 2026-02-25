# ADR-001: Framework-Agnostic Interaction Core

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — defines the fundamental separation between runtime and framework

---

## Context

PrismUI 1.x was built as a React-dependent component library. The Runtime Kernel (introduced in STAGE-005) provided module registration and overlay management, but was still deeply coupled to React Context and lifecycle.

As PrismUI evolves toward a programmable Interaction Runtime, the core must be usable beyond React:

- **Vue / Svelte adapters** for cross-framework teams
- **Automated testing** in pure Node.js without jsdom
- **AI agent integration** dispatching events to control UI
- **SSR / CLI / Dashboard engines** that run without a browser
- **MedXAI-specific** workflows that may need headless runtime

---

## Decision

The Interaction Core (Layer 0) MUST be **pure TypeScript with zero external dependencies**.

### What this means:

1. **`packages/core/` has zero framework imports** — no `react`, `react-dom`, `vue`, or any UI framework
2. **`packages/core/` has zero DOM imports** — no `document`, `window`, `HTMLElement`, or browser APIs
3. **All state management is internal** — `RuntimeStore` uses plain objects and callbacks, not React state
4. **All event handling is internal** — `EventBus` uses subscription arrays, not React Context
5. **React is one adapter** — `packages/react/` bridges the core to React via Context and hooks

### Package boundary:

```
packages/core/     ← Pure TypeScript. Zero dependencies. Runs anywhere.
packages/react/    ← React adapter. Depends on core + react.
packages/vue/      ← Future Vue adapter. Depends on core + vue.
packages/demo/     ← Demo app. Depends on react adapter.
```

---

## Consequences

### Positive

- Core is testable in pure Node.js (fast, no jsdom overhead)
- Core can be consumed by any framework or no framework
- Enables AI agents and automated systems to control UI via event dispatch
- Clean separation of concerns — behavior vs rendering
- Future-proof for framework ecosystem changes

### Negative

- React adapter adds indirection (hook wrappers, Context bridge)
- Two packages to maintain instead of one
- Some React-specific optimizations (useSyncExternalStore, concurrent mode) require adapter-level work

### Neutral

- The core is slightly more verbose than a React-only approach (explicit subscriptions vs hooks)
- TypeScript interfaces must be defined for cross-package contracts

---

## Enforcement

- **CI check**: `packages/core/` must pass a lint rule that forbids `react`, `react-dom`, `document`, `window` imports
- **Code review**: any PR touching `packages/core/` must verify framework isolation
- **Rule 3** in RULES.md explicitly mandates this

---

## References

- [ARCHITECTURE.md §2.3 Framework Isolation](../architecture/PRISMUI-ARCHITECTURE.md)
- [ADAPTER-LAYER.md](../architecture/PRISMUI-ADAPTER-REACT.md)
- [RULES.md Rule 3](../RULES.md)
- PrismUI 1.x ADR-011: Runtime Platform Architecture (precursor)
