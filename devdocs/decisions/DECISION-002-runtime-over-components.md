# ADR-002: Runtime Over Components

**Status:** Accepted  
**Date:** 2026-02-25  
**Author:** PrismUI Core Team  
**Impact:** Critical — redefines PrismUI's core identity from component library to interaction runtime

---

## Context

PrismUI 1.x spent 12 stages building components (Button, Dialog, Toast, Tabs, Layout, etc.) with 1674 tests. While successful as a component library, a key insight emerged at STAGE-005:

> Components are not the competitive advantage. **Behavioral orchestration** is.

The market is saturated with component libraries (MUI, Mantine, Ant Design, shadcn/ui). Competing on component count or visual polish is a losing strategy for a specialized project like PrismUI.

What MedXAI actually needs is:

- **Interaction control** — modal stacks, drawer flows, notification queues managed centrally
- **Workflow orchestration** — multi-step approval flows, page locking during procedures
- **Programmable UI** — automated systems controlling the dashboard
- **Audit compliance** — all interactions logged for medical regulatory requirements

---

## Decision

PrismUI 2.0 is an **Interaction Runtime**, not a component library.

### What PrismUI does:

1. **Provider** — Runtime capabilities delivered via Provider + Context + Module injection
2. **Theme** — Semantic theme system with Token → Intent → Behavior Derivation
3. **Interaction** — Unified scheduling of Modal, Drawer, Notification, Form, Workflow

### What PrismUI does NOT do:

- ❌ Chase component coverage (not building 100+ components)
- ❌ Compete on visual templates or design presets
- ❌ Stack props on components for every possible configuration
- ❌ Provide a design system / Figma kit

### The three pillars:

| Pillar               | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| **Only Provider**    | System-level capabilities via injection, not component wrapping                    |
| **Only Theme**       | Semantic derivation system — tokens, intents, behavior rules                       |
| **Only Interaction** | Unified dispatch system — `ui.modal.open()`, `ui.confirm()`, `ui.workflow.start()` |

---

## Consequences

### Positive

- Clear, differentiated positioning — no other library offers Interaction Runtime
- Dramatically smaller scope — fewer components to build and maintain
- Higher value per line of code — each module solves a hard orchestration problem
- Perfect alignment with MedXAI needs — workflow control, audit, compliance
- Enables programmable UI — automation, AI agents, remote control

### Negative

- Applications still need visual components — must integrate with MUI, Mantine, or shadcn/ui for rendering
- Developers may initially expect a traditional component library
- Marketing challenge — "Interaction Runtime" is a new category to explain

### Mitigation

- Layer 3 (Rendering) provides minimal renderers (ModalRenderer, etc.) that can wrap any component library
- Documentation will clearly explain the Runtime + external components pattern
- MedXAI serves as the proof-of-concept integration

---

## References

- [ARCHITECTURE.md §1 Platform Definition](../architecture/PRISMUI-ARCHITECTURE.md)
- [ROADMAP.md](../ROADMAP.md)
- [DESIGN-PRINCIPLES.md §1 Runtime First](../architecture/PRISMUI-DESIGN-PRINCIPLES.md)
- PrismUI 1.x STAGE-005: the architectural pivot that inspired this decision
