# PrismUI Architecture (Constitutional)

> **Status:** Active  
> **Version:** v3.0 — Runtime Platform Architecture  
> **Last Updated:** 2026-02-17  
> **Authority:** [ADR-011](../decisions/ADR-011-Runtime-Platform-Architecture.md)

This document defines **binding architectural rules** for PrismUI.
Any new module, feature, or refactor **MUST comply** with this document.
Violations require an Architecture Decision Record (ADR) and explicit approval.

---

## 1. Platform Definition

> **PrismUI is a Composable UI Runtime Platform for Large-Scale Applications.**

PrismUI is **not just a component library**. It is a runtime platform that provides:

- ✅ **Runtime Kernel**: Module registration and lifecycle management
- ✅ **Runtime Systems**: Overlay, Focus, Positioning orchestration
- ✅ **Behavior Bases**: Reusable behavior primitives (ModalBase, DrawerBase)
- ✅ **Semantic Components**: Design-system-aware UI components (Dialog, Drawer)
- ✅ **Programmatic Controllers**: Imperative APIs (dialog.confirm(), toast.show())

See [RUNTIME-PLATFORM.md](./RUNTIME-PLATFORM.md) for complete architectural vision.

---

## 2. Core Principles (Constitutional)

### 2.1 Runtime ≠ Design System

**Runtime concerns** (behavior, scheduling, coordination) are **architecturally separated** from **Design System concerns** (tokens, variants, styles).

```
ThemeSystem ≠ RuntimeSystem
```

**Enforcement**:
- ❌ OverlayManager MUST NOT access Theme
- ❌ Runtime modules MUST NOT depend on theme tokens
- ✅ Runtime provides behavior; components apply design

---

### 2.2 Four-Layer Architecture (MANDATORY)

All complex overlay components MUST follow this structure:

```
Layer 0: Runtime Kernel       ← Module registration, lifecycle
Layer 1: Runtime System        ← Overlay stack, z-index, escape, scroll lock
Layer 2: Behavior Base         ← ModalBase, DrawerBase (runtime integration)
Layer 3: Semantic Component    ← Dialog, Drawer (design system)
Layer 4: Programmatic Controller ← dialog.confirm(), toast.show()
```

**Example: Dialog Architecture**

```
PrismuiProvider (modules=[overlayModule(), dialogModule()])
    ↓
RuntimeKernel (Layer 0)
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
- Runtime logic MUST NOT leak into semantic components

---

### 2.3 Module-Based Capabilities

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

## 3. Layered Architecture (ENFORCED)

### 3.1 System Layering Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (User's React App using PrismUI components)            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Layer 3        │    │  Design System  │
│  Semantic       │◄───│  (Theme)        │
│  Components     │    │                 │
│  Dialog, Drawer │    │  Tokens, Colors │
└────────┬────────┘    │  Typography     │
         │             │  Spacing, etc.  │
         ▼             └─────────────────┘
┌─────────────────┐
│  Layer 2        │
│  Behavior Bases │
│  ModalBase      │
│  DrawerBase     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│  Layer 1        │    │  Layer 4        │
│  Runtime        │◄───│  Programmatic   │
│  Systems        │    │  Controllers    │
│  Overlay, Focus │    │  dialog.confirm │
└────────┬────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Layer 0        │
│  Runtime Kernel │
│  Module System  │
└─────────────────┘
```

---

### 3.2 Layer 0: Runtime Kernel

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

**Hard Constraints**:
- MUST be created by PrismuiProvider
- MUST NOT contain business logic
- MUST be accessible via React Context
- MUST support async module setup

---

### 3.3 Layer 1: Runtime Systems

**Examples**: OverlayModule, FocusModule, PositioningModule

**Responsibilities**:
- Stack management (overlay z-index allocation)
- Global event handling (escape key, scroll lock)
- Coordination between instances
- State synchronization

**Hard Constraints**:
- MUST NOT render UI
- MUST NOT access Theme
- MUST provide hooks for component integration
- MUST handle cleanup in teardown

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

---

### 3.4 Layer 2: Behavior Bases

**Examples**: ModalBase, DrawerBase, PopoverBase

**Responsibilities**:
- Register with Runtime System (e.g., OverlayManager)
- Manage lifecycle (open/close)
- Integrate transitions
- Connect focus trap
- Coordinate scroll lock

**Hard Constraints**:
- MUST integrate with Layer 1 Runtime System
- MUST NOT define semantic structure (header, footer)
- MUST NOT apply design tokens directly
- MUST provide compound component slots

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

---

### 3.5 Layer 3: Semantic Components

**Examples**: Dialog, Drawer, Tooltip

**Responsibilities**:
- Define semantic structure (header, title, body, footer)
- Apply design tokens (spacing, radius, shadow)
- Provide default styles
- Implement Styles API

**Hard Constraints**:
- MUST use Layer 2 Behavior Base
- MUST implement factory pattern
- MUST support Styles API
- MUST NOT contain runtime logic

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

---

### 3.6 Layer 4: Programmatic Controllers

**Examples**: DialogController, ToastController

**Responsibilities**:
- Imperative API (dialog.confirm(), toast.show())
- Promise-based workflows
- Default behavior injection
- Queue management

