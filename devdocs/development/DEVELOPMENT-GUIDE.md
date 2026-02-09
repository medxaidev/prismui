# Development Guide / 开发指南

This document describes how component development work is approached in Prismui.
It defines the lifecycle of component development activities, the thinking process
behind them, and how architecture, documentation, testing, and AI usage
fit together in the context of a React UI library.

This is not a step-by-step procedure.
Concrete actions are defined in SOP documents.

本文档描述了 Prismui 中如何处理组件开发工作。
它定义了组件开发活动的生命周期、其背后的思维过程，
以及架构、文档、测试和 AI 使用如何在 React UI 库的上下文中结合在一起。

这不是一个逐步程序。
具体操作在 SOP 文档中定义。

---

## 1. Development Philosophy / 开发哲学

Development is treated as a process of progressively reducing uncertainty.

At the beginning of any work:

- Requirements may be incomplete
- Designs may be tentative
- Implementation details are unknown

The goal of development is not to eliminate uncertainty immediately,
but to make it explicit, controlled, and eventually resolved.

开发被视为逐步减少不确定性的过程。

在任何工作开始时：

- 需求可能不完整
- 设计可能是暂时的
- 实现细节未知

开发的目标不是立即消除不确定性，
而是使其明确、可控并最终解决。

---

## 2. Types of Development Work / 开发工作类型

Not all work follows the same path.
Common development categories include:

- Exploratory component design
- New component implementation
- Theming system development
- Component refactoring and API evolution
- Accessibility improvements
- Bug fixing and stabilization

Each type requires a different balance of design, code, tests,
and documentation.

并非所有工作都遵循相同的路径。
常见的开发类别包括：

- 探索性组件设计
- 新组件实现
- 主题系统开发
- 组件重构和 API 演进
- 可访问性改进
- 错误修复和稳定化

每种类型需要不同的设计、代码、测试
和文档平衡。

---

## 3. From Idea to Implementation / 从想法到实现

All development work follows the same conceptual progression:

1. Clarify intent  
   What problem is being solved, and why it matters.

2. Identify scope  
   What is included, what is excluded, and what constraints apply.

3. Align with architecture  
   Determine how the work fits into existing architectural boundaries.

4. Design before implementation  
   Interfaces, data shapes, and responsibilities are defined
   before or alongside code.

5. Implement incrementally  
   Code is written in small, reviewable units.

6. Validate correctness  
   Through tests, reasoning, and comparison with specifications.

7. Document outcomes  
   Architecture, stages, and decisions are updated as needed.

This progression is conceptual and iterative,
not a rigid sequence.

所有开发工作都遵循相同的概念进展：

1. 明确意图  
   正在解决什么问题，以及为什么重要。

2. 识别范围  
   包括什么、排除什么、适用什么约束。

3. 与架构对齐  
   确定工作如何适应现有架构边界。

4. 实现前设计  
   接口、数据形状和职责在代码之前或与代码一起定义。

5. 增量实现  
   代码以小型、可审查的单元编写。

6. 验证正确性  
   通过测试、推理和与规范比较。

7. 记录结果  
   根据需要更新架构、阶段和决策。

这种进展是概念性和迭代的，
不是僵化的序列。

---

## 4. Architecture and Development / 架构与开发

Architecture provides the stable reference frame for component development.

During development:

- Architecture guides component patterns (Mantine-inspired core, MUI-inspired styling)
- Implementation may reveal architectural gaps or design system inconsistencies
- Mantine and MUI patterns serve as references, not strict templates

When development exposes architectural changes:

- The architecture must be updated
- Or the deviation must be explicitly justified
- Component API changes require ADR documentation

Architecture is allowed to evolve,
but never implicitly.

架构为组件开发提供稳定的参考框架。

在开发期间：

- 架构指导组件模式（受 Mantine 启发的核心，受 MUI 启发的样式）
- 实现可能揭示架构缺陷或设计系统不一致
- Mantine 和 MUI 模式作为参考，而不是严格的模板

当开发暴露架构变更时：

- 必须更新架构
- 或者必须明确证明偏差的合理性
- 组件 API 变更需要 ADR 文档

架构允许演进，
但从不隐式地。

---

## 5. Stages and Progression / 阶段和进展

Development is organized into stages,
each representing a coherent set of goals and constraints.

