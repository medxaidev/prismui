# Positioning Engine Guide

> How PrismUI positions floating elements (tooltips, popovers, dropdowns).

---

## Overview

PrismUI's positioning engine is responsible for placing floating elements relative to their anchor/trigger elements. It powers Tooltip, Popover, and any future floating UI components.

---

## Architecture

### Core Hook: `usePositioning`

The `usePositioning` hook is the foundation. It:

1. Calculates the position of a floating element relative to an anchor
2. Handles placement (top, bottom, left, right + start/end variants)
3. Applies offset distance
4. Manages arrow positioning
5. Updates on scroll/resize via `useFloating`

### Layer Structure

```
useFloating (Floating UI)
  └── usePositioning (PrismUI adapter)
        ├── PopoverBase (Layer 2) — generic floating container
        │     ├── Tooltip (Layer 3)
        │     └── Popover (Layer 3)
        └── Future: Select, Autocomplete, DatePicker, etc.
```

---

## Placement

### Available Positions

| Position | Description |
|----------|-------------|
| `top` | Above, centered |
| `top-start` | Above, left-aligned |
| `top-end` | Above, right-aligned |
| `bottom` | Below, centered |
| `bottom-start` | Below, left-aligned |
| `bottom-end` | Below, right-aligned |
| `left` | Left side, centered |
| `left-start` | Left side, top-aligned |
| `left-end` | Left side, bottom-aligned |
| `right` | Right side, centered |
| `right-start` | Right side, top-aligned |
| `right-end` | Right side, bottom-aligned |

### Offset

The `offset` prop controls the distance between the anchor and the floating element:

```tsx
<Tooltip offset={12}>...</Tooltip>  // 12px gap
<Popover offset={4}>...</Popover>   // 4px gap
```

---

## Transitions

Each placement has a corresponding transition preset that makes the element appear to slide in from the correct direction:

| Placement | Transition | Effect |
|-----------|-----------|--------|
| `top-*` | Scale + translate down | Appears from above |
| `bottom-*` | Scale + translate up | Appears from below |
| `left-*` | Scale + translate right | Appears from left |
| `right-*` | Scale + translate left | Appears from right |

Transitions use `translate3d` for GPU acceleration and `scale3d(0.96, 0.96, 1)` for a subtle scale effect.

---

## Arrow

The arrow is a rotated square element positioned at the edge of the floating element, pointing toward the anchor.

```tsx
<Tooltip withArrow arrowSize={6}>...</Tooltip>
<Popover withArrow arrowSize={8}>...</Popover>
```

Arrow positioning is calculated by the positioning engine and applied via CSS transforms.

---

## Portal

By default, floating elements render inside a Portal to avoid clipping by overflow containers:

```tsx
// Default: renders in portal
<Tooltip>...</Tooltip>

// Disable portal (renders in-place)
<Tooltip withinPortal={false}>...</Tooltip>
```

---

## PopoverBase (Layer 2)

`PopoverBase` is the generic floating container that both Tooltip and Popover build on:

### Features
- **Positioning**: Uses `usePositioning` for anchor-relative placement
- **Portal**: Optional portal rendering
- **Transitions**: Placement-based enter/exit animations
- **Click outside**: Configurable close-on-click-outside
- **Escape key**: Configurable close-on-escape
- **Focus trap**: Optional keyboard focus trapping

### Compound Components
- `PopoverBase.Target` — wraps the trigger element
- `PopoverBase.Dropdown` — the floating content panel

---

## Slide Transitions (for Drawers)

In addition to placement-based transitions, the engine provides full-distance slide transitions for drawers and panels:

| Transition | Direction | Use Case |
|-----------|-----------|----------|
| `slide-up` | From bottom | Bottom drawer |
| `slide-down` | From top | Top drawer |
| `slide-left` | From right | Right drawer |
| `slide-right` | From left | Left drawer |

These use `translate3d(0, 100%, 0)` (or equivalent) for full-distance slides.

---

## Files

| File | Purpose |
|------|---------|
| `hooks/use-floating.ts` | Core Floating UI integration |
| `hooks/use-positioning.ts` | PrismUI positioning adapter |
| `components/PopoverBase/` | Generic floating container (Layer 2) |
| `components/Tooltip/` | Tooltip component (Layer 3) |
| `components/Popover/` | Popover component (Layer 3) |
| `components/Transition/transitions.ts` | All transition presets |
