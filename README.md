# PrismUI

**Event-Driven Runtime Kernel for Modern Web Applications**

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/medxaidev/prismui)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-473%20passing-brightgreen.svg)](https://github.com/medxaidev/prismui)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://medxaidev.github.io/prismui/)
[![Dashboard](https://img.shields.io/badge/dashboard-live-blue.svg)](https://medxaidev.github.io/prismui/dashboard/)

PrismUI is a framework-agnostic event-driven runtime kernel that provides comprehensive state management, governance, and interaction capabilities for modern web applications.

**[🎮 Try the Live Demo →](https://medxaidev.github.io/prismui/)** · **[📊 Dashboard Reference App →](https://medxaidev.github.io/prismui/dashboard/)**

## 🎯 What is PrismUI?

PrismUI Runtime Kernel (v0.3.0) is an **event-driven runtime platform** that provides:

- **Event-Driven Architecture**: EventBus with history tracking and middleware pipeline
- **Modular State Management**: Pluggable module system with lifecycle hooks
- **Governance Layer**: Audit trails, replay system, and policy engine
- **Interaction Modules**: Built-in modules for common UI patterns (modals, drawers, notifications, forms, async operations)
- **Unified DSL**: High-level API (`ui.*`) wrapping all runtime capabilities
- **DevTools & Automation**: Runtime inspector, event timeline, performance monitor, AI Agent interface
- **React Adapter**: Hooks-based integration for React applications
- **Rendering Layer**: Built-in renderers for Modal, Drawer, and Notification — portal-based, render-prop pattern

## 📦 Packages

### @prismui/core

Framework-agnostic runtime kernel with zero dependencies.

```bash
npm install @prismui/core
```

**Features:**

- EventBus, Store, Scheduler
- Module system with lifecycle hooks
- Governance layer (Audit, Replay, Policy)
- Built-in modules (Page, Modal, Drawer, Notification, Form, Async)
- Interaction DSL
- DevTools module (inspector, timeline, performance, snapshots, AI agent)
- Full TypeScript support

### @prismui/react

React adapter with hooks-based API.

```bash
npm install @prismui/react @prismui/core
```

**Features:**

- `PrismUIProvider` context provider
- `useRuntime`, `useRuntimeState` core hooks
- `usePage`, `useModal`, `useDrawer`, `useNotification` module hooks
- `useForm`, `useAsync` state management hooks
- `useSelector` for fine-grained subscriptions
- `useUI` unified DSL hook
- `useDevTools` DevTools inspector hook
- `ModalRenderer`, `DrawerRenderer`, `NotificationRenderer` rendering components
- `PrismUIRootRenderer` convenience wrapper

## 🌐 Live Apps

| App              | URL                                                                                      | Description                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime Demo** | [medxaidev.github.io/prismui/](https://medxaidev.github.io/prismui/)                     | Interactive showcase of individual PrismUI modules — Page, Modal, Drawer, Notification, Form, Async, DSL, Governance, DevTools                                                                                  |
| **Dashboard**    | [medxaidev.github.io/prismui/dashboard/](https://medxaidev.github.io/prismui/dashboard/) | Reference app demonstrating real-world combinations of PrismUI capabilities — runtime playground, interaction scenarios, form workflows, governance policies, DevTools automation, and a full approval workflow |

- **Demo** (`packages/demo`) — module-by-module exploration, one feature per page
- **Dashboard** (`apps/dashboard`) — integration-focused, shows how multiple runtime capabilities work together in realistic scenarios

## 🚀 Quick Start

### Basic Setup

```tsx
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
} from "@prismui/core";
import { PrismUIProvider, usePage, useModal } from "@prismui/react";

// Create runtime with modules
const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
});

// Wrap your app
function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <YourApp />
    </PrismUIProvider>
  );
}

// Use hooks in components
function YourApp() {
  const { currentPage, transition } = usePage();
  const { open, close } = useModal();

  return (
    <div>
      <h1>Current Page: {currentPage}</h1>
      <button onClick={() => transition("dashboard")}>Go to Dashboard</button>
      <button onClick={() => open("confirm")}>Open Modal</button>
    </div>
  );
}
```

### Using the Unified DSL

```tsx
import { useUI } from "@prismui/react";

function MyComponent() {
  const ui = useUI();

  const handleConfirm = async () => {
    const confirmed = await ui.confirm("deleteDialog");
    if (confirmed) {
      ui.notify.success("Item deleted!");
    }
  };

  return <button onClick={handleConfirm}>Delete Item</button>;
}
```

### Form State Management

```tsx
import { useForm } from "@prismui/react";

function LoginForm() {
  const form = useForm();

  useEffect(() => {
    form.register("email", "");
    form.register("password", "");
  }, []);

  const handleSubmit = async () => {
    const isValid = form.validate((fields) => ({
      email: !fields.email?.value ? "Required" : null,
      password: !fields.password?.value ? "Required" : null,
    }));

    if (isValid) {
      form.submit();
      // ... async submission
      form.submitDone();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.fields.email?.value || ""}
        onChange={(e) => form.set("email", e.target.value)}
      />
      {form.fields.email?.error && <span>{form.fields.email.error}</span>}
      {/* ... */}
    </form>
  );
}
```

### DevTools & Automation

```tsx
import { createDevToolsModule } from "@prismui/core";
import { useDevTools } from "@prismui/react";

// Add DevTools to runtime (optional — zero overhead when not registered)
const runtime = createInteractionRuntime({
  modules: [
    createPageModule(),
    createDevToolsModule(), // ← opt-in
  ],
});

// Use in components
function Inspector() {
  const { timeline, metrics, controller } = useDevTools();

  // Capture state snapshot
  const snapId = controller.captureSnapshot("before-action");

  // AI Agent: dispatch events programmatically
  await controller.agent.executeSequence([
    { type: "PAGE_MOUNT", payload: { pageId: "test" } },
    { type: "PAGE_TRANSITION", payload: { pageId: "test" } },
  ]);

  // Wait for specific state
  const state = await controller.agent.waitForState(
    (s) => s.currentPage === "test",
    5000,
  );
}
```

### Async Operation Tracking

```tsx
import { useAsync } from "@prismui/react";

function DataLoader() {
  const async = useAsync();

  const loadData = async () => {
    async.start("fetchUsers");
    try {
      const data = await fetch("/api/users");
      async.done("fetchUsers", data);
    } catch (error) {
      async.fail("fetchUsers", error.message);
    }
  };

  return (
    <div>
      {async.isLoading("fetchUsers") && <Spinner />}
      <button onClick={loadData}>Load Data</button>
    </div>
  );
}
```

## 🏗️ Architecture

PrismUI follows a layered architecture:

```
┌─────────────────────────────────────────┐
│  Application Layer (Your Code)         │
├─────────────────────────────────────────┤
│  @prismui/react (React Adapter)        │
│  - Hooks, Provider, Context            │
├─────────────────────────────────────────┤
│  @prismui/core (Runtime Kernel)        │
│  ├── Interaction DSL                   │
│  ├── Built-in Modules                  │
│  ├── Governance Layer                  │
│  └── Core Runtime (EventBus, Store)   │
└─────────────────────────────────────────┘
```

## 📚 Core Concepts

### EventBus

Central event dispatcher with history tracking and subscription management.

### RuntimeStore

Immutable state container with snapshot support and efficient change notifications.

### Module System

Pluggable architecture where modules contribute:

- Initial state slices
- Event reducers
- Middleware
- Controller APIs
- Lifecycle hooks (onInit, onDestroy)

### Governance Layer

- **Audit Trail**: Complete event and state change tracking
- **Replay System**: Time-travel debugging
- **Policy Engine**: Rule-based event validation

### Interaction DSL

Unified `ui.*` API providing a fluent interface to all runtime capabilities.

## 🧪 Testing

PrismUI has comprehensive test coverage:

- **473 tests** across 25 test files
- **0 failures**, 100% passing
- Full isolation tests ensuring architectural boundaries
- TypeScript strict mode enabled

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📖 Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Release notes and version history
- [devdocs/stages/](./devdocs/stages/) - Detailed implementation documentation
- [devdocs/decisions/](./devdocs/decisions/) - Architecture Decision Records (ADRs)

## 🛣️ Roadmap

### v0.3.0 (Current) - Rendering Layer ✅

- **ModalRenderer**: Portal-based modal overlays with backdrop, Escape, z-index stacking
- **DrawerRenderer**: Anchor-positioned drawers (left/right/top/bottom) with backdrop
- **NotificationRenderer**: Toast notifications with type styling, auto-dismiss, 4 positions
- **PrismUIRootRenderer**: Convenience wrapper for all renderers
- 48 new tests (473 total)

### v0.2.0 - Runtime Kernel + DevTools ✅

- Event-driven architecture
- Module system
- Governance layer
- Interaction modules
- Form & Async state
- Unified DSL
- DevTools & Automation

### v0.4.0 (Planned)

- Workflow Runtime — multi-step flow orchestration
- State persistence layer

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT © [Fangjun](https://github.com/medxaidev)

## 🔗 Links

- [🎮 **Live Demo**](https://medxaidev.github.io/prismui/) — Module-by-module runtime exploration
- [📊 **Dashboard**](https://medxaidev.github.io/prismui/dashboard/) — Reference app with real-world scenarios
- [GitHub Repository](https://github.com/medxaidev/prismui)
- [Documentation](https://prismui.dev) (Coming soon)
- [Demo Source Code](./packages/demo)
- [Dashboard Source Code](./apps/dashboard)

---

**Note**: This is v0.3.0 - Runtime Kernel with Rendering Layer. PrismUI provides built-in renderers for Modal, Drawer, and Notification, or use any component library (Ant Design, MUI, Mantine) with the hooks API.
