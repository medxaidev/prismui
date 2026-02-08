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
- Semantic colors (`--prismui-primary-main`, etc.) — **no `palette-` prefix**
- Text/background/action tokens (`--prismui-text-primary`, `--prismui-background-default`, etc.)
- Channel tokens for `rgba()` composition
- Font tokens (`--prismui-font-family`, `--prismui-font-family-monospace`)

**CSS Variable Naming (Updated 2026-02-07):** All `--prismui-palette-*` variables renamed to `--prismui-*` for brevity.

**Files:** `packages/core/src/core/css-vars/css-vars.ts`

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
- **`ThemeVars`** — moved to `core/css-vars/` in 3.18
- **`CssBaseline`** — moved to `core/css-baseline/` in 3.16
- Runtime theme switching (light/dark/auto)

**Files:**

- `packages/core/src/core/PrismuiProvider/PrismuiProvider.tsx`
- `packages/core/src/core/PrismuiProvider/PrismuiThemeProvider.tsx`
- `packages/core/src/core/PrismuiProvider/prismui-theme-context.ts`
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

### 3.15 Testing ✅ (Updated 2026-02-07)

**Date:** 2026-02-07

84 tests across 8 test files, all passing:

- `PrismuiProvider.test.tsx` — 17 tests (provider, theme provider, hooks, CSS vars, baseline)
- `css-baseline.test.tsx` — 17 tests (BASELINE_CSS content validation + component injection/dedup)
- `local-storage-color-scheme-manager.test.ts` — 12 tests (get/set/subscribe)
- `insert-css.test.ts` — 11 tests (hash, browser injection, SSR)
- `Box.test.tsx` — 10 tests (polymorphic component)
- `style-registry.test.ts` — 7 tests (registry operations)
- `StyleRegistryProvider.test.tsx` — 3 tests (context)
- Type inference tests — 7 tests

---

### 3.16 CssBaseline Refactor ✅

**Date:** 2026-02-07

Moved `CssBaseline` from `PrismuiProvider/` to its own `core/css-baseline/` module and rewrote the baseline CSS:

**Baseline CSS rules (combining Mantine + MUI best practices):**

1. `:root { color-scheme }` — browser native UI follows theme
2. `*, *::before, *::after { box-sizing: border-box }` — box model reset
3. `html` — text-size-adjust, tab-size, line-height
4. `body` — margin: 0, font-family via `var(--prismui-font-family)`, background/color via CSS vars, font-smoothing
5. `h1-h6, p { margin: 0 }` — typography reset
6. `a { color: inherit; text-decoration: inherit }` — link reset
7. `img, svg, video, ...` — block display, max-width: 100%
8. `button, input, ...` — font: inherit, color: inherit
9. `input[type="number"]` — spinner removal
10. `textarea { resize: vertical }`
11. `hr` — normalize
12. `b, strong { font-weight: bolder }`
13. `:focus { outline: none }` + `:focus-visible` — accessible focus with `var(--prismui-primary-main)`

**Excluded (compared to Mantine/MUI):**

- No `:host` (no Shadow DOM support needed)
- No `html, body, #root { display: flex }` (too opinionated)
- No `ul, ol { list-style: none }` (too aggressive)
- No `scroll-behavior: smooth` (may interfere with JS scroll)
- No hardcoded colors (all via CSS variables)

**Theme additions:**

- `fontFamily` field added to `PrismuiTheme` → `--prismui-font-family`
- `fontFamilyMonospace` field added → `--prismui-font-family-monospace` (for `<code>`, data display, FHIR JSON viewer)

**Tests:** 17 tests (13 for BASELINE_CSS content + 4 for component behavior)

**Stories:** 3 stories (With Baseline, Without Baseline, Dark Scheme)

**Files:**

- `packages/core/src/core/css-baseline/baseline-css.ts`
- `packages/core/src/core/css-baseline/CssBaseline.tsx`
- `packages/core/src/core/css-baseline/index.ts`
- `packages/core/src/core/css-baseline/css-baseline.test.tsx`
- `packages/core/src/core/css-baseline/CssBaseline.stories.tsx`

---

### 3.17 CSS Variable Naming Simplification ✅

**Date:** 2026-02-07

Renamed all `--prismui-palette-*` CSS variables to `--prismui-*` for brevity:

