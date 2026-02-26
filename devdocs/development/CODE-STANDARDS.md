# Code Standards / 编码规范

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Scope:** All code in `packages/core/`, `packages/react/`, `packages/demo/`

> **版本：** 2.0  
> **最后更新：** 2026-02-25  
> **范围：** `packages/core/`、`packages/react/`、`packages/demo/` 的所有代码

---

## 1. Language & Tooling

## 1. 语言与工具链

| Tool           | Version | Purpose                           |
| -------------- | ------- | --------------------------------- |
| **TypeScript** | 5.x     | Primary language for all packages |
| **Vitest**     | Latest  | Unit testing framework            |
| **ESLint**     | Latest  | Code linting                      |
| **Prettier**   | Latest  | Code formatting                   |
| **pnpm**       | Latest  | Package manager (monorepo)        |

| 工具           | 版本   | 用途                     |
| -------------- | ------ | ------------------------ |
| **TypeScript** | 5.x    | 所有 packages 的主要语言 |
| **Vitest**     | Latest | 单元测试框架             |
| **ESLint**     | Latest | 代码检查                 |
| **Prettier**   | Latest | 代码格式化               |
| **pnpm**       | Latest | 包管理器（monorepo）     |

---

## 2. TypeScript Conventions

## 2. TypeScript 约定

### 2.1 Strict Mode

### 2.1 严格模式

All packages use `strict: true` in `tsconfig.json`. No `any` except in explicitly documented cases.

所有 packages 的 `tsconfig.json` 都使用 `strict: true`。除非明确记录，否则禁止 `any`。

### 2.2 Interfaces Over Types

### 2.2 interface 优先于 type

Prefer `interface` for object shapes. Use `type` for unions, intersections, and utility types.

对象结构优先使用 `interface`。联合类型、交叉类型与工具类型使用 `type`。

```typescript
// ✅ Interface for object shapes
interface RuntimeEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: number;
}

// ✅ Type for unions
type PolicyVerdict = "allow" | "deny" | "transform";

// ✅ Type for function signatures
type EventReducer = (
  event: RuntimeEvent,
  prevState: Readonly<RuntimeState>,
) => ReducerCommitResult;
```

### 2.3 Explicit Return Types

### 2.3 显式返回类型

All exported functions MUST have explicit return types.

所有导出的函数必须显式声明返回类型。

```typescript
// ✅ Explicit return type
export function createEventBus(options?: EventBusOptions): EventBus { ... }

// ❌ Inferred return type
export function createEventBus(options?: EventBusOptions) { ... }
```

### 2.4 Readonly by Default

### 2.4 默认只读

Use `Readonly<T>`, `readonly`, and `as const` wherever possible.

尽可能使用 `Readonly<T>`、`readonly` 与 `as const`。

```typescript
// ✅ Readonly state
getState(): Readonly<RuntimeState>;
getHistory(): readonly RuntimeEvent[];
```

---

## 3. File Naming

## 3. 文件命名

| Pattern              | Example               | Usage            |
| -------------------- | --------------------- | ---------------- |
| `kebab-case.ts`      | `event-bus.ts`        | Source files     |
| `kebab-case.test.ts` | `event-bus.test.ts`   | Test files       |
| `PascalCase.tsx`     | `PrismUIProvider.tsx` | React components |
| `use-kebab-case.ts`  | `use-runtime.ts`      | React hooks      |
| `index.ts`           | `index.ts`            | Barrel exports   |
| `UPPER-KEBAB.md`     | `ARCHITECTURE.md`     | Documentation    |

| 模式                 | 示例                  | 用途        |
| -------------------- | --------------------- | ----------- |
| `kebab-case.ts`      | `event-bus.ts`        | 源码文件    |
| `kebab-case.test.ts` | `event-bus.test.ts`   | 测试文件    |
| `PascalCase.tsx`     | `PrismUIProvider.tsx` | React 组件  |
| `use-kebab-case.ts`  | `use-runtime.ts`      | React hooks |
| `index.ts`           | `index.ts`            | Barrel 导出 |
| `UPPER-KEBAB.md`     | `ARCHITECTURE.md`     | 文档        |

---

## 4. Module Structure

## 4. 模块结构

### packages/core/

```
src/
├── event-bus.ts          # EventBus implementation
├── event-bus.test.ts     # EventBus tests
├── store.ts              # RuntimeStore implementation
├── store.test.ts         # RuntimeStore tests
├── scheduler.ts          # Scheduler implementation
├── scheduler.test.ts     # Scheduler tests
├── page-controller.ts    # PageController implementation
├── page-controller.test.ts
├── runtime.ts            # createInteractionRuntime factory
├── runtime.test.ts
├── types.ts              # All public type definitions
└── index.ts              # Barrel exports
```

### packages/react/

```
src/
├── context.ts            # React Context definition
├── provider.tsx          # PrismUIProvider component
├── use-runtime.ts        # useRuntime hook
├── use-runtime-state.ts  # useRuntimeState hook
├── use-page.ts           # usePage hook
├── use-modal.ts          # useModal hook
├── provider.test.tsx     # Provider tests
├── hooks.test.tsx        # Hook tests
└── index.ts              # Barrel exports
```

