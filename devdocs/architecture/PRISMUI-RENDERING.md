# Layer 3 — Rendering Layer

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-004+  
> **Location:** `packages/react/src/renderers/`

---

## Overview

The Rendering Layer is the **visual output layer** of PrismUI 2.0. It receives state from the Framework Adapter (Layer 2) and renders UI elements accordingly. It contains **zero orchestration logic** — all behavior is driven by the Runtime.

**Principle:** Renderers are pure functions of Runtime state. Given the same state, they produce the same visual output.

---

## Components

### 1. PageRenderer

Renders the current page based on Runtime state.

```tsx
interface PageRendererProps {
  pages: Record<string, React.ComponentType>;
}

function PageRenderer({ pages }: PageRendererProps): JSX.Element {
  const { currentPage } = useRuntimeState();

  if (!currentPage || !pages[currentPage]) {
    return null;
  }

  const Page = pages[currentPage];
  return <Page />;
}
```

**Responsibilities:**
- Map `currentPage` string ID to React component
- Render the matched component
- No transition logic (owned by Runtime)

---

### 2. ModalRenderer (Future: STAGE-004)

Renders the modal stack from Runtime state.

```tsx
function ModalRenderer(): JSX.Element {
  const { modalStack } = useRuntimeState();

  return (
    <>
      {modalStack.map((modalId) => (
        <ModalContainer key={modalId} id={modalId} />
      ))}
    </>
  );
}
```

**Responsibilities:**
- Iterate `modalStack` array
- Render each modal with proper z-ordering
- Apply transitions and animations
- No stack management logic (owned by Runtime)

---

### 3. DrawerRenderer (Future: STAGE-004)

Renders drawer state (side panels).

---

### 4. NotificationRenderer (Future: STAGE-004)

Renders notification queue (toasts, alerts).

---

## Styling Strategy

Renderers consume **Semantic Intent** values from the Theme system, not raw tokens.

```tsx
// ❌ Prohibited — direct token reference
<div style={{ backgroundColor: theme.tokens.color.red[500] }}>

// ✅ Required — semantic intent
<div style={{ backgroundColor: theme.intent.destructive.background }}>
```

---

## Hard Constraints

| Rule | Description |
|------|-------------|
| **R-01** | Renderers MUST NOT contain scheduling or orchestration logic |
| **R-02** | Renderers MUST NOT call `runtime.dispatch()` for state management |
| **R-03** | Renderers MUST NOT hold global interaction state |
| **R-04** | All visual output is a pure function of Runtime state |
| **R-05** | Renderers use Semantic Intent, not raw tokens |
| **R-06** | User event handlers (onClick, etc.) delegate to `runtime.dispatch()` |

---

## Relationship to Other Layers

```
Layer 3 (Rendering)
    │
    │ subscribes to state via
    ▼
Layer 2 (Adapter: useRuntimeState)
    │
    │ bridges state from
    ▼
Layer 0 (Runtime: RuntimeStore)
```

Renderers are **consumers**, not **producers**. They display what the Runtime tells them to display.
