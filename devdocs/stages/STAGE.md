# Prismui Development Stages

This document defines the progressive stages of Prismui development.
Each stage builds upon the previous one and introduces new components and capabilities.

**Core Principle:** Each stage must be **complete before the next begins**. No partial infrastructure, no deferred core logic, no tails. Stabilization reviews (查缺补漏) are permitted in parallel, but the stage's core deliverables must be fully functional, tested, and documented.

| Stage | Name                       | Status   | Date    | Key Focus                                                   |
| ----- | -------------------------- | -------- | ------- | ----------------------------------------------------------- |
| 1     | Core System                | Complete | 2026-02 | Provider, Theme, SystemProps, Box                           |
| 2     | Component Factory & Styles | Planned  | TBD     | Factory, useProps, useStyles, CSS Modules, first components |
| 3     | Layout & Typography        | Planned  | TBD     | Text, Group, Grid, Container                                |
| 4     | Input Components           | Planned  | TBD     | InputBase, TextInput, Select, Checkbox, Radio               |
| 5     | Feedback & Overlay         | Planned  | TBD     | Modal, Alert, Notification, Loader, Tooltip                 |
| 6     | Complex Components         | Planned  | TBD     | DataTable, Calendar, DatePicker (on-demand)                 |

---

## Stage 1: Core System (Complete)

**Goal:** Establish the foundational architecture — system boundary, theming, layout language, and base component.

**Deliverables:**

- ✅ Theme system with CSS variables (`defaultTheme`, `createTheme`, `getPrismuiCssVariables`)
- ✅ Color system (colorFamilies, semantic palette, shade resolver, shadow tokens)
- ✅ Provider architecture (`PrismuiProvider`, `PrismuiThemeProvider`, color scheme manager)
- ✅ Style engine (`insertCssOnce`, `StyleRegistry`, SSR support)
- ✅ CSS baseline (`CssBaseline`)
- ✅ SystemProps (config-driven, mobile-first responsive, atomic CSS injection)
- ✅ Box (polymorphic, `renderRoot`, `mod`, `variant`/`size`, `usePrismuiContext`)
- ✅ TypeScript polymorphic type system
- ✅ Comprehensive tests (131 passing)
- ✅ Storybook stories
- ✅ ADR-001 through ADR-006

**Status:** Core implementation complete. Periodic stabilization reviews ongoing (see `STAGE-001-STABILIZATION-LOG.md`).

**Detail:** `devdocs/stages/STAGE-001-SUMMARY.md`

---

## Stage 2: Component Factory & Styles API (Planned)

**Goal:** Build the **component creation infrastructure** — the standardized pipeline that all PrismUI components are built upon. Validate with first batch of real components.

**Why this stage exists:** Box alone is not enough. Every component needs a consistent pattern for type-safe creation, theme-level customization, multi-source style merging, and CSS Module integration. This is the **assembly line** for components.

**Part A — Infrastructure:**

- Factory system (`factory()`, `polymorphicFactory()`, `FactoryPayload` types)
- `useProps()` hook (theme-level default props merging)
- Styles API (`useStyles()`, `getClassName()`, `getStyle()`, `createVarsResolver()`)
- CSS Modules integration (static base styles per component)
- `PrismuiTheme.components` type extension
- Box refactored to use new factory system

**Part B — Validation Components:**

- Stack (layout, validates basic pipeline)
- ButtonBase (accessible button foundation, validates polymorphic factory)
- Paper (container with elevation, validates varsResolver)
- Button (full-featured, validates entire system end-to-end)

**Dependencies:** Stage 1 complete

**Detail:** `devdocs/stages/STAGE-002-Component-Factory.md`  
**Decision:** `devdocs/decisions/ADR-007-Component-Factory-Styles-API.md`

---

## Stage 3: Layout & Typography (Planned)

**Goal:** Complete layout and typography components.

**Deliverables:**

- Text (typography with theme integration)
- Group (horizontal layout)
- Grid (CSS Grid layout)
- Container (max-width container)
- Flex (general flexbox)
- Documentation website (Docusaurus or Next.js + MDX)

**Dependencies:** Stage 2 complete

---

## Stage 4: Input Components (Planned)

**Goal:** Build form components for user input.

**Deliverables:**

- InputBase (unstyled input foundation)
- TextInput
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Form validation utilities

**Dependencies:** Stage 3 complete

---

## Stage 5: Feedback & Overlay (Planned)

**Goal:** Implement feedback and overlay components.

**Deliverables:**

- ModalBase (unstyled modal foundation)
- Modal / Drawer
- Alert
- Notification (Toast)
- Loader / Progress / Skeleton
- Tooltip / Popover

**Dependencies:** Stage 4 complete

---

## Stage 6: Complex Components (Planned)

**Goal:** Build advanced, data-driven components as needed by MedXAI.

**Deliverables:**

- DataTable (if needed)
- Calendar (if needed)
- DatePicker (if needed)
- Autocomplete (if needed)
- Rich Text Editor (if needed)

**Note:** Components in Stage 6 are built **on-demand** based on MedXAI project requirements.

**Dependencies:** Stage 5 complete

---

## Stage Completion Criteria (ENFORCED)

A stage is considered complete **only when ALL of the following are true**:

1. **All planned deliverables are implemented** — no partial infrastructure, no "Phase 1 of 3"
2. **All code has comprehensive tests** — unit tests, type tests where applicable
3. **All components pass accessibility validation** — WCAG 2.1 Level AA
4. **Documentation is complete** — usage examples, Storybook stories
5. **Architecture documents are updated** — MODULES.md, STAGE.md, relevant ADRs
6. **Code review is complete** — no known unresolved issues
7. **No regressions** — all previous stage tests still pass

**A stage with incomplete core infrastructure is NOT complete, regardless of how many components work.**

---

## Stage Transition Rules (ENFORCED)

- **MUST NOT** start Stage N+1 until Stage N is complete (per criteria above)
- **MUST NOT** defer core infrastructure to later phases within a stage — infrastructure must be built first, then validated by components
- **MAY** run stabilization reviews of previous stages in parallel with current stage development
- **MAY** add components to current stage if needed by MedXAI
- **MUST** document any stage scope changes in ADR
- **MUST** update this document when stages change

---

## Base Component Naming Convention

PrismUI uses the `*Base` suffix for unstyled foundation components:

| Base Component | Purpose                                 | Built In |
| -------------- | --------------------------------------- | -------- |
| `ButtonBase`   | Accessible button without visual styles | Stage 2  |
| `InputBase`    | Accessible input without visual styles  | Stage 4  |
| `ModalBase`    | Modal behavior without visual styles    | Stage 5  |

These base components provide **behavior and accessibility** only. Styled components (Button, TextInput, Modal) build upon them.
