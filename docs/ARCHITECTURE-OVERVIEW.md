# PrismUI Architecture Overview

> **Version**: 0.5.0  
> **Last Updated**: 2026-03-19  
> **Target Audience**: fhir-studio development team

---

## 🎯 What is PrismUI?

PrismUI is **not** a UI component library. It is an **Interaction Runtime Platform** that provides:

- ✅ **State management** for Modal, Drawer, Notification, Form, Async operations
- ✅ **Event-driven architecture** for cross-component communication
- ✅ **Workflow orchestration** for multi-step processes
- ✅ **URL-driven routing** with browser history and deep linking
- ✅ **State persistence** with localStorage and auto-save
- ✅ **Audit trail** for compliance and debugging
- ✅ **Rendering layer** for Modal/Drawer/Notification (auto-registered)

**What PrismUI does NOT provide**:

- ❌ UI components (Button, Input, Table, etc.) → Use Ant Design
- ❌ Data fetching → Use React Query or fetch API

---

## 🏗️ Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│  Application Layer (fhir-studio)                    │
│  - Business logic                                   │
│  - UI components (Ant Design)                       │
│  - Data fetching (React Query)                      │
└───────────────────┬─────────────────────────────────┘
                    │ useUI(), useModal(), etc.
┌───────────────────▼─────────────────────────────────┐
│  @prismui/react (React Adapter)                     │
│  - Hooks (useRouter, useModal, useWorkflow, etc.)   │
│  - PrismUIProvider                                  │
│  - Auto-registered Renderers                        │
└───────────────────┬─────────────────────────────────┘
                    │ Runtime API
┌───────────────────▼─────────────────────────────────┐
│  @prismui/core (Runtime Kernel)                     │
│  ├─ Interaction DSL (ui.modal.*, ui.workflow.*)     │
│  ├─ Built-in Modules (Modal, Notification, etc.)    │
│  ├─ Governance Layer (Audit, Policy, Replay)        │
│  └─ Core Runtime (EventBus, Store, Scheduler)       │
└─────────────────────────────────────────────────────┘
```

---

## 🧩 Core Concepts

### 1. Runtime Kernel

**EventBus** - 中央事件调度器

- 所有状态变化通过事件驱动
- 自动记录事件历史（审计追踪）
- 支持事件订阅和中间件

**Store** - 不可变状态容器

- 所有模块的状态存储在一个 Store 中
- 通过 Reducer 更新状态
- 支持快照和时间旅行调试

**Scheduler** - 事件调度器

- 按优先级调度事件
- 支持中间件管道
- 错误处理和恢复

### 2. Module System

PrismUI 采用**模块化架构**，每个功能都是一个独立的模块：

```typescript
interface RuntimeModule<TController> {
  name: string; // 模块名称
  initialState?: Record<string, unknown>; // 初始状态
  reducers?: Record<string, EventReducer>; // 事件处理器
  controller?: (runtime) => TController; // 控制器 API
  onInit?(runtime): void; // 初始化钩子
  onDestroy?(): void; // 销毁钩子
}
```

**内置模块**:

- `PageModule` - 页面路由管理（简单场景）
- `RouterModule` - URL 路由管理（推荐用于生产）
- `PersistenceModule` - 状态持久化
- `ModalModule` - Modal 状态管理
- `DrawerModule` - Drawer 状态管理
- `NotificationModule` - 通知管理
- `FormModule` - 表单状态管理
- `AsyncModule` - 异步操作跟踪
- `WorkflowModule` - 工作流编排

### 3. Interaction DSL

统一的 `ui.*` API，包装所有模块能力：

```typescript
const ui = useUI();

// Modal
ui.modal.open("confirm-delete");
await ui.confirm("confirm-delete");

// Notification
ui.notify.success("Saved!");
ui.notify.error("Failed!");

// Workflow
await ui.workflow.start("save-resource", { resource });

// Router
ui.router.push("/dashboard");
ui.router.back();

// Persistence
ui.persistence.save();
ui.persistence.restore();

// Form
ui.form.register("email", "");
ui.form.set("email", "user@example.com");

// Async
ui.async.start("fetch-data");
ui.async.done("fetch-data", data);
```

### 4. Rendering Layer (v0.3.0+)

**自动注册机制** - Renderer 自动挂载到 `PrismUIProvider`：

```typescript
<PrismUIProvider runtime={runtime}>
  {/* ModalRenderer, NotificationRenderer 自动注册 */}
  <App />
</PrismUIProvider>
```

**内置 Renderer**:

- `ModalRenderer` - 基于 `modalStack` 渲染 Dialog 列表
- `NotificationRenderer` - 基于 `notifications` 渲染 Toast 列表
- `DrawerRenderer` - 基于 `drawerStack` 渲染 Drawer 列表

### 5. Router & Persistence (v0.5.0+)

**URL-driven navigation**：

```typescript
import { useRouter } from '@prismui/react';

