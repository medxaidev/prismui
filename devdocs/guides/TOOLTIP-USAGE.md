# Tooltip Usage Guide

> Complete guide to using PrismUI's Tooltip component.

---

## Quick Start

```tsx
import { Tooltip } from '@prismui/core';

function MyPage() {
  return (
    <Tooltip label="Save changes">
      <button>Save</button>
    </Tooltip>
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | Tooltip content |
| `children` | `ReactElement` | — | Trigger element |
| `position` | `TooltipPosition` | `'top'` | Placement relative to trigger |
| `offset` | `number` | `8` | Distance from trigger (px) |
| `withArrow` | `boolean` | `false` | Show arrow pointing to trigger |
| `arrowSize` | `number` | `6` | Arrow size in px |
| `opened` | `boolean` | — | Controlled open state |
| `disabled` | `boolean` | `false` | Disable the tooltip |
| `openDelay` | `number` | `0` | Delay before showing (ms) |
| `closeDelay` | `number` | `0` | Delay before hiding (ms) |
| `withinPortal` | `boolean` | `true` | Render in a portal |
| `zIndex` | `number` | `300` | z-index of the tooltip |
| `multiline` | `boolean` | `false` | Allow multiline content |
| `width` | `number \| string` | — | Fixed width (enables multiline) |

## Positions

```tsx
// Primary positions
<Tooltip label="Top" position="top">...</Tooltip>
<Tooltip label="Bottom" position="bottom">...</Tooltip>
<Tooltip label="Left" position="left">...</Tooltip>
<Tooltip label="Right" position="right">...</Tooltip>

// With alignment
<Tooltip label="Top Start" position="top-start">...</Tooltip>
<Tooltip label="Top End" position="top-end">...</Tooltip>
<Tooltip label="Bottom Start" position="bottom-start">...</Tooltip>
// ... etc.
```

## Arrow

```tsx
<Tooltip label="With arrow" withArrow>
  <button>Hover me</button>
</Tooltip>

<Tooltip label="Large arrow" withArrow arrowSize={10}>
  <button>Hover me</button>
</Tooltip>
```

## Delays

```tsx
// Show after 500ms, hide after 200ms
<Tooltip label="Delayed" openDelay={500} closeDelay={200}>
  <button>Hover me</button>
</Tooltip>
```

## Controlled

```tsx
const [opened, setOpened] = useState(false);

<Tooltip label="Controlled" opened={opened}>
  <button
    onMouseEnter={() => setOpened(true)}
    onMouseLeave={() => setOpened(false)}
  >
    Hover me
  </button>
</Tooltip>
```

## Multiline

```tsx
<Tooltip
  label="This is a long tooltip that wraps to multiple lines"
  multiline
  width={200}
>
  <button>Hover me</button>
</Tooltip>
```

---

## Architecture

Tooltip is built on the **Positioning Engine** (`useFloating` + `usePositioning`):

1. **PopoverBase** (Layer 2) — handles positioning, portal, transitions
2. **Tooltip** (Layer 3) — adds hover/focus triggers, delay logic, arrow, styling

The tooltip uses placement-based transitions from the Transition system — elements slide in from the direction they are placed relative to the anchor.

---

## Storybook Stories

### Tooltip (`Components/Tooltip`)
- Basic Tooltip
- All Positions
- With Arrow
- Controlled
- Open/Close Delay
- Multiline
- Disabled
- Custom Offset