**Hard Constraints**:
- MUST be exposed via Runtime Kernel
- MUST be optional (requires module)
- MUST NOT manipulate DOM directly
- MUST use Layer 3 components for rendering

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
```

---

### 3.7 Design System (Parallel to Runtime)

**Location**: `core/theme/`, `core/styles-api/`

**Responsibilities**:
- Theme tokens (colors, spacing, typography, shadows)
- Variant system (solid, soft, outlined, plain)
- Styles API (classNames, styles, vars)
- CSS variable generation

**Hard Constraints**:
- MUST NOT depend on Runtime System
- MUST be accessible to Layer 3 components only
- MUST NOT contain behavior logic

---

## 4. Module System Architecture

### 4.1 Module Interface

```typescript
export interface PrismuiModule {
  name: string;
  setup(kernel: RuntimeKernel): void | Promise<void>;
  teardown?(): void;
}
```

### 4.2 Module Registration

```tsx
<PrismuiProvider
  theme={customTheme}
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

### 4.3 Module Dependencies

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

## 5. Hard Constraints (Enforceable)

### 5.1 Prohibited Patterns

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

5. **❌ Design tokens in Runtime**
   ```typescript
   // ❌ FORBIDDEN
   const overlay = {
     zIndex: theme.zIndex.modal, // Runtime must not access theme
   };
   ```

---

### 5.2 Required Patterns

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

4. **✅ Design tokens in components only**
   ```typescript
   // Layer 3 component applies theme
   const getStyles = useStyles({ theme, ... });
   ```

---

## 6. Component Architecture

### 6.1 Factory System

All components MUST use the factory pattern:

```typescript
export const Component = factory<ComponentFactory>((props, ref) => {
  const { classNames, styles, vars, ...others } = props;
  
  const getStyles = useStyles<ComponentFactory>({
    name: 'Component',
    classes,
    props,
    classNames,
    styles,
    vars,
    varsResolver,
  });
  
  return <Box ref={ref} {...getStyles('root')} {...others} />;
});
```

### 6.2 Styles API

All components MUST support:
- `classNames`: Multi-source className merging
- `styles`: Multi-source style merging
- `vars`: CSS variable overrides
- `unstyled`: Disable all default styles

### 6.3 Polymorphic Components

Layout components MUST support `component` prop:

```typescript
<Box component="section" />
<Stack component="nav" />
```

---

## 7. Package Structure

```
packages/
├── core/                   # @prismui/core
│   └── src/
│       ├── core/           # Infrastructure
│       │   ├── PrismuiProvider/
│       │   ├── theme/
│       │   ├── factory/
│       │   ├── styles-api/
│       │   ├── runtime/            # ← Layer 0 + Layer 1
│       │   │   ├── RuntimeKernel.ts
│       │   │   ├── overlay/        # OverlayModule
│       │   │   ├── dialog/         # DialogModule
│       │   │   └── toast/          # ToastModule
│       │   └── ...
│       ├── components/     # Layer 2 + Layer 3
│       │   ├── Box/
│       │   ├── ModalBase/          # ← Layer 2
│       │   ├── Dialog/             # ← Layer 3
│       │   └── ...
│       ├── hooks/
│       ├── utils/
│       └── index.ts
└── nextjs/                 # @prismui/nextjs (future)
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

- **Layer 0**: Kernel registration, lifecycle
- **Layer 1**: Stack management, z-index, escape
- **Layer 2**: Runtime integration, focus, scroll lock
- **Layer 3**: Rendering, styles, props
- **Layer 4**: Promises, queue, controller API

### 8.2 Integration Tests

- Multi-layer interaction
- Nested overlays
- Module dependencies
- Cleanup and teardown

### 8.3 E2E Tests

- Full user workflows
- Keyboard navigation
- Screen reader compatibility

---

## 9. Stability Policy

| Area                     | Stability  | Breaking Changes Allowed |
|--------------------------|------------|--------------------------|
| Runtime Kernel API       | Very High  | Major version only       |
| Module Interface         | Very High  | Major version only       |
| Layer 1 Runtime Systems  | High       | Minor version with ADR   |
| Layer 2 Behavior Bases   | Medium     | Minor version            |
| Layer 3 Components       | Medium     | Minor version            |
| Layer 4 Controllers      | Low        | Any version with notice  |
| Theme tokens             | Medium     | Minor version            |

Breaking changes **MUST**:
- Be documented via ADR
- Include migration strategy
- Provide deprecation warnings (1 minor version minimum)

---

## 10. Development Stages

Stages define **time-bounded capability constraints** over this architecture.

A Stage:
- DOES NOT introduce new architectural concepts
- DOES NOT change layer responsibilities
- ONLY restricts which modules and dataflows are legally instantiable at a given time

Current stages:
- **STAGE-001**: Foundation (Theme, SystemProps, Box) ✅
- **STAGE-002**: Factory & Styles API ✅
- **STAGE-003**: Advanced Theming & Layout ✅
- **STAGE-004**: Content & Feedback (partial) ⏸️
- **STAGE-005**: Runtime Platform Architecture 🔄

---

## 11. Enforcement Rules

1. New modules **MUST reference this document** in their README.
2. Code reviews **MUST block** layer violations.
3. CI **SHOULD** include architecture boundary checks.
4. Disputes are resolved via ADRs, not exceptions.
5. Runtime/Design separation is **non-negotiable**.

---

## 12. Relationship to Other Documents

- **[RUNTIME-PLATFORM.md](./RUNTIME-PLATFORM.md)**: Complete runtime architecture guide
- **[MODULES.md](./MODULES.md)**: Concrete module inventory
- **[DESIGN-PRINCIPLES.md](./DESIGN-PRINCIPLES.md)**: Design philosophy
- **[ADR-011](../decisions/ADR-011-Runtime-Platform-Architecture.md)**: Runtime platform decision

This document is the **highest authority** on PrismUI architecture.

---

## 13. Future Extensions

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

**This architecture is constitutional and binding for all PrismUI development.**
