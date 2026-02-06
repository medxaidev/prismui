# STAGE-003: Theme System

> **Status:** In Progress  
> **Start Date:** 2026-02-05  
> **Target Completion:** TBD  
> **Owner:** Development Team  
> **Corresponds to:** STAGE-001-Core-System Phase 2 (Theme System)

---

## Goal

Build the complete theming infrastructure for PrismUI — color system, palette resolution, CSS variable generation, provider architecture, and SSR support.

---

## Success Criteria

- [ ] Color families defined with dual-index model (index 0–9 + shade 50–900)
- [ ] Semantic colors auto-generated from `colorFamilies` + `primaryShade`
- [ ] Theme can be customized via `createTheme()` with minimal config
- [ ] CSS variables generated from resolved theme
- [ ] Provider architecture working (PrismuiProvider, PrismuiThemeProvider)
- [ ] Theme switchable at runtime (light/dark)
- [ ] SSR works without FOUC (Next.js App Router)
- [ ] Full TypeScript autocomplete for theme and palette
- [ ] All tests pass

---

## Completed Work

### 3.1 Color Type System ✅

**Date:** 2026-02-05

Defined the foundational color types in `types/colors.ts`:

- `PrismuiColorShade` — `50 | 100 | 200 | ... | 900`
- `PRISMUI_SHADE_STEPS` — array mapping index 0–9 to shade values
- `PrismuiColorScale` — `Record<PrismuiColorShade, string>`
- `PrismuiColorFamilyName` — union of built-in family names (blue, indigo, purple, pink, red, orange, yellow, green, teal, cyan, violet, gray, neutral, dark)
- `PrismuiThemeColorFamiliesOverride` — empty interface for consumer extension via declaration merging
- `PrismuiColorFamily` — resolves to `PrismuiColorFamilyName | keyof Override`
- `PrismuiColorFamilies` — `Record<PrismuiColorFamily, PrismuiColorScale>`

**Files:** `packages/core/src/core/theme/types/colors.ts`

---

### 3.2 Default Color Families ✅

**Date:** 2026-02-05

Defined raw color ramps for all built-in families in `default-colors.ts`:

- 14 color families, each with 10 shades (50–900)
- Families: blue, indigo, purple, pink, red, orange, yellow, green, teal, cyan, violet, gray, neutral, dark

**Files:** `packages/core/src/core/theme/default-colors.ts`

---

### 3.3 Palette Type System ✅

**Date:** 2026-02-06

Defined palette types with Input/Resolved split in `types/palette.ts`:

- `PrismuiPaletteCommon` — `{ black, white }`
- `PrismuiPaletteColor` — `{ lighter, light, main, dark, darker, contrastText }` (all required)
- `PrismuiPaletteText` — `{ primary, secondary, disabled, icon?, *Channel? }`
- `PrismuiPaletteBackground` — `{ paper, default, neutral, *Channel? }`
- `PrismuiPaletteAction` — `{ active, hover, selected, focus, disabled, disabledBackground, *Opacity?, *Channel? }`
- `PrismuiPaletteInput<S>` — semantic colors (primary..error) **optional**; used by default-theme and user config
- `PrismuiPalette<S>` — semantic colors **required**; output of resolver, consumed by components
- `PrismuiColorSchemesInput` / `PrismuiColorSchemes` — light + dark palette wrappers

**Files:** `packages/core/src/core/theme/types/palette.ts`

---

### 3.4 Theme Type System ✅

**Date:** 2026-02-06

Defined theme types with Input/Resolved split in `types/theme.ts`:

- `PrismuiThemeBase` — shared fields: `colorFamilies`, `primaryShade`, semantic color config keys (`primaryColor`..`neutralColor`), `spacing`, `other`
- `PrismuiThemeInput` — extends base with `PrismuiColorSchemesInput`; used by `default-theme.ts` and `createTheme()` input
- `PrismuiTheme` — extends base with `PrismuiColorSchemes`; output of `createTheme()`, consumed by providers/components

**Files:** `packages/core/src/core/theme/types/theme.ts`, `types/primary-shade.ts`

---

### 3.5 Default Theme (Data-First) ✅

**Date:** 2026-02-06

Refactored `default-theme.ts` to be purely declarative (no computation logic):

