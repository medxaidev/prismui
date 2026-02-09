# PrismUI Philosophy

PrismUI is built as a **small, disciplined UI system** intended to support MedXAI.

The goal is not maximal component coverage.
The goal is a stable **architecture + design system** that can grow safely.

---

## Stage Model

Development is organized into stages. A stage is considered complete only when:

- The scope is clearly defined
- The implementation stays within that scope
- The resulting system boundary is defensible through tests and documentation

---

## We are currently in PrismUI Stage-1

### Stage-1 Scope (Hard Boundary)

Stage-1 scope is limited to:

- **Provider**
- **Theme** (semantic tokens only)
- **SystemProps** (layout language)
- **Box** (layout foundation)

### Stage-1 Non-goals

Stage-1 must **not** include:

- Component variants / sizes / component-level tokens
- Visual semantics (Button/Text/etc. design language)
- Business semantics
- A general-purpose context bag (i18n/router/telemetry/etc.)

---

## Stage-1 Implementation Review (A-D)

This section documents the current implementation review and flags anything that appears to exceed Stage-1 responsibilities.

### A. Provider

**Intent:** Provider should act as a **system boundary** rather than a context bag.

**Evidence (key files):**

- `packages/core/src/core/PrismuiProvider/PrismuiProvider.tsx`
- `packages/core/src/core/PrismuiProvider/PrismuiThemeProvider.tsx`
- `packages/core/src/core/PrismuiProvider/use-provider-color-scheme/use-provider-color-scheme.ts`
- `packages/core/src/core/css-vars/ThemeVars.tsx`
- `packages/core/src/core/css-baseline/CssBaseline.tsx`

**Pass:**

- Provider composes a small number of system responsibilities:
  - Theme context + color scheme state
  - CSS variables injection
  - Baseline injection
  - Optional SSR registry wiring
- Color scheme persistence/cross-tab sync is isolated behind `PrismuiColorSchemeManager`.

**Potential Stage-2 concerns:**

- The Provider module exports multiple hooks and managers (`useTheme`, `useColorScheme`, `localStorageColorSchemeManager`). This is acceptable if it stays theme/system-only, but it is a common path to becoming a context bag.

### B. Theme

**Intent:** Theme should define system-level tokens and enable theming without modifying component code.

**Evidence (key files):**

- `packages/core/src/core/theme/types/theme.ts`
- `packages/core/src/core/theme/default-theme.ts`
- `packages/core/src/core/theme/create-theme.ts`
- `packages/core/src/core/css-vars/css-vars.ts`
- `packages/core/src/core/css-vars/palette-vars.ts`

**Pass:**

- Theme separates responsibilities:
  - Design tokens: `colorFamilies`
  - Semantic tokens: palette resolved into CSS variables at generation time
- Semantic palette colors are deferred to CSS vars resolution (`getPaletteVars`) rather than being resolved eagerly in `createTheme`.
- System-level theming works through CSS variables (`ThemeVars` + `getPrismuiThemeCssText`).

**Potential Stage-2 concerns:**

- Avoid adding component tokens into theme during Stage-1. If component-level tokens appear (e.g. button variants), treat them as Stage-2+.

### C. SystemProps

**Intent:** SystemProps are a **layout language**, not merely prop shortcuts.

**Evidence (key files):**

- `packages/core/src/core/system/system-props.types.ts`
- `packages/core/src/core/system/system-config.ts`
- `packages/core/src/core/system/split-system-props/split-system-props.ts`
- `packages/core/src/core/system/resolve-system-props/normalize-responsive-value.ts`
- `packages/core/src/core/system/resolve-system-props/resolve-system-props.ts`

**Pass:**

- SystemProps are config-driven and component-agnostic (`SYSTEM_CONFIG` → resolver pipeline).
- Responsive behavior is explicit and consistent (mobile-first): `base` + `@media (min-width: ...)` overrides.

**Potential Stage-2 concerns / clarifications needed:**

- SystemProps currently include visual primitives (`bg`, `c`, `bd`, `bdrs`). If Stage-1 intent is strictly “layout only”, these should be considered Stage-2. If Stage-1 allows system-level primitives, then they should be explicitly acknowledged as allowed.
- The responsive spec requires explicit `base`. Runtime currently falls back to the smallest breakpoint if `base` is omitted (graceful behavior), but this is not spec-compliant. Enforcement likely belongs to Stage-2 via lint/type tooling.

### D. Box

**Intent:** Box is the foundation. It must remain neutral and free of semantics.

**Evidence (key files):**

- `packages/core/src/components/Box/Box.tsx`
- `packages/core/src/components/Box/get-box-style/get-box-style.ts`

**Pass:**

- Box is polymorphic and visually neutral (no default styling).
- Box is usable without Provider: it falls back to `defaultTheme` and still resolves system props.
- Box positions SystemProps as a system concern by calling `splitSystemProps` + `resolveSystemProps`.

**Potential Stage-2 concerns:**

- Any addition of variants, default visual styling, or semantics into Box should be considered Stage-2+.

---

## Stage-1 Violations Identified

- **Public API mismatch:** `packages/core/src/index.ts` previously exported `Text` despite `Text` not being in Stage-1 scope (and not present in the current codebase). This export has been removed.

---

## Stage-2 Concern List (Track Explicitly)

- Enforce responsive `base` (lint / type tooling, dev-mode warnings).
- Decide whether SystemProps should include visual primitives in Stage-1 or defer to Stage-2.
- Keep Provider from expanding beyond theme/system responsibilities.
- Improve CSS injection strategy if/when multi-line CSSOM insertion becomes a performance concern (`insertCssOnce` currently falls back to text append for complex rules).
