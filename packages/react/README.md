# @prismui/react

**React adapter for PrismUI Runtime Kernel**

[![npm version](https://img.shields.io/npm/v/@prismui/react.svg)](https://www.npmjs.com/package/@prismui/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Overview

`@prismui/react` is the official React adapter for PrismUI Runtime Kernel. It provides hooks-based integration for React applications, enabling seamless access to the event-driven runtime with full TypeScript support.

**Hooks-based API** • **Zero business logic** • **Full TypeScript support**

## Installation

```bash
npm install @prismui/react @prismui/core
```

**Peer Dependencies:**

- `react >= 18.0.0`
- `react-dom >= 18.0.0`
- `@prismui/core >= 0.5.0`

## Quick Start

### 1. Setup Runtime and Provider

```tsx
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
} from "@prismui/core";
import { PrismUIProvider } from "@prismui/react";

// Create runtime
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
```

### 2. Use Hooks in Components

```tsx
import { usePage, useModal, useUI } from "@prismui/react";

function MyComponent() {
  const { currentPage, transition } = usePage();
  const { stack, open, close } = useModal();
  const ui = useUI();

  return (
    <div>
      <h1>Current Page: {currentPage}</h1>
      <button onClick={() => transition("dashboard")}>Go to Dashboard</button>
      <button onClick={() => ui.modal.open("confirm")}>Open Modal</button>
    </div>
  );
}
```

## Available Hooks

### Core Hooks

#### `useRuntime()`

Access the runtime instance directly.

```tsx
import { useRuntime } from "@prismui/react";

function MyComponent() {
  const runtime = useRuntime();

  // Access runtime methods
  runtime.dispatch({ type: "MY_EVENT", payload: "data" });

  return <div>...</div>;
}
```

#### `useRuntimeState()`

Subscribe to the entire runtime state.

```tsx
import { useRuntimeState } from "@prismui/react";

function MyComponent() {
  const state = useRuntimeState();

  return <div>Current Page: {state.currentPage}</div>;
}
```

#### `useSelector(selector)`

Subscribe to partial state with memoization.

```tsx
import { useSelector } from "@prismui/react";

function MyComponent() {
  const modalCount = useSelector((state) => state.modalStack.length);

  return <div>Open Modals: {modalCount}</div>;
}
```

### Module Hooks

#### `usePage()`

Page navigation and state.

```tsx
import { usePage } from "@prismui/react";

function Navigation() {
  const { currentPage, transition, history } = usePage();

  return (
    <nav>
      <button onClick={() => transition("home")}>Home</button>
      <button onClick={() => transition("about")}>About</button>
      <p>Current: {currentPage}</p>
    </nav>
  );
}
```

#### `useModal()`

Modal management.

```tsx
import { useModal } from "@prismui/react";

function ModalControls() {
  const { stack, open, close, closeAll, isOpen } = useModal();

  return (
    <div>
      <button onClick={() => open("dialog")}>Open Dialog</button>
      <button onClick={() => close("dialog")}>Close Dialog</button>
      <p>Open modals: {stack.length}</p>
    </div>
  );
}
```

#### `useDrawer()`

Drawer management.

```tsx
import { useDrawer } from "@prismui/react";

function DrawerControls() {
  const { stack, open, close, isOpen } = useDrawer();

  return <button onClick={() => open("menu", "left")}>Open Menu</button>;
}
```

#### `useNotification()`

Notification system.

```tsx
import { useNotification } from "@prismui/react";

function NotificationDemo() {
  const { items, notify, dismiss, dismissAll } = useNotification();

  const showSuccess = () => {
    notify({
      type: "success",
      message: "Operation completed!",
      autoDismissMs: 3000,
    });
  };

  return (
    <div>
      <button onClick={showSuccess}>Show Success</button>
      <p>Active notifications: {items.length}</p>
    </div>
  );
}
```

#### `useForm()`

Form state management.

```tsx
import { useForm } from "@prismui/react";
import { useEffect } from "react";

function LoginForm() {
  const form = useForm();

  useEffect(() => {
    form.register("email", "");
    form.register("password", "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = form.validate((fields) => ({
      email: !fields.email?.value ? "Email is required" : null,
      password: !fields.password?.value ? "Password is required" : null,
    }));

    if (isValid) {
      form.submit();
      try {
        await loginAPI(form.getValues());
        form.submitDone();
      } catch (error) {
        form.submitFail(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.fields.email?.value || ""}
        onChange={(e) => form.set("email", e.target.value)}
        onBlur={() => form.touch("email")}
      />
      {form.fields.email?.error && (
        <span className="error">{form.fields.email.error}</span>
      )}

      <input
        type="password"
        value={form.fields.password?.value || ""}
        onChange={(e) => form.set("password", e.target.value)}
      />

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Logging in..." : "Login"}
      </button>

      {form.formSubmitError && (
        <div className="error">{form.formSubmitError}</div>
      )}
    </form>
  );
}
```

#### `useAsync()`

Async operation tracking.

```tsx
import { useAsync } from "@prismui/react";

function DataLoader() {
  const async = useAsync();

  const loadUsers = async () => {
    async.start("fetchUsers");
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      async.done("fetchUsers", data);
    } catch (error) {
      async.fail("fetchUsers", error.message);
    }
  };

  const operation = async.getOperation("fetchUsers");

  return (
    <div>
      <button onClick={loadUsers} disabled={async.isLoading("fetchUsers")}>
        Load Users
      </button>

      {async.isLoading("fetchUsers") && <Spinner />}

      {operation?.status === "success" && (
        <div>Data: {JSON.stringify(operation.data)}</div>
      )}

      {operation?.status === "error" && (
        <div className="error">{operation.error}</div>
      )}
    </div>
  );
}
```

### Unified DSL Hook

#### `useUI()`

Access the unified Interaction DSL with a stable memoized reference.

```tsx
import { useUI } from "@prismui/react";

function MyComponent() {
  const ui = useUI();

  const handleDelete = async () => {
    const confirmed = await ui.confirm("deleteDialog");
    if (confirmed) {
      ui.notify.success("Item deleted!");
    } else {
      ui.notify.info("Cancelled");
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={() => ui.drawer.open("menu", "left")}>Open Menu</button>
    </div>
  );
}
```

### Router Hooks

#### `useRouter()`

URL-driven navigation with browser history.

```tsx
import { useRouter } from "@prismui/react";

function Navigation() {
  const { path, push, back, forward, query } = useRouter();

  return (
    <nav>
      <button onClick={() => push("/dashboard")}>Dashboard</button>
      <button onClick={() => push("/settings?tab=profile")}>Settings</button>
      <button onClick={() => back()}>← Back</button>
      <p>Current path: {path}</p>
    </nav>
  );
}
```

#### `useLocation()`

Reactive router location.

```tsx
import { useLocation } from "@prismui/react";

function LocationInfo() {
  const { pathname, search, hash } = useLocation();
  return (
    <p>
      {pathname}
      {search}
      {hash}
    </p>
  );
}
```

#### `useSearchParams()`

Reactive query string with setter.

```tsx
import { useSearchParams } from "@prismui/react";

function SearchFilter() {
  const [params, setParams] = useSearchParams();
  return (
    <input
      value={params.q || ""}
      onChange={(e) => setParams({ q: e.target.value })}
    />
  );
}
```

#### `Link`

Anchor element that navigates via the Router Module.

```tsx
import { Link } from "@prismui/react";

function NavLinks() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/settings" replace>
        Settings
      </Link>
    </nav>
  );
}
```

### DevTools Hook

#### `useDevTools()`

Access runtime DevTools for inspection, timeline, metrics, and snapshots.

```tsx
import { useDevTools } from "@prismui/react";

function DevToolsPanel() {
  const { available, stateTree, timeline, metrics, snapshots, controller } =
    useDevTools();

  if (!available) return <p>DevTools module not registered</p>;

  return (
    <div>
      <h3>Performance</h3>
      <p>Total events: {metrics.totalEvents}</p>
      <p>Avg duration: {metrics.averageDuration.toFixed(2)}ms</p>

      <h3>Timeline ({timeline.length} entries)</h3>
      {timeline.map((entry, i) => (
        <div key={i}>
          {entry.event.type} — {entry.duration}ms
        </div>
      ))}

      <button onClick={() => controller.captureSnapshot("manual")}>
        Capture Snapshot
      </button>

      <button
        onClick={() => {
          controller.agent.dispatch({
            type: "PAGE_MOUNT",
            payload: { pageId: "test" },
          });
        }}
      >
        Agent: Dispatch Event
      </button>
    </div>
  );
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  UsePage,
  UseModal,
  UseDrawer,
  UseNotification,
  UseFormReturn,
  UseAsyncReturn,
  UseDevToolsReturn,
} from "@prismui/react";
```

## Architecture

`@prismui/react` is a **thin adapter layer** with zero business logic:

- All hooks are simple wrappers around runtime controllers
- State updates trigger React re-renders via `useState` + `useEffect`
- No React-specific logic in `@prismui/core`

```
┌─────────────────────────────────┐
│   Your React Components         │
├─────────────────────────────────┤
│   @prismui/react (Hooks)        │
│   - usePage, useModal, etc.     │
├─────────────────────────────────┤
│   @prismui/core (Runtime)       │
│   - EventBus, Store, Modules    │
└─────────────────────────────────┘
```

## Package Info

- **Version**: 0.5.0
- **License**: MIT
- **Repository**: [github.com/medxaidev/prismui](https://github.com/medxaidev/prismui)
- **Author**: Fangjun <fangjun20208@gmail.com>

## Links

- [GitHub Repository](https://github.com/medxaidev/prismui)
- [@prismui/core](https://www.npmjs.com/package/@prismui/core)
- [Documentation](https://prismui.dev) (Coming soon)
- [Changelog](https://github.com/medxaidev/prismui/blob/main/CHANGELOG.md)

## License

MIT © [Fangjun](https://github.com/medxaidev)
