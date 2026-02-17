# PrismUI Runtime Platform Architecture

**Status**: Constitutional  
**Version**: 1.0  
**Date**: 2026-02-17  
**Authority**: [ADR-011](../decisions/ADR-011-Runtime-Platform-Architecture.md)

---

## Platform Definition

> **PrismUI is a Composable UI Runtime Platform for Large-Scale Applications.**

PrismUI is **not just a component library** — it is a runtime platform that provides:

- ✅ **Runtime Kernel**: Module registration and lifecycle management
- ✅ **Runtime Systems**: Overlay, Focus, Positioning orchestration
- ✅ **Behavior Bases**: Reusable behavior primitives (ModalBase, DrawerBase)
- ✅ **Semantic Components**: Design-system-aware UI components (Dialog, Drawer)
- ✅ **Programmatic Controllers**: Imperative APIs (dialog.confirm(), toast.show())

---

## Core Principles (Constitutional)

### 1. Runtime ≠ Design System

**Runtime concerns** (behavior, scheduling, coordination) are **architecturally separated** from **Design System concerns** (tokens, variants, styles).

```
ThemeSystem ≠ RuntimeSystem
```

**Enforcement**:
- ❌ OverlayManager MUST NOT access Theme
- ❌ Runtime modules MUST NOT depend on theme tokens
- ✅ Runtime provides behavior; components apply design

---

### 2. Four-Layer Architecture

All complex overlay components MUST follow this structure:

```
Layer 0: Runtime Kernel       ← Module registration, lifecycle
Layer 1: Runtime System        ← Overlay stack, z-index, escape, scroll lock
Layer 2: Behavior Base         ← ModalBase, DrawerBase (runtime integration)
Layer 3: Semantic Component    ← Dialog, Drawer (design system)
Layer 4: Programmatic Controller ← dialog.confirm(), toast.show()
```

**Example: Dialog**

```
PrismuiProvider (modules=[overlayModule(), dialogModule()])
    ↓
RuntimeKernel
    ↓
OverlayModule (Layer 1)
    ↓
ModalBase (Layer 2)
    ↓
Dialog (Layer 3)
    ↓
DialogController (Layer 4)
```

**Enforcement**:
- Each layer has a single, well-defined responsibility
- Layers communicate only through defined interfaces
- No layer may bypass the layer below it

---

### 3. Module-Based Capabilities

All runtime capabilities MUST be provided through **pluggable modules**.

**Prohibited**:
```tsx
// ❌ Boolean flags
<PrismuiProvider enableOverlay enableDialog enableToast>
```

**Required**:
```tsx
// ✅ Module injection
<PrismuiProvider
  modules={[
    overlayModule(),
    dialogModule(),
    toastModule(),
  ]}
>
```

**Rationale**:
- Tree-shakable (unused modules not bundled)
- Testable in isolation
- Extensible (third-party modules)
- Micro-frontend compatible
- SSR-variant friendly

---

## Layer Responsibilities

### Layer 0: Runtime Kernel

**Location**: `core/runtime/RuntimeKernel.ts`

**Responsibilities**:
- Module registration (`register`, `get`, `has`)
- Public API exposure (`expose`, `getExposed`)
- Lifecycle management (setup, teardown)
- Context provision

**Interface**:
```typescript
interface RuntimeKernel {
  register<T>(name: string, value: T): void;
  get<T>(name: string): T | undefined;
  has(name: string): boolean;
  expose<T>(name: string, api: T): void;
  getExposed<T>(name: string): T | undefined;
}
```

**Constraints**:
- MUST be created by PrismuiProvider
- MUST NOT contain business logic
- MUST be accessible via React Context

---

### Layer 1: Runtime Systems

**Examples**: OverlayModule, FocusModule, PositioningModule

**Responsibilities**:
- Stack management (overlay z-index allocation)
- Global event handling (escape key, scroll lock)
- Coordination between instances
- State synchronization

**Example: OverlayModule**

