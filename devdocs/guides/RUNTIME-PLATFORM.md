# Runtime Platform Guide

> PrismUI's Runtime Platform is a modular kernel that orchestrates overlay management, focus trapping, scroll locking, and programmatic dialog control.

---

## Architecture Overview

The Runtime Platform follows a **four-layer model**:

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| 1 — Runtime | `RuntimeKernel`, modules | Orchestration, module lifecycle |
| 2 — Behavior | `ModalBase` | Portal, focus trap, scroll lock, transitions |
| 3 — Semantic | `Dialog` | Header, body, footer, close button, sizing |
| 4 — Programmatic | `DialogController` | Imperative `confirm()`, `alert()`, `open()`/`close()` |

---

## Getting Started

### 1. Register Modules

```tsx
import { PrismuiProvider } from '@prismui/core';
import { overlayModule, dialogModule } from '@prismui/core';

function App() {
  return (
    <PrismuiProvider modules={[overlayModule(), dialogModule()]}>
      <YourApp />
      <DialogRenderer />
    </PrismuiProvider>
  );
}
```

### 2. Module Lifecycle

Each module implements the `PrismuiModule` interface:

```typescript
interface PrismuiModule {
  name: string;
  setup(kernel: RuntimeKernel): void;
  teardown?(kernel: RuntimeKernel): void;
}
```

- **`setup()`** — Called synchronously when `PrismuiProvider` mounts. Register services in the kernel.
- **`teardown()`** — Called when `PrismuiProvider` unmounts. Clean up global listeners.

### 3. Accessing the Kernel

```tsx
import { useRuntimeKernel, useExposedApi } from '@prismui/core';

// Direct kernel access
const kernel = useRuntimeKernel();
const overlay = kernel.get('overlay');

// Typed exposed API access
const controller = useExposedApi<DialogController>('dialog');
```

---

## Built-in Modules

### `overlayModule(options?)`

Manages a stack of overlay instances with automatic z-index allocation and global Escape key handling.

```typescript
overlayModule({ baseZIndex: 1000 }) // default
```

**Registers**: `OverlayManager` as `'overlay'`

**Features**:
- Stack-based z-index allocation (base + index × 10)
- Global `keydown` listener for Escape (closes topmost overlay with `closeOnEscape: true`)
- SSR-safe (checks `typeof document`)
- Contiguous z-index re-allocation on unregister

### `dialogModule()`

Provides programmatic dialog control via `DialogController`.

```typescript
dialogModule()
```

**Registers**: `DialogController` as `'dialog'`

**Features**:
- `open()` / `close()` / `closeAll()` for manual control
- `confirm()` returns `Promise<boolean>`
- `alert()` returns `Promise<void>`
- Subscriber pattern for reactive rendering

---

## Creating Custom Modules

```typescript
import type { PrismuiModule } from '@prismui/core';

function analyticsModule(): PrismuiModule {
  return {
    name: 'analytics',
    setup(kernel) {
      const tracker = createTracker();
      kernel.register('analytics', tracker);
      kernel.expose('analytics', tracker);
    },
    teardown() {
      // cleanup
    },
  };
}
```

---

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useRuntimeKernel()` | Access the kernel instance |
| `useRuntimeKernelOptional()` | Access kernel or `null` (no throw) |
| `useRuntimeModule(name)` | Get a registered module by name |
| `useExposedApi(name)` | Get an exposed API by name |
| `useOverlayManager()` | Get the OverlayManager |
| `useOverlay(options)` | Register an overlay instance |
| `useDialogController()` | Get the DialogController |

---

## Test Coverage

| Area | Tests |
|------|-------|
| Runtime Kernel | 27 |
| OverlayManager | 23 |
| overlayModule | 8 |
| useOverlay | 14 |
| ModalBase | 24 |
| Dialog | 21 |
| DialogController | 24 |
| dialogModule + Renderer | 14 |
| **Total** | **155+** |
