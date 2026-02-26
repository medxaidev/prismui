# Testing Strategy / 测试策略

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

> **版本：** 2.0  
> **最后更新：** 2026-02-25

---

## 1. Overview

## 1. 概览

PrismUI 2.0 uses a **layered testing strategy** aligned with the four-layer architecture. Each layer has specific testing requirements and tools.

PrismUI 2.0 采用与四层架构对齐的 **分层测试策略**。每一层都有明确的测试要求与工具选择。

---

## 2. Testing by Layer

## 2. 按层测试

### Layer 0 — Interaction Core (`packages/core/`)

### Layer 0 —— Interaction Core（`packages/core/`）

| Aspect          | Requirement                              |
| --------------- | ---------------------------------------- |
| **Environment** | Pure Node.js (NO jsdom, NO browser APIs) |
| **Framework**   | Vitest                                   |
| **Style**       | Unit tests for each module               |
| **Coverage**    | 95% line, 90% branch                     |

| 维度            | 要求                                         |
| --------------- | -------------------------------------------- |
| **Environment** | 纯 Node.js（不允许 jsdom，不允许浏览器 API） |
| **Framework**   | Vitest                                       |
| **Style**       | 每个模块的单元测试                           |
| **Coverage**    | 95% line，90% branch                         |

**What to test:**

**测试内容：**

- EventBus: dispatch, subscribe, type-filtered subscription, history, unsubscribe, clear
- RuntimeStore: getState, setState immutability, subscribe, version increment, snapshot isolation
- Scheduler: reducer registration, event routing, middleware chain, middleware order, commit boundary, reducer error safety
- PageController: mount/unmount, transition, lock/unlock, locked state prevents transition
- Runtime Factory: composition, destroy cleanup, multiple instance isolation

- EventBus：dispatch、subscribe、按类型订阅、history、unsubscribe、clear
- RuntimeStore：getState、setState 不可变性、subscribe、version 递增、snapshot 隔离
- Scheduler：reducer 注册、事件路由、middleware 链、middleware 顺序、commit 边界、reducer 错误安全
- PageController：mount/unmount、transition、lock/unlock、锁定时禁止 transition
- Runtime Factory：组合、destroy 清理、多个实例隔离

**Test pattern:**

**测试模式：**

```typescript
import { describe, it, expect } from "vitest";
import { createEventBus } from "./event-bus";

describe("EventBus", () => {
  it("delivers event to all subscribers", () => {
    const bus = createEventBus();
    const received: RuntimeEvent[] = [];
    bus.subscribe((event) => received.push(event));

    bus.dispatch({ type: "TEST", timestamp: 0 });

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe("TEST");
  });
});
```

---

### Layer 1 — Governance (`packages/core/src/governance/`)

### Layer 1 —— Governance（`packages/core/src/governance/`）

| Aspect          | Requirement              |
| --------------- | ------------------------ |
| **Environment** | Pure Node.js             |
| **Framework**   | Vitest                   |
| **Style**       | Unit + integration tests |
| **Coverage**    | 95% line, 90% branch     |

| 维度            | 要求                 |
| --------------- | -------------------- |
| **Environment** | 纯 Node.js           |
| **Framework**   | Vitest               |
| **Style**       | 单元测试 + 集成测试  |
| **Coverage**    | 95% line，90% branch |

**What to test:**

- Policy Engine: rule registration, evaluation, allow/deny/transform, ordered evaluation, transform one-time rule
- Audit Trail: entry recording, immutability, filtering, export/serialization, prevState/nextState accuracy
- Replay System: event sequence replay, state hash verification, determinism guarantee, speed control, pause/resume, no side effects
- Reducer purity: frozen prevState input, no store access, no side effects
- Priority Scheduler: priority ordering, critical bypass, conflict resolution

- Policy Engine：规则注册、求值、allow/deny/transform、有序求值、transform 一次性规则
- Audit Trail：条目记录、不可变性、过滤、导出/序列化、prevState/nextState 准确性
- Replay System：序列重放、state hash 校验、确定性保证、速度控制、暂停/恢复、无副作用
- reducer 纯度：冻结 prevState 输入、无 store 访问、无副作用
- Priority Scheduler：优先级排序、critical 绕过、冲突解决

---

### Layer 2 — React Adapter (`packages/react/`)

### Layer 2 —— React Adapter（`packages/react/`）

| Aspect          | Requirement                    |
| --------------- | ------------------------------ |
| **Environment** | jsdom (Vitest)                 |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | Hook tests + integration tests |
| **Coverage**    | 90% line, 85% branch           |

