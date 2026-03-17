# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-17

### Added - Rendering Layer (STAGE-008)

Layer 3 rendering components for PrismUI's built-in interaction modules. These React components subscribe to runtime state and render the corresponding UI using portals, completing the four-layer architecture from runtime kernel to visible UI.

#### ModalRenderer

- **Portal-based rendering**: Renders modals into `document.body` via React portals
- **Render-prop pattern**: `(modalId, close) => JSX` for full customization
- **Backdrop click**: Configurable backdrop click to close (`backdropClose` prop)
- **Escape key**: Configurable Escape key to close top modal (`escapeClose` prop)
- **Z-index stacking**: Automatic z-index management for stacked modals
- **Accessibility**: `role="dialog"` and `aria-modal="true"`
- **12 tests** covering rendering, backdrop, escape, stacking, and portal behavior

#### DrawerRenderer

- **Anchor positioning**: Renders drawers at left/right/top/bottom positions
- **Portal-based rendering**: Renders into `document.body`
- **Render-prop pattern**: `(drawerId, anchor, close) => JSX`
- **Backdrop + Escape**: Same close behavior options as ModalRenderer
- **Accessibility**: `role="complementary"` on drawer panel
- **15 tests** covering rendering, anchors, backdrop, escape, and portal behavior

#### NotificationRenderer

- **Toast notifications**: Renders active notifications as toast messages
- **Type-based styling**: Info (blue), success (green), warning (orange), error (red) with icons
- **Auto-dismiss**: Reads `autoDismissMs` from each notification entry for automatic removal
- **4 positions**: `top-right` (default), `top-left`, `bottom-right`, `bottom-left`
- **Custom rendering**: `renderNotification` prop for fully custom toast UI
- **Dismiss button**: Built-in dismiss button on each toast
- **16 tests** covering rendering, types, auto-dismiss, positions, and custom rendering

#### PrismUIRootRenderer

- **Convenience wrapper**: Single component rendering all three renderers
- **Props passthrough**: Forward individual renderer props
- **5 tests** covering composition and simultaneous rendering

#### Demo

- New "Rendering Layer" page showcasing all renderers with live examples

### Package Updates

- **@prismui/core** bumped to 0.3.0
- **@prismui/react** bumped to 0.3.0

### Testing & Quality

- **473 tests** across 25 test files (48 new)
- **0 failures**, 100% passing
- Zero regressions from previous stages

---

## [0.2.0] - 2026-03-09

### Added - DevTools & Automation (STAGE-007)

Developer tooling and automation interfaces for runtime inspection, event timeline analysis, state snapshots, performance monitoring, and AI Agent dispatch.

#### DevTools Module (`createDevToolsModule`)

- **Event Timeline**: Middleware-based event timing with filtering and slow event detection
- **Performance Monitor**: Throughput, latency, per-type stats tracking with reset capability
- **State Snapshots**: Capture, compare (diff), and export runtime state snapshots
- **State Tree Inspector**: Structured tree view of current runtime state
- **AI Agent Interface**: Programmatic dispatch, `executeSequence()`, and `waitForState()` for automated systems
- **Optional Module**: Zero overhead when not registered — all instrumentation via middleware
- **53 tests** covering all DevTools features

#### Runtime Inspector (`createRuntimeInspector`)

- Standalone inspector that attaches to any runtime without module registration
- `getStateTree()`, `getModuleStates()`, `getEventHistory()`, `exportSnapshot()`

#### Utilities

- `buildStateTree(key, value)` — convert any value to a structured `StateTreeNode`
- `diffSnapshots(a, b)` — compare two snapshots producing added/removed/changed/unchanged diff

#### React Hook

- `useDevTools()` — reactive hook providing `stateTree`, `timeline`, `metrics`, `snapshots`, `controller`

#### Demo

- New DevTools page showcasing all features: metrics, snapshots, timeline, state tree, agent interface

### Architecture Decision

- **[ADR-009](./devdocs/decisions/ADR-009-devtools-stage-reordering.md)**: DevTools promoted to STAGE-007, Semantic Theme indefinitely deferred

### Package Updates

- **@prismui/core** bumped to 0.2.0
- **@prismui/react** bumped to 0.2.0

