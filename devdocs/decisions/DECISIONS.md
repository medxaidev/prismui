# Architecture Decisions

本目录记录所有对系统长期演进有影响的关键决策。

## Active ADRs

| ID                                                      | Title                           | Status   | Date       | Impact                                                           |
| ------------------------------------------------------- | ------------------------------- | -------- | ---------- | ---------------------------------------------------------------- |
| [ADR-001](./ADR-001-Mantine-MUI-Hybrid-Architecture.md) | Mantine-MUI Hybrid Architecture | Accepted | 2026-02-04 | High - Defines core architectural approach                       |
| [ADR-002](./ADR-002-Color-System-Architecture.md)       | Color System Architecture       | Accepted | 2026-02-06 | High - Defines color families, semantic palette, shade resolver  |
| [ADR-003](./ADR-003-CSS-Injection-Style-Engine.md)      | CSS Injection & Style Engine    | Accepted | 2026-02-06 | High - Static style.css + insertCssOnce atomic classes           |
| [ADR-004](./ADR-004-Color-Scheme-Manager.md)            | Color Scheme Manager            | Accepted | 2026-02-07 | High - Pluggable persistence, cross-tab sync, system preference  |
| [ADR-005](./ADR-005-System-Props.md)                    | System Props                    | Accepted | 2026-02-08 | High - Mobile-first responsive layout language                   |
| [ADR-006](./ADR-006-Box-Component-Architecture.md)      | Box Component Architecture      | Accepted | 2026-02-09 | High - renderRoot, mod, variant/size, usePrismuiContext          |
| [ADR-007](./ADR-007-Component-Factory-Styles-API.md)    | Component Factory & Styles API  | Accepted | 2026-02-10 | High - factory, useProps, useStyles, CSS Modules, varsResolver   |
| [ADR-008](./ADR-008-Variant-Styling-Strategy.md)        | Variant Styling Strategy        | Accepted | 2026-02-11 | High - variantColorResolver, 4 variants, opacity + channel       |
| [ADR-009](./ADR-009-Button-Sizing-Rules.md)             | Button Sizing Rules             | Accepted | 2026-02-15 | Medium - line-height 1.75, MUI-aligned heights 32/36/42/48       |
| [ADR-010](./ADR-010-Unified-Typography-System.md)       | Unified Typography System       | Accepted | 2026-02-16 | High - Merge Text+Title, MUI variant system, responsive headings |

## Planned ADRs

| ID      | Title                             | Status | Date |
| ------- | --------------------------------- | ------ | ---- |
| ADR-011 | Component Testing Strategy        | Draft  | TBD  |
| ADR-012 | Bundle Size Optimization Approach | Draft  | TBD  |
| ADR-013 | Animation System Design           | Draft  | TBD  |

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