function Navigation() {
  const { path, push, back, query } = useRouter();

  return (
    <nav>
      <button onClick={() => push('/dashboard')}>Dashboard</button>
      <button onClick={() => push('/settings?tab=profile')}>Settings</button>
      <button onClick={() => back()}>← Back</button>
      <p>Current: {path}</p>
      <p>Query: {JSON.stringify(query)}</p>
    </nav>
  );
}
```

**State persistence**：

```typescript
// Setup with auto-save
const runtime = createInteractionRuntime({
  modules: [
    createRouterModule({ adapter: createBrowserRouterAdapter() }),
    createPersistenceModule({
      include: ["routerLocation", "routerHistory"],
      debounceMs: 500,
    }),
  ],
});

// State automatically persists to localStorage
// Restores on page refresh
```

### 6. Workflow Runtime (v0.4.0+)

**声明式工作流编排**：

```typescript
ui.workflow.define({
  id: "save-resource",
  steps: [
    {
      id: "validate",
      type: "async",
      execute: (ctx) => validateResource(ctx.payload.resource),
      onError: { action: "abort", notify: "Validation failed" },
    },
    {
      id: "confirm",
      type: "confirm",
      modalId: "confirm-save",
      condition: (ctx) => ctx.results.validate.hasWarnings,
    },
    {
      id: "save",
      type: "async",
      execute: (ctx) => saveResource(ctx.payload.resource),
    },
  ],
});

const result = await ui.workflow.start("save-resource", { resource });
```

**步骤类型**:

- `async` - 执行异步函数
- `confirm` - 打开 Modal 等待用户确认
- `notify` - 发送通知
- `custom` - 自定义逻辑

### 7. Governance Layer

**Audit Trail** - 审计追踪

- 自动记录所有事件和状态变化
- 支持查询和导出
- 用于合规和调试

**Policy Engine** - 策略引擎

- 基于规则的事件验证
- 可以拦截或修改事件
- 用于权限控制和业务规则

**Replay System** - 回放系统

- 时间旅行调试
- 从任意快照恢复状态
- 用于测试和调试

---

## 🔄 Data Flow

### 典型的事件流

```
1. User Action (e.g., button click)
   ↓
2. Component calls ui.modal.open('confirm')
   ↓
3. DSL dispatches MODAL_OPEN event
   ↓
4. EventBus receives event
   ↓
5. Scheduler runs middleware pipeline
   ↓
6. Policy Engine validates event (optional)
   ↓
7. Audit Trail records event (optional)
   ↓
8. Reducer updates state (modalStack.push('confirm'))
   ↓
9. Store notifies subscribers
   ↓
10. ModalRenderer re-renders (shows modal)
```

### 跨组件通信

```
Component A                    Component B
    │                              │
    ├─ runtime.dispatch(event)     │
    │         ↓                     │
    │    EventBus                   │
    │         ↓                     │
    │    ┌─────────┐                │
    │    │  Store  │                │
    │    └─────────┘                │
    │         ↓                     │
    │    ┌─────────────────────┐   │
    └────┤ Subscribers notify  ├───┘
         └─────────────────────┘
```

---

## 📦 Module Lifecycle

```
1. createInteractionRuntime({ modules: [...] })
   ↓
2. Register modules (name, reducers, controller)
   ↓
3. Merge initialState from all modules
   ↓
4. Create Store with merged state
   ↓
5. Call module.onInit() in registration order
   ↓
6. Runtime ready
   ↓
7. Application runs
   ↓
8. runtime.destroy()
   ↓
