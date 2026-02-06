# ADR-002: Color System Architecture

## Status

**Status:** Accepted  
**Date:** 2026-02-06  
**Deciders:** Project Lead

---

## Context

PrismUI needs a color system that is:

1. **Simple to configure** — developers should set a few values and get a complete palette
2. **Predictable** — shade derivation follows clear, deterministic rules
3. **Extensible** — custom color families can be added without modifying core code
4. **Dual-scheme** — light and dark modes are first-class citizens

Both MUI and Mantine offer mature color systems, but each has trade-offs:

| Aspect | MUI | Mantine |
|--------|-----|---------|
| Configuration | Verbose — must specify `main`, `light`, `dark` per semantic color | Simple — `primaryColor: 'blue'` |
| Shade derivation | Runtime `lighten()`/`darken()` — non-deterministic | Index-based — predictable |
| Semantic colors | 4 built-in (primary, secondary, error, info/success/warning) | 1 configurable (`primaryColor`) |
| Color scale | Record-based (50–900) | Tuple-based (0–9 index) |
| Type safety | `ThemeOptions` → `Theme` two-phase types | Single unified type |

---

## Decision

### 1. Color Families (Dual-Index Model)

Color families use a **record-based scale** with 10 shades keyed by `50 | 100 | 200 | ... | 900`, combined with an internal **0–9 index** for offset arithmetic.

```typescript
// External (CSS variables, developer API)
type PrismuiColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type PrismuiColorScale = Record<PrismuiColorShade, string>;

// Internal (resolver arithmetic)
const PRISMUI_SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
// index 0 → shade 50, index 5 → shade 500, index 9 → shade 900
```

**Rationale:** Combines Mantine's simple index arithmetic with MUI's semantically clear shade keys (50–900) used in CSS variable names.

**Extensibility:** New color families can be added via TypeScript interface merging:

```typescript
declare module '@prismui/core' {
  interface PrismuiThemeColorFamiliesOverride {
    brand: true;
  }
}
```

### 2. Semantic Color Roles

Seven semantic color roles are defined at the theme level:

| Role | Config Key | Default Family | Auto-Generated |
|------|-----------|----------------|----------------|
| primary | `primaryColor` | `'blue'` | ✅ Yes |
| secondary | `secondaryColor` | `'violet'` | ✅ Yes |
| info | `infoColor` | `'cyan'` | ✅ Yes |
| success | `successColor` | `'green'` | ✅ Yes |
| warning | `warningColor` | `'yellow'` | ✅ Yes |
| error | `errorColor` | `'red'` | ✅ Yes |
| neutral | `neutralColor` | `'neutral'` | ❌ No (static) |

The first six are **automatically resolved** by the theme resolver from `colorFamilies` + `primaryShade`. The developer only needs to write:

```typescript
const theme = createTheme({ primaryColor: 'indigo' });
```

**Neutral** is independently configured in the default theme because it serves a different semantic purpose (UI structural elements like borders, subtle backgrounds) and does not follow the brand-color derivation logic.

### 3. primaryShade — Center Index Control

Inspired by Mantine's `primaryShade`, this config determines the **center shade index** for both light and dark schemes:

```typescript
primaryShade: { light: 5, dark: 6 }
// light center → index 5 → shade 500
// dark  center → index 6 → shade 600
```

**Key difference from Mantine:** `primaryShade` controls **all six auto-generated semantic colors**, not just `primary`.

### 4. Five-Level Shade Expansion

Each auto-generated semantic color expands into five levels using fixed offsets from the center index:

| Level | Offset | Formula |
|-------|--------|---------|
| `lighter` | center − 4 | `clamp(0, center - 4, 9)` |
| `light` | center − 2 | `clamp(0, center - 2, 9)` |
| `main` | center | center index directly |
| `dark` | center + 2 | `clamp(0, center + 2, 9)` |
| `darker` | center + 4 | `clamp(0, center + 4, 9)` |

**Concrete values with default `primaryShade`:**

| Level | Light (center=5) | Dark (center=6) |
|-------|-------------------|-----------------|
| lighter | index 1 → 100 | index 2 → 200 |
| light | index 3 → 300 | index 4 → 400 |
| main | index 5 → 500 | index 6 → 600 |
| dark | index 7 → 700 | index 8 → 800 |
| darker | index 9 → 900 | index 9 → 900 (clamped) |

