# Layer 2 — Framework Adapter (React)

> **Status:** Planned  
> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Implemented In:** STAGE-001 (Phase D)  
> **Location:** `packages/react/src/`

---

## Overview

The Framework Adapter is a **thin bridge** between the Interaction Core (Layer 0) and the view layer (React). It subscribes to Runtime state changes and triggers React re-renders. It contains **zero business logic**.

**Principle:** React is just one possible adapter. The same Interaction Core can be connected to Vue, Svelte, or bare TypeScript. The adapter's sole purpose is to translate Runtime state subscriptions into framework-specific reactive updates.

---

## Components

### 1. PrismUIProvider

Bridges the InteractionRuntime to React Context.

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

- Store `runtime` in React Context
- Make runtime accessible to all descendant hooks
- No state management — the runtime is created externally

**Usage:**

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

```typescript
function useRuntime(): InteractionRuntime;
```

- Throws if used outside `PrismUIProvider`
- Returns the stable runtime reference (never changes between renders)
- Used for dispatching events: `runtime.dispatch({ type: '...' })`

---

### 3. useRuntimeState()

Reactive subscription to RuntimeState. Triggers re-render on state changes.

```typescript
function useRuntimeState(): Readonly<RuntimeState>;
```

**Implementation pattern:**

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

- Read-only — components cannot modify state through this hook
- Reactive — any `store.setState()` triggers re-render
- Efficient — only subscribes once per component mount

---

### 4. usePage()

Convenience hook for page lifecycle operations.

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

---

### 5. useModal()

Convenience hook for modal stack management.

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

| Rule     | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| **A-01** | Adapter MUST NOT contain business logic                              |
| **A-02** | Adapter MUST NOT call `store.setState()` directly                    |
| **A-03** | Adapter MUST NOT implement scheduling or policy                      |
| **A-04** | All actions MUST go through `runtime.dispatch()` or `runtime.page.*` |
| **A-05** | Hooks are thin wrappers — no derived state computation               |
| **A-06** | Provider accepts externally-created runtime (not internal creation)  |

---

## Future Adapters

The same Interaction Core can be adapted to:

| Adapter     | Package             | Status        |
| ----------- | ------------------- | ------------- |
| React       | `@prismui/react`    | STAGE-001     |
| Vue         | `@prismui/vue`      | Future        |
| Svelte      | `@prismui/svelte`   | Future        |
| Vanilla JS  | Direct subscription | Available now |
| Node.js CLI | Direct subscription | Available now |
| AI Agent    | Direct subscription | Available now |

The framework-agnostic core makes this possible without any code changes to Layer 0.
