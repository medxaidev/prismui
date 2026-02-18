# STAGE-006: Extended Overlay Components

**Status**: Planning  
**Start Date**: TBD  
**Target**: Q1 2026  
**Priority**: High  
**Dependencies**: STAGE-005 ✅

---

## Executive Summary

STAGE-006 extends the Runtime Platform architecture established in STAGE-005 by implementing additional overlay-based components: **Tooltip**, **Popover**, **Toast**, and **Drawer**. Each component follows the proven four-layer architecture pattern, ensuring consistency, modularity, and programmatic control.

**Core Philosophy**: 
> Leverage the Runtime Platform to build a complete suite of overlay components with unified behavior, predictable z-index management, and powerful programmatic APIs.

---

## Strategic Goals

### 1. Component Coverage
- ✅ Tooltip (Layer 2 + 3)
- ✅ Popover (Layer 2 + 3 + 4)
- ✅ Toast (Layer 2 + 3 + 4)
- ✅ Drawer (Layer 2 + 3 + 4)

### 2. Positioning Engine (Layer 1 Extension)
- ✅ Floating UI integration for smart positioning
- ✅ Auto-placement with collision detection
- ✅ Arrow positioning
- ✅ Offset and padding configuration

### 3. Animation Presets
- ✅ Slide transitions for Drawer (slide-left, slide-right, slide-up, slide-down)
- ✅ Placement-based transitions for Tooltip/Popover
- ✅ Toast enter/exit animations

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Runtime Platform (STAGE-005)              │
│         RuntimeKernel + OverlayManager + DialogModule       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ STAGE-006 Adds │
              └────────┬───────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       │               │               │               │
       ▼               ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Positioning│   │ Tooltip  │   │ Popover  │   │  Toast   │
│  Engine  │   │  Module  │   │  Module  │   │  Module  │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
      ┌──────────┐    ┌──────────┐
      │ Drawer   │    │DrawerBase│
      │  Module  │    │          │
      └──────────┘    └──────────┘
```

---

## Component Breakdown

### 1. Tooltip

**Layers**: 2 (TooltipBase) + 3 (Tooltip)

**Features**:
- Hover/focus trigger
- Smart positioning (top, bottom, left, right, auto)
- Arrow support
- Delay control (enter/leave)
- Accessibility (aria-describedby)

**API**:
```tsx
<Tooltip label="Helpful text" position="top" withArrow>
  <button>Hover me</button>
</Tooltip>
```

**No Layer 4**: Tooltips are declarative-only (no programmatic API needed).

---

### 2. Popover

**Layers**: 2 (PopoverBase) + 3 (Popover) + 4 (PopoverController)

**Features**:
- Click/hover trigger
- Smart positioning with Floating UI
- Dropdown/menu mode
- Click-outside to close
- Nested popover support

**Declarative API**:
```tsx
<Popover>
  <Popover.Target>
    <button>Open</button>
  </Popover.Target>
  <Popover.Dropdown>
    Content
  </Popover.Dropdown>
</Popover>
```

**Programmatic API**:
```tsx
const popover = usePopoverController();

popover.open({
  target: buttonRef.current,
  content: <Menu />,
  position: 'bottom-start',
});
```

---

### 3. Toast

**Layers**: 2 (ToastBase) + 3 (Toast) + 4 (ToastController)

**Features**:
- Auto-dismiss with timer
- Queue management
- Position variants (top-right, bottom-center, etc.)
- Severity variants (info, success, warning, error)
- Action buttons
- Swipe-to-dismiss (mobile)

**Programmatic API**:
```tsx
const toast = useToastController();

toast.show({
  title: 'Success',
  message: 'Item saved',
  severity: 'success',
  duration: 3000,
});

toast.success('Quick success message');
toast.error('Error occurred');
```

**Declarative API** (for custom layouts):
```tsx
<Toast opened={opened} onClose={close} severity="info">
  Custom toast content
</Toast>
```

---

### 4. Drawer

**Layers**: 2 (DrawerBase) + 3 (Drawer) + 4 (DrawerController)

**Features**:
- Side panel (left, right, top, bottom)
- Slide transitions
- Overlay backdrop
- Scroll lock
- Nested drawer support

**Declarative API**:
```tsx
<Drawer opened={opened} onClose={close} position="right" size="md">
  <Drawer.Header>Settings</Drawer.Header>
  <Drawer.Body>Content</Drawer.Body>
</Drawer>
```

**Programmatic API**:
```tsx
const drawer = useDrawerController();

