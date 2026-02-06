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

- [x] Color families defined with dual-index model (index 0–9 + shade 50–900)
- [x] Semantic colors auto-generated from `colorFamilies` + `primaryShade`
- [x] Theme can be customized via `createTheme()` with minimal config
- [x] CSS variables generated from resolved theme
- [x] Provider architecture working (PrismuiProvider, PrismuiThemeProvider)
- [x] Theme switchable at runtime (light/dark/auto)
- [x] Color scheme persistence via pluggable manager (localStorage)
- [ ] SSR works without FOUC (Next.js App Router)
- [x] Full TypeScript autocomplete for theme and palette
- [x] All tests pass (67 tests)
- [x] Storybook stories for Provider and color scheme

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

### 3.3 Palette Type System ✅ (Updated 2026-02-07)

**Date:** 2026-02-06 (Updated 2026-02-07)

Defined palette types in `types/palette.ts`. **Type unification** applied — the Input/Resolved split was removed:

- `PrismuiPaletteCommon` — `{ black, white }`
- `PrismuiPaletteColor` — `{ lighter, light, main, dark, darker, contrastText }` (all required)
- `PrismuiPaletteText` — `{ primary, secondary, disabled, icon?, *Channel? }`
- `PrismuiPaletteBackground` — `{ paper, default, neutral, *Channel? }`
- `PrismuiPaletteAction` — `{ active, hover, selected, focus, disabled, disabledBackground, *Opacity?, *Channel? }`
- `PrismuiPalette<S>` — semantic colors (primary..error) **optional**; resolved at CSS variable generation time
- `PrismuiColorSchemes` — light + dark palette wrappers
- `PrismuiPaletteInput` / `PrismuiColorSchemesInput` — **deprecated aliases** (kept for backward compat)

**Files:** `packages/core/src/core/theme/types/palette.ts`

---

### 3.4 Theme Type System ✅ (Updated 2026-02-07)

**Date:** 2026-02-06 (Updated 2026-02-07)

Defined theme types in `types/theme.ts`. **Type unification** applied — `PrismuiTheme` and `PrismuiThemeInput` are now the same:

- `PrismuiTheme` — single unified type: `colorFamilies`, `primaryShade`, semantic color config keys (`primaryColor`..`neutralColor`), `colorSchemes` (with optional semantic palette colors), `spacing`, `other`
- `PrismuiThemeInput` — **deprecated alias** for `PrismuiTheme`
- Semantic palette colors are **optional** in the theme object — they are resolved at CSS variable generation time, not at `createTheme()` time

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

### 3.6 createTheme() — Pure Merge ✅ (Refactored 2026-02-07)

**Date:** 2026-02-06 (Refactored 2026-02-07)

`createTheme()` was **simplified to only perform `deepMerge(defaultTheme, userConfig)`**. All palette resolution logic was moved to `css-vars.ts` (see 3.10).

- **`createTheme()`** — deep-merges user config with `defaultTheme`; returns `PrismuiTheme` with optional semantic palette colors
- No resolver, no `clampIndex`, no `resolvePaletteColor` — these are now in `css-vars.ts`

**Rationale:** Separation of concerns — theme creation is a pure data merge; color resolution happens dynamically at CSS variable generation time.

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

## Known Limitations

- `insertCssOnce` uses `split('\n')` to parse CSS rules for CSSOM `insertRule`, which assumes each line is a complete rule. This works for atomic classes (e.g., `.prismui-p-md { padding: ... }`) but will fail for multi-line rules like `@media` queries or nested selectors. Such failures safely fall back to `textNode.append`. Future improvement: use regex split by `}` boundary (`cssText.match(/[^}]+}/g)`) or skip `insertRule` entirely for complex CSS.

---

### 3.10 CSS Variables with On-the-fly Palette Resolution ✅

**Date:** 2026-02-07

Refactored `css-vars.ts` to integrate palette resolution logic (moved from `create-theme.ts`):

- **`clampIndex()`** — clamps shade index to 0–9
- **`indexToShade()`** — converts index to shade value via `PRISMUI_SHADE_STEPS`
- **`resolvePaletteColor()`** — generates `PrismuiPaletteColor` from a color scale + center index using ±2/±4 offsets
- **`getPrismuiCssVariables()`** — generates all CSS variables, resolving semantic palette colors on-the-fly:
  - If `palette[key]` is explicitly provided → use as-is
  - Otherwise → auto-generate from `colorFamilies[xxxColor]` + `primaryShade`
- Color family shades (`--prismui-color-blue-50` .. `--prismui-color-blue-900`)
- Semantic palette colors (`--prismui-palette-primary-main`, etc.)
- Text/background/action tokens
- Channel tokens for `rgba()` composition

**Files:** `packages/core/src/core/theme/css-vars.ts`

---

### 3.11 Provider Architecture ✅

**Date:** 2026-02-06

Implemented the full provider architecture:

