# STAGE-004 to STAGE-005 Transition Summary

**Date**: 2026-02-17  
**Decision**: [ADR-011: Runtime Platform Architecture](./decisions/ADR-011-Runtime-Platform-Architecture.md)  
**New Stage**: [STAGE-005: Runtime Platform](./stages/STAGE-005-Runtime-Platform.md)

---

## Executive Summary

PrismUI has undergone a **fundamental architectural pivot** from a component library to a **UI Runtime Platform**. This transition redefines PrismUI's positioning and establishes a four-layer architecture for all complex overlay components.

---

## What Changed

### Before: Component Library Approach
- Components as standalone units
- Modal, Dialog, Drawer as separate components
- No runtime coordination
- Boolean props for features
- Direct DOM manipulation

### After: Runtime Platform Approach
- **Layer 0**: Runtime Kernel (module system)
- **Layer 1**: Runtime Systems (Overlay, Focus, Positioning)
- **Layer 2**: Behavior Bases (ModalBase, DrawerBase)
- **Layer 3**: Semantic Components (Dialog, Drawer)
- **Layer 4**: Programmatic Controllers (dialog.confirm(), toast.show())

---

## STAGE-004 Status

### ✅ Completed Work (Preserved)

The following components from STAGE-004 remain valid and will be integrated into STAGE-005:

| Component | Status | Integration Plan |
|-----------|--------|------------------|
| **Text** | ✅ Complete | No changes needed |
| **Anchor** | ✅ Complete | No changes needed |
| **Transition** | ✅ Complete | Used by Layer 2 (ModalBase) |
| **Alert** | ✅ Complete | No changes needed |
| **Overlay** | ✅ Complete | Used by Layer 2 (ModalBase) |
| **VisuallyHidden** | ✅ Complete | Used by FocusTrap |
| **FocusTrap** | ✅ Complete | Used by Layer 2 (ModalBase) |
| **Portal** | ✅ Complete | Used by Layer 2 (ModalBase) |
| **Paper** | ✅ Complete | Used by Layer 2 (ModalBase) |

**Test Count**: 1046 tests passing  
**Files Preserved**: All completed components remain in codebase

---

### ⚠️ Incomplete Work (Superseded)

The following work was started but superseded by the new architecture:

| Item | Status | Replacement |
|------|--------|-------------|
| **Modal** (STAGE-004 C2) | ⏸️ Halted | **Dialog** (STAGE-005 Phase D) |
| **useScrollLock** | ⏸️ Partial | Integrated into OverlayModule (STAGE-005 Phase B) |
| **Popover** | ❌ Not started | STAGE-006+ (with PositioningModule) |
| **Toast** | ❌ Not started | STAGE-006+ (with ToastModule) |
| **Badge** | ❌ Not started | STAGE-006+ |

**Files to Archive**:
- `hooks/use-scroll-lock.ts` (partial implementation, will be replaced)

---

## STAGE-005 Overview

### Timeline
- **Duration**: 12 sessions (~3-4 weeks)
- **Start**: 2026-02-17
- **Target**: Q1 2026

### Phases

#### Phase A: Runtime Kernel (2 sessions)
- RuntimeKernel core
- PrismuiProvider integration
- Module system

#### Phase B: Overlay Runtime System (3 sessions)
- OverlayManager (stack, z-index, escape)
- overlayModule
- useOverlay hook

#### Phase C: ModalBase (2 sessions)
- ModalBase component (Layer 2)
- ModalBaseOverlay, ModalBaseContent
- Runtime integration

#### Phase D: Dialog (2 sessions)
- Dialog component (Layer 3)
- DialogHeader, DialogTitle, DialogBody, DialogFooter
- Compound components

#### Phase E: DialogController (2 sessions)
- DialogController (Layer 4)
- dialogModule
- Programmatic API (confirm, alert)

#### Phase F: Documentation (1 session)
- Runtime Platform guide
- Overlay System guide
- Dialog usage guide
- 15 Storybook stories

---

## Key Architectural Changes

### 1. Module System

**Before**:
```tsx
<PrismuiProvider theme={theme}>
  <App />
</PrismuiProvider>
```

**After**:
```tsx
<PrismuiProvider
  theme={theme}
  modules={[
    overlayModule(),
    dialogModule(),
    toastModule(),
  ]}
>
  <App />
</PrismuiProvider>
```

