# Development Guide / 开发指南

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

---

## 1. Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js     | 18+     |
| pnpm        | 8+      |
| TypeScript  | 5.x     |
| Git         | 2.x     |

---

## 2. Repository Structure

```
prismui/
├── devdocs/                 # Architecture, decisions, stages, development docs
│   ├── RULES.md
│   ├── ROADMAP.md
│   ├── architecture/
│   ├── decisions/
│   ├── development/
│   └── stages/
├── packages/
│   ├── core/                # Layer 0 + Layer 1 (Pure TypeScript)
│   │   ├── src/
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   ├── react/               # Layer 2 + Layer 3 (React Adapter)
│   │   ├── src/
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── demo/                # Minimal demo application
│       ├── src/
│       └── package.json
├── package.json             # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json       # Shared TypeScript config
└── vitest.workspace.ts      # Shared test config
```

---

## 3. Getting Started

### 3.1 Clone & Install

```bash
git clone <repo-url> prismui
cd prismui
pnpm install
```

### 3.2 Development Commands

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `pnpm test`       | Run all tests across all packages      |
| `pnpm test:core`  | Run tests for `packages/core/` only    |
| `pnpm test:react` | Run tests for `packages/react/` only   |
| `pnpm typecheck`  | Run `tsc --noEmit` across all packages |
| `pnpm lint`       | Run ESLint across all packages         |
| `pnpm format`     | Run Prettier across all packages       |
| `pnpm dev`        | Start demo application                 |
| `pnpm build`      | Build all packages                     |

### 3.3 Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test -- --watch

# Specific file
pnpm test -- event-bus

# Coverage
pnpm test -- --coverage
```

---

## 4. Development Workflow

### 4.1 Standard Flow

1. **Read the stage document** — understand what to build and the acceptance criteria
2. **Read the architecture document** — understand the constraints
3. **Write types first** — define interfaces in `types.ts` before implementation
4. **Implement** — build the module following code standards
5. **Test** — write tests co-located with source files
6. **Verify** — `pnpm typecheck && pnpm test && pnpm lint`
7. **Document** — update stage document with implementation notes

### 4.2 Phase Completion Checklist

Before marking a phase as complete:

- [ ] All planned files created
- [ ] All tests passing
- [ ] `tsc --noEmit` clean (zero errors)
- [ ] All acceptance criteria met
- [ ] Stage document updated with implementation notes

### 4.3 Stage Completion Checklist

Before marking a stage as complete:

- [ ] All phases within the stage complete
- [ ] All architecture documents updated
- [ ] All relevant ADRs finalized
- [ ] Total test count verified
- [ ] Stage document frozen (no further changes)
- [ ] STAGE.md overview table updated

---

## 5. Package Development

### 5.1 packages/core/ (Layer 0 + Layer 1)

**Critical constraint:** Zero external dependencies, zero framework imports.

```bash
# Verify isolation — this must return zero results
grep -r "from 'react'" packages/core/src/
grep -r "document\." packages/core/src/
grep -r "window\." packages/core/src/
```

Development pattern:

1. Define interface in `types.ts`
2. Implement factory function (`createEventBus`, `createRuntimeStore`, etc.)
3. Write tests using Vitest (no jsdom needed — pure TypeScript)
4. Export from `index.ts`

### 5.2 packages/react/ (Layer 2 + Layer 3)

**Critical constraint:** Thin bridge only, zero business logic.

Development pattern:

1. Import types from `@prismui/core`
2. Implement React Context and hooks
3. Write tests using Vitest + React Testing Library (jsdom environment)
4. Export from `index.ts`

### 5.3 packages/demo/

Simple React application that validates the full stack.

---

## 6. Monorepo Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

### Package Dependencies

```
packages/core/    → zero dependencies
packages/react/   → depends on @prismui/core, react, react-dom
packages/demo/    → depends on @prismui/react
```

### TypeScript Project References

Each package has its own `tsconfig.json` extending `tsconfig.base.json`. This enables:

- Independent type checking per package
- Proper module resolution between packages
- IDE support for cross-package navigation

---

## 7. Debugging

### 7.1 Event Tracing

The EventBus maintains a history buffer. Use it for debugging:

```typescript
const runtime = createInteractionRuntime({ historySize: 100 });

// ... interactions happen ...

// Inspect event history
console.log(runtime.bus.getHistory());
```

### 7.2 State Inspection

```typescript
// Current state
console.log(runtime.getState());

// Subscribe to all changes
runtime.subscribe((state) => {
  console.log("[state change]", state);
});
```

### 7.3 Middleware Logging

```typescript
runtime.scheduler.use((event, next) => {
  console.log("[before]", event.type, runtime.getState());
  next();
  console.log("[after]", event.type, runtime.getState());
});
```
