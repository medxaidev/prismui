# Toast Usage Guide

> Complete guide to using PrismUI's Toast component and programmatic ToastController.

---

## Quick Start

### Programmatic Toast (Layer 4)

```tsx
import { PrismuiProvider, overlayModule, toastModule } from '@prismui/core';
import { createToastRenderer } from '@prismui/core';

// 1. Create renderer
const ToastRenderer = createToastRenderer();

// 2. Wrap your app
<PrismuiProvider modules={[overlayModule(), toastModule()]}>
  <App />
  <ToastRenderer />
</PrismuiProvider>

// 3. Use in components
import { useToastController } from '@prismui/core';

function MyComponent() {
  const toast = useToastController();

  return (
    <button onClick={() => toast.show({ title: 'Saved!' })}>
      Save
    </button>
  );
}
```

---

## ToastController API

### Methods

#### `show(options): string`

Shows a toast and returns its ID.

```tsx
const id = toast.show({
  title: 'File uploaded',
  description: 'Your file has been uploaded successfully.',
  severity: 'success',
  duration: 5000,
});
```

#### `success(options): string`

Shorthand for `show({ severity: 'success', ... })`.

```tsx
toast.success({ title: 'Saved!' });
```

#### `error(options): string`

Shorthand for `show({ severity: 'error', ... })`.

```tsx
toast.error({ title: 'Failed to save', description: 'Please try again.' });
```

#### `warning(options): string`

Shorthand for `show({ severity: 'warning', ... })`.

#### `info(options): string`

Shorthand for `show({ severity: 'info', ... })`.

#### `promise(promise, options): string`

Shows a loading toast that updates on resolve/reject.

```tsx
toast.promise(
  fetch('/api/save'),
  {
    loading: { title: 'Saving...' },
    success: { title: 'Saved!' },
    error: { title: 'Failed to save' },
  },
);
```

The timer resets when the promise resolves or rejects, so the success/error toast gets a fresh auto-dismiss countdown.

#### `dismiss(id): void`

Dismiss a specific toast by ID.

#### `dismissAll(): void`

Dismiss all toasts.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Toast title |
| `description` | `string` | — | Toast description |
| `severity` | `'default' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'default'` | Visual severity |
| `duration` | `number` | `5000` | Auto-dismiss time (ms), `0` = no auto-dismiss |
| `dismissible` | `boolean` | `true` | Show close button |
| `icon` | `ReactNode` | — | Custom icon (overrides severity icon) |

---

## Severity Styles

| Severity | Background | Icon |
|----------|-----------|------|
| `default` | Dark gray (`gray-800`) | None |
| `primary` | White (paper) | InfoIcon |
| `info` | White (paper) | InfoIcon |
| `success` | White (paper) | SuccessIcon |
| `warning` | White (paper) | WarningIcon |
| `error` | White (paper) | ErrorIcon |

Semantic severities (non-default) use a 48px icon frame with `color-mix(in srgb, currentcolor 8%, transparent)` background.

---

## Toast Behavior

- **Auto-dismiss**: Toasts auto-dismiss after `duration` ms (default 5000)
- **Pause on hover**: Timer pauses when mouse enters the toast area
- **Always expanded**: Multiple toasts display as a flat list (no collapsed stacking)
- **Visible limit**: Up to 5 toasts visible at once (configurable via `visibleToasts`)
- **Enter/exit animation**: Expand/collapse style (maxHeight transition)
- **Close button**: Uses `ButtonBase` with round hover effect, respects `dismissible` prop
- **Shadow**: `box-shadow: var(--prismui-shadow-md)` (no border)

---

## Promise Toast

The promise toast starts in a loading state with:
- White background (semantic style)
- Neutral-colored loader icon
- No auto-dismiss during loading
- No close button during loading

When the promise resolves or rejects:
- Title and description update in-place
- Severity changes to `success` or `error`
- Timer resets for fresh auto-dismiss
- Close button becomes available

---

## Architecture

Toast follows the 4-layer architecture:

1. **Layer 1**: Overlay system (z-index management)
2. **Layer 2**: `ToastBase` — positioning, animation, timer management
3. **Layer 3**: `Toast` — semantic styling, icons, close button
4. **Layer 4**: `ToastController` — programmatic API (`show`, `success`, `promise`, etc.)

Icons are imported from the centralized `icons/` folder (same pattern as Alert).

---

## Storybook Stories

### Toast (`Runtime/ToastController`)
- All Severities
- Promise Toast
- Custom Duration
- Dismissible / Non-dismissible
- Multiple Toasts
- Position Variants