A stage:

- Has a clear focus
- Introduces or stabilizes key concepts
- Produces both code and documentation

A stage is considered complete only when:

- Its objectives are met
- Its impact on architecture is documented
- Open questions are resolved or explicitly deferred

Stages are recorded in `devdocs/stages`.

开发被组织成阶段，
每个阶段代表一组一致的目标和约束。

一个阶段：

- 有明确的焦点
- 引入或稳定关键概念
- 产生代码和文档

一个阶段仅在以下情况下被视为完成：

- 其目标已实现
- 其对架构的影响已记录
- 开放问题已解决或明确推迟

阶段记录在 `devdocs/stages` 中。

---

## 5.1 Current Stage: Stage-1 (System Boundary Review)

We are currently in **PrismUI Stage-1**.

Stage-1 scope is limited to:

- Provider
- Theme (semantic tokens only)
- SystemProps (layout language)
- Box (layout foundation)

The purpose of Stage-1 is to establish a stable **system boundary**:

- Components must be safe by default
- Theming must be possible without changing component code
- SystemProps must behave like a consistent layout language
- Box must remain visually neutral and purely foundational

### Stage-1 Implementation Review Checklist (A-D)

This checklist is used to detect scope creep. If an item exceeds Stage-1 responsibilities, mark it as a potential Stage-2 concern.

- **A. Provider**
  - **Pass**
    - Provider composes a small set of system responsibilities (theme, CSS vars, baseline, optional SSR registry).
    - Color scheme persistence is isolated behind a strategy interface (`PrismuiColorSchemeManager`).
    - Evidence:
      - `packages/core/src/core/PrismuiProvider/PrismuiProvider.tsx`
      - `packages/core/src/core/PrismuiProvider/PrismuiThemeProvider.tsx`
      - `packages/core/src/core/PrismuiProvider/use-provider-color-scheme/use-provider-color-scheme.ts`
      - `packages/core/src/core/css-vars/ThemeVars.tsx`
      - `packages/core/src/core/css-baseline/CssBaseline.tsx`
  - **Potential Stage-1 violations / risks**
    - Provider exports multiple hooks and managers; ensure it stays a boundary and does not become a general-purpose context bag.
    - If more runtime services are added (i18n, router, telemetry), they must be deferred to Stage-2+.

- **B. Theme**
  - **Pass**
    - Design tokens (`colorFamilies`) and semantic tokens (`palette`) are separated by responsibility: semantic colors resolve at CSS variable generation time.
    - System-level theming is supported via CSS variables (`ThemeVars`, `getPrismuiThemeCssText`).
    - Evidence:
      - `packages/core/src/core/theme/types/theme.ts`
      - `packages/core/src/core/theme/create-theme.ts`
      - `packages/core/src/core/css-vars/css-vars.ts`
      - `packages/core/src/core/css-vars/palette-vars.ts`
  - **Potential Stage-1 violations / risks**
    - Avoid adding component-specific styling into theme at Stage-1 (component tokens belong to later stages).

- **C. SystemProps**
  - **Pass**
    - SystemProps are config-driven (`SYSTEM_CONFIG`) and component-agnostic (`splitSystemProps` + `resolveSystemProps`).
    - Responsive behavior is consistent and mobile-first (`base` + `min-width` overrides).
    - Evidence:
      - `packages/core/src/core/system/system-props.types.ts`
      - `packages/core/src/core/system/system-config.ts`
      - `packages/core/src/core/system/split-system-props/split-system-props.ts`
      - `packages/core/src/core/system/resolve-system-props/normalize-responsive-value.ts`
      - `packages/core/src/core/system/resolve-system-props/resolve-system-props.ts`
  - **Potential Stage-1 violations / risks**
    - SystemProps currently include visual tokens (`bg`, `c`, `bd`, `bdrs`). If Stage-1 intent is “layout only”, these should be treated as Stage-2 (or explicitly allowed as system-level primitives).
    - Responsive spec requires explicit `base`. The runtime currently falls back to the smallest breakpoint when `base` is omitted (not recommended). Consider enforcing this in dev-mode or via lint/type tooling in later stages.

