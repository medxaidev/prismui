# ADR-005: Page as Runtime Resource

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** High — redefines pages from JSX component trees to runtime-managed entities

---

## Context

In traditional React applications, pages are React components rendered by a router:

```tsx
<Route path="/dashboard" component={Dashboard} />
<Route path="/patient/:id" component={PatientDetail} />
```

Page state (current page, navigation history, lock status) is managed by:
- React Router (URL-based)
- Component-local state (`useState`, `useReducer`)
- Context providers scattered through the tree

This creates several problems for enterprise applications:
- **No centralized control** — no single authority over page lifecycle
- **No lock mechanism** — cannot prevent navigation during critical procedures
- **No orchestration** — pages cannot be programmatically mounted/transitioned from external systems
- **No audit trail** — page transitions are not tracked by default
- **Framework coupling** — page lifecycle is tied to React Router and React lifecycle

---

## Decision

In PrismUI 2.0, **pages are Runtime Resources** — managed entities with explicit lifecycle, controlled entirely by the Interaction Core.

### Page lifecycle:

```typescript
runtime.page.mount("Dashboard")       // Register page as available
runtime.page.transition("Dashboard")  // Set as current page
runtime.page.lock()                   // Prevent all transitions
runtime.page.unlock()                 // Allow transitions again
runtime.page.unmount("Dashboard")     // Remove page from registry
```

### Pages are NOT:
- ❌ React components (they have string IDs, not JSX)
- ❌ URL routes (runtime-managed, not URL-managed)
- ❌ Component trees (rendered by Layer 3, not by the page itself)

### Pages ARE:
- ✅ String identifiers registered with the Runtime
- ✅ Runtime-managed resources with lifecycle events
- ✅ Lockable, transitionable, orchestratable units
- ✅ Mappable to React components via `PageRenderer`

### State representation:

```typescript
interface RuntimeState {
  currentPage: string | null;     // Active page ID
  mountedPages: string[];         // All available page IDs
  locked: boolean;                // Whether transitions are blocked
  // ...
}
```

### Event flow for page transition:

```
runtime.page.transition("PatientDetail")
    → dispatch({ type: "PAGE_TRANSITION", payload: { pageId: "PatientDetail" } })
    → Scheduler processes
    → [Policy check: is page locked? is page mounted?]
    → Handler: store.setState(prev => ({ ...prev, currentPage: "PatientDetail" }))
    → Subscribers notified
    → React Adapter re-renders
    → PageRenderer displays PatientDetail component
```

---

## Consequences

### Positive
- **Centralized control** — one source of truth for page state
- **Lockable** — `runtime.page.lock()` prevents ALL transitions, no workarounds
- **Programmable** — external systems can control page navigation via event dispatch
- **Auditable** — every page transition is a logged event
- **Testable** — page lifecycle can be tested in pure Node.js without rendering
- **Orchestratable** — multi-page workflows can be defined as event sequences

### Negative
- Additional abstraction layer between "page" concept and React rendering
- Existing React Router patterns must be adapted or bridged
- String-based page IDs require a registry mapping to actual components

### Mitigation
- `PageRenderer` component maps page IDs to React components automatically
- Can coexist with React Router for URL management (Router syncs with Runtime)
- Page ID registry is simple: `{ Dashboard: DashboardComponent, ... }`

---

## Use Cases

### Page Lock During Procedure
```typescript
// Doctor starts a procedure
runtime.page.lock();
// ... procedure in progress ...
// All navigation blocked until explicitly unlocked
runtime.page.unlock();
```

### Automated Dashboard Control
```typescript
// External monitoring system triggers page switch
runtime.dispatch({
  type: "PAGE_TRANSITION",
  payload: { pageId: "AlertDashboard" },
  source: "monitoring-system"
});
```

### Workflow Orchestration
```typescript
// Sequential page flow enforced by policy
const workflow = ["PatientIntake", "Diagnosis", "Prescription", "Summary"];
for (const page of workflow) {
  runtime.page.transition(page);
  await waitForUserCompletion();
}
```

---

## References

- [RUNTIME-CORE.md §4 PageOrchestrator](../architecture/PRISMUI-RUNTIME.md)
- [ARCHITECTURE.md §3.2 Layer 0](../architecture/PRISMUI-ARCHITECTURE.md)
- [RULES.md Rule 16](../RULES.md)
- [DESIGN-PRINCIPLES.md §1 Runtime First](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