9. Call module.onDestroy() in reverse order (LIFO)
```

---

## 🎨 Integration Patterns

### Pattern 1: Simple Modal

```typescript
function DeleteButton({ resourceId }) {
  const ui = useUI();

  const handleDelete = async () => {
    const confirmed = await ui.confirm('delete-resource');
    if (confirmed) {
      await deleteResource(resourceId);
      ui.notify.success('Deleted!');
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Pattern 2: Multi-Step Workflow

```typescript
function ResourceEditor() {
  const ui = useUI();

  useEffect(() => {
    ui.workflow.define({
      id: "save-resource",
      steps: [
        { id: "validate", type: "async", execute: validateResource },
        { id: "confirm", type: "confirm", modalId: "confirm-save" },
        { id: "save", type: "async", execute: saveResource },
        {
          id: "notify",
          type: "notify",
          notification: { type: "success", message: "Saved!" },
        },
      ],
    });
  }, []);

  const handleSave = () => ui.workflow.start("save-resource", { resource });
}
```

### Pattern 3: Cross-Page Communication

```typescript
// Page A: Dispatch event
function ResourceCreator() {
  const runtime = useRuntime();

  const handleCreate = async () => {
    await createResource(resource);
    runtime.dispatch({
      type: "RESOURCE_CREATED",
      payload: { id: "Patient/123" },
    });
  };
}

// Page B: Subscribe to event
function ResourceList() {
  const runtime = useRuntime();

  useEffect(() => {
    return runtime.subscribe((event) => {
      if (event.type === "RESOURCE_CREATED") {
        fetchResources(); // Refresh list
      }
    });
  }, []);
}
```

### Pattern 4: Form State Management

```typescript
function LoginForm() {
  const { fields, register, set, validate, submitStart, submitDone } =
    useForm();

  useEffect(() => {
    register("email", "");
    register("password", "");
  }, []);

  const handleSubmit = async () => {
    const isValid = validate((fields) => ({
      email: !fields.email?.value ? "Required" : null,
      password: !fields.password?.value ? "Required" : null,
    }));

    if (isValid) {
      submitStart();
      await loginUser(fields.email.value, fields.password.value);
      submitDone();
    }
  };
}
```

---

## 🔍 Key Design Decisions

### Why Event-Driven?

- ✅ **Decoupling**: Components don't need to know about each other
- ✅ **Audit Trail**: All state changes are traceable
- ✅ **Time Travel**: Can replay events for debugging
- ✅ **Middleware**: Easy to add cross-cutting concerns (logging, validation)

### Why Module System?

- ✅ **Composability**: Only register modules you need
- ✅ **Isolation**: Each module manages its own state slice
- ✅ **Extensibility**: Easy to add custom modules
- ✅ **Testing**: Modules can be tested independently

### Why Unified DSL?

- ✅ **Consistency**: Same API style across all features
- ✅ **Discoverability**: `ui.` autocomplete shows all capabilities
- ✅ **Simplicity**: One import instead of many

### Why Auto-Registered Renderers?

- ✅ **Zero Config**: Works out of the box
- ✅ **No Boilerplate**: Don't need to manually add `<ModalRenderer />`
- ✅ **Consistency**: All apps use the same rendering logic

---

## ⚠️ Common Misconceptions

### ❌ "PrismUI is a component library"

**Wrong**. PrismUI is a **runtime platform**. It provides state management and rendering for Modal/Drawer/Notification, but you still need a UI library (Ant Design) for buttons, inputs, tables, etc.

### ❌ "PrismUI replaces Zustand/Redux"

**Partially correct**. PrismUI includes state management, but it's **specialized** for UI interactions (modals, notifications, workflows). For general application state, you can still use Zustand/Redux alongside PrismUI.

### ❌ "PrismUI requires learning a new paradigm"

**Partially wrong**. If you're familiar with Redux (events/reducers) or React Context (providers/hooks), PrismUI will feel natural. The DSL API (`ui.*`) is intentionally simple.

### ❌ "PrismUI is overkill for simple apps"

**Correct**. If your app only has 1-2 modals and no complex workflows, PrismUI is overkill. It's designed for **large-scale applications** like fhir-studio (97 capability points, plugin system, audit requirements).

---

## 📊 When to Use PrismUI

### ✅ Good Fit

- Large-scale dashboard applications
- Apps with complex modal/drawer management (nested, stacked)
- Apps requiring audit trails (medical, financial, government)
- Apps with multi-step workflows (wizards, approval processes)
- Apps with plugin systems (need state isolation)
- Apps with cross-component communication needs

### ❌ Not a Good Fit

- Simple CRUD apps (use Ant Design + React Query)
- Static websites (no runtime needed)
- Apps with < 5 pages (too much overhead)
- Apps without modal/notification requirements

---

## 🚀 Performance Characteristics

- **Bundle Size**: ~15KB (core) + ~3KB (react) gzipped
- **Runtime Overhead**: Minimal (event dispatch ~0.1ms, state update ~0.2ms)
- **Memory**: ~1MB for 1000 events in history (configurable)
- **Re-render Optimization**: `useSelector` for fine-grained subscriptions

---

## 🔮 Future Roadmap

### STAGE-11: Scoped Runtime (v0.6.0)

- Plugin system support (isolated state spaces)
- Multi-tenant applications
- Namespace-based event filtering

### STAGE-12: Real-time Bridge (v0.7.0)

- WebSocket/SSE integration
- Automatic event synchronization
- Conflict resolution

---

## 📚 Further Reading

- **Integration Guide**: `docs/INTEGRATION-GUIDE.md`
- **API Reference**: `docs/API-REFERENCE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Live Demo**: https://medxaidev.github.io/prismui/
- **npm Package**: https://www.npmjs.com/package/@prismui/core

---

**Questions?** Open an issue on GitHub or contact the PrismUI team.
