# Layer 2 — Framework Adapter (React) / 框架适配层（React）

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-001 (Phase D)  
> **Location:** `packages/react/src/`

> **状态：** Planned  
> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **实现阶段：** STAGE-001（Phase D）  
> **位置：** `packages/react/src/`

---

## Overview

The Framework Adapter is a **thin bridge** between the Interaction Core (Layer 0) and the view layer (React). It subscribes to Runtime state changes and triggers React re-renders. It contains **zero business logic**.

Framework Adapter 是 Interaction Core（Layer 0）与视图层（React）之间的**薄桥接层**。它订阅 Runtime state 的变化并触发 React 重新渲染。适配层中应当 **零业务逻辑**。

**Principle:** React is just one possible adapter. The same Interaction Core can be connected to Vue, Svelte, or bare TypeScript. The adapter's sole purpose is to translate Runtime state subscriptions into framework-specific reactive updates.

**原则：** React 只是可能的适配器之一。同一套 Interaction Core 也可以连接到 Vue、Svelte 或纯 TypeScript。适配层唯一目标是把 Runtime state 的订阅转译为框架侧的响应式更新机制。

---

## Components

### 1. PrismUIProvider

Bridges the InteractionRuntime to React Context.

将 InteractionRuntime 桥接到 React Context。

```tsx
interface PrismUIProviderProps {
  runtime: InteractionRuntime;
  children: React.ReactNode;
}

function PrismUIProvider({
  runtime,
  children,
}: PrismUIProviderProps): JSX.Element;
```

**Responsibilities:**

**职责：**

- Store `runtime` in React Context
- Make runtime accessible to all descendant hooks
- No state management — the runtime is created externally

- 将 `runtime` 存入 React Context
- 让所有后代 hooks 可访问 runtime
- 不做状态管理 —— runtime 在外部创建

**Usage:**

**用法：**

```tsx
import { createInteractionRuntime } from "@prismui/core";
import { PrismUIProvider } from "@prismui/react";

const runtime = createInteractionRuntime();

function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <MyApp />
    </PrismUIProvider>
  );
}
```

---

### 2. useRuntime()

Access the full InteractionRuntime instance.

访问完整的 InteractionRuntime 实例。

```typescript
function useRuntime(): InteractionRuntime;
```

- Throws if used outside `PrismUIProvider`
- Returns the stable runtime reference (never changes between renders)
- Used for dispatching events: `runtime.dispatch({ type: '...' })`

- 在 `PrismUIProvider` 外使用会抛错
- 返回稳定的 runtime 引用（渲染间不变）
- 用于 dispatch 事件：`runtime.dispatch({ type: '...' })`

---

### 3. useRuntimeState()

Reactive subscription to RuntimeState. Triggers re-render on state changes.

对 RuntimeState 的响应式订阅。在 state 变化时触发 re-render。

```typescript
function useRuntimeState(): Readonly<RuntimeState>;
```

**Implementation pattern:**

**实现模式：**

```typescript
function useRuntimeState(): Readonly<RuntimeState> {
  const runtime = useRuntime();
  const [state, setState] = useState(() => runtime.getState());

  useEffect(() => {
    const unsub = runtime.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, [runtime]);

  return state;
}
```

**Properties:**

**特性：**

- Read-only — components cannot modify state through this hook
- Reactive — any `store.setState()` triggers re-render
- Efficient — only subscribes once per component mount

- 只读 —— 组件不能通过该 hook 修改 state
- 响应式 —— 任意 `store.setState()` 都会触发 re-render
- 高效 —— 每个组件 mount 期间仅订阅一次

---

### 4. usePage()

Convenience hook for page lifecycle operations.

用于页面生命周期操作的便捷 hook。

```typescript
interface UsePageReturn {
  currentPage: string | null;
  mountedPages: string[];
  isLocked: boolean;
  mount: (pageId: string) => void;
  unmount: (pageId: string) => void;
  transition: (pageId: string) => void;
  lock: () => void;
  unlock: () => void;
}

function usePage(): UsePageReturn;
```

**Implementation:** Thin wrapper combining `useRuntimeState()` for reactive data and `useRuntime().page` for actions.

**实现：** 薄封装：组合 `useRuntimeState()`（提供响应式数据）与 `useRuntime().page`（提供动作）。

---

### 5. useModal()

Convenience hook for modal stack management.

用于 Modal stack 管理的便捷 hook。

```typescript
interface UseModalReturn {
  modalStack: string[];
  isOpen: (modalId: string) => boolean;
  open: (modalId: string) => void;
  close: (modalId?: string) => void;
  closeAll: () => void;
}

function useModal(): UseModalReturn;
```

---

## Hard Constraints

## 硬性约束

| Rule     | Description                                                            |
| -------- | ---------------------------------------------------------------------- |
| **A-01** | Adapter MUST NOT contain business logic                                |
| **A-02** | Adapter MUST NOT call `store.setState()` directly                      |
| **A-03** | Adapter MUST NOT implement scheduling or policy                        |
| **A-04** | All actions MUST go through `runtime.dispatch()` or module controllers |
| **A-05** | Hooks are thin wrappers — no derived state computation                 |
| **A-06** | Provider accepts externally-created runtime (not internal creation)    |

| 规则     | 描述                                                        |
| -------- | ----------------------------------------------------------- |
| **A-01** | 适配层不得包含业务逻辑                                      |
| **A-02** | 适配层不得直接调用 `store.setState()`                       |
| **A-03** | 适配层不得实现 scheduling 或 policy                         |
| **A-04** | 所有动作必须通过 `runtime.dispatch()` 或 module controllers |
| **A-05** | Hooks 为薄封装 —— 不做 derived state 计算                   |
| **A-06** | Provider 接收外部创建的 runtime（不在内部创建）             |

---

## Future Adapters

## 未来适配器

The same Interaction Core can be adapted to:

同一套 Interaction Core 可适配到：

| Adapter     | Package             | Status        |
| ----------- | ------------------- | ------------- |
| React       | `@prismui/react`    | STAGE-001     |
| Vue         | `@prismui/vue`      | Future        |
| Svelte      | `@prismui/svelte`   | Future        |
| Vanilla JS  | Direct subscription | Available now |
| Node.js CLI | Direct subscription | Available now |
| AI Agent    | Direct subscription | Available now |

| 适配器      | Package             | 状态          |
| ----------- | ------------------- | ------------- |
| React       | `@prismui/react`    | STAGE-001     |
| Vue         | `@prismui/vue`      | Future        |
| Svelte      | `@prismui/svelte`   | Future        |
| Vanilla JS  | Direct subscription | Available now |
| Node.js CLI | Direct subscription | Available now |
| AI Agent    | Direct subscription | Available now |

The framework-agnostic core makes this possible without any code changes to Layer 0.

框架无关的 core 使得这一点成立：无需对 Layer 0 做任何代码改动。
