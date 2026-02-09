# ADR-006: Box Component Architecture

## Status

**Accepted** — 2026-02-09

## Context

Box is the foundational component in PrismUI. All higher-level components (Button, Input, Text, etc.) will extend Box. We need to decide what capabilities Box should provide as infrastructure for the component system.

Mantine's Box provides:
- Polymorphic `component` prop
- `renderRoot` render-prop alternative
- `variant` / `size` data-attribute props
- `mod` declarative data-attribute modifier system
- Theme context access (non-throwing, works without Provider)

## Decision

### 1. `forwardRef<HTMLDivElement>`

Use `HTMLDivElement` as the default ref type (matching the default `'div'` element), not `unknown`. The external polymorphic type system (`PolymorphicRef<C>`) already provides correct ref inference for consumers.

### 2. `renderRoot`

Add `renderRoot` as a render-prop alternative to `component`. This gives full control over the root element rendering, useful for:
- Wrapping with framework-specific components (Next.js `<Link>`)
- Cases where `component` prop doesn't provide enough control

`renderRoot` takes precedence over `component` when both are provided.

### 3. `variant` and `size` (`BoxComponentProps`)

Box accepts `variant` (string) and `size` (string | number):
- `variant` → sets `data-variant` attribute
- `size` → sets `data-size` attribute (only for string values; numeric sizes are not set as data attributes)

These are **pass-through infrastructure** — Box applies no default styling based on these values. Higher-level components use CSS selectors like `[data-variant="filled"]` to apply variant-specific styles.

`BoxComponentProps` extends `BoxProps` with `variant` and `size`. The public `Box` component uses `BoxComponentProps` as its prop type.

### 4. `mod` (data-attribute modifier system)

The `mod` prop accepts:
- **string**: `mod="loading"` → `data-loading="true"`
- **object**: `mod={{ loading: true, size: 'lg' }}` → `data-loading="true" data-size="lg"`
- **array**: `mod={[{ loading: true }, 'active']}` → merged
- **nested arrays**: flattened recursively

Falsy values (`undefined`, `null`, `false`, `''`) are filtered out. Keys without `data-` prefix are auto-prefixed.

Implementation: `getBoxMod()` and `getMod()` utilities in `get-box-mod/`.

### 5. `usePrismuiContext()` (non-throwing)

Added `usePrismuiContext()` hook that returns `null` if no Provider is present (non-throwing). Box uses this instead of `useContext(PrismuiThemeContext)` directly:

```ts
const theme = usePrismuiContext()?.theme ?? defaultTheme;
```

Existing `usePrismuiTheme()` remains as the strict (throwing) version for components that require a Provider.

## Consequences

- Box is now a complete foundation for the component system (aligned with Mantine's Box)
- `variant`/`size`/`mod` enable data-attribute-driven styling without adding visual behavior to Box
- `renderRoot` provides an escape hatch for complex polymorphism scenarios
- `usePrismuiContext()` is a cleaner pattern for optional-provider components
- All new features are tested (28 new tests) and documented in Storybook

## Files

- `packages/core/src/components/Box/Box.tsx` — main component
- `packages/core/src/components/Box/get-box-mod/get-box-mod.ts` — mod utilities
- `packages/core/src/core/PrismuiProvider/prismui-theme-context.ts` — `usePrismuiContext()`