```typescript
export function overlayModule(): PrismuiModule {
  return {
    name: 'overlay',
    setup(kernel) {
      const manager = createOverlayManager();
      kernel.register('overlay', manager);
      
      // Global escape handler
      document.addEventListener('keydown', handleEscape);
    },
    teardown() {
      document.removeEventListener('keydown', handleEscape);
    },
  };
}
```

**Constraints**:
- MUST NOT render UI
- MUST NOT access Theme
- MUST provide hooks for component integration
- MUST handle cleanup in teardown

---

### Layer 2: Behavior Bases

**Examples**: ModalBase, DrawerBase, PopoverBase

**Responsibilities**:
- Register with Runtime System (e.g., OverlayManager)
- Manage lifecycle (open/close)
- Integrate transitions
- Connect focus trap
- Coordinate scroll lock

**Example: ModalBase**

```typescript
export const ModalBase = forwardRef<HTMLDivElement, ModalBaseProps>(
  (props, ref) => {
    const { opened, onClose, trapFocus, lockScroll } = props;
    
    // Register with OverlayManager
    const { zIndex } = useOverlay({ opened, onClose, trapFocus });
    
    // Focus management
    useFocusReturn({ opened });
    
    // Scroll lock
    useScrollLock({ enabled: opened && lockScroll });
    
    return (
      <OptionalPortal>
        <Box ref={ref} style={{ zIndex }}>
          {props.children}
        </Box>
      </OptionalPortal>
    );
  }
);
```

**Constraints**:
- MUST integrate with Layer 1 Runtime System
- MUST NOT define semantic structure (header, footer)
- MUST NOT apply design tokens directly
- MUST provide compound component slots

---

### Layer 3: Semantic Components

**Examples**: Dialog, Drawer, Tooltip

**Responsibilities**:
- Define semantic structure (header, title, body, footer)
- Apply design tokens (spacing, radius, shadow)
- Provide default styles
- Implement Styles API

**Example: Dialog**

```typescript
export const Dialog = factory<DialogFactory>((props, ref) => {
  const { title, withCloseButton, children, size, centered } = props;
  
  return (
    <ModalBase ref={ref} {...baseProps}>
      <ModalBaseOverlay />
      <ModalBaseContent>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {withCloseButton && <DialogCloseButton />}
          </DialogHeader>
        )}
        <DialogBody>{children}</DialogBody>
      </ModalBaseContent>
    </ModalBase>
  );
});
```

**Constraints**:
- MUST use Layer 2 Behavior Base
- MUST implement factory pattern
- MUST support Styles API
- MUST NOT contain runtime logic

---

### Layer 4: Programmatic Controllers

**Examples**: DialogController, ToastController

**Responsibilities**:
- Imperative API (dialog.confirm(), toast.show())
- Promise-based workflows
- Default behavior injection
- Queue management

**Example: DialogController**

```typescript
export interface DialogController {
  open(options: DialogOptions): string;
  close(id: string): void;
  confirm(options: DialogOptions): Promise<boolean>;
  alert(options: DialogOptions): Promise<void>;
}

// Usage
const dialog = useDialogController();

const confirmed = await dialog.confirm({
  title: 'Delete item?',
  content: 'This action cannot be undone.',
});

if (confirmed) {
  // proceed with deletion
}
```

**Constraints**:
- MUST be exposed via Runtime Kernel
- MUST be optional (requires module)
- MUST NOT manipulate DOM directly
- MUST use Layer 3 components for rendering

---

## Module System

### Module Interface

```typescript
export interface PrismuiModule {
  name: string;
  setup(kernel: RuntimeKernel): void | Promise<void>;
  teardown?(): void;
}
```

### Module Registration

```tsx
<PrismuiProvider
  modules={[
    themeModule(),           // Design system
    overlayModule(),         // Layer 1: Overlay runtime
    focusModule(),           // Layer 1: Focus management
    dialogModule(),          // Layer 4: Dialog controller
    toastModule(),           // Layer 4: Toast controller
  ]}
>
  <App />
</PrismuiProvider>
```

