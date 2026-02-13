# STAGE-004: Content Components, Feedback & Documentation Site

> **Status:** Not Started
> **Predecessor:** STAGE-003 (Advanced Theming & Layout Components)
> **Owner:** Development Team
> **Created:** 2026-02-13

---

## 1. Goal

Deliver content display components (Text, typography system), feedback/overlay components (Alert, Toast, Modal, Popover), and the public-facing documentation website for PrismUI.

---

## 2. Prerequisites

| Dependency | Source | Status |
|---|---|---|
| All Stage-2 infrastructure | Stage-2 | ✅ |
| `variantColorResolver` | Stage-3 Phase A | Pending |
| Headless mode | Stage-3 Phase A4 | Pending |
| Portal | Stage-3 Phase B1 | Pending |
| Button | Stage-3 Phase D1 | Pending |
| Container, Group, Grid | Stage-3 Phase C | Pending |

---

## 3. Phase Overview

```
Phase A: Typography System
  ├── A1: Text component (polymorphic, theme-aware)
  ├── A2: Title component (h1-h6 semantic headings)
  └── A3: Anchor component (styled link, extends Text)

Phase B: Feedback Components
  ├── B1: Loader / Spinner
  ├── B2: Transition (animation wrapper)
  ├── B3: Alert (info/success/warning/error banners)
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

### Phase A: Typography

| Component | Type | Description |
|---|---|---|
| **Text** | polymorphicFactory | Styled text with `size`, `color`, `weight`, `align`, `truncate`, `lineClamp` |
| **Title** | factory | Semantic headings (h1-h6) with consistent sizing from theme |
| **Anchor** | polymorphicFactory | Styled `<a>` extending Text, with `underline` prop |

### Phase B: Feedback

| Component | Type | Description |
|---|---|---|
| **Loader** | factory | Spinning/pulsing loading indicator (oval, dots, bars variants) |
| **Transition** | utility | CSS transition wrapper with mount/unmount animation |
| **Alert** | factory | Banner with icon, title, message, close button. Uses `variantColorResolver` |
| **Toast** | system | Notification toasts with auto-dismiss, stacking, positioning |
| **Badge** | factory | Small label/tag with variant colors |

### Phase C: Overlay

| Component | Type | Description |
|---|---|---|
| **Overlay** | factory | Semi-transparent backdrop |
| **Modal** | factory | Dialog window (Portal + Overlay + Transition + focus trap) |
| **Popover** | factory | Floating content anchored to trigger (Portal + positioning) |
| **Tooltip** | factory | Simple text popover on hover/focus |

### Phase D: Documentation Site

| Item | Description |
|---|---|
| **Framework** | Next.js App Router + MDX or Nextra |
| **API docs** | Auto-generated from TypeScript types (props tables) |
| **Examples** | Live interactive demos with code snippets |
| **Theme guide** | Customization tutorial, color system docs, variant system docs |

---

## 5. Key Dependencies Within Stage-4

```
Text ← (standalone, no deps beyond Stage-2)
Title ← Text
Anchor ← Text
Loader ← (standalone)
Transition ← (standalone, CSS-only)
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

| Category | Estimated Components | Estimated Tests |
|---|---|---|
| Typography (A) | 3 | ~40 |
| Feedback (B) | 5 | ~80 |
| Overlay (C) | 4 | ~60 |
| Documentation (D) | — | — |
| **Total** | **12** | **~180** |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Popover positioning complexity (floating-ui) | Evaluate `@floating-ui/react` vs custom solution |
| Toast system state management | Consider Zustand-like store or React context |
| Modal focus trap + scroll lock | Reference Mantine's FocusTrap, implement incrementally |
| Documentation site build tooling | Start with Nextra (minimal config), migrate if needed |

---

## 8. Non-Goals (Deferred to Stage-5+)

- **Form components** — TextInput, Select, Checkbox, Radio, Switch, Slider
- **Data display** — Table, List, Timeline, Stepper
- **Navigation** — Tabs, Breadcrumbs, Pagination, Menu
- **App layout** — AppShell, Header, Sidebar, Footer
- **Advanced animations** — Spring physics, gesture-based transitions
- **i18n / RTL support**

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