---

## 5. Export Rules

## 5. 导出规则

### 5.1 Barrel Exports

### 5.1 Barrel 导出

Each package has a single `index.ts` that exports the public API.

每个 package 只有一个 `index.ts` 用于导出 public API。

```typescript
// packages/core/src/index.ts
export { createEventBus } from './event-bus';
export { createRuntimeStore } from './store';
export { createScheduler } from './scheduler';
export { createInteractionRuntime } from './runtime';
export { createPageModule } from './modules/page-module';
export { createModalModule } from './modules/modal-module';
export type { RuntimeEvent, EventBus, RuntimeStore, RuntimeState, RuntimeModule, ReducerCommitResult, ... } from './types';
```

### 5.2 No Default Exports

### 5.2 禁止默认导出

All exports MUST be named. No `export default`.

所有导出必须为命名导出，禁止 `export default`。

```typescript
// ✅ Named export
export function createEventBus(): EventBus { ... }

// ❌ Default export
export default function createEventBus(): EventBus { ... }
```

---

## 6. Testing Standards

## 6. 测试规范

### 6.1 Test File Location

### 6.1 测试文件位置

Tests are co-located with source files: `event-bus.ts` → `event-bus.test.ts`.

测试与源码同目录放置：`event-bus.ts` → `event-bus.test.ts`。

### 6.2 Test Structure

### 6.2 测试结构

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from './event-bus';

describe('EventBus', () => {
  describe('dispatch', () => {
    it('delivers event to all subscribers', () => { ... });
    it('includes timestamp in event', () => { ... });
  });

  describe('subscribe', () => {
    it('returns unsubscribe function', () => { ... });
    it('supports type-filtered subscription', () => { ... });
  });
});
```

### 6.3 Test Naming

### 6.3 测试命名

- `describe` blocks: component/function name
- `it` blocks: behavior description (not implementation)
- No `test()` — always use `it()`

- `describe`：模块/组件/函数名
- `it`：行为描述（不是实现细节）
- 不用 `test()` —— 始终使用 `it()`

### 6.4 Coverage Targets

### 6.4 覆盖率目标

| Package           | Minimum Coverage     |
| ----------------- | -------------------- |
| `packages/core/`  | 95% line, 90% branch |
| `packages/react/` | 90% line, 85% branch |

| Package           | 最低覆盖率           |
| ----------------- | -------------------- |
| `packages/core/`  | 95% line，90% branch |
| `packages/react/` | 90% line，85% branch |

---

## 7. Error Handling

## 7. 错误处理

### 7.1 Error Messages

### 7.1 错误信息

All errors MUST include the PrismUI prefix and be descriptive.

所有错误必须包含 PrismUI 前缀，并且具有描述性。

```typescript
// ✅ Descriptive error
throw new Error("[PrismUI] useRuntime must be used within a PrismUIProvider");

// ✅ Descriptive error with context
throw new Error(
  `[PrismUI] Handler for event type "${type}" is already registered`,
);

// ❌ Generic error
throw new Error("Invalid state");
```

### 7.2 No Silent Failures

### 7.2 禁止静默失败

Operations that fail MUST throw or return an error. No silent swallowing.

失败的操作必须抛错或返回 error，禁止静默吞掉。

---

## 8. packages/core/ Specific Rules

## 8. packages/core 专属规则

### 8.1 Zero Dependencies

### 8.1 零依赖

`packages/core/package.json` MUST have `"dependencies": {}` — literally zero.

`packages/core/package.json` 必须包含 `"dependencies": {}` —— 必须是字面意义上的零依赖。

### 8.2 No Framework Imports

### 8.2 禁止框架 import

A CI lint rule enforces:

CI lint 规则强制：

```
❌ import ... from 'react'
❌ import ... from 'react-dom'
❌ document.*, window.*, HTMLElement
```

### 8.3 Pure Functions

### 8.3 纯函数

All reducers MUST be pure functions (deterministic, no side effects). Middleware MUST NOT call `store.setState()`.

所有 reducer 必须为纯函数（确定性、无副作用）。middleware 不得调用 `store.setState()`。

---

## 9. packages/react/ Specific Rules

## 9. packages/react 专属规则

### 9.1 Hook Naming

### 9.1 Hook 命名

All hooks start with `use`: `useRuntime`, `useRuntimeState`, `usePage`, `useModal`.

所有 hooks 以 `use` 开头：`useRuntime`、`useRuntimeState`、`usePage`、`useModal`。

### 9.2 Provider Pattern

### 9.2 Provider 模式

Provider accepts externally-created runtime — does NOT create it internally.

Provider 接收外部创建的 runtime —— 不得在内部创建。

### 9.3 No Business Logic

### 9.3 禁止业务逻辑

Hooks are thin wrappers. No state computation, no derived values, no scheduling.

hooks 必须是薄封装：不计算 state、不派生值、不做调度。
