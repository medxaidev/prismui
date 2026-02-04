# Testing Strategy / 测试策略

This document defines the testing strategy for Prismui component library.
Its purpose is to establish confidence in component correctness, accessibility,
and visual consistency while keeping testing effort proportional and intentional.

Testing is treated as a design activity,
not as a mechanical afterthought.

本文档定义了 Prismui 组件库的测试策略。
其目的是在保持测试工作成比例和有意图的同时，
建立对组件正确性、可访问性和视觉一致性的信心。

测试被视为设计活动，
而不是机械的事后考虑。

---

## 1. Goals of Testing / 测试目标

Testing exists to:

- Validate correctness of core logic
- Prevent regressions during evolution
- Make assumptions and constraints explicit
- Support refactoring with confidence

Testing is not intended to:

- Prove absence of bugs
- Maximize coverage metrics
- Replace reasoning or documentation

测试的存在是为了：

- 验证核心逻辑的正确性
- 防止演进过程中的回归
- 明确假设和约束
- 支持有信心的重构

测试不旨在：

- 证明没有错误
- 最大化覆盖率指标
- 替代推理或文档

---

## 2. What Must Be Tested / 必须测试的内容

Testing is mandatory for **all components**.

Components must have:

- Unit tests (props, rendering, interactions)
- Accessibility tests (ARIA, keyboard navigation, screen reader)
- Visual regression tests (appearance consistency)
- Theming tests (theme application, CSS variables)
- Integration tests (component composition)

Components must be testable in isolation and in composition.

**所有组件**的测试是强制性的。

组件必须有：

- 单元测试（属性、渲染、交互）
- 可访问性测试（ARIA、键盘导航、屏幕阅读器）
- 视觉回归测试（外观一致性）
- 主题测试（主题应用、CSS 变量）
- 集成测试（组件组合）

组件必须可在隔离和组合中测试。

---

## 3. What May Be Tested Lightly or Not at All / 可轻测试或不测试的内容

Not all code requires the same level of testing.

The following may be tested lightly or omitted:

- Thin wrappers over well-tested libraries
- Pure data containers without behavior
- Trivial glue code
- Code that is immediately exercised by higher-level tests

Lack of tests must be a conscious choice,
not an oversight.

并非所有代码都需要相同级别的测试。

以下内容可轻测试或省略：

- 经过良好测试的库的薄包装器
- 没有行为的纯数据容器
- 简单的胶水代码
- 被更高级别测试立即执行的代码

缺乏测试必须是意识的选择，
而不是疏忽。

---

## 4. Testing Levels / 测试级别

Testing is structured in layers:

### 4.1 Component Unit Tests / 组件单元测试

- Test component rendering with different props
- Validate user interactions (clicks, keyboard events)
- Test conditional rendering and variants
- Fast, deterministic, and independent
- Use React Testing Library patterns

Unit tests are the primary defense
for component logic.

- 测试不同属性的组件渲染
- 验证用户交互（点击、键盘事件）
- 测试条件渲染和变体
- 快速、确定性和独立
- 使用 React Testing Library 模式

单元测试是组件逻辑的主要防御。

---

### 4.2 Accessibility Tests / 可访问性测试

- Validate ARIA attributes and roles
- Test keyboard navigation (Tab, Enter, Escape, Arrows)
- Verify focus management
- Check color contrast ratios
- Test with automated tools (axe, jest-axe)

Accessibility tests are mandatory for all components.

- 验证 ARIA 属性和角色
- 测试键盘导航
- 验证焦点管理
- 检查颜色对比度
- 使用自动化工具测试

可访问性测试对所有组件都是强制性的。

### 4.3 Visual Regression Tests / 视觉回归测试

- Capture component screenshots
- Compare against baseline images
- Detect unintended visual changes
- Test across different themes

Visual tests ensure design consistency.

- 捕获组件截图
- 与基线图像比较
- 检测意外的视觉变化
- 测试不同主题

视觉测试确保设计一致性。

### 4.4 Integration Tests / 集成测试

- Validate component composition
- Ensure theming propagates correctly
- Cover realistic usage scenarios
- Test provider hierarchies

Integration tests trade speed for confidence.

