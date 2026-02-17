# STAGE-005: Runtime Platform Architecture

**Status**: Active  
**Start Date**: 2026-02-17  
**Target**: Q1 2026  
**Priority**: Critical  
**Dependencies**: STAGE-001 ✅, STAGE-002 ✅, STAGE-003 ✅

---

## Executive Summary

STAGE-005 represents a **fundamental architectural pivot** from "component library" to **"UI Runtime Platform"**. This stage implements the four-layer architecture defined in [ADR-011](../decisions/ADR-011-Runtime-Platform-Architecture.md), establishing PrismUI as a composable runtime system for large-scale applications.

**Core Philosophy**: 
> PrismUI is not just a component library — it's a **UI Runtime Platform** with pluggable modules, runtime scheduling, and programmatic control.

---

## Strategic Goals

### 1. Platform Foundation
- ✅ Establish Runtime Kernel as the core orchestration layer
- ✅ Implement modular plugin system
- ✅ Separate Runtime concerns from Design System
- ✅ Enable tree-shakable, opt-in capabilities

### 2. Four-Layer Architecture
- ✅ **Layer 0**: Runtime Kernel (module registration, lifecycle)
- ✅ **Layer 1**: Runtime Systems (Overlay, Focus, Positioning)
- ✅ **Layer 2**: Behavior Bases (ModalBase, DrawerBase, PopoverBase)
- ✅ **Layer 3**: Semantic Components (Dialog, Drawer, Tooltip)
- ✅ **Layer 4**: Programmatic Controllers (dialog.confirm(), toast.show())

### 3. Overlay System
- ✅ Stack management with z-index allocation
- ✅ Scroll lock coordination
- ✅ Escape key handling
- ✅ Nested overlay support
- ✅ Focus trap integration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PrismuiProvider                        │
│  modules={[themeModule(), overlayModule(), dialogModule()]} │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Runtime Kernel │ ◄── Layer 0
              └────────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Overlay  │   │  Focus   │   │Position  │ ◄── Layer 1
│ Module   │   │ Module   │   │  Module  │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
      ┌──────────┐    ┌──────────┐
      │ModalBase │    │DrawerBase│ ◄── Layer 2
      └────┬─────┘    └────┬─────┘
           │               │
           ▼               ▼
      ┌────────┐      ┌────────┐
      │ Dialog │      │ Drawer │ ◄── Layer 3
      └────┬───┘      └────┬───┘
           │               │
           ▼               ▼
    ┌──────────────┐ ┌──────────────┐
    │DialogController│ │DrawerController│ ◄── Layer 4
    └──────────────┘ └──────────────┘
```

---

## Phase Breakdown

### Phase A: Runtime Kernel (2 sessions)

**Goal**: Implement the core module system and kernel infrastructure.

#### A1: Runtime Kernel Core (1 session)

**Files**:
- `core/runtime/RuntimeKernel.ts`
- `core/runtime/types.ts`
- `core/runtime/RuntimeContext.tsx`
- `core/runtime/useRuntimeKernel.ts`
- `core/runtime/index.ts`

**API Design**:

```typescript
// types.ts
export interface PrismuiModule {
  name: string;
  setup(kernel: RuntimeKernel): void | Promise<void>;
  teardown?(): void;
}

export interface RuntimeKernel {
  // Module registration
  register<T>(name: string, value: T): void;
  get<T>(name: string): T | undefined;
  has(name: string): boolean;
  
  // Public API exposure
  expose<T>(name: string, api: T): void;
  getExposed<T>(name: string): T | undefined;
  
  // Lifecycle
  getModules(): string[];
  isReady(): boolean;
}

