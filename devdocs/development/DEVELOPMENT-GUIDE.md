# Development Guide / 开发指南

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

> **版本：** 2.0  
> **最后更新：** 2026-02-25

---

## 1. Prerequisites

## 1. 前置条件

| Requirement | Version |
| ----------- | ------- |
| Node.js     | 18+     |
| pnpm        | 8+      |
| TypeScript  | 5.x     |
| Git         | 2.x     |

| 依赖       | 版本 |
| ---------- | ---- |
| Node.js    | 18+  |
| pnpm       | 8+   |
| TypeScript | 5.x  |
| Git        | 2.x  |

---

## 2. Repository Structure

## 2. 仓库结构

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

## 3. 快速开始

### 3.1 Clone & Install

### 3.1 克隆与安装

```bash
git clone <repo-url> prismui
cd prismui
pnpm install
```

### 3.2 Development Commands

### 3.2 开发命令

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

| 命令              | 说明                                 |
| ----------------- | ------------------------------------ |
| `pnpm test`       | 运行所有 package 的测试              |
| `pnpm test:core`  | 只运行 `packages/core/` 的测试       |
| `pnpm test:react` | 只运行 `packages/react/` 的测试      |
| `pnpm typecheck`  | 在所有 package 上运行 `tsc --noEmit` |
| `pnpm lint`       | 在所有 package 上运行 ESLint         |
| `pnpm format`     | 在所有 package 上运行 Prettier       |
| `pnpm dev`        | 启动 demo 应用                       |
| `pnpm build`      | 构建所有 packages                    |

### 3.3 Running Tests

### 3.3 运行测试

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

## 4. 开发流程

### 4.1 Standard Flow

### 4.1 标准流程

1. **Read the stage document** — understand what to build and the acceptance criteria
2. **Read the architecture document** — understand the constraints
3. **Write types first** — define interfaces in `types.ts` before implementation
4. **Implement** — build the module following code standards
5. **Test** — write tests co-located with source files
6. **Verify** — `pnpm typecheck && pnpm test && pnpm lint`
7. **Document** — update stage document with implementation notes

8. **阅读 stage 文档** —— 理解要实现的内容与验收标准
9. **阅读架构文档** —— 理解强约束
10. **先写 types** —— 在实现之前先在 `types.ts` 定义接口
11. **实现** —— 按编码规范构建模块
12. **测试** —— 测试与源码同目录放置
13. **验证** —— `pnpm typecheck && pnpm test && pnpm lint`
14. **文档** —— 在 stage 文档中更新实现说明

### 4.2 Phase Completion Checklist

### 4.2 Phase 完成检查清单

Before marking a phase as complete:

- [ ] All planned files created
- [ ] All tests passing
- [ ] `tsc --noEmit` clean (zero errors)
- [ ] All acceptance criteria met
- [ ] Stage document updated with implementation notes

- [ ] 所有计划文件已创建
- [ ] 所有测试通过
- [ ] `tsc --noEmit` 干净（零错误）
- [ ] 所有验收标准满足
- [ ] stage 文档已更新实现说明

### 4.3 Stage Completion Checklist

### 4.3 Stage 完成检查清单

Before marking a stage as complete:

- [ ] All phases within the stage complete
- [ ] All architecture documents updated
- [ ] All relevant ADRs finalized
- [ ] Total test count verified
- [ ] Stage document frozen (no further changes)
- [ ] STAGE.md overview table updated

- [ ] stage 内所有 phase 完成
- [ ] 所有架构文档已更新
- [ ] 所有关联 ADR 已定稿
- [ ] 总测试数已核对
- [ ] stage 文档已冻结（不再变更）
- [ ] STAGE.md 总览表已更新

---

## 5. Package Development

## 5. 包开发

### 5.1 packages/core/ (Layer 0 + Layer 1)

### 5.1 packages/core/（Layer 0 + Layer 1）

**Critical constraint:** Zero external dependencies, zero framework imports.

**关键约束：** 零外部依赖、零框架 import。

```bash
# Verify isolation — this must return zero results
grep -r "from 'react'" packages/core/src/
grep -r "document\." packages/core/src/
grep -r "window\." packages/core/src/
```

Development pattern:

开发模式：

1. Define interface in `types.ts`
2. Implement factory function (`createEventBus`, `createRuntimeStore`, etc.)
3. Write tests using Vitest (no jsdom needed — pure TypeScript)
4. Export from `index.ts`

5. 在 `types.ts` 定义接口
6. 实现 factory 函数（`createEventBus`、`createRuntimeStore` 等）
7. 用 Vitest 编写测试（无需 jsdom —— 纯 TypeScript）
8. 从 `index.ts` 导出

### 5.2 packages/react/ (Layer 2 + Layer 3)

### 5.2 packages/react/（Layer 2 + Layer 3）

**Critical constraint:** Thin bridge only, zero business logic.

**关键约束：** 仅做薄桥接，零业务逻辑。

Development pattern:

1. Import types from `@prismui/core`
2. Implement React Context and hooks
3. Write tests using Vitest + React Testing Library (jsdom environment)
4. Export from `index.ts`

开发模式：

1. 从 `@prismui/core` 导入 types
2. 实现 React Context 与 hooks
3. 使用 Vitest + React Testing Library 编写测试（jsdom 环境）
4. 从 `index.ts` 导出

### 5.3 packages/demo/

Simple React application that validates the full stack.

### 5.3 packages/demo/

用于验证全栈集成的最小 React 应用。

---

## 6. Monorepo Configuration

## 6. Monorepo 配置

### pnpm-workspace.yaml

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

### Package Dependencies

### 包依赖关系

```
packages/core/    → zero dependencies
packages/react/   → depends on @prismui/core, react, react-dom
packages/demo/    → depends on @prismui/react
```

### TypeScript Project References

### TypeScript 项目引用（Project References）

Each package has its own `tsconfig.json` extending `tsconfig.base.json`. This enables:

每个 package 都有独立的 `tsconfig.json` 并继承 `tsconfig.base.json`，从而实现：

- Independent type checking per package
- Proper module resolution between packages
- IDE support for cross-package navigation

- 每个 package 可独立 typecheck
- packages 间正确的模块解析
- IDE 支持跨包跳转

---

## 7. Debugging

## 7. 调试

### 7.1 Event Tracing

### 7.1 事件追踪

The EventBus maintains a history buffer. Use it for debugging:

EventBus 维护事件历史缓冲区，可用于调试：

```typescript
const runtime = createInteractionRuntime({ historySize: 100 });

// ... interactions happen ...

// Inspect event history
console.log(runtime.bus.getHistory());
```

### 7.2 State Inspection

### 7.2 状态检查

```typescript
// Current state
console.log(runtime.getState());

// Subscribe to all changes
runtime.subscribe((state) => {
  console.log("[state change]", state);
});
```

### 7.3 Middleware Logging

### 7.3 中间件日志

```typescript
runtime.scheduler.use((event, next) => {
  console.log("[before]", event.type, runtime.getState());
  next();
  console.log("[after]", event.type, runtime.getState());
});
```
