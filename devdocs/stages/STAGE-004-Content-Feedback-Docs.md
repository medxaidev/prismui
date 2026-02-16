# STAGE-004: Content Components, Feedback & Documentation Site

> **Status:** In Progress (Phase A)
> **Predecessor:** STAGE-003 (Advanced Theming & Layout Components) — ✅ Complete
> **Owner:** Development Team
> **Created:** 2026-02-13

---

## 1. Goal

Deliver content display components (Text, typography system), feedback/overlay components (Alert, Toast, Modal, Popover), and the public-facing documentation website for PrismUI.

---

## 2. Prerequisites

| Dependency                 | Source           | Status |
| -------------------------- | ---------------- | ------ |
| All Stage-2 infrastructure | Stage-2          | ✅     |
| `variantColorResolver`     | Stage-3 Phase A  | ✅     |
| Headless mode              | Stage-3 Phase A4 | ✅     |
| Portal                     | Stage-3 Phase B1 | ✅     |
| Button                     | Stage-3 Phase D1 | ✅     |
| Container, Group, Grid     | Stage-3 Phase C  | ✅     |
| Loader                     | Stage-3 Phase E  | ✅     |

---

## 3. Phase Overview

```
Phase A: Typography System (ADR-010: Unified Text + Title)
  ├── A1: Text component (unified typography — h1-h6, subtitle, body, caption, overline) ✅
  └── A2: Anchor component (styled link, extends Text) ✅

Phase B: Feedback Components
  ├── B1: Transition System (Transition + TransitionGroup + SwitchTransition) ✅
  ├── B2: Alert (severity + variant + description + actions + close) ✅
  ├── B4: Toast / Notification system
  └── B5: Badge

Phase C: Overlay Components
  ├── C1: Overlay (backdrop)
  ├── C2: Modal (dialog, uses Portal + Overlay + Transition)
  ├── C3: Popover (floating content, uses Portal)
  └── C4: Tooltip (simple popover variant)

Phase D: Documentation Site
  ├── D1: Framework selection (Next.js + Nextra or similar)
  ├── D2: Component API documentation generation
  ├── D3: Interactive examples / playground
  └── D4: Theme customization guide
```

---

## 4. Component Summary

### Phase A: Typography (ADR-010: Unified)

| Component  | Type               | Status | Description                                                                                      |
| ---------- | ------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| **Text**   | polymorphicFactory | ✅     | Unified typography: h1-h6 (responsive), subtitle1/2, body1/2, caption, overline + color/truncate |
| **Anchor** | polymorphicFactory | ✅     | Styled `<a>` extending Text, with `underline` and `external` props                               |

### Phase B: Feedback

| Component      | Type    | Description                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------- |
| **Loader**     | factory | Spinning/pulsing loading indicator (oval, dots, bars variants)               |
| **Transition** | utility | ✅ Transition + TransitionGroup + SwitchTransition, 19 presets (translate3d) |
| **Alert**      | factory | ✅ 4 severities × 4 variants, description, actions, built-in icons, close    |
| **Toast**      | system  | Notification toasts with auto-dismiss, stacking, positioning                 |
| **Badge**      | factory | Small label/tag with variant colors                                          |

### Phase C: Overlay

| Component   | Type    | Description                                                 |
| ----------- | ------- | ----------------------------------------------------------- |
| **Overlay** | factory | Semi-transparent backdrop                                   |
| **Modal**   | factory | Dialog window (Portal + Overlay + Transition + focus trap)  |
| **Popover** | factory | Floating content anchored to trigger (Portal + positioning) |
| **Tooltip** | factory | Simple text popover on hover/focus                          |

### Phase D: Documentation Site

| Item            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| **Framework**   | Next.js App Router + MDX or Nextra                             |
| **API docs**    | Auto-generated from TypeScript types (props tables)            |
| **Examples**    | Live interactive demos with code snippets                      |
| **Theme guide** | Customization tutorial, color system docs, variant system docs |

---

## 5. Key Dependencies Within Stage-4

```
Text ← (standalone, no deps beyond Stage-2) ✅
Anchor ← Text ✅
Transition ← (standalone, CSS-only) ✅
Alert ← variantColorResolver (Stage-3)
Badge ← variantColorResolver (Stage-3)
Toast ← Portal (Stage-3) + Transition
Overlay ← (standalone)
Modal ← Portal (Stage-3) + Overlay + Transition
Popover ← Portal (Stage-3) + floating positioning
Tooltip ← Popover
Documentation Site ← all components
```

---

## 6. Estimated Scope

| Category          | Estimated Components | Estimated Tests | Actual Tests                    |
| ----------------- | -------------------- | --------------- | ------------------------------- |
| Typography (A)    | 2 (Text+Anchor)      | ~65             | 80 ✅                           |
| Feedback (B)      | 4                    | ~80             | 154 (Transition 113 + Alert 41) |
| Overlay (C)       | 4                    | ~60             |                                 |
| Documentation (D) | —                    | —               |                                 |
| **Total**         | **10**               | **~205**        | **234**                         |

---

## 7. Risks

| Risk                                         | Mitigation                                             |
| -------------------------------------------- | ------------------------------------------------------ |
| Popover positioning complexity (floating-ui) | Evaluate `@floating-ui/react` vs custom solution       |
| Toast system state management                | Consider Zustand-like store or React context           |
| Modal focus trap + scroll lock               | Reference Mantine's FocusTrap, implement incrementally |
| Documentation site build tooling             | Start with Nextra (minimal config), migrate if needed  |

---

## 8. Non-Goals (Deferred to Stage-5+)

- **Form components** — TextInput, Select, Checkbox, Radio, Switch, Slider
- **Data display** — Table, List, Timeline, Stepper
- **Navigation** — Tabs, Breadcrumbs, Pagination, Menu
- **App layout** — AppShell, Header, Sidebar, Footer
- **Advanced animations** — Spring physics, gesture-based transitions
- **i18n / RTL support**
- **Theme Presets / 可视化 Theme Creator** — 需要绝大部分组件完成后才有意义，预计 Stage-5+。详见 STAGE-003 Section 12 "未来考虑：可视化主题配置器"

---

## 9. Relationship to Other Stages

```
Stage-1          Stage-2              Stage-3                  Stage-4 (This Stage)     Stage-5+ (Future)
─────────        ────────             ────────                 ────────────────────     ─────────────────
Provider         Factory System       variantColorResolver     Text, Title, Anchor      Form Components
Theme       →    useProps        →    Headless Mode       →    Loader, Transition  →    Data Display
SystemProps      Styles API           Container, Divider       Alert, Toast, Badge      Navigation
Box              CSS Modules          Group, Grid              Overlay, Modal           App Layout
                 Stack                Portal                   Popover, Tooltip         i18n / RTL
                 ButtonBase           Button + Button.Group    Documentation Site
                 Paper
```

---

## 10. References

- Mantine components: `@mantine/core/src/components/`
- MUI Joy UI: design reference for visual aesthetics
- Nextra: https://nextra.site/
- Floating UI: https://floating-ui.com/
- PrismUI Stage-3: `devdocs/stages/STAGE-003-Advanced-Theming-Components.md`
