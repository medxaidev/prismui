# ADR-001: Framework-Agnostic Interaction Core / 与框架无关的交互核心

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — defines the fundamental separation between runtime and framework

**状态：** Accepted  
**日期：** 2026-02-25  
**作者：** PrismUI Core Team  
**影响：** Critical —— 定义运行时与框架之间的根本隔离边界

---

## Context

## 背景（Context）

PrismUI 1.x was built as a React-dependent component library. The Runtime Kernel (introduced in STAGE-005) provided module registration and overlay management, but was still deeply coupled to React Context and lifecycle.

PrismUI 1.x 是一个依赖 React 的组件库。运行时内核（在 STAGE-005 引入）提供模块注册与 overlay 管理，但仍然与 React Context 与生命周期深度耦合。

As PrismUI evolves toward a programmable Interaction Runtime, the core must be usable beyond React:

随着 PrismUI 向可编程的 Interaction Runtime 演进，core 必须能够在 React 之外复用：

- **Vue / Svelte adapters** for cross-framework teams
- **Automated testing** in pure Node.js without jsdom
- **AI agent integration** dispatching events to control UI
- **SSR / CLI / Dashboard engines** that run without a browser
- **MedXAI-specific** workflows that may need headless runtime

- **Vue / Svelte 适配器** —— 供跨框架团队使用
- **纯 Node.js 的自动化测试** —— 无需 jsdom
- **AI agent 集成** —— 通过 dispatch 事件控制 UI
- **SSR / CLI / Dashboard 引擎** —— 无浏览器也可运行
- **MedXAI 专用** 工作流 —— 可能需要 headless runtime

---

## Decision

## 决策（Decision）

The Interaction Core (Layer 0) MUST be **pure TypeScript with zero external dependencies**.

Interaction Core（Layer 0）必须是 **纯 TypeScript 且零外部依赖**。

### What this means:

### 这意味着：

1. **`packages/core/` has zero framework imports** — no `react`, `react-dom`, `vue`, or any UI framework
2. **`packages/core/` has zero DOM imports** — no `document`, `window`, `HTMLElement`, or browser APIs
3. **All state management is internal** — `RuntimeStore` uses plain objects and callbacks, not React state
4. **All event handling is internal** — `EventBus` uses subscription arrays, not React Context
5. **React is one adapter** — `packages/react/` bridges the core to React via Context and hooks

6. **`packages/core/` 零框架 import** —— 不得引入 `react`、`react-dom`、`vue` 或任何 UI 框架
7. **`packages/core/` 零 DOM import** —— 不得使用 `document`、`window`、`HTMLElement` 或浏览器 API
8. **所有状态管理在 core 内部完成** —— `RuntimeStore` 使用普通对象与回调，而不是 React state
9. **所有事件处理在 core 内部完成** —— `EventBus` 使用订阅数组，而不是 React Context
10. **React 只是一个 adapter** —— `packages/react/` 通过 Context 与 hooks 将 core 桥接到 React

### Package boundary:

### 包边界：

```
packages/core/     ← Pure TypeScript. Zero dependencies. Runs anywhere.
packages/react/    ← React adapter. Depends on core + react.
packages/vue/      ← Future Vue adapter. Depends on core + vue.
packages/demo/     ← Demo app. Depends on react adapter.
```

packages/core/ ← 纯 TypeScript。零依赖。可在任何环境运行。
packages/react/ ← React 适配器。依赖 core + react。
packages/vue/ ← 未来的 Vue 适配器。依赖 core + vue。
packages/demo/ ← Demo 应用。依赖 react 适配器。

---

## Consequences

## 影响（Consequences）

### Positive

### 正面

- Core is testable in pure Node.js (fast, no jsdom overhead)
- Core can be consumed by any framework or no framework
- Enables AI agents and automated systems to control UI via event dispatch
- Clean separation of concerns — behavior vs rendering
- Future-proof for framework ecosystem changes

- core 可在纯 Node.js 下测试（更快，无 jsdom 开销）
- core 可被任何框架或无框架环境消费
- 支持 AI agent 与自动化系统通过事件分发控制 UI
- 关注点清晰分离 —— 行为 vs 渲染
- 面向未来 —— 可应对框架生态变化

### Negative

### 负面

- React adapter adds indirection (hook wrappers, Context bridge)
- Two packages to maintain instead of one
- Some React-specific optimizations (useSyncExternalStore, concurrent mode) require adapter-level work

- React adapter 增加了一层间接性（hook 封装、Context 桥接）
- 需要维护两个包而不是一个
- 部分 React 特有优化（useSyncExternalStore、并发模式）需要在 adapter 层完成

### Neutral

### 中性

- The core is slightly more verbose than a React-only approach (explicit subscriptions vs hooks)
- TypeScript interfaces must be defined for cross-package contracts

- core 相比纯 React 方案会略显冗长（显式订阅 vs hooks）
- 需要为跨包契约定义 TypeScript interfaces

---

## Enforcement

## 约束与落地（Enforcement）

- **CI check**: `packages/core/` must pass a lint rule that forbids `react`, `react-dom`, `document`, `window` imports
- **Code review**: any PR touching `packages/core/` must verify framework isolation
- **Rule 3** in RULES.md explicitly mandates this

- **CI 检查：** `packages/core/` 必须通过禁止 `react`、`react-dom`、`document`、`window` import 的 lint 规则
- **代码审查：** 任何修改 `packages/core/` 的 PR 都必须验证框架隔离
- RULES.md 的 **Rule 3** 明确要求该约束

---

## References

## 参考资料（References）

- [ARCHITECTURE.md §2.3 Framework Isolation](../architecture/PRISMUI-ARCHITECTURE.md)
- [ADAPTER-LAYER.md](../architecture/PRISMUI-ADAPTER-REACT.md)
- [RULES.md Rule 3](../RULES.md)
- PrismUI 1.x ADR-011: Runtime Platform Architecture (precursor)
