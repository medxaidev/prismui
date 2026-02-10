# STAGE-002: Component Factory & Styles API

**Status:** Planned  
**Start Date:** TBD  
**Prerequisite:** Stage-1 complete (Provider, Theme, SystemProps, Box)

---

## 1. Stage Goal

Establish the **component factory infrastructure** — the core system that all PrismUI components are built upon. This includes the factory pattern, styling API, CSS Modules integration, theme-level component customization, and the first batch of validation components.

**This stage is foundational and must be completed in full before any component work beyond this stage.**

---

## 2. Why This Stage Exists

Stage-1 delivered the **system boundary** (Provider, Theme, SystemProps, Box). But Box alone is not enough to build real components. Every component in Mantine follows a consistent creation pattern:

```
factory/polymorphicFactory → useProps → useStyles → CSS Modules → Box
```

Without this infrastructure, each component would reinvent its own:
- Props merging logic
- Style resolution logic
- Theme integration logic
- CSS class generation logic

This is unacceptable. **The factory system is the component assembly line.**

---

## 3. Architecture Reference

### 3.1 Mantine's Component Creation Pipeline

```
Component Definition
    │
    ├── FactoryPayload type (props, ref, stylesNames, vars, variant)
    │
    ├── factory() / polymorphicFactory()
    │       └── forwardRef + .extend() + .withProps() + .classes
    │
    ├── useProps(componentName, defaultProps, props)
    │       └── merge: defaultProps < theme.components[name].defaultProps < user props
    │
    ├── useStyles({ name, classes, props, classNames, styles, vars, varsResolver })
    │       └── returns getStyles(selector) → { className, style }
    │           ├── getClassName: 8+ sources merged via cx()
    │           └── getStyle: 6+ sources merged into CSSProperties
    │
    ├── CSS Modules (Component.module.css)
    │       └── Static base styles, zero runtime
    │
    └── Box (renders final element with all merged props)
```

### 3.2 PrismUI Adaptation

PrismUI follows Mantine's pattern with these differences:

| Aspect | Mantine | PrismUI |
|--------|---------|---------|
| Class prefix | `mantine-` | `prismui-` |
| CSS Modules | ✅ | ✅ (same) |
| `sx` prop / CSS-in-JS transform | Emotion optional | Not used (simpler) |
| `transformedStyles` in getClassName | Yes | No (removed, no Emotion) |
| Style engine for dynamic styles | PostCSS + InlineStyles | `insertCssOnce` (already built) |
| Theme context hook | `useMantineTheme` | `usePrismuiTheme` / `usePrismuiContext` |
| Headless mode | Yes | Deferred (Stage-3+) |

---

## 4. Deliverables

### Part A: Factory System (`core/factory/`)

| # | Deliverable | Description | Files |
|---|-------------|-------------|-------|
| A1 | `FactoryPayload` type | Component metadata: props, ref, stylesNames, vars, variant, staticComponents, compound | `factory/factory.ts` |
| A2 | `PolymorphicFactoryPayload` type | Extends FactoryPayload with defaultComponent, defaultRef | `factory/polymorphic-factory.ts` |
| A3 | `Factory<P>` / `PolymorphicFactory<P>` | Type aliases for payload declaration | `factory/create-factory.ts` |
| A4 | `factory()` function | Non-polymorphic component factory (forwardRef + extend + withProps) | `factory/factory.tsx` |
| A5 | `polymorphicFactory()` function | Polymorphic component factory | `factory/polymorphic-factory.tsx` |
| A6 | `ExtendComponent<P>` type | Shape of `.extend()` input (defaultProps, classNames, styles, vars) | `factory/factory.ts` |
| A7 | `PrismuiComponent<P>` type | Full component type with static properties | `factory/factory.ts` |
| A8 | Barrel exports | All types and functions exported | `factory/index.ts` |

**Refactoring required:**
- Current `createPolymorphicComponent` in `core/types/polymorphic/` will be **replaced** by the new factory system
- Box will be **refactored** to use `polymorphicFactory()` instead of `createPolymorphicComponent`

### Part B: useProps (`core/factory/use-props.ts`)

| # | Deliverable | Description |
|---|-------------|-------------|
| B1 | `useProps()` hook | Merges defaultProps + theme.components[name].defaultProps + user props |
| B2 | `filterProps()` utility | Removes undefined props before merge |
| B3 | `PrismuiTheme.components` | Extend theme type to support per-component default props, classNames, styles, vars |

### Part C: Styles API (`core/styles-api/`)

