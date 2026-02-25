# Code Standards / 编码规范

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Scope:** All code in `packages/core/`, `packages/react/`, `packages/demo/`

---

## 1. Language & Tooling

| Tool           | Version | Purpose                           |
| -------------- | ------- | --------------------------------- |
| **TypeScript** | 5.x     | Primary language for all packages |
| **Vitest**     | Latest  | Unit testing framework            |
| **ESLint**     | Latest  | Code linting                      |
| **Prettier**   | Latest  | Code formatting                   |
| **pnpm**       | Latest  | Package manager (monorepo)        |

---

## 2. TypeScript Conventions

### 2.1 Strict Mode

All packages use `strict: true` in `tsconfig.json`. No `any` except in explicitly documented cases.

### 2.2 Interfaces Over Types

Prefer `interface` for object shapes. Use `type` for unions, intersections, and utility types.

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

All exported functions MUST have explicit return types.

```typescript
// ✅ Explicit return type
export function createEventBus(options?: EventBusOptions): EventBus { ... }

// ❌ Inferred return type
export function createEventBus(options?: EventBusOptions) { ... }
```

### 2.4 Readonly by Default

Use `Readonly<T>`, `readonly`, and `as const` wherever possible.

```typescript
// ✅ Readonly state
getState(): Readonly<RuntimeState>;
getHistory(): readonly RuntimeEvent[];
```

---

## 3. File Naming

| Pattern              | Example               | Usage            |
| -------------------- | --------------------- | ---------------- |
| `kebab-case.ts`      | `event-bus.ts`        | Source files     |
| `kebab-case.test.ts` | `event-bus.test.ts`   | Test files       |
| `PascalCase.tsx`     | `PrismUIProvider.tsx` | React components |
| `use-kebab-case.ts`  | `use-runtime.ts`      | React hooks      |
| `index.ts`           | `index.ts`            | Barrel exports   |
| `UPPER-KEBAB.md`     | `ARCHITECTURE.md`     | Documentation    |

---

## 4. Module Structure

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

### 5.1 Barrel Exports

Each package has a single `index.ts` that exports the public API.

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

All exports MUST be named. No `export default`.

```typescript
// ✅ Named export
export function createEventBus(): EventBus { ... }

// ❌ Default export
export default function createEventBus(): EventBus { ... }
```

---

## 6. Testing Standards

### 6.1 Test File Location

Tests are co-located with source files: `event-bus.ts` → `event-bus.test.ts`.

### 6.2 Test Structure

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

- `describe` blocks: component/function name
- `it` blocks: behavior description (not implementation)
- No `test()` — always use `it()`

### 6.4 Coverage Targets

| Package           | Minimum Coverage     |
| ----------------- | -------------------- |
| `packages/core/`  | 95% line, 90% branch |
| `packages/react/` | 90% line, 85% branch |

---

## 7. Error Handling

### 7.1 Error Messages

All errors MUST include the PrismUI prefix and be descriptive.

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

Operations that fail MUST throw or return an error. No silent swallowing.

---

## 8. packages/core/ Specific Rules

### 8.1 Zero Dependencies

`packages/core/package.json` MUST have `"dependencies": {}` — literally zero.

### 8.2 No Framework Imports

A CI lint rule enforces:

```
❌ import ... from 'react'
❌ import ... from 'react-dom'
❌ document.*, window.*, HTMLElement
```

### 8.3 Pure Functions

All reducers MUST be pure functions (deterministic, no side effects). Middleware MUST NOT call `store.setState()`.

---

## 9. packages/react/ Specific Rules

### 9.1 Hook Naming

All hooks start with `use`: `useRuntime`, `useRuntimeState`, `usePage`, `useModal`.

### 9.2 Provider Pattern

Provider accepts externally-created runtime — does NOT create it internally.

### 9.3 No Business Logic

Hooks are thin wrappers. No state computation, no derived values, no scheduling.