// RuntimeKernel.ts
export function createRuntimeKernel(): RuntimeKernel {
  const registry = new Map<string, unknown>();
  const exposed = new Map<string, unknown>();
  const modules = new Set<string>();
  
  return {
    register(name, value) {
      if (registry.has(name)) {
        throw new Error(`Runtime: "${name}" already registered`);
      }
      registry.set(name, value);
      modules.add(name);
    },
    
    get(name) {
      return registry.get(name);
    },
    
    has(name) {
      return registry.has(name);
    },
    
    expose(name, api) {
      exposed.set(name, api);
    },
    
    getExposed(name) {
      return exposed.get(name);
    },
    
    getModules() {
      return Array.from(modules);
    },
    
    isReady() {
      return modules.size > 0;
    },
  };
}
```

**Tests**: 15 tests covering registration, retrieval, exposure, error handling

---

#### A2: PrismuiProvider Integration (1 session)

**Goal**: Integrate Runtime Kernel into PrismuiProvider.

**Files**:
- `core/PrismuiProvider/PrismuiProvider.tsx` (refactor)
- `core/runtime/useRuntimeModule.ts`
- `core/runtime/RuntimeKernel.test.tsx`

**Updated PrismuiProvider**:

```typescript
export interface PrismuiProviderProps {
  theme?: PrismuiTheme;
  children: React.ReactNode;
  modules?: PrismuiModule[];
  // ... existing props
}

export function PrismuiProvider({
  theme,
  children,
  modules = [],
  ...others
}: PrismuiProviderProps) {
  const kernel = useMemo(() => createRuntimeKernel(), []);
  
  // Setup modules
  useEffect(() => {
    modules.forEach((module) => {
      module.setup(kernel);
    });
    
    return () => {
      modules.forEach((module) => {
        module.teardown?.();
      });
    };
  }, [kernel, modules]);
  
  return (
    <RuntimeContext.Provider value={kernel}>
      <PrismuiThemeProvider theme={theme} {...others}>
        {children}
      </PrismuiThemeProvider>
    </RuntimeContext.Provider>
  );
}
```

**Tests**: 12 tests for module lifecycle, context access, teardown

**Acceptance Criteria**:
- [ ] RuntimeKernel implements register/get/expose API
- [ ] PrismuiProvider accepts modules prop
- [ ] Modules are setup on mount, teardown on unmount
- [ ] useRuntimeKernel hook provides kernel access
- [ ] 27 tests pass, tsc clean

---

### Phase B: Overlay Runtime System (3 sessions)

**Goal**: Implement Layer 1 — Overlay stack management, z-index, scroll lock, escape handling.

#### B1: OverlayManager Core (1.5 sessions)

**Files**:
- `core/runtime/overlay/OverlayManager.ts`
- `core/runtime/overlay/types.ts`
- `core/runtime/overlay/OverlayManager.test.ts`

**API Design**:

```typescript
export interface OverlayInstance {
  id: string;
  zIndex: number;
  trapFocus: boolean;
  closeOnEscape: boolean;
  lockScroll: boolean;
  onClose: () => void;
}

export interface OverlayManager {
  // Stack management
  register(instance: OverlayInstance): void;
  unregister(id: string): void;
  getStack(): OverlayInstance[];
  getActive(): OverlayInstance | undefined;
  
  // Z-index allocation
  allocateZIndex(id: string): number;
  
  // Event handling
  handleEscape(): void;
  
  // Scroll lock coordination
  shouldLockScroll(): boolean;
}

export function createOverlayManager(
  baseZIndex = 1000
): OverlayManager {
  const stack: OverlayInstance[] = [];
  
  return {
    register(instance) {
      stack.push(instance);
    },
    
    unregister(id) {
      const index = stack.findIndex((i) => i.id === id);
      if (index !== -1) stack.splice(index, 1);
    },
    
    getStack() {
      return [...stack];
    },
    
    getActive() {
      return stack[stack.length - 1];
    },
    
    allocateZIndex(id) {
      const index = stack.findIndex((i) => i.id === id);
      return baseZIndex + index * 10;
    },
    
    handleEscape() {
      const active = this.getActive();
      if (active?.closeOnEscape) {
        active.onClose();
      }
    },
    
    shouldLockScroll() {
      return stack.some((i) => i.lockScroll);
    },
  };
}
```

**Tests**: 25 tests covering stack operations, z-index, escape, scroll lock

---

#### B2: OverlayModule Implementation (1 session)

**Files**:
- `core/runtime/overlay/overlayModule.ts`
- `core/runtime/overlay/useOverlayManager.ts`
- `core/runtime/overlay/index.ts`

**Module Implementation**:

```typescript
export function overlayModule(options?: {
  baseZIndex?: number;
}): PrismuiModule {
  let manager: OverlayManager;
  
  return {
    name: 'overlay',
    
    setup(kernel) {
      manager = createOverlayManager(options?.baseZIndex);
      kernel.register('overlay', manager);
      
      // Global escape handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          manager.handleEscape();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Store cleanup
      kernel.register('overlay:cleanup', () => {
        document.removeEventListener('keydown', handleKeyDown);
      });
    },
    
    teardown() {
      const cleanup = kernel.get<() => void>('overlay:cleanup');
      cleanup?.();
    },
  };
}

