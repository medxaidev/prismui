# Testing Strategy / 测试策略

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

---

## 1. Overview

PrismUI 2.0 uses a **layered testing strategy** aligned with the four-layer architecture. Each layer has specific testing requirements and tools.

---

## 2. Testing by Layer

### Layer 0 — Interaction Core (`packages/core/`)

| Aspect          | Requirement                              |
| --------------- | ---------------------------------------- |
| **Environment** | Pure Node.js (NO jsdom, NO browser APIs) |
| **Framework**   | Vitest                                   |
| **Style**       | Unit tests for each module               |
| **Coverage**    | 95% line, 90% branch                     |

**What to test:**

- EventBus: dispatch, subscribe, type-filtered subscription, history, unsubscribe, clear
- RuntimeStore: getState, setState immutability, subscribe, version increment, snapshot isolation
- Scheduler: reducer registration, event routing, middleware chain, middleware order, commit boundary, reducer error safety
- PageController: mount/unmount, transition, lock/unlock, locked state prevents transition
- Runtime Factory: composition, destroy cleanup, multiple instance isolation

**Test pattern:**

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

| Aspect          | Requirement              |
| --------------- | ------------------------ |
| **Environment** | Pure Node.js             |
| **Framework**   | Vitest                   |
| **Style**       | Unit + integration tests |
| **Coverage**    | 95% line, 90% branch     |

**What to test:**

- Policy Engine: rule registration, evaluation, allow/deny/transform, ordered evaluation, transform one-time rule
- Audit Trail: entry recording, immutability, filtering, export/serialization, prevState/nextState accuracy
- Replay System: event sequence replay, state hash verification, determinism guarantee, speed control, pause/resume, no side effects
- Reducer purity: frozen prevState input, no store access, no side effects
- Priority Scheduler: priority ordering, critical bypass, conflict resolution

---

### Layer 2 — React Adapter (`packages/react/`)

| Aspect          | Requirement                    |
| --------------- | ------------------------------ |
| **Environment** | jsdom (Vitest)                 |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | Hook tests + integration tests |
| **Coverage**    | 90% line, 85% branch           |

**What to test:**

- PrismUIProvider: renders children, provides runtime via context
- useRuntime: returns runtime instance, throws outside provider
- useRuntimeState: reactive to state changes, read-only
- usePage: reflects page state, transition/lock functions work
- useModal: reflects modal stack, open/close functions work

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

    act(() => {
      runtime.page.mount('Dashboard');
      runtime.page.transition('Dashboard');
    });

    expect(result.current.currentPage).toBe('Dashboard');
  });
});
```

---

### Layer 3 — Rendering (Future)

| Aspect          | Requirement                    |
| --------------- | ------------------------------ |
| **Environment** | jsdom                          |
| **Framework**   | Vitest + React Testing Library |
| **Style**       | Component tests                |

---

## 3. Test Categories

### 3.1 Unit Tests

Test individual modules in isolation with mocked dependencies.

- Every exported function has unit tests
- Every error path is tested
- Edge cases documented and tested

### 3.2 Integration Tests

Test modules working together through the full pipeline.

```typescript
describe("Full Pipeline Integration", () => {
  it("dispatches event through bus → scheduler → handler → store", () => {
    const runtime = createInteractionRuntime();

    runtime.page.mount("Dashboard");
    runtime.page.transition("Dashboard");

    expect(runtime.getState().currentPage).toBe("Dashboard");
    expect(runtime.bus.getHistory()).toHaveLength(2);
  });
});
```

### 3.3 Isolation Tests

Verify that `packages/core/` has zero framework dependencies.

```typescript
describe("Framework Isolation", () => {
  it("core package has no react imports", () => {
    // Automated via lint rule or CI check
  });
});
```

---

## 4. Test Naming Convention

```
describe('ModuleName')
  describe('methodName')
    it('expected behavior when condition')
```

Examples:

- `it('delivers event to all subscribers')`
- `it('returns unsubscribe function')`
- `it('prevents transition when page is locked')`
- `it('throws when used outside PrismUIProvider')`

---

## 5. Test Count Targets by Stage

| Stage     | New Tests | Cumulative |
| --------- | --------- | ---------- |
| STAGE-001 | ~94       | ~94        |
| STAGE-002 | ~80       | ~174       |
| STAGE-003 | ~60       | ~234       |

---

## 6. Continuous Verification

Every phase completion requires:

```bash
pnpm test           # All tests pass
pnpm typecheck      # tsc --noEmit clean
pnpm lint           # Zero lint errors
```

No regressions allowed — all previous tests must continue to pass.
