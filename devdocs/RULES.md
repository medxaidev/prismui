# R&D Rules (Strong Constraints) / 研发规则（强约束）

> **Version:** 2.0  
> **Last Updated:** 2026-02-25  
> **Authority:** Constitutional — all contributors MUST comply.

---

1. **Architecture precedes code.** / 架构优先于代码  
   Any non-trivial implementation must be traceable to an architectural intent
   documented in devdocs. Runtime patterns must align with the four-layer architecture.  
   任何非平凡的实现都必须能够追溯到在 devdocs 中记录的架构意图。  
   运行时模式必须与四层架构对齐。

2. **All behavior flows through Runtime dispatch.** / 所有行为必须通过 Runtime dispatch  
   Components MUST NOT call `setState()` for global interaction state.
   All state changes MUST flow through `runtime.dispatch(event)`.  
   组件不得对全局交互状态调用 `setState()`。  
   所有状态变更必须通过 `runtime.dispatch(event)` 流转。

3. **Interaction Core is framework-agnostic.** / 交互核心与框架无关  
   `packages/core/` MUST NOT import React, DOM APIs, or any framework-specific code.
   The Interaction Core is pure TypeScript with zero external dependencies.  
   `packages/core/` 不得导入 React、DOM API 或任何框架特定代码。  
   交互核心是纯 TypeScript，零外部依赖。

4. **Deterministic flow is mandatory.** / 确定性流程是强制的  
   All interactions MUST follow: `Event → Scheduler → [Middleware] → Reducer → Commit → Render`.
   Implicit side effects in components and reducers are prohibited.  
   所有交互必须遵循：`Event → Scheduler → [Middleware] → Reducer → Commit → Render`。  
   禁止组件和 reducer 中的隐式副作用。

5. **Theme MUST use semantic indirection.** / Theme 必须使用语义间接层  
   Components MUST NOT reference tokens directly. All styling MUST go through
   the Semantic Layer (`intent`), which derives from the Token Layer.  
   组件不得直接引用 token。所有样式必须通过语义层（`intent`），由 Token 层推导。

6. **Adapters contain zero business logic.** / 适配层不包含业务逻辑  
   React Provider, hooks, and bindings are pure bridges between Runtime and the view layer.
   No scheduling, policy, or orchestration logic is permitted in adapters.  
   React Provider、hooks 和绑定是 Runtime 与视图层之间的纯桥接。  
   适配层中不允许调度、策略或编排逻辑。

7. **All destructive interactions require policy approval.** / 所有破坏性交互需要策略审批  
   Any interaction classified as destructive (delete, overwrite, approve) MUST pass through
   the Governance Layer's policy engine before execution.  
   任何被归类为破坏性的交互（删除、覆盖、审批）在执行前必须通过治理层的策略引擎。

8. **Components MUST NOT implement scheduling logic.** / 组件不得实现调度逻辑  
   Event priority, queue management, and conflict resolution belong exclusively
   to the Scheduler in the Interaction Core. Components only dispatch and render.  
   事件优先级、队列管理和冲突解决专属于交互核心中的 Scheduler。  
   组件只负责 dispatch 和 render。

9. **Documentation is part of the deliverable.** / 文档是交付物的一部分  
   A module or feature is considered incomplete if its corresponding documentation,
   API spec, and usage examples are missing or outdated.  
   如果相应文档、API 规范和使用示例缺失或过时，则模块或功能被视为未完成。

10. **Stage completion requires documentation freeze.** / 阶段完成需要文档冻结  
    A development stage is not considered complete until all relevant
    devdocs (architecture, stage notes, decisions) are updated and reviewed.  
    在所有相关的 devdocs（架构、阶段说明、决策）更新和审查之前，  
    开发阶段不被视为完成。

11. **Long-term or irreversible decisions must be recorded.** / 长期或不可逆决策必须记录  
    Any decision that affects architecture, public interfaces, or runtime behavior
    must be documented as an ADR (Architecture Decision Record).  
    任何影响架构、公共接口或运行时行为的决策必须作为 ADR 记录。

12. **Tests are mandatory for all modules.** / 所有模块必须测试  
    All runtime modules, adapters, and renderers must have unit tests.
    Core logic (EventBus, Store, Scheduler, PageController) requires comprehensive testing.  
    所有运行时模块、适配器和渲染器必须有单元测试。  
    核心逻辑（EventBus、Store、Scheduler、PageController）需要全面测试。

13. **Stage completeness is mandatory.** / 阶段完整性是强制的  
    Each development stage must be completed in full before the next begins.
    Core infrastructure within a stage MUST NOT be deferred or split.
    Partial infrastructure leads to rework.  
    每个开发阶段必须在下一个阶段开始之前完整完成。  
    阶段内的核心基础设施不得推迟或拆分。不完整的基础设施会导致返工。

14. **Infrastructure before consumers.** / 基础设施先于消费者  
    Within any stage that introduces new infrastructure (EventBus, Store, Scheduler),
    the infrastructure must be fully built and tested before consumers are implemented.
    Consumers (adapters, renderers) serve as validation, not the other way around.  
    在任何引入新基础设施的阶段中，基础设施必须在消费者实现之前完全构建和测试。  
    消费者（适配器、渲染器）是基础设施的验证，而不是反过来。

15. **AI-generated code is untrusted by default.** / AI 生成的代码默认不可信  
    All AI-assisted code must be reviewed, understood, and validated
    before being accepted into the codebase.  
    所有 AI 辅助的代码在被接受到代码库之前，必须经过审查、理解和验证。

16. **Pages are Runtime Resources, not JSX.** / 页面是运行时资源，不是 JSX  
    Pages are managed entities with lifecycle (mount, unmount, transition, lock).
    Page state is owned by Runtime, not by React component trees.  
    页面是具有生命周期的受管实体（mount、unmount、transition、lock）。  
    页面状态由 Runtime 拥有，而不是 React 组件树。

17. **State mutation ONLY through Reducer Commit.** / 状态变更仅通过 Reducer Commit  
    `store.setState()` MUST only be called inside the Scheduler's commit step.
    Reducers are pure functions: `(event, prevState) → nextState`. No side effects.
    No handler, middleware, component, or external code may call `store.setState()` directly.
    See ADR-006.  
    `store.setState()` 仅允许在 Scheduler 的 commit 步骤中调用。  
    Reducer 是纯函数：`(event, prevState) → nextState`。无副作用。  
    任何 handler、中间件、组件或外部代码不得直接调用 `store.setState()`。  
    参见 ADR-006。
