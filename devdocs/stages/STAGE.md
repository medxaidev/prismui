# Prismui Development Stages

This document defines the progressive stages of Prismui development.
Each stage builds upon the previous one and introduces new components and capabilities.

| Stage | Name               | Status      | Date    | Key Focus                                   |
| ----- | ------------------ | ----------- | ------- | ------------------------------------------- |
| 1     | Core System        | In Progress | 2026-02 | Theming, polymorphic components, foundation |
| 1.3   | └─ Theme System    | In Progress | 2026-02 | Color system, palette resolver, providers   |
| 2     | Input Components   | Planned     | TBD     | Forms, validation, user input               |
| 3     | Feedback & Overlay | Planned     | TBD     | Modals, notifications, alerts               |
| 4     | Complex Components | Planned     | TBD     | DataTable, Calendar, advanced UI            |

---

## Stage 1: Core System (Current)

**Goal:** Establish the foundational architecture and theming system.

**Deliverables:**

- ✅ Theme system with CSS variables
- ✅ Provider architecture (PrismuiProvider, PrismuiThemeProvider, PrismuiAppProvider)
- 🔄 Polymorphic component pattern
- 🔄 Core components: Box, Text, Button
- 🔄 Layout components: Stack, Group
- 🔄 Core hooks: useTheme, useId
- 🔄 TypeScript type system
- 🔄 Accessibility foundation

**Success Criteria:**

- Theme can be customized and switched at runtime
- Components render correctly with SSR (Next.js App Router)
- All components meet WCAG 2.1 Level AA
- Full TypeScript autocomplete for theme and props
- Documentation and tests complete

---

## Stage 2: Input Components (Planned)

**Goal:** Build form components for user input.

**Deliverables:**

- Input (base component)
- TextInput
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Form validation utilities
- Input accessibility patterns

**Dependencies:** Stage 1 complete

---

## Stage 3: Feedback & Overlay (Planned)

**Goal:** Implement feedback and overlay components.

**Deliverables:**

- Modal
- Drawer
- Alert
- Notification (Toast)
- Loader
- Progress
- Skeleton
- Tooltip
- Popover

**Dependencies:** Stage 2 complete

---

## Stage 4: Complex Components (Planned)

**Goal:** Build advanced, data-driven components as needed by MedXAI.

**Deliverables:**

- DataTable (if needed)
- Calendar (if needed)
- DatePicker (if needed)
- Autocomplete (if needed)
- Rich Text Editor (if needed)

**Note:** Components in Stage 4 are built **on-demand** based on MedXAI project requirements.

**Dependencies:** Stage 3 complete

---

## Stage Completion Criteria

A stage is considered complete when:

1. All planned components are implemented
2. All components have comprehensive tests
3. All components pass accessibility validation
4. Documentation is complete with usage examples
5. Architecture documents are updated
6. ADRs are recorded for significant decisions
7. Code review is complete

---

## Stage Transition Rules

- **MUST NOT** start Stage N+1 until Stage N is complete
- **MAY** add components to current stage if needed by MedXAI
- **MUST** document any stage scope changes in ADR
- **MUST** update this document when stages change