| # | Deliverable | Description | Files |
|---|-------------|-------------|-------|
| C1 | `StylesApiProps<P>` type | Props interface: unstyled, variant, classNames, styles, vars | `styles-api.types.ts` |
| C2 | `ClassNames<P>` type | Per-selector className overrides | `styles-api.types.ts` |
| C3 | `Styles<P>` type | Per-selector style overrides | `styles-api.types.ts` |
| C4 | `useStyles<P>()` hook | Returns `getStyles(selector, options)` | `use-styles/use-styles.ts` |
| C5 | `getClassName()` | Multi-source className merger | `use-styles/get-class-name/` |
| C6 | `getStyle()` | Multi-source style merger | `use-styles/get-style/` |
| C7 | `createVarsResolver<P>()` | Type-safe CSS variable resolver factory | `create-vars-resolver.ts` |
| C8 | `VarsResolver<P>` type | Resolver function type | `create-vars-resolver.ts` |
| C9 | `GetStylesApi<P>` type | Return type of useStyles | `use-styles/use-styles.ts` |

**getClassName sources (PrismUI):**
1. `getSelectorClassName` — CSS Module class (`classes[selector]`)
2. `getStaticClassNames` — Static class (`prismui-Button-root`)
3. `getRootClassName` — User `className` prop (root only)
4. `getResolvedClassNames` — User `classNames` prop
5. `getThemeClassNames` — `theme.components[name].classNames`
6. `getOptionsClassNames` — `getStyles()` call-site classNames
7. `getGlobalClassNames` — Global utility classes (focusable, active)
8. `getVariantClassName` — Variant-specific class

**getStyle sources (PrismUI):**
1. Theme styles — `theme.components[name].styles[selector]`
2. Resolved styles — User `styles` prop
3. Options styles — `getStyles()` call-site styles
4. Vars — `varsResolver` output
5. Root style — User `style` prop (root only)
6. Options style — `getStyles()` call-site style

### Part D: CSS Modules Integration

| # | Deliverable | Description |
|---|-------------|-------------|
| D1 | Vite CSS Modules config | Verify/configure Vite for `.module.css` support |
| D2 | PostCSS config | If needed for mixins (e.g., RTL support) |
| D3 | CSS Module conventions | Naming: `.root`, `.inner`, `.label`, etc. |
| D4 | `unstyled` prop behavior | When true, CSS Module classes are skipped |

### Part E: Box Refactoring

| # | Deliverable | Description |
|---|-------------|-------------|
| E1 | Refactor Box to use `polymorphicFactory()` | Replace `createPolymorphicComponent` |
| E2 | Box uses `useStyles` for className/style resolution | Integrate Styles API |
| E3 | All existing Box tests pass | No regressions |
| E4 | Update Box Storybook | Reflect new patterns |

### Part F: Validation Components

These components validate the factory infrastructure. They are **not optional** — they are the test cases for the factory system.

| # | Component | Purpose | Complexity |
|---|-----------|---------|------------|
| F1 | **Stack** | Simplest layout component. Validates: factory + useStyles + CSS Module + single selector (`root`) | Low |
| F2 | **ButtonBase** | Unstyled accessible button. Validates: polymorphicFactory + useProps + `<button>` semantics + keyboard a11y | Medium |
| F3 | **Paper** | Container with elevation. Validates: varsResolver + CSS variables + `shadow` tokens | Medium |
| F4 | **Button** | Full-featured component. Validates: ALL infrastructure (factory + useProps + useStyles + varsResolver + CSS Modules + multiple selectors + variants + sizes + loading state + compound mod) | High |

**Each component must include:**
- Component implementation (`.tsx`)
- CSS Module (`.module.css`)
- Type definitions (Factory type + Props interface)
- Unit tests (`.test.tsx`)
- Storybook stories (`.stories.tsx`)
- Barrel export (`index.ts`)

---

## 5. Implementation Order

```
Phase A: Factory System
    ├── A1-A8: factory types and functions
    └── Tests for factory utilities

Phase B: useProps
    ├── B1-B2: useProps hook + filterProps
    ├── B3: Extend PrismuiTheme.components type
    └── Tests for useProps

Phase C: Styles API
    ├── C1-C3: Types (StylesApiProps, ClassNames, Styles)
    ├── C4-C6: useStyles + getClassName + getStyle
    ├── C7-C8: createVarsResolver
    └── Tests for all Styles API utilities

Phase D: CSS Modules
    ├── D1-D2: Build config verification
    └── D3-D4: Conventions documented

Phase E: Box Refactoring
    ├── E1-E2: Refactor Box to new system
    ├── E3: All existing tests pass
    └── E4: Storybook updated

Phase F: Validation Components (sequential)
    ├── F1: Stack (simplest, validates basic pipeline)
    ├── F2: ButtonBase (validates polymorphic + a11y)
    ├── F3: Paper (validates varsResolver)
    └── F4: Button (validates everything)
```

