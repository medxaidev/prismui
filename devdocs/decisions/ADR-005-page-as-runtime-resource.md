# ADR-005: Page as Runtime Resource / 页面作为运行时资源

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** High — redefines pages from JSX component trees to runtime-managed entities

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** High —— 将页面从 JSX 组件树重定义为运行时管理的实体

---

## Context

## 背景（Context）

In traditional React applications, pages are React components rendered by a router:

在传统 React 应用中，页面是由路由器渲染的 React 组件：

```tsx
<Route path="/dashboard" component={Dashboard} />
<Route path="/patient/:id" component={PatientDetail} />
```

Page state (current page, navigation history, lock status) is managed by:

页面 state（当前页面、导航历史、锁定状态）通常由以下方式管理：

- React Router (URL-based)
- Component-local state (`useState`, `useReducer`)
- Context providers scattered through the tree

- React Router（基于 URL）
- 组件本地 state（`useState`、`useReducer`）
- 分散在组件树中的 Context providers

This creates several problems for enterprise applications:

这会在企业应用中带来多个问题：

- **No centralized control** — no single authority over page lifecycle
- **No lock mechanism** — cannot prevent navigation during critical procedures
- **No orchestration** — pages cannot be programmatically mounted/transitioned from external systems
- **No audit trail** — page transitions are not tracked by default
- **Framework coupling** — page lifecycle is tied to React Router and React lifecycle

- **缺少集中控制** —— 页面生命周期没有单一权威
- **缺少锁机制** —— 无法在关键流程中阻止导航
- **缺少编排能力** —— 外部系统无法以编程方式 mount/transition 页面
- **缺少审计轨迹** —— 页面切换默认不被记录
- **框架耦合** —— 生命周期绑定到 React Router 与 React 生命周期

---

## Decision

## 决策（Decision）

In PrismUI 2.0, **pages are Runtime Resources** — managed entities with explicit lifecycle, controlled entirely by the Interaction Core.

在 PrismUI 2.0 中，**页面是运行时资源（Runtime Resources）** —— 具有显式生命周期的被管理实体，并完全由交互核心控制。

### Page lifecycle:

### 页面生命周期：

```typescript
// Page is a Built-in Module (Layer 0.5), accessed via runtime.modules
const page = runtime.modules.page as PageController;

page.mount("Dashboard"); // Register page as available
page.transition("Dashboard"); // Set as current page
page.lock(); // Prevent all transitions
page.unlock(); // Allow transitions again
page.unmount("Dashboard"); // Remove page from registry
```

### Pages are NOT:

### 页面不是（Pages are NOT）：

- ❌ React components (they have string IDs, not JSX)
- ❌ URL routes (runtime-managed, not URL-managed)
- ❌ Component trees (rendered by Layer 3, not by the page itself)

- ❌ React 组件（页面使用字符串 ID，而非 JSX）
- ❌ URL 路由（由 runtime 管理，而非 URL 管理）
- ❌ 组件树（由 Layer 3 渲染，而不是页面自身渲染）

### Pages ARE:

### 页面是（Pages ARE）：

- ✅ String identifiers registered with the Runtime
- ✅ Runtime-managed resources with lifecycle events
- ✅ Lockable, transitionable, orchestratable units
- ✅ Mappable to React components via `PageRenderer`

- ✅ 注册到 Runtime 的字符串标识符
- ✅ 具有生命周期事件的 runtime-managed 资源
- ✅ 可锁定、可转移、可编排的单元
- ✅ 可通过 `PageRenderer` 映射到 React 组件

### State representation:

### State 表示：

```typescript
// Page Module contributes these fields to RuntimeState via initialState
interface PageModuleState {
  currentPage: string | null; // Active page ID
  mountedPages: string[]; // All available page IDs
  locked: boolean; // Whether transitions are blocked
}
```

### Event flow for page transition:

### 页面跳转的事件流：

```
page.transition("PatientDetail")
    → dispatch({ type: "PAGE_TRANSITION", payload: { pageId: "PatientDetail" } })
    → Scheduler processes
    → [Middleware: Policy check — is page locked? is page mounted?]
    → Reducer: (event, prevState) → { nextState: { ...prevState, currentPage: "PatientDetail" } }
    → Scheduler commits nextState to store
    → Subscribers notified
    → React Adapter re-renders
    → PageRenderer displays PatientDetail component
```

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- **Centralized control** — one source of truth for page state
- **Lockable** — `page.lock()` prevents ALL transitions, no workarounds
- **Programmable** — external systems can control page navigation via event dispatch
- **Auditable** — every page transition is a logged event
- **Testable** — page lifecycle can be tested in pure Node.js without rendering
- **Orchestratable** — multi-page workflows can be defined as event sequences

- **集中控制** —— 页面 state 的单一事实来源
- **可锁定** —— `page.lock()` 阻止所有跳转，无需 workaround
- **可编程** —— 外部系统可通过事件分发控制页面导航
- **可审计** —— 每次页面切换都是可记录事件
- **可测试** —— 无需渲染即可在纯 Node.js 中测试生命周期
- **可编排** —— 可将多页面工作流定义为事件序列

### Negative

### 负面

- Additional abstraction layer between "page" concept and React rendering
- Existing React Router patterns must be adapted or bridged
- String-based page IDs require a registry mapping to actual components

- 在“页面”概念与 React 渲染之间增加了一层抽象
- 需要适配或桥接既有 React Router 模式
- 基于字符串的 page ID 需要 registry 映射到实际组件

### Mitigation

### 缓解措施

- `PageRenderer` component maps page IDs to React components automatically
- Can coexist with React Router for URL management (Router syncs with Runtime)
- Page ID registry is simple: `{ Dashboard: DashboardComponent, ... }`

- `PageRenderer` 自动将 page IDs 映射到 React 组件
- 可与 React Router 共存以管理 URL（Router 与 Runtime 同步）
- Page ID registry 结构简单：`{ Dashboard: DashboardComponent, ... }`

---

## Use Cases

## 使用场景（Use Cases）

### Page Lock During Procedure

### 术中页面锁定

```typescript
const page = runtime.modules.page as PageController;
// Doctor starts a procedure
page.lock();
// ... procedure in progress ...
// All navigation blocked until explicitly unlocked
page.unlock();
```

### Automated Dashboard Control

### 自动化仪表盘控制

```typescript
// External monitoring system triggers page switch
runtime.dispatch({
  type: "PAGE_TRANSITION",
  payload: { pageId: "AlertDashboard" },
  source: "monitoring-system",
});
```

### Workflow Orchestration

### 工作流编排

```typescript
// Sequential page flow enforced by policy
const workflow = ["PatientIntake", "Diagnosis", "Prescription", "Summary"];
const page = runtime.modules.page as PageController;
for (const step of workflow) {
  page.transition(step);
  await waitForUserCompletion();
}
```

---

## References

## 参考资料（References）

- [PRISMUI-RUNTIME.md §4 Module System](../architecture/PRISMUI-RUNTIME.md)
- [ARCHITECTURE.md §3.2 Layer 0](../architecture/PRISMUI-ARCHITECTURE.md)
- [RULES.md Rule 16](../RULES.md)
- [DESIGN-PRINCIPLES.md §1 Runtime First](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