- Type: `PrismuiThemeInput` (semantic colors omitted from palette — resolver fills them)
- Light and dark palettes defined as static `PrismuiPaletteInput` objects
- Static tokens (`common`, `neutral`, `text`, `background`, `divider`, `action`) derive values from `defaultColorFamilies.gray` / `.neutral`
- Semantic color family assignments: `primaryColor: 'blue'`, `secondaryColor: 'violet'`, etc.
- `primaryShade: { light: 5, dark: 6 }`

**Files:** `packages/core/src/core/theme/default-theme.ts`

---

### 3.6 Palette Resolver in createTheme() ✅

**Date:** 2026-02-06

Implemented the palette resolver in `create-theme.ts`:

- **`clampIndex()`** — clamps shade index to 0–9
- **`indexToShade()`** — converts index to shade value via `PRISMUI_SHADE_STEPS`
- **`resolvePaletteColor()`** — generates `PrismuiPaletteColor` from a color scale + center index using ±2/±4 offsets
- **`resolvePalette()`** — iterates over 6 semantic color keys; skips if already provided in input; otherwise auto-generates from `colorFamilies[xxxColor]` + `primaryShade`
- **`createTheme()`** — deep-merges user config with `defaultTheme`, then resolves both light and dark palettes; returns fully typed `PrismuiTheme`

**Resolver priority:**

1. User-provided semantic colors in palette → respected as-is
2. Otherwise → auto-generated from `colorFamilies` + `primaryShade`
3. Static tokens (`common`, `neutral`, `text`, `background`, `divider`, `action`) → always from merged config

**Files:** `packages/core/src/core/theme/create-theme.ts`

---

### 3.7 ADR-002: Color System Architecture ✅

**Date:** 2026-02-06

Recorded the color system design decisions in `ADR-002-Color-System-Architecture.md`, covering:

- Dual-index color model (Mantine index + MUI shade keys)
- Seven semantic color roles (6 auto-generated + neutral static)
- `primaryShade` center index control
- Five-level shade expansion (±2/±4 with clamping)
- Static palette tokens (text/background/divider/action from gray)
- Two-phase type system (Input → Resolved)
- Resolver priority rules

**Files:** `devdocs/decisions/ADR-002-Color-System-Architecture.md`

---

### 3.8 ADR-003: CSS Injection & Style Engine Architecture ✅

**Date:** 2026-02-06

Recorded the CSS injection strategy in `ADR-003-CSS-Injection-Style-Engine.md`:

- **Layer 1:** Theme CSS variables → static `style.css` (build-time, imported by consumer)
- **Layer 2:** System props + component styles → `insertCssOnce()` runtime CSSOM atomic classes
- Compared against MUI (Emotion runtime) and Mantine (inline styles) — PrismUI approach is zero-dependency, no inline styles, class-based (overridable)
- SSR via `PrismuiStyleRegistry` + `useServerInsertedHTML`

**Files:** `devdocs/decisions/ADR-003-CSS-Injection-Style-Engine.md`

---

### 3.9 Style Engine Implementation ✅

**Date:** 2026-02-06

Implemented the style engine module in `core/style-engine/`:

- **`style-registry.ts`** — `PrismuiStyleRegistry` interface + `createStyleRegistry()` factory. Collects CSS snippets in memory during SSR; deduplicates by id; `flush()` returns accumulated CSS and resets.
- **`insert-css.ts`** — `insertCssOnce(id, cssText, registry?)` core injection function:
  - Browser: two separate `<style>` elements — `data-prismui-theme-vars` (theme variables, full `textContent` replace on theme switch) and `data-prismui-style-engine` (component/atomic rules, CSSOM `insertRule` append)
  - SSR: delegates to `registry.insert()` when `canUseDOM()` is false
  - Deduplication via DJB2 hash comparison per id
  - Fallback: `textNode.append` if `insertRule` throws
- **`StyleRegistryProvider.tsx`** — React Context provider + `useStyleRegistry()` hook for passing registry through the component tree (SSR only; returns `null` in SPA)
- **`index.ts`** — barrel exports

**Tests:** 22 tests, all passing:

- `style-registry.test.ts` — 7 tests (insert, dedup, order, has, flush, reuse, newline handling)
- `insert-css.test.ts` — 11 tests (hashString, browser injection, dedup, theme vars separation, theme vars replacement, SSR delegation, SSR no-registry safety)
- `StyleRegistryProvider.test.tsx` — 4 tests (context provision, instance identity, null without provider)

**Files:**