drawer.open({
  position: 'right',
  content: <SettingsPanel />,
  size: 'lg',
});
```

---

## Phase Breakdown

### Phase A: Positioning Engine (2 sessions)

**Goal**: Implement Layer 1 extension for smart positioning.

#### A1: Floating UI Integration (1 session)

**Files**:
- `core/runtime/positioning/PositioningEngine.ts`
- `core/runtime/positioning/types.ts`
- `core/runtime/positioning/usePositioning.ts`

**Features**:
- Floating UI wrapper
- Auto-placement
- Collision detection
- Arrow positioning
- Offset/padding

**Tests**: 30 tests

---

#### A2: Positioning Module (1 session)

**Files**:
- `core/runtime/positioning/positioningModule.ts`
- `core/runtime/positioning/index.ts`

**Integration**:
- Register in RuntimeKernel
- Expose positioning utilities
- Hook for component usage

**Tests**: 15 tests

---

### Phase B: Tooltip (1.5 sessions)

**Goal**: Implement Tooltip (Layer 2 + 3).

#### B1: TooltipBase (0.5 session)

**Files**:
- `components/TooltipBase/TooltipBase.tsx`
- `components/TooltipBase/TooltipBase.module.css`

**Features**:
- Positioning integration
- Hover/focus triggers
- Delay control

**Tests**: 15 tests

---

#### B2: Tooltip Component (1 session)

**Files**:
- `components/Tooltip/Tooltip.tsx`
- `components/Tooltip/Tooltip.module.css`
- `components/Tooltip/Tooltip.test.tsx`
- `components/Tooltip/Tooltip.stories.tsx`

**Features**:
- Arrow support
- Semantic styling
- Accessibility

**Tests**: 20 tests
**Stories**: 6 stories

---

### Phase C: Popover (2 sessions)

**Goal**: Implement Popover (Layer 2 + 3 + 4).

#### C1: PopoverBase (0.5 session)

**Files**:
- `components/PopoverBase/PopoverBase.tsx`
- `components/PopoverBase/PopoverBase.module.css`

**Features**:
- Positioning
- Click-outside
- Nested support

**Tests**: 18 tests

---

#### C2: Popover Component (1 session)

**Files**:
- `components/Popover/Popover.tsx`
- `components/Popover/Popover.module.css`
- `components/Popover/Popover.test.tsx`
- `components/Popover/Popover.stories.tsx`

**Compound Components**:
- `Popover.Target`
- `Popover.Dropdown`

**Tests**: 25 tests
**Stories**: 8 stories

---

#### C3: PopoverController (0.5 session)

**Files**:
- `core/runtime/popover/PopoverController.ts`
- `core/runtime/popover/popoverModule.ts`
- `core/runtime/popover/usePopoverController.ts`

**API**:
- `open(options)`
- `close(id)`
- `closeAll()`

**Tests**: 20 tests

---

### Phase D: Toast (2.5 sessions)

**Goal**: Implement Toast (Layer 2 + 3 + 4).

#### D1: ToastBase (0.5 session)

**Files**:
- `components/ToastBase/ToastBase.tsx`
- `components/ToastBase/ToastBase.module.css`

**Features**:
- Auto-dismiss timer
- Enter/exit animations
- Position variants

**Tests**: 15 tests

---

#### D2: Toast Component (1 session)

**Files**:
- `components/Toast/Toast.tsx`
- `components/Toast/Toast.module.css`
- `components/Toast/Toast.test.tsx`
- `components/Toast/Toast.stories.tsx`

**Features**:
- Severity variants
- Icon support
- Action buttons
- Close button

**Tests**: 22 tests
**Stories**: 8 stories

---

#### D3: ToastController (1 session)

**Files**:
- `core/runtime/toast/ToastController.ts`
- `core/runtime/toast/ToastQueue.ts`
- `core/runtime/toast/toastModule.ts`
- `core/runtime/toast/ToastRenderer.tsx`
- `core/runtime/toast/useToastController.ts`

**Features**:
- Queue management
- Auto-dismiss
- Position management
- Shorthand methods (success, error, etc.)

**API**:
```typescript
interface ToastController {
  show(options: ToastOptions): string;
  hide(id: string): void;
  hideAll(): void;
  success(message: string, options?: Partial<ToastOptions>): string;
  error(message: string, options?: Partial<ToastOptions>): string;
  warning(message: string, options?: Partial<ToastOptions>): string;
  info(message: string, options?: Partial<ToastOptions>): string;
}
```

**Tests**: 35 tests

---

### Phase E: Drawer (2.5 sessions)

**Goal**: Implement Drawer (Layer 2 + 3 + 4).

#### E1: DrawerBase (1 session)

**Files**:
- `components/DrawerBase/DrawerBase.tsx`
- `components/DrawerBase/DrawerBase.module.css`
- `components/DrawerBase/DrawerBase.context.tsx`

**Features**:
- Position variants (left, right, top, bottom)
- Slide transitions
- Overlay integration
- Size control

**Tests**: 20 tests

---

#### E2: Drawer Component (1 session)

**Files**:
- `components/Drawer/Drawer.tsx`
- `components/Drawer/Drawer.module.css`
- `components/Drawer/Drawer.test.tsx`
- `components/Drawer/Drawer.stories.tsx`

**Compound Components**:
- `Drawer.Header`
- `Drawer.Body`
- `Drawer.Footer`
- `Drawer.CloseButton`

**Tests**: 25 tests
**Stories**: 10 stories

---

#### E3: DrawerController (0.5 session)

**Files**:
- `core/runtime/drawer/DrawerController.ts`
- `core/runtime/drawer/drawerModule.ts`
- `core/runtime/drawer/useDrawerController.ts`

**API**:
- `open(options)`
- `close(id)`
- `closeAll()`

**Tests**: 20 tests

---

### Phase F: Documentation & Polish (1 session)

**Goal**: Comprehensive documentation and final polish.

**Files**:
- `devdocs/guides/TOOLTIP-USAGE.md`
- `devdocs/guides/POPOVER-USAGE.md`
- `devdocs/guides/TOAST-USAGE.md`
- `devdocs/guides/DRAWER-USAGE.md`
- `devdocs/guides/POSITIONING-ENGINE.md`

**Stories**: 32+ total across all components

**Acceptance Criteria**:
- [ ] All guides complete
- [ ] 32+ Storybook stories
- [ ] All examples work correctly
- [ ] Performance benchmarks documented

---

## Testing Strategy

### Unit Tests
- **Positioning Engine**: 45 tests
- **Tooltip**: 35 tests
- **Popover**: 63 tests (Base + Component + Controller)
- **Toast**: 72 tests (Base + Component + Controller + Queue)
- **Drawer**: 65 tests (Base + Component + Controller)
- **Total**: ~280 new tests

### Integration Tests
- Nested popovers with correct z-index
- Toast queue management
- Drawer + Dialog interaction
- Tooltip positioning with scroll
- Multi-component overlay stack

---

## Success Metrics

### Technical
- [ ] 280+ new tests passing
- [ ] tsc --noEmit clean
- [ ] Zero runtime errors in Storybook
- [ ] Bundle size impact < 15KB (gzipped)

### Architectural
- [ ] All components follow four-layer pattern
- [ ] Positioning engine reusable
- [ ] No z-index conflicts
- [ ] Consistent API patterns

### Developer Experience
- [ ] Intuitive declarative APIs
- [ ] Powerful programmatic APIs
- [ ] Excellent TypeScript types
- [ ] Comprehensive documentation

---

## Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| A: Positioning Engine | 2 sessions | 2 |
| B: Tooltip | 1.5 sessions | 3.5 |
| C: Popover | 2 sessions | 5.5 |
| D: Toast | 2.5 sessions | 8 |
| E: Drawer | 2.5 sessions | 10.5 |
| F: Documentation | 1 session | 11.5 |

**Total**: 11.5 sessions (~3 weeks)

---

## Future Extensions (Post-STAGE-006)

### STAGE-007 Candidates
- **CommandPaletteModule**: ⌘K command palette
- **ContextMenuModule**: Right-click context menus
- **NotificationCenterModule**: Persistent notification center
- **DevToolsModule**: Runtime inspector overlay
- **A/B Testing Runtime**: Feature flag overlays

### Advanced Features
- **Gesture Support**: Swipe, pinch, drag for mobile
- **Virtual Scrolling**: For large toast queues
- **Accessibility Enhancements**: Screen reader announcements, focus management
- **Animation Customization**: Custom transition presets
- **Theme Variants**: Dark mode, high contrast

---

## Conclusion

STAGE-006 completes the core overlay component suite, establishing PrismUI as a comprehensive UI Runtime Platform. By following the proven four-layer architecture, we ensure consistency, maintainability, and extensibility across all overlay-based components.

**The Runtime Platform is now production-ready for large-scale applications.**