| 维度            | 要求                           |
| --------------- | ------------------------------ |
| **Environment** | jsdom（Vitest）                |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | hook 测试 + 集成测试           |
| **Coverage**    | 90% line，85% branch           |

**What to test:**

- PrismUIProvider: renders children, provides runtime via context
- useRuntime: returns runtime instance, throws outside provider
- useRuntimeState: reactive to state changes, read-only
- usePage: reflects page state, transition/lock functions work
- useModal: reflects modal stack, open/close functions work

- PrismUIProvider：渲染 children、通过 context 提供 runtime
- useRuntime：返回 runtime 实例，provider 外抛错
- useRuntimeState：随 state 变化而更新，只读
- usePage：反映页面 state，transition/lock 生效
- useModal：反映 modal stack，open/close 生效

**Test pattern:**

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PrismUIProvider } from './provider';
import { useRuntimeState } from './use-runtime-state';
import { createInteractionRuntime } from '@prismui/core';

describe('useRuntimeState', () => {
  it('re-renders when state changes', () => {
    const runtime = createInteractionRuntime();
    const wrapper = ({ children }) => (
      <PrismUIProvider runtime={runtime}>{children}</PrismUIProvider>
    );

    const { result } = renderHook(() => useRuntimeState(), { wrapper });

    expect(result.current.currentPage).toBeNull();

    const page = runtime.modules.page as PageController;

    act(() => {
      page.mount('Dashboard');
      page.transition('Dashboard');
    });

    expect(result.current.currentPage).toBe('Dashboard');
  });
});
```

---

### Layer 3 — Rendering (Future)

### Layer 3 —— Rendering（未来）

| Aspect          | Requirement                    |
| --------------- | ------------------------------ |
| **Environment** | jsdom                          |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | Component tests                |

| 维度            | 要求                           |
| --------------- | ------------------------------ |
| **Environment** | jsdom                          |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | 组件测试                       |

---

## 3. Test Categories

## 3. 测试类别

### 3.1 Unit Tests

### 3.1 单元测试

Test individual modules in isolation with mocked dependencies.

在隔离环境中测试单个模块，并对依赖进行 mock。

- Every exported function has unit tests
- Every error path is tested
- Edge cases documented and tested

- 每个导出函数都有单元测试
- 每条错误路径都覆盖
- 边界情况有文档并有测试

### 3.2 Integration Tests

### 3.2 集成测试

Test modules working together through the full pipeline.

测试模块通过完整管线协同工作。

```typescript
describe("Full Pipeline Integration", () => {
  it("dispatches event through bus → scheduler → reducer → commit → store", () => {
    const runtime = createInteractionRuntime({
      modules: [createPageModule()],
    });
    const page = runtime.modules.page as PageController;

    page.mount("Dashboard");
    page.transition("Dashboard");

    expect(runtime.getState().currentPage).toBe("Dashboard");
    expect(runtime.bus.getHistory()).toHaveLength(2);
  });
});
```

### 3.3 Isolation Tests

### 3.3 隔离测试

Verify that `packages/core/` has zero framework dependencies.

验证 `packages/core/` 对框架依赖为零。

```typescript
describe("Framework Isolation", () => {
  it("core package has no react imports", () => {
    // Automated via lint rule or CI check
  });
});
```

---

## 4. Test Naming Convention

## 4. 测试命名约定

```
describe('ModuleName')
  describe('methodName')
    it('expected behavior when condition')
```

Examples:

示例：

- `it('delivers event to all subscribers')`
- `it('returns unsubscribe function')`
- `it('prevents transition when page is locked')`
- `it('throws when used outside PrismUIProvider')`

---

## 5. Test Count Targets by Stage

## 5. 按 Stage 的测试数量目标

| Stage     | New Tests | Cumulative |
| --------- | --------- | ---------- |
| STAGE-001 | ~94       | ~94        |
| STAGE-002 | ~80       | ~174       |
| STAGE-003 | ~60       | ~234       |

| Stage     | 新增测试 | 累计 |
| --------- | -------- | ---- |
| STAGE-001 | ~94      | ~94  |
| STAGE-002 | ~80      | ~174 |
| STAGE-003 | ~60      | ~234 |

---

## 6. Continuous Verification

## 6. 持续验证

Every phase completion requires:

每个 phase 完成必须执行：

```bash
pnpm test           # All tests pass
pnpm typecheck      # tsc --noEmit clean
pnpm lint           # Zero lint errors
```

No regressions allowed — all previous tests must continue to pass.

不允许回归 —— 所有既有测试必须持续通过。