export function useOverlayManager(): OverlayManager {
  const kernel = useRuntimeKernel();
  const manager = kernel.get<OverlayManager>('overlay');
  
  if (!manager) {
    throw new Error(
      'OverlayManager not found. Did you add overlayModule() to PrismuiProvider?'
    );
  }
  
  return manager;
}
```

**Tests**: 18 tests for module setup, hook access, global escape, cleanup

---

#### B3: useOverlay Hook (0.5 session)

**Files**:
- `core/runtime/overlay/useOverlay.ts`
- `core/runtime/overlay/useOverlay.test.tsx`

**Hook Design**:

```typescript
export interface UseOverlayOptions {
  opened: boolean;
  onClose: () => void;
  trapFocus?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

export function useOverlay({
  opened,
  onClose,
  trapFocus = true,
  closeOnEscape = true,
  lockScroll = true,
}: UseOverlayOptions) {
  const manager = useOverlayManager();
  const id = useId();
  const zIndex = useRef(0);
  
  useEffect(() => {
    if (opened) {
      const instance: OverlayInstance = {
        id,
        zIndex: 0, // allocated below
        trapFocus,
        closeOnEscape,
        lockScroll,
        onClose,
      };
      
      manager.register(instance);
      zIndex.current = manager.allocateZIndex(id);
      
      return () => {
        manager.unregister(id);
      };
    }
  }, [opened, id, trapFocus, closeOnEscape, lockScroll, onClose, manager]);
  
  return {
    zIndex: zIndex.current,
    isActive: manager.getActive()?.id === id,
  };
}
```

**Tests**: 20 tests for registration, z-index, active state, cleanup

**Acceptance Criteria**:
- [ ] OverlayManager manages stack, z-index, escape
- [ ] overlayModule registers manager in kernel
- [ ] useOverlay hook integrates with manager
- [ ] Global escape handler works correctly
- [ ] 63 tests pass, tsc clean

---

### Phase C: ModalBase (Behavior Layer) (2 sessions)

**Goal**: Implement Layer 2 — ModalBase connects Overlay runtime with UI transitions.

#### C1: ModalBase Component (1.5 sessions)

**Files**:
- `components/ModalBase/ModalBase.tsx`
- `components/ModalBase/ModalBase.module.css`
- `components/ModalBase/ModalBase.context.tsx`
- `components/ModalBase/ModalBase.test.tsx`

**API Design**:

```typescript
export interface ModalBaseProps extends BoxProps {
  opened: boolean;
  onClose: () => void;
  
  // Runtime options
  trapFocus?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  withinPortal?: boolean;
  
  // Transition
  transitionProps?: TransitionOverride;
  
