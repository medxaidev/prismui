# Architecture Decisions / 架构决策

This directory records key decisions that have long-term impact on the system's evolution.

本目录记录所有对系统长期演进有影响的关键决策。

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

> **版本：** 2.0  
> **最后更新：** 2026-02-25

---

## Active ADRs

## 已生效 ADR（Active ADRs）

| ID                                                   | Title                               | Status   | Date       | Impact                                                    |
| ---------------------------------------------------- | ----------------------------------- | -------- | ---------- | --------------------------------------------------------- |
| [ADR-001](./DECISION-001-framework-agnostic-core.md) | Framework-Agnostic Interaction Core | Accepted | 2026-02-25 | Critical — defines runtime/framework separation           |
| [ADR-002](./DECISION-002-runtime-over-components.md) | Runtime Over Components             | Accepted | 2026-02-25 | Critical — redefines PrismUI as Interaction Runtime       |
| [ADR-003](./DECISION-003-deterministic-principle.md) | Deterministic Interaction Principle | Accepted | 2026-02-25 | Critical — guarantees traceable, replayable state         |
| [ADR-004](./ADR-004-semantic-theme-system.md)        | Semantic Theme System               | Accepted | 2026-02-25 | High — three-layer theme derivation                       |
| [ADR-005](./ADR-005-page-as-runtime-resource.md)     | Page as Runtime Resource            | Accepted | 2026-02-25 | High — pages as managed lifecycle entities                |
| [ADR-006](./ADR-006-reducer-commit-model.md)         | Reducer Commit Model                | Accepted | 2026-02-25 | Critical — state mutation centralized in Scheduler commit |
| [ADR-007](./ADR-007-stage-reordering.md)             | Stage Reordering                    | Accepted | 2026-03-08 | High — runtime kernel completeness before presentation    |

| ID                                                   | 标题                                                       | 状态              | 日期       | 影响                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------- | ----------------- | ---------- | ---------------------------------------------------------- |
| [ADR-001](./DECISION-001-framework-agnostic-core.md) | Framework-Agnostic Interaction Core / 与框架无关的交互核心 | Accepted / 已采纳 | 2026-02-25 | Critical / 关键 —— 定义运行时与框架的隔离边界              |
| [ADR-002](./DECISION-002-runtime-over-components.md) | Runtime Over Components / 运行时优先于组件                 | Accepted / 已采纳 | 2026-02-25 | Critical / 关键 —— 将 PrismUI 重新定义为交互运行时         |
| [ADR-003](./DECISION-003-deterministic-principle.md) | Deterministic Interaction Principle / 确定性交互原则       | Accepted / 已采纳 | 2026-02-25 | Critical / 关键 —— 保证可追踪、可重放的 state              |
| [ADR-004](./ADR-004-semantic-theme-system.md)        | Semantic Theme System / 语义主题系统                       | Accepted / 已采纳 | 2026-02-25 | High / 高 —— 三层主题推导体系                              |
| [ADR-005](./ADR-005-page-as-runtime-resource.md)     | Page as Runtime Resource / 页面作为运行时资源              | Accepted / 已采纳 | 2026-02-25 | High / 高 —— 页面作为被治理的生命周期实体                  |
| [ADR-006](./ADR-006-reducer-commit-model.md)         | Reducer Commit Model / Reducer Commit 模型                 | Accepted / 已采纳 | 2026-02-25 | Critical / 关键 —— 在 Scheduler commit 集中 state mutation |
| [ADR-007](./ADR-007-stage-reordering.md)             | Stage Reordering / 阶段重排                                | Accepted / 已采纳 | 2026-03-08 | High / 高 —— 运行时内核完整性优先于表现层                  |

## Planned ADRs

## 计划中的 ADR（Planned ADRs）

| ID      | Title                            | Status | Date |
| ------- | -------------------------------- | ------ | ---- |
| ADR-008 | Interaction DSL Design           | Draft  | TBD  |
| ADR-009 | Governance Middleware Pattern    | Draft  | TBD  |
| ADR-010 | Cross-Framework Adapter Contract | Draft  | TBD  |

| ID      | 标题                                                | 状态         | 日期 |
| ------- | --------------------------------------------------- | ------------ | ---- |
| ADR-008 | Interaction DSL Design / 交互 DSL 设计              | Draft / 草案 | TBD  |
| ADR-009 | Governance Middleware Pattern / 治理中间件模式      | Draft / 草案 | TBD  |
| ADR-010 | Cross-Framework Adapter Contract / 跨框架适配器契约 | Draft / 草案 | TBD  |

---

## ADR Template

## ADR 模板

When creating a new ADR, use the following structure:

创建新 ADR 时，请使用如下结构：

```markdown
# ADR-NNN: Title

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Author:** [Author name or team]
**Impact:** [Critical | High | Medium | Low] — brief description

---

## Context

[What is the issue we're facing? What constraints exist?]

## Decision

[What did we decide? What are the core principles?]

## Consequences

### Positive

[Benefits of this decision]

### Negative

[Drawbacks and trade-offs]

## References

[Links to related documents, discussions, or external resources]
```

---

## Relationship to PrismUI 1.x ADRs

## 与 PrismUI 1.x ADR 的关系

PrismUI 1.x had 11 ADRs (ADR-001 through ADR-011). The 2.0 decisions supersede the 1.x architecture entirely:

PrismUI 1.x 有 11 份 ADR（ADR-001 到 ADR-011）。2.0 的决策将完全取代 1.x 的架构：

| 2.0 ADR                           | Supersedes 1.x                                                  |
| --------------------------------- | --------------------------------------------------------------- |
| ADR-001 (Framework-Agnostic)      | New — 1.x had no framework isolation                            |
| ADR-002 (Runtime Over Components) | ADR-011 (Runtime Platform) — elevated to foundational           |
| ADR-003 (Deterministic Principle) | New — 1.x had no determinism guarantee                          |
| ADR-004 (Semantic Theme)          | ADR-002 (Color System) + ADR-008 (Variant Styling) — reimagined |
| ADR-005 (Page as Resource)        | New — 1.x had no page orchestration                             |

| 2.0 ADR                            | 取代 1.x                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| ADR-001（Framework-Agnostic）      | 新增 —— 1.x 没有框架隔离                                       |
| ADR-002（Runtime Over Components） | ADR-011（Runtime Platform）—— 提升为基础性原则                 |
| ADR-003（Deterministic Principle） | 新增 —— 1.x 没有确定性保证                                     |
| ADR-004（Semantic Theme）          | ADR-002（Color System）+ ADR-008（Variant Styling）—— 重新构想 |
| ADR-005（Page as Resource）        | 新增 —— 1.x 没有页面编排                                       |

The 1.x component-level decisions (ADR-007 Factory, ADR-009 Button Sizing, ADR-010 Typography) are no longer applicable as PrismUI 2.0 is not a component library.

1.x 的组件层面决策（ADR-007 Factory、ADR-009 Button Sizing、ADR-010 Typography）不再适用，因为 PrismUI 2.0 不是组件库。
