# Layer 3 — Rendering Layer / 第 3 层——渲染层

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-004+  
> **Location:** `packages/react/src/renderers/`

> **状态：** Planned  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **实现于：** STAGE-004+  
> **位置：** `packages/react/src/renderers/`

---

## Overview

The Rendering Layer is the **visual output layer** of PrismUI 2.0. It receives state from the Framework Adapter (Layer 2) and renders UI elements accordingly. It contains **zero orchestration logic** — all behavior is driven by the Runtime.

**Principle:** Renderers are pure functions of Runtime state. Given the same state, they produce the same visual output.

## 概览

渲染层是 PrismUI 2.0 的 **视觉输出层**。它从框架适配层（Layer 2）接收 state，并据此渲染 UI 元素。它包含 **零编排逻辑** —— 所有行为都由 Runtime 驱动。

**原则：** Renderer 是 Runtime state 的纯函数。给定相同 state，将产生相同的视觉输出。

---

## Components

## 组件

### 1. PageRenderer

### 1. 页面渲染器（PageRenderer）

Renders the current page based on Runtime state.

根据 Runtime state 渲染当前页面。

```tsx
interface PageRendererProps {
  pages: Record<string, React.ComponentType>;
}

function PageRenderer({ pages }: PageRendererProps): JSX.Element {
  const { currentPage } = useRuntimeState();

  if (!currentPage || !pages[currentPage]) {
    return null;
  }

  const Page = pages[currentPage];
  return <Page />;
}
```

**Responsibilities:**

- Map `currentPage` string ID to React component
- Render the matched component
- No transition logic (owned by Runtime)

**职责：**

- 将 `currentPage` 字符串 ID 映射到 React 组件
- 渲染匹配到的组件
- 不包含 transition 逻辑（由 Runtime 负责）

---

### 2. ModalRenderer (Future: STAGE-004)

### 2. 模态渲染器（ModalRenderer，未来：STAGE-004）

Renders the modal stack from Runtime state.

从 Runtime state 渲染 modal stack。

```tsx
function ModalRenderer(): JSX.Element {
  const { modalStack } = useRuntimeState();

  return (
    <>
      {modalStack.map((modalId) => (
        <ModalContainer key={modalId} id={modalId} />
      ))}
    </>
  );
}
```

**Responsibilities:**

- Iterate `modalStack` array
- Render each modal with proper z-ordering
- Apply transitions and animations
- No stack management logic (owned by Runtime)

**职责：**

- 遍历 `modalStack` 数组
- 按正确 z-order 渲染每个 modal
- 应用 transition 与 animation
- 不包含 stack 管理逻辑（由 Runtime 负责）

---

### 3. DrawerRenderer (Future: STAGE-004)

### 3. 抽屉渲染器（DrawerRenderer，未来：STAGE-004）

Renders drawer state (side panels).

渲染 drawer state（侧边面板）。

---

### 4. NotificationRenderer (Future: STAGE-004)

### 4. 通知渲染器（NotificationRenderer，未来：STAGE-004）

Renders notification queue (toasts, alerts).

渲染通知队列（toasts、alerts）。

---

## Styling Strategy

## 样式策略

Renderers consume **Semantic Intent** values from the Theme system, not raw tokens.

Renderer 从 Theme 系统消费 **语义 Intent** 值，而不是直接使用原始 tokens。

```tsx
// ❌ Prohibited — direct token reference
<div style={{ backgroundColor: theme.tokens.color.red[500] }}>

// ✅ Required — semantic intent
<div style={{ backgroundColor: theme.intent.destructive.background }}>
```

---

## Hard Constraints

## 强约束

| Rule     | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| **R-01** | Renderers MUST NOT contain scheduling or orchestration logic         |
| **R-02** | Renderers MUST NOT call `runtime.dispatch()` for state management    |
| **R-03** | Renderers MUST NOT hold global interaction state                     |
| **R-04** | All visual output is a pure function of Runtime state                |
| **R-05** | Renderers use Semantic Intent, not raw tokens                        |
| **R-06** | User event handlers (onClick, etc.) delegate to `runtime.dispatch()` |

| 规则     | 描述                                                        |
| -------- | ----------------------------------------------------------- |
| **R-01** | Renderer 不得包含调度或编排逻辑                             |
| **R-02** | Renderer 不得为 state 管理调用 `runtime.dispatch()`         |
| **R-03** | Renderer 不得持有全局交互 state                             |
| **R-04** | 所有视觉输出必须是 Runtime state 的纯函数                   |
| **R-05** | Renderer 必须使用语义 Intent，而不是原始 tokens             |
| **R-06** | 用户事件处理器（onClick 等）必须委托给 `runtime.dispatch()` |

---

## Relationship to Other Layers

## 与其他层的关系

```
Layer 3 (Rendering)
    │
    │ subscribes to state via
    ▼
Layer 2 (Adapter: useRuntimeState)
    │
    │ bridges state from
    ▼
Layer 0 (Runtime: RuntimeStore)
```

Renderers are **consumers**, not **producers**. They display what the Runtime tells them to display.

Renderer 是 **消费者（consumer）**，而不是 **生产者（producer）**。它们展示 Runtime 告诉它们展示的内容。
