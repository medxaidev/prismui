# PrismUI

> **A Composable UI Runtime Platform for Large-Scale Applications**

PrismUI is not just a component library — it's a **UI Runtime Platform** that provides beautiful components, runtime coordination, and programmatic control for building complex applications.

## What is PrismUI?

PrismUI combines:

- 🎨 **Design System**: Beautiful components with thoughtful defaults (inspired by MUI/Joy UI)
- ⚙️ **Runtime System**: Overlay coordination, focus management, positioning (four-layer architecture)
- 🎯 **Programmatic APIs**: Imperative control (`dialog.confirm()`, `toast.show()`)
- 🧩 **Module System**: Tree-shakable, opt-in capabilities

## Why PrismUI?

### For Beautiful UIs

- **Beautiful by default**: Modern visuals with a consistent design language
- **Theme-friendly**: Global and component-level customization through a single theme
- **Type-safe**: Strong TypeScript ergonomics and IDE autocomplete

### For Complex Applications

- **Runtime coordination**: Centralized overlay stack, z-index allocation, scroll lock
- **Programmatic control**: Promise-based APIs for dialogs, toasts, and more
- **Modular architecture**: Only bundle what you use
- **Extensible**: Third-party runtime modules and plugins

## Architecture

PrismUI follows a **four-layer architecture** for complex overlay components:

```
Layer 0: Runtime Kernel       ← Module registration, lifecycle
Layer 1: Runtime Systems      ← Overlay, Focus, Positioning
Layer 2: Behavior Bases       ← ModalBase, DrawerBase
Layer 3: Semantic Components  ← Dialog, Drawer
Layer 4: Controllers          ← dialog.confirm(), toast.show()
```

**Example: Dialog**

```tsx
// Declarative (Layer 3)
<Dialog opened={opened} onClose={close} title="Confirm">
  Are you sure?
</Dialog>;

// Programmatic (Layer 4)
const dialog = useDialogController();
const confirmed = await dialog.confirm({
  title: "Delete item?",
  content: "This action cannot be undone.",
});
```

## Inspirations

PrismUI learns from proven ecosystems:

- **Mantine**: Architecture, component patterns, theming ergonomics, factory system
- **MUI / Joy UI**: Visual design, tokens, practical component UX, interaction details

## Status

**Current Stage**: STAGE-005 — Runtime Platform Architecture (Active)

PrismUI is under active development. The runtime platform foundation is being built, establishing the module system and four-layer architecture.

**Completed**:

- ✅ Theme system & CSS variables
- ✅ Factory & Styles API
- ✅ Layout components (Box, Stack, Group, Grid, Container)
- ✅ Typography (Text, Anchor)
- ✅ Feedback components (Transition, Alert)
- ✅ Overlay & FocusTrap infrastructure

**In Progress** (STAGE-005):

- 🔄 Runtime Kernel & module system
- 🔄 Overlay runtime coordination
- 🔄 Dialog with four-layer architecture
- 🔄 Programmatic dialog API

## Documentation

### Architecture

- [`ARCHITECTURE.md`](./devdocs/architecture/ARCHITECTURE.md) — Constitutional architectural rules
- [`RUNTIME-PLATFORM.md`](./devdocs/architecture/RUNTIME-PLATFORM.md) — Complete runtime architecture guide
- [`DESIGN-PRINCIPLES.md`](./devdocs/architecture/DESIGN-PRINCIPLES.md) — Design philosophy and principles
- [`ADR-011`](./devdocs/decisions/ADR-011-Runtime-Platform-Architecture.md) — Runtime platform decision

### Development

- [`STAGE-005-Runtime-Platform.md`](./devdocs/stages/STAGE-005-Runtime-Platform.md) — Current implementation roadmap

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Commands

```bash
npm install
npm test
npm run typecheck
npm run storybook
```

## License

MIT