- `packages/core/src/core/style-engine/style-registry.ts`
- `packages/core/src/core/style-engine/insert-css.ts`
- `packages/core/src/core/style-engine/StyleRegistryProvider.tsx`
- `packages/core/src/core/style-engine/index.ts`

---

## Remaining Work

### 3.10 CSS Variables for style.css 🔄

Update `css-vars.ts` to generate complete CSS text for static `style.css` output:

- Color family shades (`--prismui-color-blue-50` .. `--prismui-color-blue-900`)
- Semantic palette colors (`--prismui-palette-primary-main`, etc.)
- Text/background/action tokens
- Channel tokens for `rgba()` composition
- Light/dark scheme selectors

### 3.11 Provider Architecture 🔄

- `PrismuiThemeProvider` — theme context only
- `PrismuiProvider` — theme + CSS variables injection + baseline styles
- `useTheme()` hook
- Runtime theme switching (light/dark)

### 3.12 Next.js App Router SSR Support 🔄

- `PrismuiAppProvider` — uses `useServerInsertedHTML` for SSR style injection
- No FOUC on initial load

### 3.13 Typecheck & Testing 🔄

- Run full typecheck across the package
- Unit tests for `createTheme()` resolver
- Unit tests for CSS variable generation
- Integration tests for provider + theme switching

---

## Key Design Decisions

| Decision               | Approach                                                    | Reference |
| ---------------------- | ----------------------------------------------------------- | --------- |
| Color scale model      | Dual-index (0–9 internal + 50–900 external)                 | ADR-002   |
| Semantic color config  | `primaryColor: 'blue'` (Mantine-style)                      | ADR-002   |
| Shade derivation       | ±2/±4 discrete offsets, clamped to 0–9                      | ADR-002   |
| neutral handling       | Static, does not follow primaryShade                        | ADR-002   |
| text/background/action | Derived from gray family, static per scheme                 | ADR-002   |
| Type system            | Input (optional semantics) → Resolved (required)            | ADR-002   |
| CSS injection          | Static `style.css` + runtime `insertCssOnce` CSSOM          | ADR-003   |
| Style deduplication    | DJB2 hash per id, atomic classes                            | ADR-003   |
| Theme vars isolation   | Dedicated `<style data-prismui-theme-vars>` (replaceable)   | ADR-003   |
| SSR CSS collection     | `PrismuiStyleRegistry` + `useServerInsertedHTML`            | ADR-003   |
| Provider naming        | PrismuiProvider / PrismuiThemeProvider / PrismuiAppProvider | ADR-001   |

---

## File Structure

```
packages/core/src/core/
├── style-engine/
│   ├── insert-css.ts              # insertCssOnce + hashString + canUseDOM
│   ├── insert-css.test.ts         # 11 tests
│   ├── style-registry.ts          # PrismuiStyleRegistry + createStyleRegistry
│   ├── style-registry.test.ts     # 7 tests
│   ├── StyleRegistryProvider.tsx   # React Context + Provider + hook
│   ├── StyleRegistryProvider.test.tsx  # 4 tests
│   └── index.ts                   # Barrel exports
├── theme/
│   ├── types/
│   │   ├── colors.ts              # Color shades, scales, families
│   │   ├── primary-shade.ts       # PrismuiShadeIndex, PrismuiPrimaryShade
│   │   ├── palette.ts             # PaletteInput, Palette, ColorSchemes
│   │   ├── theme.ts               # ThemeInput, Theme
│   │   ├── color-scheme.ts        # PrismuiResolvedColorScheme
│   │   ├── spacing.ts             # PrismuiSpacingValues
│   │   ├── variant.ts             # Component variant types
│   │   └── index.ts               # Barrel exports
│   ├── default-colors.ts          # Raw color ramps (14 families × 10 shades)
│   ├── default-theme.ts           # Data-first default theme (PrismuiThemeInput)
│   ├── create-theme.ts            # createTheme() with palette resolver
│   ├── css-vars.ts                # CSS variable generation
│   └── index.ts                   # Theme module barrel exports
├── PrismuiProvider/               # (planned)
└── PrismuiThemeProvider/          # (planned)
```

---

## References

- ADR-001: Mantine-MUI Hybrid Architecture
- ADR-002: Color System Architecture
- ADR-003: CSS Injection & Style Engine
- STAGE-001-002-COMPLETION.md
- [Mantine Theming](https://mantine.dev/theming/theme-object/)
- [MUI Palette](https://mui.com/material-ui/customization/palette/)
