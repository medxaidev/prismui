# Overlay System Guide

> The Overlay System manages a stack of overlay instances, handling z-index allocation, Escape key dismissal, and scroll locking.

---

## Overview

The Overlay System is the foundation for all overlay-based components in PrismUI (modals, dialogs, drawers, popovers). It ensures:

- **Correct stacking** — Each overlay gets a unique z-index
- **Escape key handling** — Only the topmost overlay responds to Escape
- **Scroll lock coordination** — Body scroll is locked when any overlay requests it
- **Clean lifecycle** — Overlays are automatically unregistered on unmount

---

## Setup

Register `overlayModule()` in your `PrismuiProvider`:

```tsx
import { PrismuiProvider, overlayModule } from '@prismui/core';

<PrismuiProvider modules={[overlayModule()]}>
  <App />
</PrismuiProvider>
```

### Custom Base Z-Index

```tsx
overlayModule({ baseZIndex: 2000 })
```

Default base is `1000`. Each overlay increments by `10` (1000, 1010, 1020, …).

---

## OverlayManager API

The `OverlayManager` is the core engine. You rarely interact with it directly — use `useOverlay()` instead.

```typescript
interface OverlayManager {
  register(instance: OverlayInstanceOptions): void;
  unregister(id: string): void;
  getStack(): OverlayInstance[];
  getZIndex(id: string): number;
  isTopmost(id: string): boolean;
  handleEscape(): void;
  shouldLockScroll(): boolean;
}
```

### Stack Behavior

| Action | Result |
|--------|--------|
| Register overlay A | Stack: [A] — z-index 1000 |
| Register overlay B | Stack: [A, B] — z-indices 1000, 1010 |
| Register overlay C | Stack: [A, B, C] — z-indices 1000, 1010, 1020 |
| Unregister B | Stack: [A, C] — z-indices re-allocated to 1000, 1010 |

### Escape Key

When Escape is pressed, the manager walks the stack **top-down** and closes the first overlay with `closeOnEscape: true`.

---

## useOverlay Hook

The primary hook for components that need overlay behavior:

```tsx
import { useOverlay } from '@prismui/core';

function MyOverlay({ opened, onClose }) {
  const { zIndex, isActive, overlayId } = useOverlay({
    opened,
    onClose,
    trapFocus: true,      // default: true
    closeOnEscape: true,   // default: true
    lockScroll: true,      // default: true
  });

  if (!opened) return null;

  return (
    <div style={{ zIndex, position: 'fixed' }}>
      {isActive && <span>I am the topmost overlay</span>}
    </div>
  );
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `zIndex` | `number` | Allocated z-index from the manager |
| `isActive` | `boolean` | Whether this is the topmost overlay |
| `overlayId` | `string` | Unique ID for this overlay instance |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `opened` | `boolean` | — | Whether the overlay is currently open |
| `onClose` | `() => void` | — | Called when the overlay should close |
| `trapFocus` | `boolean` | `true` | Whether to trap keyboard focus |
| `closeOnEscape` | `boolean` | `true` | Whether Escape closes this overlay |
| `lockScroll` | `boolean` | `true` | Whether to lock body scroll |

---

## Nested Overlays

Overlays stack naturally. Each gets its own z-index, and Escape only closes the topmost:

```tsx
function App() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);

  return (
    <>
      <Dialog opened={first} onClose={() => setFirst(false)} title="First">
        <button onClick={() => setSecond(true)}>Open Second</button>
      </Dialog>

      <Dialog opened={second} onClose={() => setSecond(false)} title="Second">
        Press Escape to close only this dialog.
      </Dialog>
    </>
  );
}
```

---

## Scroll Lock

Scroll locking uses a reference-counted approach:

- When the first overlay with `lockScroll: true` opens, `document.body.style.overflow` is set to `'hidden'`
- When the last such overlay closes, the original overflow value is restored
- Nested overlays share the lock — no flicker between open/close

---

## Storybook Stories

See `Runtime/OverlayRuntime` in Storybook for interactive examples:

- **Single Overlay** — Basic overlay registration
- **Nested Overlays** — Stack with multiple levels
- **Stack Inspector** — Real-time view of the overlay stack
- **Escape Key Behavior** — Demonstrates topmost-only closing
- **Custom Base Z-Index** — Non-default z-index base
