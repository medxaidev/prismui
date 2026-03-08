# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### [0.2.0] - Planned
- Stage 7: Semantic Theme System
- Stage 9: Component Library
- UI Layer implementation

### [0.3.0] - Planned
- Stage 8: DevTools & Automation
- Runtime Inspector
- Event Replay UI
- AI Agent Interface

[0.1.0]: https://github.com/medxaidev/prismui/releases/tag/v0.1.0