  // Styling
  zIndex?: number;
  children?: React.ReactNode;
}

export const ModalBase = forwardRef<HTMLDivElement, ModalBaseProps>(
  (props, ref) => {
    const {
      opened,
      onClose,
      trapFocus = true,
      closeOnEscape = true,
      lockScroll = true,
      withinPortal = true,
      transitionProps,
      zIndex: zIndexProp,
      children,
      ...others
    } = props;
    
    // Register with overlay manager
    const { zIndex, isActive } = useOverlay({
      opened,
      onClose,
      trapFocus,
      closeOnEscape,
      lockScroll,
    });
    
    // Focus return
    useFocusReturn({ opened, shouldReturnFocus: trapFocus });
    
    // Scroll lock
    useScrollLock({ enabled: opened && lockScroll });
    
    const finalZIndex = zIndexProp ?? zIndex;
    
    return (
      <OptionalPortal withinPortal={withinPortal}>
        <Box
          ref={ref}
          data-modal-base
          data-active={isActive || undefined}
          style={{ zIndex: finalZIndex }}
          {...others}
        >
          {children}
        </Box>
      </OptionalPortal>
    );
  }
);
```

**Tests**: 30 tests covering overlay integration, portal, focus, scroll lock

---

#### C2: ModalBase Subcomponents (0.5 session)

**Files**:
- `components/ModalBase/ModalBaseOverlay.tsx`
- `components/ModalBase/ModalBaseContent.tsx`
- `components/ModalBase/index.ts`

**Subcomponents**:

```typescript
// ModalBaseOverlay.tsx
export const ModalBaseOverlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ onClick, ...props }, ref) => {
    const ctx = useModalBaseContext();
    
    return (
      <Transition mounted={ctx.opened} transition="fade">
        {(styles) => (
          <Overlay
            ref={ref}
            fixed
            style={styles}
            onClick={(e) => {
              onClick?.(e);
              ctx.closeOnClickOutside && ctx.onClose();
            }}
            {...props}
          />
        )}
      </Transition>
    );
  }
);

// ModalBaseContent.tsx
export const ModalBaseContent = forwardRef<HTMLDivElement, PaperProps>(
  (props, ref) => {
    const ctx = useModalBaseContext();
    const trapRef = useFocusTrap(ctx.opened && ctx.trapFocus);
    const mergedRef = useMergedRef(ref, trapRef);
    
    return (
      <Transition mounted={ctx.opened} transition="pop">
        {(styles) => (
          <Paper
            ref={mergedRef}
            role="dialog"
            aria-modal
            style={styles}
            {...props}
          />
        )}
      </Transition>
    );
  }
);
```

**Tests**: 15 tests for overlay click, content focus trap, transitions

**Acceptance Criteria**:
- [ ] ModalBase integrates with OverlayManager
- [ ] Focus trap and scroll lock work correctly
- [ ] Portal rendering works
- [ ] Subcomponents (Overlay, Content) render correctly
- [ ] 45 tests pass, tsc clean

---

### Phase D: Dialog (Semantic Layer) (2 sessions)

**Goal**: Implement Layer 3 — Dialog adds semantic structure (header, footer, close button).

#### D1: Dialog Component (1.5 sessions)

**Files**:
- `components/Dialog/Dialog.tsx`
- `components/Dialog/Dialog.module.css`
- `components/Dialog/Dialog.context.tsx`
- `components/Dialog/Dialog.test.tsx`

**API Design**:

```typescript
export interface DialogProps extends ModalBaseProps {
  title?: React.ReactNode;
  withCloseButton?: boolean;
  closeButtonProps?: CloseButtonProps;
  size?: PrismuiSize | number;
  centered?: boolean;
  fullScreen?: boolean;
}

