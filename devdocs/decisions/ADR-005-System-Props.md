# ADR-005: System Props

**Status:** Accepted  
**Date:** 2026-02-08  
**Scope:** System props architecture for PrismUI Box and all components

---

## Context

PrismUI needs a system props mechanism (like Mantine's style-props and MUI's sx/system) so that components can accept shorthand CSS props (`m`, `p`, `bg`, `display`, `gap`, etc.) with responsive value support.

## Decision

### Architecture

System props are implemented as a **config-driven resolver pipeline**:

1. **`SystemProps` interface** — merged Mantine + MUI props (spacing, colors, typography, layout, flex, overflow, cursor, z-index, gap, etc.)
2. **`SYSTEM_CONFIG`** — maps each prop key to a CSS property name + transform key (e.g. `m → margin + spacing`)
3. **Resolvers** — pure functions `(value, theme) → string | undefined` for each transform type: `spacing`, `identity`, `size`, `radius`, `border`, `color`, `textColor`, `fontFamily`, `fontSize`, `lineHeight`
4. **`resolveSystemProps`** — core logic that normalizes responsive values, resolves via transforms, produces inline styles (non-responsive) or injects atomic CSS classes (responsive)
5. **`splitSystemProps`** — separates system props from remaining component props
6. **`getBoxStyle`** — merges `style` (object/function/array), `__vars`, and resolved system props inline styles

### Responsive Values

```ts
type PrismuiResponsiveValue<Value> =
  | Value
  | Partial<Record<PrismuiBreakpointKey | "base", Value>>;
```

- Plain value → inline style
- Object with breakpoint keys → injected atomic CSS class with `@media` rules
- **Mobile-first only**: `base` is applied without a media query; breakpoint overrides use `@media (min-width: <bp>)` sorted ascending
- Per the responsive design spec (`devdocs/architecture/RESPONSIVE-DESIGN.md`), `base` must always be explicitly declared
- If `base` is omitted, the smallest defined breakpoint is used as fallback (not recommended)
- CSS is deduplicated via `insertCssOnce` (content-hashed class names)

### Resolver Functions

| Transform    | Behavior                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spacing`    | `number * spacingUnit → rem()`, tokens → CSS vars, negative tokens → `calc(var * -1)`, strings → `rem()`                                                       |
| `identity`   | Pass-through (string/number → string)                                                                                                                          |
| `size`       | `rem()` conversion                                                                                                                                             |
| `radius`     | `"theme"` → var, `"none"` → 0, `"full"` → 9999px, else `rem()`                                                                                                 |
| `border`     | Pass-through                                                                                                                                                   |
| `color`      | `"blue.500"` → `var(--prismui-color-blue-500)`, `"primary.main"` → `var(--prismui-primary-main)`, `"white"` → `var(--prismui-common-white)`, else pass-through |
| `textColor`  | Delegates to `colorResolver`                                                                                                                                   |
| `fontFamily` | `"mono"` → var, `"sans"/"default"` → var, else pass-through                                                                                                    |
| `fontSize`   | `"md"/"base"` → var, else `rem()`                                                                                                                              |
| `lineHeight` | `"md"/"base"` → var, else pass-through                                                                                                                         |

### Box Integration

`Box` is the base polymorphic component. It:

1. Reads theme from `PrismuiThemeContext` (falls back to `defaultTheme`)
2. Calls `splitSystemProps(others)` to separate system props from DOM props
3. Calls `resolveSystemProps({ styleProps, theme, registry })` to get inline styles + optional className
4. Merges via `getBoxStyle` (style → \_\_vars → system props, system props win)
5. Merges className via `clsx`

### File Structure

```
packages/core/src/core/system/
├── index.ts                          # Barrel exports
├── system-props.types.ts             # SystemProps interface
├── system-config.ts                  # SYSTEM_CONFIG mapping
├── resolvers/
│   ├── index.ts                      # Resolver map + Resolvers type
│   ├── spacing-resolver/
│   ├── identity-resolver/
│   ├── size-resolver/
│   ├── radius-resolver/
│   ├── border-resolver/
│   ├── color-resolver/
│   ├── text-color-resolver/
│   ├── font-family-resolver/
│   ├── font-size-resolver/
│   └── line-height-resolver/
├── resolve-system-props/
│   ├── normalize-responsive-value.ts
│   ├── resolve-system-props.ts
│   └── resolve-system-props.test.ts
└── split-system-props/
    └── split-system-props.ts

packages/core/src/components/Box/
├── Box.tsx                           # Updated with system props
├── get-box-style/
│   └── get-box-style.ts             # Style merging helper
└── Box.stories.tsx
```

### Theme Additions

- `PrismuiResponsiveValue<Value>` — generic responsive value type
- `ResponsiveValue<Value, BP>` — base generic (non-PrismUI-specific)

### Utility Additions

- `omitUndefinedProps` — removes undefined keys from an object (used by `splitSystemProps`)

### Related Specifications

- `devdocs/architecture/RESPONSIVE-DESIGN.md` — mandatory responsive design constraints (mobile-first, explicit base, monotonic non-decreasing, max 3 breakpoints)

## Consequences

- All PrismUI components that extend `Box` automatically inherit system props
- Responsive styles are atomic and deduplicated (one class per unique CSS template)
- **Mobile-first only** — no desktop-first mode; `base` is always the smallest viewport
- New resolvers can be added by extending `SYSTEM_CONFIG` + `resolvers` map
- System props always win over `style` and `__vars` in precedence
