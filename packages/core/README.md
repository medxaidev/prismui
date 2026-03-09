# @prismui/core

**Framework-agnostic event-driven runtime kernel for modern web applications**

[![npm version](https://img.shields.io/npm/v/@prismui/core.svg)](https://www.npmjs.com/package/@prismui/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Overview

`@prismui/core` is the runtime kernel of PrismUI - a pure, framework-agnostic state management runtime with comprehensive governance capabilities. It provides event-driven architecture, modular state management, and built-in interaction modules.

**Zero dependencies** • **Full TypeScript support** • **Framework-agnostic**

## Installation

```bash
npm install @prismui/core
```

## Features

### Core Runtime

- **EventBus**: Event-driven communication with history tracking
- **RuntimeStore**: Immutable state management with snapshots
- **Scheduler**: Reducer-based event processing with middleware pipeline
- **Module System**: Pluggable architecture with lifecycle hooks

### Governance Layer

- **Audit Trail**: Complete event and state change tracking
- **Replay System**: Time-travel debugging
- **Policy Engine**: Rule-based event validation
- **Priority Scheduler**: Event prioritization with conflict resolution

### Built-in Modules

- **Page Module**: Page navigation and transition management
- **Modal Module**: Modal stack management
- **Drawer Module**: Drawer positioning and stack management
- **Notification Module**: Toast notification system
- **Form Module**: Form state with validation and submission lifecycle
- **Async Module**: Async operation tracking with loading/success/error states

### Interaction DSL

- **Unified API**: `ui.*` namespace wrapping all module controllers
- **Promise-based**: `ui.confirm()` returns `Promise<boolean>`
- **Type-safe**: Full TypeScript autocomplete

### DevTools & Automation

- **DevTools Module**: Optional instrumentation for runtime inspection
- **Event Timeline**: Middleware-based event timing with filtering
- **Performance Monitor**: Throughput, latency, per-type stats
- **State Snapshots**: Capture, compare (diff), and export
- **AI Agent Interface**: Programmatic dispatch, sequence execution, state waiting

## Quick Start

```typescript
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  createNotificationModule,
} from "@prismui/core";

// Create runtime with modules
const runtime = createInteractionRuntime({
  modules: [
    createPageModule(),
    createModalModule(),
    createNotificationModule(),
  ],
});

// Use module controllers
runtime.modules.page?.transition("dashboard");
runtime.modules.modal?.open("confirm");
runtime.modules.notification?.notify({
  type: "success",
  message: "Operation completed!",
});

// Or use the unified DSL
import { createInteractionDSL } from "@prismui/core";

const ui = createInteractionDSL(runtime);
ui.page.go("dashboard");
ui.modal.open("confirm");
ui.notify.success("Operation completed!");

// Promise-based confirmation
const confirmed = await ui.confirm("deleteDialog");
if (confirmed) {
  console.log("User confirmed");
}
```

## Module System

Create custom modules to extend the runtime:

```typescript
import { RuntimeModule } from "@prismui/core";

interface MyModuleState {
  myData: string;
}

const createMyModule = (): RuntimeModule<MyModuleState, any> => ({
  name: "myModule",

  initialState: {
    myData: "initial",
  },

  reducers: {
    MY_EVENT: (state, event) => ({
      ...state,
      myData: event.payload,
    }),
  },

  controller: (runtime) => ({
    updateData: (data: string) => {
      runtime.dispatch({ type: "MY_EVENT", payload: data });
    },
  }),

  onInit: (runtime) => {
    console.log("Module initialized");
  },

  onDestroy: () => {
    console.log("Module destroyed");
  },
});
```

## Governance

### Audit Trail

```typescript
import { createAuditMiddleware } from '@prismui/core';

const audit = createAuditMiddleware();
const runtime = createInteractionRuntime({
  modules: [...],
  middleware: [audit],
});

// Query audit entries
const entries = audit.getEntries({ eventType: 'MODAL_OPEN' });
console.log(entries);
```

### Policy Engine

```typescript
import { createPolicyMiddleware } from '@prismui/core';

const policy = createPolicyMiddleware();
policy.addRule({
  name: 'preventModalSpam',
  condition: (event) => event.type === 'MODAL_OPEN',
  action: 'block',
  reason: 'Too many modals',
});

const runtime = createInteractionRuntime({
  modules: [...],
  middleware: [createPolicyMiddleware(policy, runtime.store)],
});
```

## State Selectors

Efficiently subscribe to partial state:

```typescript
import { createSelector } from "@prismui/core";

const selectModalStack = createSelector(
  (state) => state.modalStack,
  (modalStack) => modalStack.length,
);

const unsubscribe = runtime.store.subscribe((state) => {
  const count = selectModalStack(state);
  console.log("Modal count:", count);
});
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  InteractionRuntime,
  RuntimeModule,
  RuntimeEvent,
  RuntimeState,
  EventBus,
  RuntimeStore,
  Scheduler,
  InteractionDSL,
} from "@prismui/core";
```

## React Integration

For React applications, use `@prismui/react`:

```bash
npm install @prismui/react @prismui/core
```

See [@prismui/react](https://www.npmjs.com/package/@prismui/react) for React-specific hooks and components.

## API Documentation

### Core Exports

- `createInteractionRuntime(config)` - Create runtime instance
- `createInteractionDSL(runtime)` - Create unified DSL API

### Module Factories

- `createPageModule()` - Page navigation module
- `createModalModule()` - Modal management module
- `createDrawerModule()` - Drawer management module
- `createNotificationModule()` - Notification module
- `createFormModule()` - Form state module
- `createAsyncModule()` - Async operation module

### Governance

- `createAuditMiddleware()` - Audit trail middleware
- `createReplaySystem(audit)` - Replay system
- `createPolicyMiddleware(policy, store)` - Policy engine middleware
- `createPriorityScheduler()` - Priority-based scheduler

### Utilities

- `createSelector(selector, transform?)` - Memoized state selector
- `waitFor(runtime, condition, options?)` - Wait for state condition

### DevTools

- `createDevToolsModule(options?)` - DevTools instrumentation module
- `createRuntimeInspector(runtime)` - Standalone runtime inspector
- `buildStateTree(key, value)` - Build structured state tree
- `diffSnapshots(a, b)` - Compare two snapshots

## Package Info

- **Version**: 0.2.0
- **License**: MIT
- **Repository**: [github.com/medxaidev/prismui](https://github.com/medxaidev/prismui)
- **Author**: Fangjun <fangjun20208@gmail.com>

## Links

- [GitHub Repository](https://github.com/medxaidev/prismui)
- [Documentation](https://prismui.dev) (Coming soon)
- [Changelog](https://github.com/medxaidev/prismui/blob/main/CHANGELOG.md)

## License

MIT © [Fangjun](https://github.com/medxaidev)