- 验证组件组合
- 确保主题正确传播
- 覆盖真实使用场景
- 测试提供者层次结构

集成测试以速度换取信心。

---

### 4.3 End-to-End Reasoning / 端到端推理

Not all behavior is best tested through automation.

For complex or specification-driven logic:

- Written reasoning
- Worked examples
- Cross-references to specifications

may supplement or partially replace automated tests.

Reasoned correctness must still be defensible.

并非所有行为都最适合通过自动化测试。

对于复杂或规范驱动的逻辑：

- 书面推理
- 工作示例
- 规范的交叉引用

可能补充或部分替代自动化测试。

推理的正确性仍必须是可辩护的。

---

## 5. Test Design Principles / 测试设计原则

Good tests should:

- Be readable and intention-revealing
- Fail for clear and specific reasons
- Minimize coupling to implementation details
- Reflect domain concepts, not technical artifacts

Tests that are hard to understand
are a maintenance burden.

好的测试应该：

- 可读且意图明确
- 因清晰和特定的原因失败
- 最小化与实现细节的耦合
- 反映域概念，而不是技术产物

难以理解的测试
是维护负担。

---

## 6. Test Data / 测试数据

Test data should:

- Be minimal but representative
- Reflect real-world constraints
- Explicitly encode edge cases

Avoid:

- Random or opaque test fixtures
- Overly large datasets without justification

Test data is part of the test design.

测试数据应该：

- 最小但具有代表性
- 反映真实世界的约束
- 明确编码边缘情况

避免：

- 随机或不透明的测试夹具
- 没有合理性的过大数据集

测试数据是测试设计的一部分。

---

## 7. Tests and Refactoring / 测试和重构

Refactoring is encouraged,
but must preserve observable behavior.

Before refactoring:

- Ensure existing tests express intended behavior

After refactoring:

- Tests should pass without modification
  unless behavior intentionally changed

If tests must be rewritten,
their intent must be reconsidered.

鼓励重构，
但必须保持可观察的行为。

重构前：

- 确保现有测试表达预期行为

重构后：

- 测试应该无需修改即可通过
  除非行为有意改变

如果测试必须重写，
其意图必须重新考虑。

---

## 8. Tests and AI-Generated Code / 测试和 AI 生成的代码

AI-generated code does not reduce testing requirements.

For AI-assisted implementations:

- Tests are mandatory for core logic
- Edge cases must be explicitly considered
- Human reasoning must confirm correctness

If confidence relies solely on AI output,
the test suite is insufficient.

AI 生成的代码不会减少测试要求。

对于 AI 辅助的实现：

- 核心逻辑的测试是强制性的
- 必须明确考虑边缘情况
- 人类推理必须确认正确性

如果信心仅依赖于 AI 输出，
测试套件是不充分的。

---

## 9. When Tests Are Not Enough / 当测试不足时

Some correctness properties cannot be fully captured by tests.

In such cases:

- Document assumptions
- Record reasoning in devdocs
- Reference authoritative specifications

Testing and documentation together
form the confidence boundary.

一些正确性属性无法完全通过测试捕获。

在这种情况下：

- 记录假设
- 在 devdocs 中记录推理
- 引用权威规范

测试和文档一起
形成信心边界。

---

## 10. Component Testing Tools / 组件测试工具

Recommended testing stack:

- **Vitest** or **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **jest-axe** or **axe-core** - Accessibility testing
- **Playwright** or **Storybook** - Visual regression
- **@testing-library/user-event** - User interaction simulation

推荐的测试堆栈：

- **Vitest** 或 **Jest** - 测试运行器
- **React Testing Library** - 组件测试
- **@testing-library/jest-dom** - DOM 匹配器
- **jest-axe** 或 **axe-core** - 可访问性测试
- **Playwright** 或 **Storybook** - 视觉回归
- **@testing-library/user-event** - 用户交互模拟

---

## 11. Guiding Principle / 指导原则

Tests define the boundaries of trust for components.

If a component cannot be confidently defended
through tests, accessibility validation, and visual consistency,
it is not ready to be considered stable.

测试定义了组件的信任边界。

如果组件无法通过测试、
可访问性验证和视觉一致性自信地辩护，
它就不准备好被视为稳定。
