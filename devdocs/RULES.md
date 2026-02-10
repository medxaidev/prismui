# R&D Rules (Strong Constraints) / 研发规则（强约束）

1. Architecture precedes code. / 架构优先于代码
   Any non-trivial component implementation must be traceable to an architectural intent
   documented in devdocs. Component patterns must align with Mantine/MUI principles.
   任何非平凡的组件实现都必须能够追溯到在 devdocs 中记录的架构意图。
   组件模式必须与 Mantine/MUI 原则对齐。

2. Component APIs are defined before implementations. / 组件 API 在实现之前定义
   Public component APIs, prop interfaces, and theming contracts must be written
   before or alongside their implementations.
   公共组件 API、属性接口和主题合约必须在实现之前或与实现同时编写。

3. Documentation is part of the deliverable. / 文档是交付物的一部分
   A component is considered incomplete if its corresponding documentation,
   accessibility notes, and usage examples are missing or outdated.
   如果相应文档、可访问性说明和使用示例缺失或过时，则组件被视为未完成。

4. Stage completion requires documentation freeze. / 阶段完成需要文档冻结
   A development stage is not considered complete until all relevant
   devdocs (architecture, stage notes, decisions) are updated and reviewed.
   在所有相关的 devdocs（架构、阶段说明、决策）更新和审查之前，
   开发阶段不被视为完成。

5. Long-term or irreversible decisions must be recorded. / 长期或不可逆决策必须记录
   Any decision that affects architecture, data models, or public interfaces
   must be documented as an ADR.
   任何影响架构、数据模型或公共接口的决策必须作为 ADR 记录。

6. AI-generated code is untrusted by default. / AI 生成的代码默认不可信
   All AI-assisted code must be reviewed, understood, and validated
   before being accepted into the codebase.
   所有 AI 辅助的代码在被接受到代码库之前，必须经过审查、理解和验证。

7. Tests are mandatory for components. / 组件必须测试
   All components must have unit tests, accessibility tests, and visual regression tests.
   Core theming logic, style resolution, and polymorphic patterns require comprehensive testing.
   所有组件必须有单元测试、可访问性测试和视觉回归测试。
   核心主题逻辑、样式解析和多态模式需要全面测试。

8. Uncertain designs must be explicitly documented. / 不确定的设计必须明确记录
   Exploratory or unresolved component designs must be recorded in devdocs,
   clearly marked as provisional, and revisited before being promoted
   to stable architecture.
   探索性或未解决的组件设计必须在 devdocs 中记录，明确标记为临时性，
   并在提升为稳定架构之前重新审视。

9. Accessibility is non-negotiable. / 可访问性不可协商
   All components must meet WCAG 2.1 Level AA standards.
   Keyboard navigation, screen reader support, and ARIA attributes are mandatory.
   所有组件必须满足 WCAG 2.1 Level AA 标准。
   键盘导航、屏幕阅读器支持和 ARIA 属性是强制性的。

10. Design system consistency is enforced. / 设计系统一致性被强制执行
    All components must use the theming system.
    Direct style overrides that bypass the theme are prohibited.
    所有组件必须使用主题系统。
    禁止绕过主题的直接样式覆盖。

11. MedXAI project alignment. / MedXAI 项目对齐
    Component development prioritizes MedXAI project needs.
    Components are built incrementally based on actual usage requirements.
    组件开发优先考虑 MedXAI 项目需求。
    组件根据实际使用需求增量构建。

12. Stage completeness is mandatory. / 阶段完整性是强制的
    Each development stage must be completed in full before the next begins.
    Core infrastructure within a stage must NOT be deferred, simplified, or split
    into progressive phases. Partial infrastructure leads to rework.
    Stabilization reviews of previous stages may run in parallel,
    but the current stage's deliverables must be complete, tested, and documented.
    每个开发阶段必须在下一个阶段开始之前完整完成。
    阶段内的核心基础设施不得推迟、简化或拆分为渐进阶段。
    不完整的基础设施会导致返工。
    前一阶段的稳定化审查可以并行进行，
    但当前阶段的交付物必须完整、经过测试并有文档记录。

13. Infrastructure before components. / 基础设施先于组件
    Within any stage that introduces new infrastructure (factory, styles API, etc.),
    the infrastructure must be fully built and tested before components are implemented.
    Components serve as validation of the infrastructure, not the other way around.
    在任何引入新基础设施（工厂、样式 API 等）的阶段中，
    基础设施必须在组件实现之前完全构建和测试。
    组件是基础设施的验证，而不是反过来。