export const Dialog = factory<DialogFactory>((_props, ref) => {
  const props = useProps('Dialog', defaultProps, _props);
  const {
    title,
    withCloseButton,
    closeButtonProps,
    size,
    centered,
    fullScreen,
    children,
    ...others
  } = props;
  
  const getStyles = useStyles<DialogFactory>({
    name: 'Dialog',
    classes,
    props,
    // ...
  });
  
  return (
    <ModalBase ref={ref} {...others}>
      <ModalBaseOverlay />
      <div {...getStyles('inner')} data-centered={centered || undefined}>
        <ModalBaseContent {...getStyles('content')}>
          {(title || withCloseButton) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {withCloseButton && <DialogCloseButton {...closeButtonProps} />}
            </DialogHeader>
          )}
          <DialogBody>{children}</DialogBody>
        </ModalBaseContent>
      </div>
    </ModalBase>
  );
});
```

**Tests**: 35 tests covering title, close button, sizing, centering, fullScreen

---

#### D2: Dialog Subcomponents (0.5 session)

**Files**:
- `components/Dialog/DialogHeader.tsx`
- `components/Dialog/DialogTitle.tsx`
- `components/Dialog/DialogBody.tsx`
- `components/Dialog/DialogFooter.tsx`
- `components/Dialog/DialogCloseButton.tsx`
- `components/Dialog/index.ts`

**Compound Components**:

```typescript
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
Dialog.CloseButton = DialogCloseButton;
```

**Tests**: 20 tests for compound components, composition

**Acceptance Criteria**:
- [ ] Dialog renders with header, title, body, footer
- [ ] Close button works correctly
- [ ] Size, centered, fullScreen props work
- [ ] Compound components work
- [ ] 55 tests pass, tsc clean

---

### Phase E: DialogController (Programmatic Layer) (2 sessions)

**Goal**: Implement Layer 4 — Programmatic API for imperative dialog control.

#### E1: DialogController Core (1 session)

**Files**:
- `core/runtime/dialog/DialogController.ts`
- `core/runtime/dialog/types.ts`
- `core/runtime/dialog/DialogController.test.ts`

**API Design**:

```typescript
export interface DialogControllerOptions {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  // ... other options
}

export interface DialogController {
  open(options: DialogControllerOptions): string;
  close(id: string): void;
  confirm(options: DialogControllerOptions): Promise<boolean>;
  alert(options: Omit<DialogControllerOptions, 'onCancel'>): Promise<void>;
}

export function createDialogController(
  overlay: OverlayManager
): DialogController {
  const dialogs = new Map<string, DialogControllerOptions>();
  
  return {
    open(options) {
      const id = generateId();
      dialogs.set(id, options);
      // Render logic handled by DialogRenderer
      return id;
    },
    
    close(id) {
      dialogs.delete(id);
    },
    
    async confirm(options) {
      return new Promise((resolve) => {
        const id = this.open({
          ...options,
          onConfirm: async () => {
            await options.onConfirm?.();
            this.close(id);
            resolve(true);
          },
          onCancel: () => {
            options.onCancel?.();
            this.close(id);
            resolve(false);
          },
        });
      });
    },
    
    async alert(options) {
      return new Promise((resolve) => {
        const id = this.open({
          ...options,
          onConfirm: async () => {
            await options.onConfirm?.();
            this.close(id);
            resolve();
          },
        });
      });
    },
  };
}
```

**Tests**: 25 tests for open, close, confirm, alert, promises

---

#### E2: DialogModule & Renderer (1 session)

**Files**:
- `core/runtime/dialog/dialogModule.ts`
- `core/runtime/dialog/DialogRenderer.tsx`
- `core/runtime/dialog/useDialogController.ts`
- `core/runtime/dialog/index.ts`

**Module Implementation**:

```typescript
export function dialogModule(): PrismuiModule {
  return {
    name: 'dialog',
    
    setup(kernel) {
      const overlay = kernel.get<OverlayManager>('overlay');
      if (!overlay) {
        throw new Error('dialogModule requires overlayModule');
      }
      
      const controller = createDialogController(overlay);
      kernel.expose('dialog', controller);
    },
  };
}