- **`PrismuiThemeProvider`** — theme context + color scheme state via `useProviderColorScheme` hook
- **`PrismuiProvider`** — all-in-one: theme + CSS variables injection (`ThemeVars`) + baseline styles (`CssBaseline`) + optional SSR registry
- **`prismui-theme-context.ts`** — `PrismuiThemeContext` + hooks:
  - `usePrismuiTheme()` — full context (theme, colorScheme, setColorScheme, clearColorScheme)
  - `useTheme()` — theme object only
  - `useColorScheme()` — `[resolvedScheme, setColorScheme]` tuple
- **`ThemeVars`** — calls `getPrismuiThemeCssText()` and injects via `insertCssOnce`
- **`CssBaseline`** — global reset/base styles
- Runtime theme switching (light/dark/auto)

**Files:**

- `packages/core/src/core/PrismuiProvider/PrismuiProvider.tsx`
- `packages/core/src/core/PrismuiProvider/PrismuiThemeProvider.tsx`
- `packages/core/src/core/PrismuiProvider/prismui-theme-context.ts`
- `packages/core/src/core/PrismuiProvider/ThemeVars.tsx`
- `packages/core/src/core/PrismuiProvider/CssBaseline.tsx`
- `packages/core/src/core/PrismuiProvider/index.ts`

---

### 3.12 Color Scheme Manager ✅

**Date:** 2026-02-07

Implemented pluggable color scheme persistence using a strategy pattern (ADR-004):

- **`PrismuiColorSchemeManager`** interface — `get(defaultValue)`, `set(value)`, `subscribe(onUpdate) → unsubscribe`
- **`isPrismuiColorScheme()`** — validation helper
- **`localStorageColorSchemeManager()`** — default implementation backed by `window.localStorage`
  - Cross-tab sync via `storage` event
  - SSR-safe (`typeof window` guards)
  - Configurable key (default: `'prismui-color-scheme'`)
- **`useProviderColorScheme()`** hook — manages:
  - State initialization from manager
  - `setColorScheme()` — accepts `'light' | 'dark' | 'auto'`, persists via manager
  - `clearColorScheme()` — resets to default
  - DOM attribute: `data-prismui-color-scheme` on `document.documentElement`
  - System preference tracking via `matchMedia('(prefers-color-scheme: dark)')`
  - Cross-tab sync via `manager.subscribe()`
  - `forceColorScheme` support (ignores user toggle)

**Tests:** 12 tests for `localStorageColorSchemeManager` (get/set/subscribe/unsubscribe)

**Files:**

- `packages/core/src/core/PrismuiProvider/color-scheme-manager/types.ts`
- `packages/core/src/core/PrismuiProvider/color-scheme-manager/is-prismui-color-scheme.ts`
- `packages/core/src/core/PrismuiProvider/color-scheme-manager/local-storage-color-scheme-manager.ts`
- `packages/core/src/core/PrismuiProvider/color-scheme-manager/local-storage-color-scheme-manager.test.ts`
- `packages/core/src/core/PrismuiProvider/color-scheme-manager/index.ts`
- `packages/core/src/core/PrismuiProvider/use-provider-color-scheme/use-provider-color-scheme.ts`
- `packages/core/src/core/PrismuiProvider/use-provider-color-scheme/index.ts`

---

### 3.13 Type System Unification ✅

**Date:** 2026-02-07

Removed the Input/Resolved type split. Since `createTheme()` no longer resolves semantic palette colors, there is no need for separate input and output types:

- `PrismuiPalette` — semantic colors are **optional** (resolved at CSS var generation time)
- `PrismuiPaletteInput` — **deprecated alias** for `PrismuiPalette`
- `PrismuiColorSchemes` — unified (no separate `PrismuiColorSchemesInput`)
- `PrismuiTheme` — unified (no separate `PrismuiThemeInput`)
- `PrismuiThemeInput` — **deprecated alias** for `PrismuiTheme`

**Files:** `types/palette.ts`, `types/theme.ts`, `types/index.ts`

---

### 3.14 Storybook Stories ✅

**Date:** 2026-02-07

Created interactive Storybook stories for the Provider and color scheme system:

- **Default** — default provider with theme info + color swatches
- **DarkScheme** — `defaultColorScheme="dark"`
- **ForceColorScheme** — `forceColorScheme="dark"`, verifies `setColorScheme` is ignored
- **ThemeOverrides** — custom `primaryColor: 'indigo'`, `secondaryColor: 'orange'`
- **WithoutCssVarsAndBaseline** — `withCssVars={false}`, `withCssBaseline={false}`
- **ColorSchemeToggle** — interactive light/dark/auto toggle via `useColorScheme()`
- **WithLocalStorageManager** — `localStorageColorSchemeManager` with live localStorage display
- **ClearColorScheme** — `clearColorScheme()` demo

**Files:** `packages/core/src/core/PrismuiProvider/PrismuiProvider.stories.tsx`

---

### 3.15 Testing ✅

**Date:** 2026-02-07

67 tests across 7 test files, all passing:

- `PrismuiProvider.test.tsx` — 17 tests (provider, theme provider, hooks, CSS vars, baseline)
- `local-storage-color-scheme-manager.test.ts` — 12 tests (get/set/subscribe)
- `insert-css.test.ts` — 11 tests (hash, browser injection, SSR)
- `Box.test.tsx` — 10 tests (polymorphic component)
- `style-registry.test.ts` — 7 tests (registry operations)
- `StyleRegistryProvider.test.tsx` — 3 tests (context)
- Type inference tests — 7 tests

---

## Remaining Work

### 3.16 Next.js App Router SSR Support 🔄

- `PrismuiAppProvider` — uses `useServerInsertedHTML` for SSR style injection
- `InitColorSchemeScript` — inline script to prevent FOUC (reads localStorage before React hydrates)
- No FOUC on initial load

---

## Key Design Decisions

| Decision               | Approach                                                    | Reference |
| ---------------------- | ----------------------------------------------------------- | --------- |
| Color scale model      | Dual-index (0–9 internal + 50–900 external)                 | ADR-002   |
| Semantic color config  | `primaryColor: 'blue'` (Mantine-style)                      | ADR-002   |
| Shade derivation       | ±2/±4 discrete offsets, clamped to 0–9                      | ADR-002   |
| neutral handling       | Static, does not follow primaryShade                        | ADR-002   |
| text/background/action | Derived from gray family, static per scheme                 | ADR-002   |
| Type system            | Unified (optional semantics, resolved at CSS var time)      | ADR-002   |
| CSS injection          | Static `style.css` + runtime `insertCssOnce` CSSOM          | ADR-003   |
| Style deduplication    | DJB2 hash per id, atomic classes                            | ADR-003   |
| Theme vars isolation   | Dedicated `<style data-prismui-theme-vars>` (replaceable)   | ADR-003   |
| SSR CSS collection     | `PrismuiStyleRegistry` + `useServerInsertedHTML`            | ADR-003   |
| Provider naming        | PrismuiProvider / PrismuiThemeProvider / PrismuiAppProvider | ADR-001   |
| Color scheme manager   | Strategy pattern, subscribe returns unsubscribe             | ADR-004   |
| Palette resolution     | Deferred to CSS variable generation (not createTheme)       | ADR-002   |

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
│   ├── StyleRegistryProvider.test.tsx  # 3 tests
│   └── index.ts                   # Barrel exports
├── theme/
│   ├── types/
│   │   ├── colors.ts              # Color shades, scales, families
│   │   ├── primary-shade.ts       # PrismuiShadeIndex, PrismuiPrimaryShade
│   │   ├── palette.ts             # PrismuiPalette, PrismuiColorSchemes (unified)
│   │   ├── theme.ts               # PrismuiTheme (unified)
│   │   ├── color-scheme.ts        # PrismuiColorScheme, PrismuiResolvedColorScheme
│   │   ├── spacing.ts             # PrismuiSpacingValues
│   │   ├── variant.ts             # Component variant types
│   │   └── index.ts               # Barrel exports
│   ├── default-colors.ts          # Raw color ramps (14 families × 10 shades)
│   ├── default-theme.ts           # Data-first default theme
│   ├── create-theme.ts            # createTheme() — pure deepMerge only
│   ├── css-vars.ts                # CSS variable generation + palette resolution
│   └── index.ts                   # Theme module barrel exports
├── PrismuiProvider/
│   ├── color-scheme-manager/
│   │   ├── types.ts               # PrismuiColorSchemeManager interface
│   │   ├── is-prismui-color-scheme.ts  # Validation helper
│   │   ├── local-storage-color-scheme-manager.ts  # localStorage implementation
│   │   ├── local-storage-color-scheme-manager.test.ts  # 12 tests
│   │   └── index.ts               # Barrel exports
│   ├── use-provider-color-scheme/
│   │   ├── use-provider-color-scheme.ts  # Core hook
│   │   └── index.ts               # Barrel exports
│   ├── PrismuiProvider.tsx        # All-in-one provider
│   ├── PrismuiThemeProvider.tsx   # Theme-only provider
│   ├── prismui-theme-context.ts   # Context + hooks (usePrismuiTheme, useTheme, useColorScheme)
│   ├── ThemeVars.tsx              # CSS variable injection component
│   ├── CssBaseline.tsx            # Global reset/base styles
│   ├── PrismuiProvider.test.tsx   # 17 tests
│   ├── PrismuiProvider.stories.tsx  # 8 Storybook stories
│   └── index.ts                   # Barrel exports
```

---

## References

- ADR-001: Mantine-MUI Hybrid Architecture
- ADR-002: Color System Architecture
- ADR-003: CSS Injection & Style Engine
- ADR-004: Color Scheme Manager
- STAGE-001-002-COMPLETION.md
- [Mantine Theming](https://mantine.dev/theming/theme-object/)
- [MUI Palette](https://mui.com/material-ui/customization/palette/)