### 2. Component Usage

**Before (STAGE-004 Modal)**:
```tsx
<Modal opened={opened} onClose={close}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
</Modal>
```

**After (STAGE-005 Dialog)**:

**Declarative (Layer 3)**:
```tsx
<Dialog opened={opened} onClose={close} title="Title">
  Content
</Dialog>
```

**Imperative (Layer 4)**:
```tsx
const dialog = useDialogController();

const confirmed = await dialog.confirm({
  title: 'Delete item?',
  content: 'Are you sure?',
});
```

### 3. Runtime Coordination

**Before**: Each Modal manages its own scroll lock, z-index, escape handling

**After**: OverlayManager coordinates all overlays:
- Centralized z-index allocation
- Single escape handler (closes active overlay only)
- Coordinated scroll lock (one lock for multiple overlays)
- Nested overlay support

---

## Migration Guide

### For Developers

1. **Completed STAGE-004 components**: No changes needed
2. **Modal usage**: Will be replaced by Dialog in STAGE-005
3. **New capabilities**: Programmatic dialog API, nested overlays, runtime modules

### For Future Work

1. **Toast**: Will use ToastModule (Layer 4 controller)
2. **Drawer**: Will use DrawerBase (Layer 2) + DrawerModule (Layer 4)
3. **Popover**: Will use PopoverBase (Layer 2) + PositioningModule (Layer 1)
4. **CommandPalette**: Will use dedicated runtime module

---

## Testing Impact

### Preserved Tests
- **1046 tests** from STAGE-001 through STAGE-004 Phase B remain valid
- No regressions expected

### New Tests (STAGE-005)
- **~235 new tests** across 6 phases
- Total expected: **~1280 tests**

### Test Categories
- Unit: Runtime Kernel, OverlayManager, ModalBase, Dialog, DialogController
- Integration: Multi-layer interaction, nested overlays, module dependencies
- E2E: Full workflows, keyboard navigation, accessibility

---

## Documentation Updates

### New Documents
1. ✅ **ADR-011**: Runtime Platform Architecture (constitutional)
2. ✅ **RUNTIME-PLATFORM.md**: Complete architectural guide
3. ✅ **STAGE-005-Runtime-Platform.md**: Detailed implementation plan
4. ✅ **STAGE-004-TO-005-TRANSITION.md**: This document

### Updated Documents
1. ✅ **DECISIONS.md**: Added ADR-011
2. ✅ **MODULES.md**: Updated to v3.0 with runtime structure
3. ✅ **STAGE-004-Content-Feedback-Docs.md**: Marked as superseded

---

## Success Criteria

### Technical
- [ ] 235+ new tests passing
- [ ] 1280+ total tests passing
- [ ] tsc --noEmit clean
- [ ] Zero runtime errors in Storybook
- [ ] Tree-shakable modules verified

### Architectural
- [ ] Four layers clearly separated
- [ ] Runtime/Design separation enforced
- [ ] Module system extensible
- [ ] No direct document.body manipulation

### Developer Experience
- [ ] Clear module registration API
- [ ] Helpful error messages for missing modules
- [ ] Comprehensive TypeScript types
- [ ] Excellent documentation

---

## Future Vision

### STAGE-006+ Candidates
- **ToastModule**: Programmatic notifications with queue
- **DrawerModule**: Side panel with positioning
- **PopoverModule**: Floating content with positioning engine
- **CommandPaletteModule**: Command palette runtime
- **DevToolsModule**: Runtime inspector overlay

### Long-term Capabilities
- Plugin marketplace
- Third-party runtime modules
- SSR-optimized variants
- Micro-frontend isolation
- A/B testing runtime
- Window management system
- Dock system
- Floating AI panel

---

## Conclusion

The transition from STAGE-004 to STAGE-005 represents a **paradigm shift** in PrismUI's architecture. By establishing the Runtime Platform foundation, we enable:

- **Modularity**: Tree-shakable, opt-in capabilities
- **Extensibility**: Third-party plugins and modules
- **Scalability**: Micro-frontend and SSR support
- **Maintainability**: Clear separation of concerns

**All completed STAGE-004 work is preserved. The incomplete Modal work is superseded by the superior four-layer Dialog architecture.**

**PrismUI is now positioned as a platform-grade UI infrastructure for large-scale applications.**
