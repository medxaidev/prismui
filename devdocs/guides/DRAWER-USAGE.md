# Drawer Usage Guide

> Complete guide to using PrismUI's Drawer component and programmatic DrawerController.

---

## Quick Start

### Declarative Drawer (Layer 3)

```tsx
import { Drawer } from '@prismui/core';

function MyPage() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)}>Open</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title="Settings">
        <p>Drawer content goes here.</p>
      </Drawer>
    </>
  );
}
```

### Programmatic Drawer (Layer 4)

```tsx
import { useDrawerController } from '@prismui/core';

function MyPage() {
  const drawer = useDrawerController();

  const handleOpen = () => {
    drawer.open({
      title: 'Settings',
      content: <SettingsPanel />,
      position: 'right',
      size: 400,
    });
  };

  return <button onClick={handleOpen}>Settings</button>;
}
```

---

## Drawer Component

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opened` | `boolean` | — | Whether the drawer is open |
| `onClose` | `() => void` | — | Called when the drawer should close |
| `title` | `ReactNode` | — | Title rendered in the header |
| `withCloseButton` | `boolean` | `true` | Show close button in header |
| `closeButtonProps` | `ButtonHTMLAttributes` | — | Props for the close button |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Which edge the drawer slides from |
| `size` | `number \| string` | `320` | Width (left/right) or height (top/bottom) |
| `overlayOpacity` | `number` | `0.48` | Backdrop opacity |
| `overlayBlur` | `number \| string` | `0` | Backdrop blur |
| `withOverlay` | `boolean` | `true` | Show overlay backdrop |
| `trapFocus` | `boolean` | `true` | Trap keyboard focus |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnClickOutside` | `boolean` | `true` | Close on backdrop click |
| `lockScroll` | `boolean` | `true` | Lock body scroll |
| `withinPortal` | `boolean` | `true` | Render in a portal |

### Position Variants

```tsx
// Right (default) — settings panel, detail view
<Drawer position="right" ... />

// Left — navigation menu
<Drawer position="left" ... />

// Top — notification panel
<Drawer position="top" size={200} ... />

// Bottom — mobile action sheet
<Drawer position="bottom" size={280} ... />
```

### Sizing

```tsx
// Numeric (px)
<Drawer size={400} ... />

// String (CSS value)
<Drawer size="50%" ... />
<Drawer size="100vw" ... />  // full-width
```

### Without Overlay

```tsx
<Drawer
  withOverlay={false}
  closeOnClickOutside={false}
  ...
>
  {/* Page remains interactive behind the drawer */}
</Drawer>
```

---

## Compound Components

For full layout control, use the compound components directly:

```tsx
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
} from '@prismui/core';

<Drawer opened={opened} onClose={close} withCloseButton={false}>
  <DrawerHeader>
    <DrawerTitle>Edit Profile</DrawerTitle>
    <DrawerCloseButton />
  </DrawerHeader>
  <DrawerBody>
    <form>
      <input placeholder="Name" />
      <input placeholder="Email" />
    </form>
  </DrawerBody>
  <DrawerFooter>
    <button onClick={close}>Cancel</button>
    <button onClick={handleSave}>Save</button>
  </DrawerFooter>
</Drawer>
```

### Available Components

| Component | Description |
|-----------|-------------|
| `DrawerHeader` | Flex container for title + close button (flex-shrink: 0) |
| `DrawerTitle` | Title text (font-weight 600) |
| `DrawerBody` | Scrollable body content (flex: 1, overflow-y: auto) |
| `DrawerFooter` | Right-aligned footer with top border (flex-shrink: 0) |
| `DrawerCloseButton` | Close button that calls `onClose` from context |

---

## DrawerController API

### Setup

```tsx
import { PrismuiProvider, overlayModule, drawerModule, DrawerRenderer } from '@prismui/core';

<PrismuiProvider modules={[overlayModule(), drawerModule()]}>
  <App />
  <DrawerRenderer />
</PrismuiProvider>
```

> **Important**: Place `<DrawerRenderer />` inside the provider tree. It renders programmatic drawers.

### Methods

#### `open(options): string`

Opens a drawer and returns its ID for manual closing.

```tsx
const id = drawer.open({
  title: 'Settings',
  content: <SettingsPanel />,
  position: 'right',
  size: 400,
});

// Later...
drawer.close(id);
```

#### `close(id): void`

Closes a specific drawer by ID.

#### `closeAll(): void`

Closes all open programmatic drawers.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Drawer title |
| `content` | `ReactNode` | — | Body content |
| `position` | `DrawerPosition` | `'right'` | Slide-in edge |
| `size` | `number \| string` | `320` | Width or height |
| `closeOnEscape` | `boolean` | `true` | Close on Escape |
| `closeOnClickOutside` | `boolean` | `true` | Close on backdrop click |
| `withCloseButton` | `boolean` | `true` | Show close button |
| `withOverlay` | `boolean` | `true` | Show backdrop |
| `onClose` | `() => void` | — | Called when closed |

---

## Patterns

### Navigation Drawer

```tsx
<Drawer position="left" size={280} title="Menu">
  <nav>
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
    <a href="/profile">Profile</a>
  </nav>
</Drawer>
```

### Form Drawer with Footer

```tsx
<Drawer opened={opened} onClose={close} withCloseButton={false} size={400}>
  <DrawerHeader>
    <DrawerTitle>Edit Profile</DrawerTitle>
    <DrawerCloseButton />
  </DrawerHeader>
  <DrawerBody>
    {/* Form fields */}
  </DrawerBody>
  <DrawerFooter>
    <button onClick={close}>Cancel</button>
    <button onClick={handleSave}>Save Changes</button>
  </DrawerFooter>
</Drawer>
```

### Mobile Bottom Sheet

```tsx
<Drawer position="bottom" size={280} title="Actions">
  <button>Share</button>
  <button>Copy Link</button>
  <button>Delete</button>
</Drawer>
```

---

## Architecture

Drawer follows the 4-layer architecture:

1. **Layer 1**: Overlay system (z-index management via OverlayManager)
2. **Layer 2**: `DrawerBase` — extends ModalBase with side-panel positioning and slide transitions
3. **Layer 3**: `Drawer` — semantic structure (header, body, footer, close button)
4. **Layer 4**: `DrawerController` — programmatic API (`open`, `close`, `closeAll`)

### Slide Transitions

Each position maps to a slide transition:

| Position | Transition |
|----------|-----------|
| `left` | `slide-right` (slides in from left) |
| `right` | `slide-left` (slides in from right) |
| `top` | `slide-down` (slides in from top) |
| `bottom` | `slide-up` (slides in from bottom) |

### CSS Structure

```
DrawerBase (fixed, fullscreen)
├── Overlay layer (backdrop)
└── Content panel (fixed, positioned at edge)
    ├── DrawerHeader (flex-shrink: 0)
    ├── DrawerBody (flex: 1, overflow-y: auto)
    └── DrawerFooter (flex-shrink: 0, border-top)
```

---

## Storybook Stories

### Drawer (`Components/Drawer`)
- Basic Drawer
- Position Variants
- Custom Size
- Without Overlay
- Without Close Button
- Compound Components
- Scrollable Content
- Bottom Sheet
- Nested Drawers
- Form in Drawer

### DrawerController (`Runtime/DrawerController`)
- Programmatic open()
- Position Variants
- Custom Size
- Manual open/close
- Multiple Drawers + closeAll