```
--prismui-palette-primary-main  →  --prismui-primary-main
--prismui-palette-text-primary  →  --prismui-text-primary
--prismui-palette-background-default  →  --prismui-background-default
--prismui-palette-action-hover  →  --prismui-action-hover
--prismui-palette-common-black  →  --prismui-common-black
--prismui-palette-divider  →  --prismui-divider
```

Unchanged: `--prismui-color-*` (color families), `--prismui-spacing-*`, `--prismui-scheme`, `--prismui-font-family`, `--prismui-font-family-monospace`.

**Files:** `packages/core/src/core/css-vars/css-vars.ts` + all consumers updated

---

### 3.18 CSS Vars Module Extraction ✅

**Date:** 2026-02-07

Extracted CSS variable generation and injection into a dedicated `core/css-vars/` module:

- **`css-vars.ts`** — moved from `theme/css-vars.ts`; contains `getPrismuiCssVariables()`, `cssVariablesToCssText()`, `getPrismuiThemeCssText()`, and all shade resolution logic
- **`ThemeVars.tsx`** — moved from `PrismuiProvider/ThemeVars.tsx`; React component that injects theme CSS variables via `insertCssOnce`
- **`index.ts`** — barrel exports

**Rationale:** CSS variable generation is an independent concern — it reads from `theme` types but does not belong inside the `theme/` module (which holds data and types) nor inside `PrismuiProvider/` (which is the React integration layer). The `core/css-vars/` module sits between them.

**No resolver pattern:** Unlike Mantine's `defaultCssVariablesResolver` + custom generator approach, PrismUI uses a single `getPrismuiCssVariables()` function. Custom variables can be added via `theme.other` in the future. A pluggable resolver is unnecessary — 99% of users never replace it.

**Files:**

- `packages/core/src/core/css-vars/css-vars.ts`
- `packages/core/src/core/css-vars/ThemeVars.tsx`
- `packages/core/src/core/css-vars/index.ts`

---

### 3.19 Color Functions Module & Palette Vars Refactor ✅

**Date:** 2026-02-07

#### Color Functions (`core/color-functions/`)

Standalone utility module extracted from Mantine's `color-functions`, adapted for PrismUI. All functions are pure (no theme dependency) and support hex, rgb(), rgba(), hsl(), hsla() inputs.

| Function                          | Description                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| `toRgba(color)`                   | Parse any CSS color string to `{ r, g, b, a }`                 |
| `luminance(color)`                | WCAG 2.0 relative luminance (0–1)                              |
| `isLightColor(color, threshold?)` | `luminance > threshold` (default 0.179)                        |
| `rgba(color, alpha)` / `alpha()`  | Apply alpha; uses `color-mix()` for CSS variables              |
| `darken(color, amount)`           | Darken by 0–1; uses `color-mix()` for CSS variables            |
| `lighten(color, amount)`          | Lighten by 0–1; uses `color-mix()` for CSS variables           |
| `getColorChannels(color)`         | Convert to RGB triplet string (`"12 104 233"`)                 |
| `getContrastText(bg)`             | Auto black (`#0B0D0E`) or white (`#FFFFFF`) based on luminance |

#### Palette Vars Extraction (`css-vars/palette-vars.ts`)

Palette CSS variable generation extracted from monolithic `css-vars.ts` into `palette-vars.ts`:

- **`getPaletteVars(theme, scheme)`** — generates all palette-related CSS variables (semantic colors, neutral, text, background, divider, action)
- **`css-vars.ts`** — now delegates palette generation via `Object.assign(vars, getPaletteVars(...))`, keeping only color-family shades, scheme, font, and spacing

#### Auto `contrastText`

`contrastText` is auto-computed via `getContrastText()` (WCAG luminance) when:

1. Semantic colors are auto-resolved from `colorFamilies` + `primaryShade`
2. User-provided palette has no `contrastText` value

Luminance threshold: **0.45** (not strict WCAG 0.179). This matches MUI's visual behavior — only very bright colors (e.g. yellow/amber, luminance > 0.45) get dark contrast text `#1C252E` (gray-800); all others get white `#FFFFFF`. Result: primary/secondary/info/success/error → white text, warning → dark text.

#### Channel Variants

All 6 `PrismuiPaletteColor` fields now emit `*Channel` CSS variables:

```
--prismui-primary-lighterChannel: 219 234 254;
--prismui-primary-lightChannel: 66 133 244;
--prismui-primary-mainChannel: 33 150 243;
--prismui-primary-darkChannel: 25 118 210;
--prismui-primary-darkerChannel: 13 71 161;
--prismui-primary-contrastTextChannel: 255 255 255;
```

