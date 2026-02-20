# Toast Component — Architecture Design

## Overview

Toast provides non-intrusive, temporary notifications that appear at screen edges and auto-dismiss. Inspired by **Sonner** (stacking animation), **Mantine Notifications** (queue management), and **MUI Snackbar** (simplicity).

### Key Differentiators from References

| Feature | Mantine | MUI Snackbar | Sonner | PrismUI Toast |
|---------|---------|-------------|--------|---------------|
| Multiple toasts | ✅ | ❌ | ✅ | ✅ |
| Stacking animation | ❌ | ❌ | ✅ | ✅ |
| Queue management | ✅ | ❌ | ❌ | ✅ |
| Promise state | ❌ | ❌ | ✅ | ✅ |
| Severity variants | ✅ | ✅ | ✅ | ✅ |
| Programmatic API | ✅ | ❌ | ✅ | ✅ (Layer 4) |

---

## Four-Layer Architecture

```
Layer 1: Box (primitive)
Layer 2: ToastBase — behavior (auto-dismiss, stacking, transitions, positioning)
Layer 3: Toast — semantic styling (default/primary/info/success/warning/error/promise)
Layer 4: ToastController — programmatic API (toast.show/success/error/warning/info/promise)
```

---

## Layer 2: ToastBase

### Purpose

Unstyled behavioral foundation for toast notifications. Manages:
- Auto-dismiss timer (pause on hover)
- Enter/exit transitions
- Stacking layout (Sonner-style: visible toasts stack with scale + translateY)
- Position variants (6 positions)
- Swipe-to-dismiss gesture

### Files

```
components/ToastBase/
├── ToastBase.tsx              — Main container (renders positioned toast list)
├── ToastBase.context.tsx      — Shared context for toast region
├── ToastBaseItem.tsx           — Individual toast item (transition, timer, swipe)
├── ToastBase.module.css        — Minimal positioning & stacking CSS
└── index.ts                    — Barrel exports
```

### Types

```typescript
// Position of the toast container on screen
type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Data for a single toast
interface ToastData {
  id: string;
  // Content
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;          // Custom action button area
  // Behavior
  duration?: number;                  // Auto-dismiss ms, 0 = no auto-dismiss
  dismissible?: boolean;              // Show close button, default true
  // Callbacks
  onClose?: (id: string) => void;
  onAutoClose?: (id: string) => void;
  // Internal
  createdAt: number;
}

// ToastBase props
interface ToastBaseProps {
  /** Toasts to render */
  toasts: ToastData[];
  /** Position on screen @default 'bottom-right' */
  position?: ToastPosition;
  /** Max visible toasts before stacking @default 3 */
  visibleToasts?: number;
  /** Whether expanded (show all) or collapsed (Sonner-style stack) @default false */
  expanded?: boolean;
  /** Gap between toasts in px @default 14 */
  gap?: number;
  /** Container width @default 356 */
  width?: number | string;
  /** Transition duration ms @default 300 */
  transitionDuration?: number;
  /** z-index @default 1500 */
  zIndex?: number;
  /** Render function for each toast */
  renderToast: (data: ToastData, handlers: ToastHandlers) => React.ReactNode;
  /** Called when a toast should be removed */
  onRemove: (id: string) => void;
}

interface ToastHandlers {
  close: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}
```

### Stacking Behavior (Sonner-style)

When `expanded=false` (default), toasts stack visually:
- **Front toast** (index 0): `scale(1)`, `translateY(0)`, full opacity
- **Second toast** (index 1): `scale(0.95)`, `translateY(-8px)`, opacity 0.8
- **Third toast** (index 2): `scale(0.9)`, `translateY(-16px)`, opacity 0.6
- **Beyond visible**: hidden with `opacity: 0`, `scale(0.85)`

On hover over the toast container → `expanded=true` → all toasts spread out with gap.

### Enter/Exit Transitions

- **Enter**: Slide in from edge + fade (direction based on position)
  - `bottom-*`: slide up from below
  - `top-*`: slide down from above
- **Exit**: Slide out + fade + collapse height (smooth reflow)
- **Timing**: `cubic-bezier(0.4, 0, 0.2, 1)` for enter, `cubic-bezier(0.4, 0, 1, 1)` for exit

---

## Layer 3: Toast

### Purpose

Semantic styling layer. Applies visual design per severity variant.

### Files

```
components/Toast/
├── Toast.tsx                  — Styled toast component
├── Toast.module.css           — Severity-specific styles
├── Toast.test.tsx             — Tests
├── Toast.stories.tsx          — Storybook stories
└── index.ts                   — Barrel exports
```