**Rationale:** This is more predictable than MUI's runtime `lighten()`/`darken()` and more comprehensive than Mantine's single-shade selection. The ±2/±4 step size ensures visible contrast between adjacent levels.

**Edge case:** When center is near boundaries (e.g., center=1), `lighter` and `light` may both clamp to the same index. This is acceptable because extreme center values are uncommon in practice.

### 5. Static Palette Tokens

The following palette sections are **not auto-generated** — they are defined directly in `default-theme.ts`:

- **`common`** — `{ black, white }`
- **`neutral`** — independently configured (does not follow `primaryShade`)
- **`text`** — derives from `gray` family (e.g., `text.primary = gray[800]` in light)
- **`background`** — derives from `gray` family (e.g., `background.default = gray[100]` in light)
- **`divider`** — derives from `gray` family with opacity
- **`action`** — derives from `gray` family with opacity

These require separate light/dark definitions because their mapping to the gray scale is scheme-specific and not reducible to a simple formula.

### 6. Two-Phase Type System (Input → Resolved)

Following MUI's `ThemeOptions → Theme` pattern:

```
PrismuiThemeInput  →  createTheme()  →  PrismuiTheme
PrismuiPaletteInput                      PrismuiPalette
PrismuiColorSchemesInput                 PrismuiColorSchemes
```

- **Input types:** Semantic colors (`primary`..`error`) are **optional** in the palette
- **Resolved types:** Semantic colors are **required** — guaranteed present after resolution

This ensures:
- `default-theme.ts` can omit semantic colors (they are auto-generated)
- Components always receive a fully resolved palette with no optional checks
- User-provided semantic colors in `createTheme()` config are respected (resolver skips them)

### 7. Resolver Priority

The `createTheme()` resolver follows this priority:

1. If the user explicitly provides a semantic color in `colorSchemes.light.palette.primary` (etc.), **use it as-is**
2. Otherwise, **auto-generate** from `colorFamilies[xxxColor]` + `primaryShade`
3. Static tokens (`common`, `neutral`, `text`, `background`, `divider`, `action`) are always taken from the merged config, never auto-generated

---

## Consequences

### Positive

- **Minimal configuration** — changing `primaryColor: 'indigo'` updates all six semantic colors across both schemes
- **Predictable** — discrete index mapping, no runtime color math
- **Type-safe** — two-phase types prevent consuming unresolved palettes
- **Extensible** — new families via interface merging, custom semantic colors via explicit palette override
- **Dual-scheme native** — light/dark are separate palette objects, not computed inversions

### Negative

- **Edge clamping** — extreme `primaryShade` values may produce duplicate shade levels
- **Static tokens require manual maintenance** — `text`/`background`/`action` must be updated by hand if the gray family changes
- **Two type variants** — adds complexity to the type system (Input vs Resolved)

### Mitigations

- Document edge clamping behavior
- Consider a future `resolveGrayTokens()` helper if gray-derived tokens become a maintenance burden
- Keep Input/Resolved types co-located in `palette.ts` for discoverability

---

## File Map

| File | Role |
|------|------|
| `types/colors.ts` | `PrismuiColorShade`, `PrismuiColorScale`, `PrismuiColorFamilyName`, `PrismuiColorFamilies` |
| `types/primary-shade.ts` | `PrismuiShadeIndex`, `PrismuiPrimaryShade` |
| `types/palette.ts` | `PrismuiPaletteInput`, `PrismuiPalette`, `PrismuiColorSchemesInput`, `PrismuiColorSchemes` |
| `types/theme.ts` | `PrismuiThemeInput`, `PrismuiTheme` |
| `default-colors.ts` | Raw color ramps (`defaultColorFamilies`) |
| `default-theme.ts` | Data-first default theme config (`PrismuiThemeInput`) |
| `create-theme.ts` | `createTheme()` — deep merge + palette resolver |

---

## References

- [Mantine primaryShade](https://mantine.dev/theming/colors/#primary-shade)
- [MUI Palette](https://mui.com/material-ui/customization/palette/)
- [MUI augmentColor](https://mui.com/material-ui/customization/palette/#custom-colors)
- ADR-001: Mantine-MUI Hybrid Architecture