Priority: user-provided `*Channel` values > auto-computed via `getColorChannels()`. Text and background channels also auto-computed if not user-defined.

**Type update:** `PrismuiPaletteColor` now includes optional `lighterChannel`, `lightChannel`, `mainChannel`, `darkChannel`, `darkerChannel`, `contrastTextChannel`.

**Files:**

- `packages/core/src/core/color-functions/` (7 files + index)
- `packages/core/src/core/css-vars/palette-vars.ts`
- `packages/core/src/core/css-vars/css-vars.ts` (simplified)
- `packages/core/src/core/theme/types/palette.ts` (channel fields added)
- `packages/core/src/core/PrismuiProvider/PrismuiProvider.stories.tsx` (CSS output stories)

---

## Remaining Work

### 3.20 Next.js App Router SSR Support 🔄

- `PrismuiAppProvider` — uses `useServerInsertedHTML` for SSR style injection
- `InitColorSchemeScript` — inline script to prevent FOUC (reads localStorage before React hydrates)
- No FOUC on initial load

---

## Key Design Decisions

| Decision                 | Approach                                                                                                                                                                                                                                                                                                                                                                  | Reference |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Color scale model        | Dual-index (0–9 internal + 50–900 external)                                                                                                                                                                                                                                                                                                                               | ADR-002   |
| Semantic color config    | `primaryColor: 'blue'` (Mantine-style)                                                                                                                                                                                                                                                                                                                                    | ADR-002   |
| Shade derivation         | ±2/±4 discrete offsets, clamped to 0–9                                                                                                                                                                                                                                                                                                                                    | ADR-002   |
| neutral handling         | Static, does not follow primaryShade                                                                                                                                                                                                                                                                                                                                      | ADR-002   |
| text/background/action   | Derived from gray family, static per scheme                                                                                                                                                                                                                                                                                                                               | ADR-002   |
| Type system              | Unified (optional semantics, resolved at CSS var time)                                                                                                                                                                                                                                                                                                                    | ADR-002   |
| CSS injection            | Static `style.css` + runtime `insertCssOnce` CSSOM                                                                                                                                                                                                                                                                                                                        | ADR-003   |
| Style deduplication      | DJB2 hash per id, atomic classes                                                                                                                                                                                                                                                                                                                                          | ADR-003   |
| Theme vars isolation     | Dedicated `<style data-prismui-theme-vars>` (replaceable)                                                                                                                                                                                                                                                                                                                 | ADR-003   |
| SSR CSS collection       | `PrismuiStyleRegistry` + `useServerInsertedHTML`                                                                                                                                                                                                                                                                                                                          | ADR-003   |
| Provider naming          | PrismuiProvider / PrismuiThemeProvider / PrismuiAppProvider                                                                                                                                                                                                                                                                                                               | ADR-001   |
| Color scheme manager     | Strategy pattern, subscribe returns unsubscribe                                                                                                                                                                                                                                                                                                                           | ADR-004   |
| Palette resolution       | Deferred to CSS variable generation (not createTheme)                                                                                                                                                                                                                                                                                                                     | ADR-002   |
| CSS var naming           | `--prismui-*` (no `palette-` prefix)                                                                                                                                                                                                                                                                                                                                      | —         |
| CssBaseline              | Mantine+MUI hybrid, all values via CSS vars, independent module                                                                                                                                                                                                                                                                                                           | —         |
| Font tokens              | `--prismui-font-family` + `--prismui-font-family-monospace`                                                                                                                                                                                                                                                                                                               | —         |
| Reduce Motion            | Deferred. Mantine uses JS + `data-respect-reduced-motion` attribute; prefer CSS-native `@media (prefers-reduced-motion: reduce)` in baseline when animation components are introduced (zero JS cost)                                                                                                                                                                      | —         |
| Breakpoint Classes       | Deferred. Mantine's `MantineClasses` generates `.visible-from-{bp}` / `.hidden-from-{bp}` utility classes from `theme.breakpoints` via `@media` + `display:none !important`. When breakpoint system is introduced, add optional `<BreakpointClasses />` alongside ThemeVars/CssBaseline in Provider                                                                       | —         |
| getRootElement           | Deferred. Mantine exposes `getRootElement = () => document.documentElement` on Provider for Shadow DOM / iframe scenarios. Not needed currently — PrismUI targets standard DOM. Revisit if Shadow DOM or micro-frontend support is required                                                                                                                               | —         |
| CSS vars resolver        | No pluggable resolver pattern (unlike Mantine's `defaultCssVariablesResolver` + custom generator). Single `getPrismuiCssVariables()` function; extend via `theme.other` if needed                                                                                                                                                                                         | —         |
| Color functions module   | Standalone `core/color-functions/` with `toRgba`, `luminance`, `isLightColor`, `rgba`, `darken`, `lighten`, `getColorChannels`, `getContrastText`. Extracted from Mantine's color-functions, adapted for PrismUI (no theme dependency). Pure utility functions                                                                                                            | —         |
| Auto contrastText        | `contrastText` is auto-computed via luminance (`isLightColor`, threshold 0.45). Light backgrounds (luminance > 0.45) get `#1C252E` (gray-800), dark backgrounds get `#FFFFFF`. Matches MUI visual behavior                                                                                                                                                                | —         |
| Channel variants         | All 6 palette color fields (lighter/light/main/dark/darker/contrastText) emit `*Channel` CSS variables (RGB triplet e.g. `12 104 233`). User-provided channel values take priority; otherwise auto-computed via `getColorChannels()`. Text/background channels also auto-computed if not user-defined                                                                     | —         |
| Palette vars extraction  | Palette CSS variable generation extracted to `palette-vars.ts` (from monolithic `css-vars.ts`). `css-vars.ts` delegates palette generation via `getPaletteVars()`, keeping only color-family shades, scheme, font, and spacing                                                                                                                                            | —         |
| Theme-bound type aliases | Base types (`Style`, `StyleProp`, `CSSVars`) use `Theme = unknown` for framework-agnostic reuse. PrismUI-specific aliases (`PrismuiStyle`, `PrismuiStyleProp`, `PrismuiCSSVars`) bind `Theme` to `PrismuiTheme`, giving components full type-safe access to the theme object in style functions                                                                           | —         |
| Breakpoints              | `PrismuiBreakpointKey` defaults to `PrismuiSize` (xs/sm/md/lg/xl), extensible via `PrismuiThemeSizesOverride.breakpoints`. Default values: xs=36rem, sm=48rem, md=62rem, lg=75rem, xl=88rem. `PrismuiBreakpoint` adds `(string & {})` for ad-hoc values. CSS vars: `--prismui-breakpoint-*`                                                                               | —         |
| Scale                    | `theme.scale` (default `1`) emits `--prismui-scale`. All `rem()` output wraps in `calc(Xrem * var(--prismui-scale))`, enabling global size scaling without changing individual values. `em()` does NOT scale (used for media queries / relative sizing)                                                                                                                   | —         |
| rem / em utilities       | `rem(value)` converts px→rem with `var(--prismui-scale)` scaling; `em(value)` converts px→em without scaling. Both handle numbers, px strings, space/comma lists. `calc()`, `clamp()`, `rgba()` strings pass through unchanged. Exported from `utils/rem/`                                                                                                                | —         |
| spacingUnit              | `theme.spacingUnit` (default `4`, in px) emits `--prismui-spacing-unit` (converted to rem: `0.25rem`). System Props use `m={2}` → `calc(2 * var(--prismui-spacing-unit))`. Primary spacing mechanism for numeric props. `spacing` (xs/sm/md/lg/xl) is optional (`Partial`) — defaults provided in `default-theme` but consumers may omit it in overrides                  | —         |
| fontSizes (two-layer)    | **Layer 1:** `theme.fontSize` (default `14`, in px, optimized for Chinese) emits `--prismui-font-size` (`0.875rem`). Base font size for body text. **Layer 2:** `theme.fontSizes` (xs~xl token map) emits `--prismui-font-size-xs` .. `--prismui-font-size-xl`. Components use via `size` prop. Typography variants (h1~h6, body1/2 etc.) will be a separate future layer | —         |
| lineHeights              | `theme.lineHeights` (xs~xl token map) emits `--prismui-line-height-xs` .. `--prismui-line-height-xl`. Unitless ratios: xs=1.4, sm=1.45, **md=1.5** (default body), lg=1.55, xl=1.6. Baseline CSS uses hardcoded `1.5` for html/body; components reference tokens via size prop                                                                                            | —         |
| radius                   | `theme.radius` (xs~xl token map) emits `--prismui-radius-xs` .. `--prismui-radius-xl`. Defaults: xs=0.125rem (2px), sm=0.25rem (4px), **md=0.5rem (8px)**, lg=0.75rem (12px), xl=1rem (16px). Components use via `radius` prop. `PrismuiRadius` accepts key, string, or number                                                                                            | —         |

---

## File Structure

```
packages/core/src/core/
├── css-baseline/
│   ├── baseline-css.ts            # BASELINE_CSS constant (comprehensive reset)
│   ├── CssBaseline.tsx            # React component (injects via insertCssOnce)
│   ├── css-baseline.test.tsx      # 17 tests
│   ├── CssBaseline.stories.tsx    # 3 Storybook stories
│   └── index.ts                   # Barrel exports
├── style-engine/
│   ├── insert-css.ts              # insertCssOnce + hashString + canUseDOM
│   ├── insert-css.test.ts         # 11 tests
│   ├── style-registry.ts          # PrismuiStyleRegistry + createStyleRegistry
│   ├── style-registry.test.ts     # 7 tests
│   ├── StyleRegistryProvider.tsx   # React Context + Provider + hook
│   ├── StyleRegistryProvider.test.tsx  # 3 tests
│   └── index.ts                   # Barrel exports
├── color-functions/
│   ├── to-rgba.ts                # toRgba() — parse hex/rgb/hsl to RGBA object
│   ├── luminance.ts              # luminance() + isLightColor() — WCAG 2.0
│   ├── rgba.ts                   # rgba() / alpha() — apply alpha transparency
│   ├── darken.ts                 # darken() — darken color by amount
│   ├── lighten.ts                # lighten() — lighten color by amount
│   ├── get-color-channels.ts     # getColorChannels() — color to RGB triplet string
│   ├── get-contrast-text.ts      # getContrastText() — auto black/white for contrast
│   └── index.ts                  # Barrel exports
├── css-vars/
│   ├── css-vars.ts               # Top-level CSS variable orchestrator
│   ├── palette-vars.ts           # Palette CSS variable generation (semantic + text/bg/action)
│   ├── ThemeVars.tsx             # React component — injects theme CSS vars
│   └── index.ts                  # Barrel exports
├── theme/
│   ├── types/
│   │   ├── colors.ts              # Color shades, scales, families
│   │   ├── primary-shade.ts       # PrismuiShadeIndex, PrismuiPrimaryShade
│   │   ├── palette.ts             # PrismuiPalette, PrismuiColorSchemes (unified)
│   │   ├── theme.ts               # PrismuiTheme (unified, includes fontFamily)
│   │   ├── color-scheme.ts        # PrismuiColorScheme, PrismuiResolvedColorScheme
│   │   ├── spacing.ts             # PrismuiSpacingValues
│   │   ├── variant.ts             # Component variant types
│   │   ├── breakpoint.ts          # PrismuiBreakpointKey, PrismuiBreakpoint, PrismuiBreakpointsValues
│   │   ├── font-size.ts           # PrismuiFontSizeKey, PrismuiFontSize, PrismuiFontSizesValues
│   │   ├── line-height.ts         # PrismuiLineHeightKey, PrismuiLineHeight, PrismuiLineHeightsValues
│   │   ├── radius.ts              # PrismuiRadiusKey, PrismuiRadius, PrismuiRadiusValues
│   │   ├── prismui-style.ts       # PrismuiStyle, PrismuiStyleProp (Theme-bound)
│   │   ├── prismui-css-vars.ts    # PrismuiCSSVars (Theme-bound)
│   │   └── index.ts               # Barrel exports
│   ├── default-colors.ts          # Raw color ramps (14 families × 10 shades)
│   ├── default-theme.ts           # Data-first default theme (with fontFamily)
│   ├── create-theme.ts            # createTheme() — pure deepMerge only
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
│   ├── PrismuiProvider.test.tsx   # 17 tests
│   ├── PrismuiProvider.stories.tsx  # 8 Storybook stories
│   └── index.ts                   # Barrel exports
├── ../utils/
│   ├── rem/
│   │   ├── rem.ts                   # scaleRem, createConverter, rem(), em()
│   │   └── index.ts                 # Barrel exports
│   ├── is-plain-object/
│   ├── deep-merge/
│   └── index.ts                     # Utils barrel exports
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