### Severity Variants

#### 1. `default`

Dark style toast (like Sonner's default):

```
┌─────────────────────────────────────┐
│  Title                          [×] │
│  Description text                   │
└─────────────────────────────────────┘
```

```css
color: var(--prismui-common-white);
background-color: var(--prismui-color-gray-800);
/* gray-800 is from colorFamilies.gray[800] — we need to emit this var */
```

- Title: 13px, `var(--prismui-common-white)`
- Description: 13px, `rgba(var(--prismui-common-whiteChannel) / 70%)`

#### 2. `primary` / `info` / `success` / `warning` / `error`

White background with colored icon area:

```
┌──────────────────────────────────────────────┐
│ ┌──────┐                                     │
│ │ Icon │  Title                         [×]  │
│ │  24  │  Description text                   │
│ └──────┘                                     │
└──────────────────────────────────────────────┘
```

**Overall layout:**
```css
padding: 4px 8px 4px 4px;
background-color: var(--prismui-background-paper);
border: solid 1px rgba(var(--prismui-color-gray-500Channel) / 12%);
border-radius: 12px;
box-shadow: var(--prismui-shadow-dropdown);
```

**Three-area layout** (horizontal, gap: 12px):
1. **Icon area** (48×48px)
2. **Title + Description area** (flex: 1)
3. **Action button area** (optional, user-provided)

**Icon area:**
```css
width: 48px;
height: 48px;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
background-color: color-mix(in srgb, currentcolor 8%, transparent);
```

Icon color per severity:
```css
/* primary */  color: var(--prismui-primary-main);
/* info */     color: var(--prismui-info-main);
/* success */  color: var(--prismui-success-main);
/* warning */  color: var(--prismui-warning-main);
/* error */    color: var(--prismui-error-main);
```

Icon size: **24px**

**Title:**
```css
font-size: 13px;
font-weight: 600;
color: var(--prismui-text-primary);
```

**Description:**
```css
font-size: 13px;
color: var(--prismui-text-secondary);
```

#### 3. `promise` (loading state)

Same layout as severity variants, but:
- Icon area uses **neutral** styling
- Icon is the system `<Loader>` component at 24px
- Title/description update dynamically based on promise state

```typescript
toast.promise(myAsyncFn, {
  loading: { title: 'Uploading...', description: 'Please wait' },
  success: { title: 'Uploaded!', description: 'File saved' },
  error: { title: 'Failed', description: 'Upload error' },
});
```

Promise state flow:
1. **Loading**: neutral icon area + Loader, title/desc from `loading`
2. **Success**: transitions to success variant styling
3. **Error**: transitions to error variant styling

### Close Button

Similar to ModalBase's close button design:
- Small `×` icon button (16×16 icon, 28×28 hit area)
- Positioned at top-right of the toast
- Visible by default (`dismissible: true`)
- On hover: subtle background highlight

### Toast Component Props

```typescript
type ToastSeverity = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  /** Severity variant @default 'default' */
  severity?: ToastSeverity;
  /** Toast title */
  title?: React.ReactNode;
  /** Toast description */
  description?: React.ReactNode;
  /** Custom icon (overrides severity default) */
  icon?: React.ReactNode;
  /** Custom action area (buttons, links) */
  action?: React.ReactNode;
  /** Show close button @default true */
  dismissible?: boolean;
  /** Loading state (for promise toasts) */
  loading?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
}
```

### Default Icons per Severity

Each severity has a default SVG icon (24px):
- **info**: ℹ circle
- **success**: ✓ circle
- **warning**: ⚠ triangle
- **error**: ✕ circle
- **primary**: same as info

---

## Layer 4: ToastController

### Purpose

Programmatic API for imperative toast management. Integrates with RuntimeKernel.

### Files

```
core/runtime/toast/
├── types.ts                   — ToastController types
├── ToastController.ts         — Controller factory (queue, timer, state)
├── toastModule.ts             — Runtime module registration
├── useToastController.ts      — React hook
├── ToastRenderer.tsx           — Subscribes to controller, renders ToastBase + Toast
├── ToastController.test.ts    — Tests
└── index.ts                   — Barrel exports
```

### API Design

```typescript
interface ToastControllerOptions {
  /** Toast title */
  title?: React.ReactNode;
  /** Toast description / message */
  description?: React.ReactNode;
  /** Severity @default 'default' */
  severity?: ToastSeverity;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom action area */
  action?: React.ReactNode;
  /** Auto-dismiss duration ms @default 4000, 0 = no auto-dismiss */
  duration?: number;
  /** Show close button @default true */
  dismissible?: boolean;
  /** Position override (per-toast) */
  position?: ToastPosition;
  /** Callback when toast is dismissed */
  onClose?: () => void;
  /** Callback when toast auto-closes */
  onAutoClose?: () => void;
}

interface ToastPromiseOptions<T> {
  loading: { title?: string; description?: string };
  success: { title?: string; description?: string } | ((data: T) => { title?: string; description?: string });
  error: { title?: string; description?: string } | ((err: unknown) => { title?: string; description?: string });
  /** Duration for success/error state before auto-dismiss @default 4000 */
  duration?: number;
}

interface ToastController {
  /** Show a toast. Returns toast id. */
  show(options: ToastControllerOptions): string;

  /** Hide a specific toast by id. */
  hide(id: string): void;

  /** Hide all toasts. */
  hideAll(): void;

  /** Shorthand: show success toast */
  success(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show error toast */
  error(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show warning toast */
  warning(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show info toast */
  info(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Promise toast: loading → success/error */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
  ): string;

  /** Update an existing toast */
  update(id: string, options: Partial<ToastControllerOptions>): void;

  /** Get all active toasts */
  getToasts(): ToastInstance[];

  /** Subscribe to toast state changes */
  subscribe(listener: ToastChangeListener): () => void;
}
```

### Internal State Management

```typescript
interface ToastInstance {
  id: string;
  options: ToastControllerOptions;
  createdAt: number;
  /** For promise toasts: 'loading' | 'success' | 'error' */
  promiseState?: 'loading' | 'success' | 'error';
}
```

The controller uses a `Map<string, ToastInstance>` internally, same pattern as DialogController/PopoverController.

### ToastRenderer

```typescript
function ToastRenderer({
  position = 'bottom-right',
  visibleToasts = 3,
  width = 356,
}: ToastRendererProps)
```

- Subscribes to `ToastController` via `useToastController()`
- Groups toasts by position
- Renders a `ToastBase` per position group
- Each toast item is rendered as a `Toast` component

---

## CSS Variable Reference

All CSS variables used, mapped to the system:

| Usage | CSS Variable |
|-------|-------------|
| Default bg | `var(--prismui-color-gray-800)` — **NOTE: needs new var, see below** |
| Default text | `var(--prismui-common-white)` |
| Semantic bg | `var(--prismui-background-paper)` |
| Border | `rgba(var(--prismui-color-gray-500Channel) / 12%)` |
| Shadow | `var(--prismui-shadow-dropdown)` |
| Title color | `var(--prismui-text-primary)` |
| Description color | `var(--prismui-text-secondary)` |
| Primary icon | `var(--prismui-primary-main)` |
| Info icon | `var(--prismui-info-main)` |
| Success icon | `var(--prismui-success-main)` |
| Warning icon | `var(--prismui-warning-main)` |
| Error icon | `var(--prismui-error-main)` |

### New CSS Variable Needed

`--prismui-color-gray-800` — We need to emit `colorFamilies.gray[800]` as a CSS variable for the default toast background. This requires a small addition to `palette-vars.ts`.

**Alternative**: Use a hardcoded fallback in the CSS:
```css
background-color: var(--prismui-color-gray-800, #212b36);
```

Or we can emit gray scale shades as CSS variables. Decision: **emit `--prismui-color-gray-800`** in `palette-vars.ts` since it's useful beyond just Toast.

---

## Stacking Animation Detail (Sonner-style)

### Collapsed State (default)

```
                    ┌─────────────────────┐  ← toast[0] (front)
                  ┌─┤                     ├─┐  ← toast[1] (scale 0.95, y-8)
                ┌─┤ └─────────────────────┘ ├─┐  ← toast[2] (scale 0.9, y-16)
                └─┤                         ├─┘
                  └─────────────────────────┘
```

CSS for each toast at index `i` (bottom-* positions):
```css
transform: translateY(calc(var(--index) * -8px)) scale(calc(1 - var(--index) * 0.05));
opacity: calc(1 - var(--index) * 0.2);
z-index: calc(var(--total) - var(--index));
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

For top-* positions, `translateY` is positive (pushes down).

### Expanded State (on hover)

```
                ┌─────────────────────────┐  ← toast[0]
                └─────────────────────────┘
                        14px gap
                ┌─────────────────────────┐  ← toast[1]
                └─────────────────────────┘
                        14px gap
                ┌─────────────────────────┐  ← toast[2]
                └─────────────────────────┘
```

Each toast gets `translateY` based on cumulative heights + gap.

### Enter Animation

New toast slides in from edge:
```css
/* bottom-* */
@keyframes toast-enter-bottom {
  from { transform: translateY(100%) scale(1); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

/* top-* */
@keyframes toast-enter-top {
  from { transform: translateY(-100%) scale(1); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
```

### Exit Animation

Toast slides out + collapses:
```css
@keyframes toast-exit {
  0%   { transform: translateY(0); opacity: 1; max-height: var(--height); }
  50%  { transform: translateY(-100%); opacity: 0; max-height: var(--height); }
  100% { transform: translateY(-100%); opacity: 0; max-height: 0; margin: 0; padding: 0; }
}
```

---

## File Creation Order

### Phase 1: ToastBase (Layer 2)
1. `components/ToastBase/ToastBase.context.tsx`
2. `components/ToastBase/ToastBaseItem.tsx`
3. `components/ToastBase/ToastBase.module.css`
4. `components/ToastBase/ToastBase.tsx`
5. `components/ToastBase/index.ts`

### Phase 2: Toast (Layer 3)
6. `components/Toast/Toast.tsx`
7. `components/Toast/Toast.module.css`
8. `components/Toast/Toast.test.tsx`
9. `components/Toast/Toast.stories.tsx`
10. `components/Toast/index.ts`

### Phase 3: ToastController (Layer 4)
11. `core/runtime/toast/types.ts`
12. `core/runtime/toast/ToastController.ts`
13. `core/runtime/toast/toastModule.ts`
14. `core/runtime/toast/useToastController.ts`
15. `core/runtime/toast/ToastRenderer.tsx`
16. `core/runtime/toast/ToastController.test.ts`
17. `core/runtime/toast/index.ts`

### Phase 4: Integration
18. Update `components/index.ts` — barrel exports
19. Update `core/runtime/index.ts` — barrel exports
20. Add `--prismui-color-gray-800` to `palette-vars.ts` (if needed)

---

## Test Plan

### ToastBase Tests (~20)
- Renders toast list
- Auto-dismiss fires after duration
- Pause timer on hover, resume on leave
- Close button calls onRemove
- Stacking: correct transform/opacity per index
- Expanded state on hover
- Position variants (6 positions)
- Enter/exit transitions
- Max visible toasts respected
- Swipe-to-dismiss (optional, stretch)

### Toast Tests (~15)
- Default severity renders dark style
- Each severity variant renders correct colors
- Icon area renders with correct background
- Custom icon overrides default
- Title and description render
- Close button visibility (dismissible prop)
- Action area renders
- Loading state shows Loader
- Promise state transitions (loading → success, loading → error)
- Accessibility: role="alert"

### ToastController Tests (~25)
- show() creates toast and returns id
- hide() removes toast by id
- hideAll() clears all toasts
- success/error/warning/info shorthands set correct severity
- promise() starts in loading state
- promise() transitions to success on resolve
- promise() transitions to error on reject
- update() modifies existing toast
- subscribe() notifies on changes
- Auto-dismiss timer fires
- getToasts() returns current state
- Queue: respects limit
- Multiple positions: toasts grouped correctly

**Total: ~60 tests**

---

## Storybook Stories Plan (~12)

1. **Default** — Dark toast
2. **Severities** — All 6 severity variants side by side
3. **WithAction** — Toast with custom action button
4. **AutoDismiss** — Shows timer countdown
5. **Stacking** — Multiple toasts with Sonner-style stack
6. **Expanded** — Hover to expand stack
7. **Positions** — All 6 positions
8. **Promise** — Loading → Success / Error
9. **NoDismiss** — Without close button
10. **CustomIcon** — Override default severity icon
11. **LongContent** — Title/description overflow handling
12. **ProgrammaticController** — Using toast.show/success/error via Layer 4

---

## Implementation Notes

### Why not use OverlayManager?

Toast does **not** register with OverlayManager because:
- Toasts don't block interaction (no backdrop, no focus trap)
- Toasts have a fixed z-index (1500, above everything)
- Toasts don't participate in the overlay stack (Dialog/Popover)
- Multiple toasts coexist without z-index conflicts

### Sonner-style vs Mantine-style

We follow **Sonner's stacking animation** (collapsed/expanded) rather than Mantine's simple vertical list because:
- More polished visual experience
- Better space efficiency (collapsed by default)
- Hover-to-expand is intuitive
- Smooth height transitions on add/remove

### Auto-dismiss Behavior

- Default duration: **4000ms**
- Hover pauses the timer (like Mantine's NotificationContainer)
- Promise toasts: no auto-dismiss during loading, auto-dismiss after success/error
- `duration: 0` disables auto-dismiss (must be manually closed)