export function useDialogController(): DialogController {
  const kernel = useRuntimeKernel();
  const controller = kernel.getExposed<DialogController>('dialog');
  
  if (!controller) {
    throw new Error(
      'DialogController not found. Did you add dialogModule() to PrismuiProvider?'
    );
  }
  
  return controller;
}
```

**DialogRenderer**: Component that subscribes to controller state and renders dialogs.

**Tests**: 20 tests for module setup, renderer, hook access

**Acceptance Criteria**:
- [ ] DialogController implements open/close/confirm/alert
- [ ] dialogModule exposes controller via kernel
- [ ] DialogRenderer renders programmatic dialogs
- [ ] useDialogController hook works
- [ ] Promise-based confirm/alert work
- [ ] 45 tests pass, tsc clean

---

### Phase F: Documentation & Examples (1 session)

**Goal**: Comprehensive documentation and examples.

**Files**:
- `devdocs/guides/RUNTIME-PLATFORM.md`
- `devdocs/guides/OVERLAY-SYSTEM.md`
- `devdocs/guides/DIALOG-USAGE.md`
- `components/Dialog/Dialog.stories.tsx` (15 stories)

**Story Examples**:
- Basic Dialog
- With Title & Close Button
- Centered & Fullscreen
- Nested Dialogs (z-index test)
- Programmatic confirm()
- Programmatic alert()
- Custom Footer
- Scroll Lock Demo
- Focus Trap Demo

**Acceptance Criteria**:
- [ ] Runtime Platform guide complete
- [ ] Overlay System guide complete
- [ ] Dialog usage guide complete
- [ ] 15 Storybook stories
- [ ] All examples work correctly

---

## Testing Strategy

### Unit Tests
- **Runtime Kernel**: 27 tests
- **OverlayManager**: 63 tests
- **ModalBase**: 45 tests
- **Dialog**: 55 tests
- **DialogController**: 45 tests
- **Total**: ~235 new tests

### Integration Tests
- Nested dialogs with correct z-index
- Escape key closes active dialog only
- Scroll lock coordination
- Focus trap with multiple dialogs
- Programmatic API with promises

### E2E Tests (Future)
- Full dialog lifecycle
- Keyboard navigation
- Screen reader compatibility

---

## Migration Guide

### From STAGE-004 Modal (Incomplete)

The incomplete Modal work from STAGE-004 will be **archived** and replaced with the new four-layer architecture:

**Old Approach** (STAGE-004):
```tsx
<Modal opened={opened} onClose={close}>
  Content
</Modal>
```

**New Approach** (STAGE-005):

**Layer 3 (Semantic)**:
```tsx
<Dialog opened={opened} onClose={close} title="Title">
  Content
</Dialog>
```

**Layer 4 (Programmatic)**:
```tsx
const dialog = useDialogController();

await dialog.confirm({
  title: 'Delete?',
  content: 'Are you sure?',
});
```

### Breaking Changes
- `Modal` component removed (replaced by `Dialog`)
- `useScrollLock` moved to runtime layer
- Portal/Overlay now managed by OverlayManager

---

## Success Metrics

### Technical
- [ ] 235+ tests passing
- [ ] tsc --noEmit clean
- [ ] Zero runtime errors in Storybook
- [ ] Tree-shakable modules (verified with bundle analysis)

### Architectural
- [ ] Four layers clearly separated
- [ ] Runtime/Design separation enforced
- [ ] Module system extensible
- [ ] No direct document.body manipulation in components

### Developer Experience
- [ ] Clear module registration API
- [ ] Helpful error messages for missing modules
- [ ] Comprehensive TypeScript types
- [ ] Excellent documentation

---

## Future Extensions (Post-STAGE-005)

### STAGE-006 Candidates
- **ToastModule**: Programmatic toast notifications
- **DrawerModule**: Drawer component + controller
- **PopoverModule**: Popover with positioning engine
- **CommandPaletteModule**: Command palette runtime
- **DevToolsModule**: Runtime inspector overlay

### Long-term Vision
- Plugin marketplace
- Third-party runtime modules
- SSR-optimized variants
- Micro-frontend isolation
- A/B testing runtime

---

## Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| A: Runtime Kernel | 2 sessions | 2 |
| B: Overlay System | 3 sessions | 5 |
| C: ModalBase | 2 sessions | 7 |
| D: Dialog | 2 sessions | 9 |
| E: DialogController | 2 sessions | 11 |
| F: Documentation | 1 session | 12 |

**Total**: 12 sessions (~3-4 weeks)

---

## Conclusion

STAGE-005 represents a **paradigm shift** in PrismUI's architecture. By implementing the four-layer model and runtime module system, we establish PrismUI as a true **UI Runtime Platform** capable of supporting large-scale applications with complex overlay requirements.

This foundation enables future extensions (Toast, Drawer, Popover, CommandPalette) to be added as pluggable modules without architectural debt.

**The future of PrismUI is modular, composable, and runtime-driven.**