- **D. Box**
  - **Pass**
    - Box is visually neutral (no default styling) and acts as the system foundation.
    - Box can render without Provider (falls back to `defaultTheme`) and can still resolve non-responsive system props.
    - Evidence:
      - `packages/core/src/components/Box/Box.tsx`
      - `packages/core/src/components/Box/get-box-style/get-box-style.ts`
  - **Potential Stage-1 violations / risks**
    - If Box starts to accumulate component-like behavior (variants, states, semantic defaults), it should be moved to Stage-2+.

### Stage-1 Violations Identified

- **Resolved:** `packages/core/src/index.ts` previously exported `Text` (out of Stage-1 scope and missing in the current codebase). The export has been removed to align the public API with Stage-1 intent.

---

## 6. Decisions and Trade-offs / 决策和权衡

Some choices have long-term consequences.

Decisions that affect:

- Architecture
- Data models
- Public interfaces
- Core algorithms

must be made explicit and recorded.

Short-term or local decisions may remain undocumented,
but must not accumulate hidden technical debt.

一些选择具有长期后果。

影响以下内容的决策：

- 架构
- 数据模型
- 公共接口
- 核心算法

必须明确并记录。

短期或本地决策可能保持未记录，
但不得积累隐藏的技术债务。

---

## 7. Testing and Confidence / 测试和信心

Testing is how confidence is built over time.

Not all code requires the same level of testing,
but core logic always does.

Testing should:

- Validate correctness
- Protect against regressions
- Reflect real usage scenarios

A feature is not considered stable
until its behavior is defensible through tests or reasoning.

测试是随时间建立信心的方式。

并非所有代码都需要相同级别的测试，
但核心逻辑总是需要。

测试应该：

- 验证正确性
- 防止回归
- 反映真实使用场景

功能不被视为稳定，
直到其行为可以通过测试或推理来辩护。

---

## 8. AI in the Development Process / 开发过程中的 AI

AI is used to accelerate execution,
not to replace understanding.

During development, AI may assist with:

- Drafting code or documentation
- Exploring alternatives
- Refactoring and summarization

AI-generated outputs must always be reviewed,
understood, and validated.

When AI influences design or architecture,
the result must be documented.

AI 用于加速执行，
而不是替代理解。

在开发期间，AI 可能协助：

- 起草代码或文档
- 探索替代方案
- 重构和总结

AI 生成的输出必须始终被审查、
理解和验证。

当 AI 影响设计或架构时，
结果必须被记录。

---

## 9. Documentation as Part of Development / 作为开发一部分的文档

Documentation is not a final step;
it evolves together with code.

Documentation is updated when:

- Architecture changes
- A stage is completed
- A significant decision is made
- Core logic is introduced or modified

Outdated documentation is treated as a defect.

文档不是最后一步；
它与代码一起演进。

文档在以下情况下更新：

- 架构变更
- 阶段完成
- 做出重大决策
- 引入或修改核心逻辑

过时的文档被视为缺陷。

---

## 10. Component Development Specifics / 组件开发细节

### 10.1 Component Design Process / 组件设计流程

Before implementing a component:

1. Study equivalent components in Mantine and MUI
2. Define the component API (props, variants, sizes)
3. Design the theming contract
4. Plan accessibility features
5. Create usage examples

在实现组件之前：

1. 研究 Mantine 和 MUI 中的等效组件
2. 定义组件 API（属性、变体、大小）
3. 设计主题合约
4. 规划可访问性功能
5. 创建使用示例

### 10.2 MedXAI Project Alignment / MedXAI 项目对齐

Components are built to serve MedXAI:

- Prioritize components needed by MedXAI
- Design with Chinese medical UI patterns in mind
- Ensure compatibility with Next.js App Router
- Support SSR and client-side rendering

组件构建服务于 MedXAI：

- 优先考虑 MedXAI 需要的组件
- 考虑中文医疗 UI 模式进行设计
- 确保与 Next.js App Router 兼容
- 支持 SSR 和客户端渲染

---

## 11. Guiding Principle / 指导原则

Component development progresses when uncertainty decreases
and understanding of both user needs and technical patterns increases.

If progress is not accompanied by clearer component APIs,
better accessibility, or stronger design system consistency,
it is likely not real progress.

当不确定性减少
和对用户需求和技术模式的理解增加时，组件开发取得进展。

如果进展没有伴随更清晰的组件 API、
更好的可访问性或更强的设计系统一致性，
它可能不是真正的进展。