**Dependency chain:** A → B → C → D → E → F1 → F2 → F3 → F4

Each phase must be **complete with tests** before the next begins.

---

## 6. Success Criteria

### Infrastructure (A-E)

- [ ] `factory()` and `polymorphicFactory()` produce correctly typed components
- [ ] `.extend()` returns theme-compatible component config
- [ ] `.withProps()` creates fixed-prop variants
- [ ] `useProps()` correctly merges default → theme → user props
- [ ] `useStyles()` returns `getStyles(selector)` with correct className + style
- [ ] `getClassName()` merges all sources in correct priority order
- [ ] `getStyle()` merges all sources in correct priority order
- [ ] `createVarsResolver()` produces type-safe CSS variable resolvers
- [ ] CSS Modules work with Vite build
- [ ] `unstyled` prop skips CSS Module classes
- [ ] Box refactored with zero regressions

### Validation Components (F)

- [ ] Stack renders with correct flex layout, gap, align, justify
- [ ] ButtonBase renders `<button>` by default, supports polymorphism, keyboard accessible
- [ ] Paper renders with elevation shadow via CSS variables
- [ ] Button renders with all variants, sizes, loading, disabled, left/right sections
- [ ] All components support `classNames`, `styles`, `unstyled`, `mod` props
- [ ] All components work with and without PrismuiProvider
- [ ] All components have comprehensive tests
- [ ] All components have Storybook stories

### Stage Completion Gate

- [ ] All tests pass (existing + new)
- [ ] All Storybook stories render correctly
- [ ] ADR-007 written and approved
- [ ] MODULES.md updated
- [ ] STAGE.md updated
- [ ] No known regressions in Stage-1 functionality

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSS Modules don't work with current Vite config | Blocks all component styling | Verify early in Phase D; Vite supports CSS Modules natively |
| `PrismuiTheme.components` type change breaks existing code | Breaking change | Careful type extension (optional field, no existing code uses it) |
| Box refactoring introduces regressions | Breaks Stage-1 | Run all existing tests after refactoring; keep old tests intact |
| useStyles complexity exceeds estimate | Schedule delay | Start with simplified version; add sources incrementally |
| TypeScript inference issues with factory types | DX degradation | Test type inference explicitly in `.test-d.ts` files |

---

## 8. Non-Goals (Explicitly Deferred)

- **Headless mode** — `useMantineIsHeadless()` equivalent deferred to Stage-3+
- **CSS-in-JS transform** — No Emotion/styled-components integration
- **Theme-level style transforms** — `useStylesTransform` deferred
- **Documentation website** — Deferred to later stage
- **Text component** — Not in Stage-2 (Button validates the system sufficiently)
- **Group component** — Not in Stage-2 (Stack is sufficient for layout validation)

---

## 9. Relationship to Other Stages

```
Stage-1 (Complete)          Stage-2 (This Stage)           Stage-3+ (Future)
─────────────────           ────────────────────           ─────────────────
Provider                    Factory System                  Text, Group
Theme + CSS Vars     →      useProps                 →      Input Components
SystemProps                 Styles API                      Feedback Components
Box (basic)                 CSS Modules                     Documentation Site
                            Box (refactored)                Headless mode
                            Stack                           Advanced theming
                            ButtonBase
                            Paper
                            Button
```

---

## 10. Estimated Timeline

| Phase | Estimated Duration | Notes |
|-------|-------------------|-------|
| A: Factory System | 1-2 days | Types + functions, moderate complexity |
| B: useProps | 0.5 day | Simple hook, but requires theme type extension |
| C: Styles API | 2-3 days | Most complex part (getClassName, getStyle, varsResolver) |
| D: CSS Modules | 0.5 day | Config verification, conventions |
| E: Box Refactoring | 1 day | Must pass all existing tests |
| F1: Stack | 0.5 day | Simple component |
| F2: ButtonBase | 1 day | Accessibility + polymorphism |
| F3: Paper | 0.5 day | VarsResolver validation |
| F4: Button | 1-2 days | Full-featured, most complex component |
| **Total** | **~8-10 days** | |

---

## 11. References

- Mantine factory source: `@mantine/core/src/core/factory/`
- Mantine useStyles source: `@mantine/core/src/core/styles-api/use-styles/`
- Mantine UnstyledButton: `@mantine/core/src/components/UnstyledButton/`
- Mantine Button: `@mantine/core/src/components/Button/`
- PrismUI Stage-1: `devdocs/stages/STAGE-001-SUMMARY.md`
- PrismUI style engine: `packages/core/src/core/style-engine/`
- ADR-006: Box Component Architecture
- ADR-007: Component Factory & Styles API (to be written)