### Module Dependencies

Modules can depend on other modules:

```typescript
export function dialogModule(): PrismuiModule {
  return {
    name: 'dialog',
    setup(kernel) {
      // Require overlayModule
      const overlay = kernel.get<OverlayManager>('overlay');
      if (!overlay) {
        throw new Error('dialogModule requires overlayModule');
      }
      
      const controller = createDialogController(overlay);
      kernel.expose('dialog', controller);
    },
  };
}
```

---

## Hard Constraints (Enforceable)

### Prohibited Patterns

1. **❌ Runtime accessing Theme**
   ```typescript
   // ❌ FORBIDDEN
   const manager = createOverlayManager(theme.zIndex.modal);
   ```

2. **❌ Components bypassing Runtime**
   ```typescript
   // ❌ FORBIDDEN
   document.body.style.overflow = 'hidden';
   ```

3. **❌ Boolean module flags**
   ```typescript
   // ❌ FORBIDDEN
   <PrismuiProvider enableDialog enableToast />
   ```

4. **❌ Layer violations**
   ```typescript
   // ❌ FORBIDDEN: Dialog directly using OverlayManager
   const manager = useOverlayManager();
   ```

### Required Patterns

1. **✅ Runtime through Kernel**
   ```typescript
   const kernel = useRuntimeKernel();
   const overlay = kernel.get<OverlayManager>('overlay');
   ```

2. **✅ Module injection**
   ```typescript
   <PrismuiProvider modules={[overlayModule()]} />
   ```

3. **✅ Layer respect**
   ```typescript
   // Dialog uses ModalBase, not OverlayManager directly
   <ModalBase>{/* Dialog content */}</ModalBase>
   ```

---

## Future Extensions

The Runtime Platform architecture enables:

### Planned Modules (STAGE-006+)
- **ToastModule**: Notification system with queue
- **DrawerModule**: Side panel with positioning
- **PopoverModule**: Floating content with positioning engine
- **CommandPaletteModule**: Command palette runtime
- **WindowManagerModule**: Multi-window coordination

### Advanced Capabilities
- **Plugin System**: Third-party runtime modules
- **DevTools Module**: Runtime inspector overlay
- **Motion Scheduler**: Coordinated animations
- **Layout Engine**: Advanced layout coordination
- **SSR Variants**: Server-optimized modules

---

## Migration from Component Library

### Before (Component Library Approach)

```tsx
// Standalone components
<Modal opened={opened} onClose={close}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
</Modal>
```

### After (Runtime Platform Approach)

**Declarative (Layer 3)**:
```tsx
<Dialog opened={opened} onClose={close} title="Title">
  Content
</Dialog>
```

**Imperative (Layer 4)**:
```tsx
const dialog = useDialogController();

await dialog.confirm({
  title: 'Confirm action',
  content: 'Are you sure?',
});
```

---

## Testing Strategy

### Unit Tests
- **Layer 0**: Kernel registration, lifecycle
- **Layer 1**: Stack management, z-index, escape
- **Layer 2**: Runtime integration, focus, scroll lock
- **Layer 3**: Rendering, styles, props
- **Layer 4**: Promises, queue, controller API

### Integration Tests
- Multi-layer interaction
- Nested overlays
- Module dependencies
- Cleanup and teardown

### E2E Tests
- Full user workflows
- Keyboard navigation
- Screen reader compatibility

---

## Conclusion

The Runtime Platform Architecture establishes PrismUI as a **platform-grade UI infrastructure** for large-scale applications. By separating runtime concerns from design concerns and enforcing a four-layer model, we enable:

- **Modularity**: Tree-shakable, opt-in capabilities
- **Extensibility**: Third-party plugins and modules
- **Scalability**: Micro-frontend and SSR support
- **Maintainability**: Clear separation of concerns

**This is the architectural foundation for all future PrismUI development.**