### Testing & Quality

- **425 tests** across 21 test files (53 new)
- **0 failures**, 100% passing
- Zero regressions from previous stages

---

## [0.1.0] - 2026-03-08

### Added - Runtime Kernel Release

This is the initial release of PrismUI Runtime Kernel, a framework-agnostic event-driven state management runtime with comprehensive governance capabilities.

#### Stage 1: Runtime Core

- **EventBus**: Event-driven communication with history tracking and subscription management
- **RuntimeStore**: Immutable state management with snapshot support and change notifications
- **Scheduler**: Reducer-based event processing with middleware pipeline
- **Module System**: Pluggable architecture with lifecycle hooks (onInit/onDestroy)
- **Built-in Modules**: Page and Modal state management modules
- **React Adapter**: `PrismUIProvider`, `useRuntime`, `useRuntimeState` hooks
- **Demo Application**: Interactive demo showcasing all runtime features
- **110 tests** covering all core functionality

#### Stage 2: Governance Layer

- **Audit Trail**: Complete event and state change tracking with filtering and export
- **Replay System**: Time-travel debugging with state restoration
- **Policy Engine**: Rule-based event validation and blocking
- **Priority Scheduler**: Event prioritization with conflict resolution strategies
- **Middleware Integration**: Seamless integration with runtime scheduler
- **79 tests** for governance features

#### Stage 3: Interaction Modules

- **Drawer Module**: Drawer stack management with anchor positioning (left/right/top/bottom)
- **Notification Module**: Toast notification system with auto-dismiss and type support
- **React Hooks**: `useDrawer`, `useNotification` convenience hooks
- **58 tests** for interaction modules

#### Stage 4: Lifecycle & Selectors

- **State Selectors**: Efficient partial state subscription with memoization
- **Module Lifecycle**: `onInit` and `onDestroy` hooks with status tracking
- **Inter-module Communication**: `waitFor` utility for event-driven coordination
- **React Hook**: `useSelector` for fine-grained state subscriptions
- **43 tests** for lifecycle and selector features

#### Stage 5: Form & Async Runtime

- **Form State Module**: Field registration, validation, submission lifecycle, dirty/touched tracking
- **Async State Module**: Loading/success/error lifecycle for async operations with timestamps
- **React Hooks**: `useForm` and `useAsync` convenience hooks
- **47 tests** for form and async state management

#### Stage 6: Interaction DSL

- **Unified DSL API**: `createInteractionDSL(runtime)` wrapping all module controllers
- **Namespaces**: `ui.modal`, `ui.drawer`, `ui.notify`, `ui.form`, `ui.async`
- **Promise-based Confirmation**: `ui.confirm(modalId)` returns `Promise<boolean>`
- **Shorthand Methods**: `ui.notify.info/success/warning/error` with options
- **React Hook**: `useUI()` with memoized reference
- **35 tests** for DSL functionality

### Package Structure

- **@prismui/core** (v0.1.0): Framework-agnostic runtime kernel
  - Zero dependencies
  - Full TypeScript support
  - ESM and CJS builds
  - Comprehensive type definitions

- **@prismui/react** (v0.1.0): React adapter layer
  - React 18+ support
  - Hooks-based API
  - Zero business logic (thin wrappers)
  - Full TypeScript support

### Testing & Quality

- **372 tests** across 20 test files
- **0 failures**, 100% passing
- Full TypeScript strict mode
- Comprehensive test coverage for all features
- Isolation tests ensuring architectural boundaries

### Documentation

- 6 detailed STAGE documents covering implementation
- 8 Architecture Decision Records (ADRs)
- Interactive demo application
- Inline JSDoc comments for all public APIs

### Breaking Changes

None - this is the initial release.

### Migration Guide

Not applicable - this is the initial release.

---

## Future Releases

### [0.4.0] - Planned

- Workflow Runtime — multi-step flow orchestration
- State persistence layer (IndexedDB/LocalStorage)

[0.3.0]: https://github.com/medxaidev/prismui/releases/tag/v0.3.0
[0.2.0]: https://github.com/medxaidev/prismui/releases/tag/v0.2.0
[0.1.0]: https://github.com/medxaidev/prismui/releases/tag/v0.1.0
