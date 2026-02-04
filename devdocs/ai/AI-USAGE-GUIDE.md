# AI Usage Guide / AI 使用指南

This document defines how AI tools are used in the Prismui project.
AI is treated as a productivity amplifier, not as an authority
on component architecture, styling systems, or design decisions.

The goal is to benefit from AI assistance without compromising
design clarity, component quality, or long-term maintainability.

本文档定义了 Prismui 项目如何使用 AI 工具。
AI 被视为生产力放大器，而不是组件架构、样式系统或设计决策的权威。

目标是在不影响设计清晰度、组件质量或长期可维护性的前提下，
从 AI 辅助中受益。

---

## 1. Role of AI in This Project / AI 在项目中的角色

AI is used as:

- A drafting assistant (code, documentation, tests)
- A reasoning aid for exploration and comparison
- A refactoring and summarization helper

AI is **not** used as:

- A decision-maker for architecture
- A source of truth for algorithms or specifications
- A substitute for understanding or review

Human judgment always has priority.

AI 用作：

- 起草助手（代码、文档、测试）
- 探索和比较的推理辅助
- 重构和总结助手

AI **不**用作：

- 架构决策者
- 算法或规范的真相来源
- 理解或审查的替代品

人类判断始终优先。

---

## 2. Trust Model / 信任模型

All AI-generated outputs are considered **untrusted by default**.

Before accepting AI-generated content, the developer must ensure:

- The logic is fully understood
- The output aligns with the documented architecture
- Edge cases and failure modes are considered
- The result can be reasonably maintained without AI assistance

If the developer cannot explain the code or design,
it must not be merged.

所有 AI 生成的输出都被视为**默认不可信**。

在接受 AI 生成的内容之前，开发者必须确保：

- 逻辑被完全理解
- 输出与记录的架构一致
- 考虑了边缘情况和失败模式
- 结果可以在没有 AI 辅助的情况下合理维护

如果开发者无法解释代码或设计，
则不得合并。

---

## 3. Allowed Use Cases / 允许的用例

AI assistance is encouraged for:

- Drafting boilerplate or repetitive code
- Translating ideas into initial code skeletons
- Generating documentation drafts
- Refactoring for readability and structure
- Producing test case outlines
- Summarizing or comparing external specifications

AI may also be used during early-stage exploration,
as long as the results are clearly marked as provisional.

鼓励使用 AI 辅助：

- 起草样板或重复代码
- 将想法转化为初始代码框架
- 生成文档草稿
- 为可读性和结构进行重构
- 生成测试用例大纲
- 总结或比较外部规范

AI 也可在早期探索阶段使用，
只要结果明确标记为临时性。

---

## 4. Prohibited or Restricted Use Cases / 禁止或限制的用例

AI must not be used to:

- Introduce architectural decisions without documentation
- Generate component logic without human verification
- Bypass testing or accessibility requirements
- Copy large opaque code blocks without understanding
- Replace understanding of Mantine/MUI architecture patterns
- Generate styling systems without design system alignment

Any AI-generated change that affects public component APIs,
theming systems, or core styling logic requires explicit review
and documentation updates.

AI 不得用于：

- 在没有文档的情况下引入架构决策
- 在没有人工验证的情况下生成组件逻辑
- 绕过测试或可访问性要求
- 在不理解的情况下复制大型不透明代码块
- 替代理解 Mantine/MUI 架构模式
- 在没有设计系统对齐的情况下生成样式系统

任何影响公共组件 API、主题系统或核心样式逻辑的 AI 生成变更
都需要明确的审查和文档更新。

---

## 5. AI and Architecture / AI 与架构

Architecture is defined and evolved in `devdocs/architecture`.

AI may assist in:

- Exploring alternative designs
- Stress-testing assumptions
- Identifying potential edge cases

AI must not:

- Define module boundaries autonomously
- Override documented architectural constraints
- Introduce hidden dependencies or abstractions

When AI influences architectural thinking,
the outcome must be recorded in devdocs
(e.g. ARCHITECTURE.md or an ADR).

架构在 `devdocs/architecture` 中定义和演进。

AI 可以协助：

- 探索替代设计
- 压力测试假设
- 识别潜在边缘情况

AI 不得：

- 自主定义模块边界
- 覆盖记录的架构约束
- 引入隐藏依赖或抽象

当 AI 影响架构思维时，
结果必须记录在 devdocs 中
（例如 ARCHITECTURE.md 或 ADR）。

---

## 6. AI and Core Logic / AI 与核心逻辑

For core component logic (theming engine, style resolution, polymorphic components):

- AI-generated code must be reviewed line by line
- Component tests and accessibility tests are mandatory
- Design system assumptions must be explicit
- Mantine/MUI pattern references must be verified

If AI is used to generate a component or styling solution that is not fully understood,
the solution is considered invalid.

Correctness and accessibility have priority over speed.

对于核心组件逻辑（主题引擎、样式解析、多态组件）：

- AI 生成的代码必须逐行审查
- 组件测试和可访问性测试是强制性的
- 设计系统假设必须明确
- Mantine/MUI 模式引用必须被验证

如果 AI 用于生成未被完全理解的组件或样式解决方案，
则该解决方案被视为无效。

正确性和可访问性优先于速度。

---

## 7. Documentation and AI / 文档与 AI

AI may be used to:

- Draft documentation
- Improve clarity and structure
- Translate or rephrase content

The final responsibility for accuracy and intent
always lies with the human author.

Documentation produced with AI must still reflect
actual system behavior and decisions.

AI 可用于：

- 起草文档
- 改善清晰度和结构
- 翻译或重新表述内容

准确性和意图的最终责任
始终在于人类作者。

AI 生成的文档仍必须反映
实际的系统行为和决策。

---

## 8. Accountability / 责任归属

The use of AI does not transfer responsibility.

All merged code and documentation are owned by the developer
who submits them, regardless of AI involvement.

If an issue arises, "AI generated it" is not considered
an acceptable explanation.

使用 AI 不会转移责任。

所有合并的代码和文档都归提交它们的开发者所有，
无论是否有 AI 参与。

如果出现问题，"AI 生成的" 不被视为
可接受的解释。

---

## 9. Guiding Principle / 指导原则

AI accelerates execution.
Understanding governs acceptance.

When in doubt:

- Slow down
- Re-read the architecture
- Prefer clarity over cleverness

AI 加速执行。
理解决定接受。

如有疑问：

- 放慢速度
- 重读架构文档
- 优先考虑清晰度而非巧妙性
