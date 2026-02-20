# Popover Usage Guide

> Complete guide to using PrismUI's Popover component.

---

## Quick Start

```tsx
import { Popover } from '@prismui/core';

function MyPage() {
  return (
    <Popover>
      <Popover.Target>
        <button>Click me</button>
      </Popover.Target>
      <Popover.Dropdown>
        <p>Popover content</p>
      </Popover.Dropdown>
    </Popover>
  );
}
```

---

## Popover Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opened` | `boolean` | — | Controlled open state |
| `defaultOpened` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onChange` | `(opened: boolean) => void` | — | Called when open state changes |
| `position` | `PopoverBasePosition` | `'bottom'` | Placement relative to trigger |
| `offset` | `number` | `8` | Distance from trigger (px) |
| `withArrow` | `boolean` | `false` | Show arrow pointing to trigger |
| `arrowSize` | `number` | `8` | Arrow size in px |
| `trapFocus` | `boolean` | `false` | Trap keyboard focus in dropdown |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnClickOutside` | `boolean` | `true` | Close on outside click |
| `withinPortal` | `boolean` | `true` | Render dropdown in a portal |
| `zIndex` | `number` | `300` | z-index of the dropdown |
| `width` | `number \| string \| 'target'` | — | Dropdown width (`'target'` = match trigger) |
| `shadow` | `PrismuiShadow` | `'md'` | Dropdown shadow |
| `radius` | `PrismuiRadius` | `'md'` | Dropdown border radius |

---

## Compound Components

### `Popover.Target`

Wraps the trigger element. The child must accept a `ref`.

```tsx
<Popover.Target>
  <button>Trigger</button>
</Popover.Target>
```

### `Popover.Dropdown`

The dropdown content panel.

```tsx
<Popover.Dropdown>
  <div style={{ padding: 16 }}>
    Content here
  </div>
</Popover.Dropdown>
```

---

## Patterns

### Controlled

```tsx
const [opened, setOpened] = useState(false);

<Popover opened={opened} onChange={setOpened}>
  <Popover.Target>
    <button onClick={() => setOpened((o) => !o)}>Toggle</button>
  </Popover.Target>
  <Popover.Dropdown>
    <button onClick={() => setOpened(false)}>Close</button>
  </Popover.Dropdown>
</Popover>
```

### Match Target Width

```tsx
<Popover width="target">
  <Popover.Target>
    <input placeholder="Search..." />
  </Popover.Target>
  <Popover.Dropdown>
    {/* Dropdown matches input width */}
    <div>Search results...</div>
  </Popover.Dropdown>
</Popover>
```

### With Arrow

```tsx
<Popover withArrow arrowSize={10}>
  <Popover.Target>
    <button>Info</button>
  </Popover.Target>
  <Popover.Dropdown>
    <p>Additional information</p>
  </Popover.Dropdown>
</Popover>
```

### Focus Trap

```tsx
<Popover trapFocus>
  <Popover.Target>
    <button>Open Form</button>
  </Popover.Target>
  <Popover.Dropdown>
    <input placeholder="Name" />
    <input placeholder="Email" />
    <button>Submit</button>
  </Popover.Dropdown>
</Popover>
```

---

## Architecture

Popover is built on the **Positioning Engine**:

1. **PopoverBase** (Layer 2) — handles positioning, portal, transitions, click-outside, escape
2. **Popover** (Layer 3) — adds Paper styling, arrow, shadow, radius, width matching

The dropdown uses placement-based transitions from the Transition system.

---

## Storybook Stories

### Popover (`Components/Popover`)
- Basic Popover
- All Positions
- Controlled
- With Arrow
- Match Target Width
- Focus Trap
- Close on Click Outside
- Nested Popovers
