# @prismui/core Changelog

## [0.4.0] - 2026-03-17

### Added

- **WorkflowModule** (`createWorkflowModule`): Declarative multi-step workflow orchestration
- 4 step types: `async`, `confirm`, `notify`, `custom`
- WorkflowContext with accumulated payload + step results
- Guard conditions, error actions, lifecycle hooks (onEnter/onExit)
- Workflow lifecycle: idle → running → completed / failed / aborted
- Concurrent workflow instances with abort support
- DSL extension: `ui.workflow.define()`, `ui.workflow.start()`, `ui.workflow.abort()`
- 28 new tests (501 total)

---

## [0.3.0] - 2026-03-17

### Changed

- Version bump to 0.3.0 (aligned with @prismui/react Rendering Layer release)
- No breaking changes to core API

### Note

The rendering layer (ModalRenderer, DrawerRenderer, NotificationRenderer) is implemented in `@prismui/react`, not in core. Core remains framework-agnostic with zero dependencies.

---

## [0.2.0] - 2026-03-09

### Added

- **DevTools Module** (`createDevToolsModule`): Event Timeline, Performance Monitor, State Snapshots, AI Agent Interface
- **Runtime Inspector** (`createRuntimeInspector`): Standalone inspector for any runtime
- **Utilities**: `buildStateTree`, `diffSnapshots`
- 53 new tests (425 total)

---

## [0.1.0] - 2026-03-08

### Added

- Core Runtime: EventBus, RuntimeStore, Scheduler, Module System
- Governance Layer: Audit Trail, Replay System, Policy Engine, Priority Scheduler
- Built-in Modules: Page, Modal, Drawer, Notification, Form, Async
- Interaction DSL: `createInteractionDSL(runtime)`
- State Selectors: `createSelector`, `selectFromStore`
- Module Lifecycle: `onInit`, `onDestroy`, `MODULE_INIT`, `MODULE_DESTROY`
- Inter-module Communication: `waitFor`
- 372 tests, zero dependencies, full TypeScript support
