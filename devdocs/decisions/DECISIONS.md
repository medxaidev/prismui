# Architecture Decisions

本目录记录所有对系统长期演进有影响的关键决策。

## Active ADRs

| ID                                                      | Title                           | Status   | Date       | Impact                                                          |
| ------------------------------------------------------- | ------------------------------- | -------- | ---------- | --------------------------------------------------------------- |
| [ADR-001](./ADR-001-Mantine-MUI-Hybrid-Architecture.md) | Mantine-MUI Hybrid Architecture | Accepted | 2026-02-04 | High - Defines core architectural approach                      |
| [ADR-002](./ADR-002-Color-System-Architecture.md)       | Color System Architecture       | Accepted | 2026-02-06 | High - Defines color families, semantic palette, shade resolver |
| [ADR-003](./ADR-003-CSS-Injection-Style-Engine.md)      | CSS Injection & Style Engine    | Accepted | 2026-02-06 | High - Static style.css + insertCssOnce atomic classes          |
| [ADR-004](./ADR-004-Color-Scheme-Manager.md)            | Color Scheme Manager            | Accepted | 2026-02-07 | High - Pluggable persistence, cross-tab sync, system preference |

## Planned ADRs

| ID      | Title                             | Status | Date |
| ------- | --------------------------------- | ------ | ---- |
| ADR-005 | Component Testing Strategy        | Draft  | TBD  |
| ADR-006 | Bundle Size Optimization Approach | Draft  | TBD  |
| ADR-007 | Animation System Design           | Draft  | TBD  |

## ADR Template

When creating a new ADR, use the following structure:

```markdown
# ADR-NNN: Title

## Status

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Deciders:** [List of decision makers]

## Context

[What is the issue we're facing? What constraints exist?]

## Decision

[What did we decide? What are the core principles?]

## Consequences

[What are the positive and negative outcomes?]

## References

[Links to related documents, discussions, or external resources]
```
