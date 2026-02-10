# ADR-007: Component Factory & Styles API Architecture

## Status

**Accepted** — 2026-02-10

## Context

Stage-1 established the system boundary (Provider, Theme, SystemProps, Box). To build real components, we need a **standardized component creation pipeline** — a factory system that ensures every component follows the same pattern for:

- Type-safe component creation with forwardRef
- Theme-level default props and style overrides
- Multi-source className and style merging
- CSS Modules for static base styles
- CSS variable resolvers for dynamic theming

Without this infrastructure, each component would reinvent its own prop merging, style resolution, and theme integration logic.

### Options Evaluated

1. **Full Mantine Factory System** — `factory()`, `polymorphicFactory()`, `useStyles()`, full Styles API
2. **MUI Styled Pattern** — Emotion CSS-in-JS, `styled()` API, `sx` prop, slots pattern
3. **Simplified/Progressive Approach** — Start minimal, add complexity later

### Decision Drivers

- PrismUI's architecture is Mantine-inspired (ADR-001)
- Performance: prefer static CSS over runtime CSS-in-JS
- Type safety: factory types encode component metadata
- Completeness: each stage must be complete, no partial infrastructure
- SSR compatibility: must work with Next.js App Router

## Decision

### 1. Adopt Mantine's Factory Pattern (Adapted)

PrismUI will implement the full factory system aligned with Mantine, with targeted simplifications.

#### What we adopt from Mantine:

- **`factory()` / `polymorphicFactory()`** — Component creation wrappers with `.extend()`, `.withProps()`, `.classes` static properties
- **`FactoryPayload` / `PolymorphicFactoryPayload`** — Type-level component metadata
- **`useProps()`** — Theme-level default props merging
- **`useStyles()`** — Multi-source style orchestration returning `getStyles(selector)`
- **`createVarsResolver()`** — Type-safe CSS variable resolver
- **`StylesApiProps`** — `classNames`, `styles`, `unstyled`, `vars` props on every component
- **CSS Modules** — Static base styles per component (`.module.css`)
- **Static class names** — `prismui-ComponentName-selector` for external targeting

#### What we simplify/remove:

| Mantine Feature | PrismUI Decision | Rationale |
|----------------|-----------------|-----------|
| `useSxTransform` / Emotion integration | **Removed** | No CSS-in-JS dependency; PrismUI uses `insertCssOnce` for dynamic styles |
| `transformedStyles` in getClassName | **Removed** | Consequence of no Emotion |
| `useMantineIsHeadless` / headless mode | **Deferred to Stage-3+** | Not needed for initial components |
| `useStylesTransform` | **Deferred** | Theme-level style transforms not needed yet |

### 2. CSS Modules as Style Carrier

**Decision:** Use CSS Modules (`.module.css`) for component base styles.

**Rationale:**
- Zero runtime overhead (styles compiled at build time)
- Vite supports CSS Modules natively (zero config)
- Scoped class names prevent collisions
- `unstyled` prop can skip CSS Module classes cleanly
- Consistent with Mantine's approach
- SSR-friendly (no runtime style injection needed for base styles)

**Coexistence with `insertCssOnce`:**
- CSS Modules → static component base styles (e.g., ButtonBase reset, Stack flex layout)
- `insertCssOnce` → dynamic styles (SystemProps responsive classes, theme CSS variables)
- Both systems coexist without conflict

### 3. Theme-Level Component Customization

Extend `PrismuiTheme` with a `components` field:

```ts
interface PrismuiTheme {
  // ... existing fields
  components: Record<string, PrismuiThemeComponent>;
}

interface PrismuiThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?: Record<string, CSSProperties>;
  vars?: PartialVarsResolver<any>;
}
```

This enables:
```ts
const theme = createTheme({
  components: {
    Button: {
      defaultProps: { variant: 'filled', size: 'md' },
      classNames: { root: 'my-custom-button' },
    },
  },
});
```

### 4. Naming Conventions

| Convention | Value |
|-----------|-------|
| Class prefix | `prismui-` |
| Static class pattern | `prismui-{ComponentName}-{selector}` |
| CSS Module file | `{ComponentName}.module.css` |
| CSS variable prefix | `--{componentName}-` (e.g., `--button-height`) |
| Factory display name | `@prismui/core/{ComponentName}` |

### 5. Replaces Current Polymorphic System

The current `createPolymorphicComponent` in `core/types/polymorphic/` will be **replaced** by `polymorphicFactory()`. Box will be refactored to use the new system. All existing tests must continue to pass.

## Consequences

### Positive

- **Consistency** — Every component follows the same creation pattern
- **Type safety** — Factory types encode component capabilities at the type level
- **Customizability** — Users can override any component part via `classNames`/`styles` props or theme-level config
- **Performance** — CSS Modules for static styles, no runtime CSS-in-JS
- **Maintainability** — Adding new components is formulaic, not creative
- **SSR-ready** — CSS Modules work natively with SSR

### Negative

- **Complexity** — Factory + Styles API is ~20+ files of infrastructure
- **Learning curve** — Contributors must understand the factory pattern
- **Migration** — Box must be refactored (risk of regressions)

### Mitigations

- Comprehensive tests for all infrastructure
- Box refactoring verified against all existing tests
- Validation components (Stack, ButtonBase, Paper, Button) prove the system works end-to-end

## Files

### New files (to be created in Stage-2)

```
packages/core/src/core/factory/
├── factory.tsx                    # factory() + types
├── polymorphic-factory.tsx        # polymorphicFactory()
├── create-factory.ts              # Factory<P> / PolymorphicFactory<P> type aliases
├── use-props.ts                   # useProps() hook
├── index.ts                       # barrel exports

packages/core/src/core/styles-api/
├── styles-api.types.ts            # StylesApiProps, ClassNames, Styles, etc.
├── create-vars-resolver.ts        # createVarsResolver()
├── use-styles/
│   ├── use-styles.ts              # useStyles() hook
│   ├── get-class-name/
│   │   ├── get-class-name.ts      # Main className merger
│   │   ├── get-selector-class-name.ts
│   │   ├── get-static-class-names.ts
│   │   ├── get-root-class-name.ts
│   │   ├── get-resolved-class-names.ts
│   │   ├── get-theme-class-names.ts
│   │   ├── get-options-class-names.ts
│   │   ├── get-global-class-names.ts
│   │   └── get-variant-class-name.ts
│   └── get-style/
│       ├── get-style.ts           # Main style merger
│       ├── get-theme-styles.ts
│       └── resolve-styles.ts
└── index.ts                       # barrel exports
```

### Modified files

- `packages/core/src/core/theme/types/theme.ts` — Add `components` field
- `packages/core/src/components/Box/Box.tsx` — Refactor to use factory
- `packages/core/src/core/index.ts` — Export factory and styles-api

## References

- Mantine factory: `@mantine/core/src/core/factory/`
- Mantine styles-api: `@mantine/core/src/core/styles-api/`
- ADR-001: Mantine-MUI Hybrid Architecture
- ADR-003: CSS Injection & Style Engine
- ADR-006: Box Component Architecture
