# Architecture Decisions

本目录记录所有对系统长期演进有影响的关键决策。

> **Version:** 2.0  
> **Last Updated:** 2026-02-25

---

## Active ADRs

| ID                                                   | Title                               | Status   | Date       | Impact                                                    |
| ---------------------------------------------------- | ----------------------------------- | -------- | ---------- | --------------------------------------------------------- |
| [ADR-001](./DECISION-001-framework-agnostic-core.md) | Framework-Agnostic Interaction Core | Accepted | 2026-02-25 | Critical — defines runtime/framework separation           |
| [ADR-002](./DECISION-002-runtime-over-components.md) | Runtime Over Components             | Accepted | 2026-02-25 | Critical — redefines PrismUI as Interaction Runtime       |
| [ADR-003](./DECISION-003-deterministic-principle.md) | Deterministic Interaction Principle | Accepted | 2026-02-25 | Critical — guarantees traceable, replayable state         |
| [ADR-004](./ADR-004-semantic-theme-system.md)        | Semantic Theme System               | Accepted | 2026-02-25 | High — three-layer theme derivation                       |
| [ADR-005](./ADR-005-page-as-runtime-resource.md)     | Page as Runtime Resource            | Accepted | 2026-02-25 | High — pages as managed lifecycle entities                |
| [ADR-006](./ADR-006-reducer-commit-model.md)         | Reducer Commit Model                | Accepted | 2026-02-25 | Critical — state mutation centralized in Scheduler commit |

## Planned ADRs

| ID      | Title                            | Status | Date |
| ------- | -------------------------------- | ------ | ---- |
| ADR-007 | Interaction DSL Design           | Draft  | TBD  |
| ADR-008 | Governance Middleware Pattern    | Draft  | TBD  |
| ADR-009 | Cross-Framework Adapter Contract | Draft  | TBD  |

---

## ADR Template

When creating a new ADR, use the following structure:

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

PrismUI 1.x had 11 ADRs (ADR-001 through ADR-011). The 2.0 decisions supersede the 1.x architecture entirely:

| 2.0 ADR                           | Supersedes 1.x                                                  |
| --------------------------------- | --------------------------------------------------------------- |
| ADR-001 (Framework-Agnostic)      | New — 1.x had no framework isolation                            |
| ADR-002 (Runtime Over Components) | ADR-011 (Runtime Platform) — elevated to foundational           |
| ADR-003 (Deterministic Principle) | New — 1.x had no determinism guarantee                          |
| ADR-004 (Semantic Theme)          | ADR-002 (Color System) + ADR-008 (Variant Styling) — reimagined |
| ADR-005 (Page as Resource)        | New — 1.x had no page orchestration                             |

The 1.x component-level decisions (ADR-007 Factory, ADR-009 Button Sizing, ADR-010 Typography) are no longer applicable as PrismUI 2.0 is not a component library.
