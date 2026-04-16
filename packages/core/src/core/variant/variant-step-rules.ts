import type { ColorShade } from '../theme/types';

/**
 * SHADE_SCALE
 *
 * Maps shade index (0–9) to ColorShade values (50–900).
 * Used by VariantStepRule to express shade offsets as readable integers.
 *
 * @example
 * SHADE_SCALE[5] // → 500
 * SHADE_SCALE[7] // → 700
 */
export const SHADE_SCALE: readonly ColorShade[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;
// index: 0    1    2    3    4    5    6    7    8    9

/**
 * ColorStrategy
 *
 * Two fundamental color categories that drive different shade-step logic:
 *   chromatic  — hue-bearing colors (blue, red, green, ...)
 *   achromatic — gray-scale (neutral)
 *
 * Key behavioral difference:
 *   chromatic  filled: bg=500 (mid), hover=700 (darker)  → "press deeper"
 *   achromatic filled: bg=900 (darkest), hover=800 (lighter) → "float up"
 *
 * This distinction is NOT a runtime branch in variantColorResolver — the resolver
 * always reads CSS variables uniformly. The strategy only affects how Palette values
 * are authored (design-time guidance, not runtime logic).
 */
export type ColorStrategy = 'chromatic' | 'achromatic';

/**
 * getColorStrategy
 *
 * Returns the color strategy for a given semantic color name.
 * Used for auditing and palette generation guidance.
 */
export function getColorStrategy(color: string): ColorStrategy {
  return color === 'neutral' ? 'achromatic' : 'chromatic';
}

/**
 * VariantStepRule
 *
 * Declares the shade indices used for each interaction state of a variant.
 * This is a DESIGN STRATEGY document, not a runtime token.
 *
 * Role in the architecture:
 *   Color Scale → VariantStepRule (guides) → Palette ColorRef → CSS Variables → Component
 *
 * Palette (SemanticColorToken) remains the source of truth at runtime.
 * This rule table exists to make the shade selection auditable and consistent.
 *
 * Scope: Light mode only. Dark mode token design is a separate stage.
 *
 * fgShade intentionally has no 'auto' option — WCAG contrast calculation is deferred.
 */
export interface VariantStepRule {
  bgShade:     number | 'transparent';
  hoverShade:  number | 'transparent';
  activeShade: number | 'transparent';
  borderShade?: number;
  hoverBorderShade?: number;
  fgShade:     number | 'white' | 'black';
}

/**
 * VARIANT_STEP_RULES
 *
 * The canonical shade-step mapping for PrismUI's four variants.
 * Strategy: **chromatic** (hue-bearing colors: primary, secondary, etc.)
 *
 * Key decisions:
 * - filled hoverShade = 7 (shade 700): +2 from bg (500), aligns with MUI primary.dark
 * - soft/outlined/plain hoverShade = 0 (shade 50): lightweight surface reveal, aligns with Mantine
 * - No dark mode entries: dark palette is designed independently (not mirrored)
 *
 * Hover direction: DEEPER (darker = "press into surface")
 *
 * To read: SHADE_SCALE[hoverShade] gives the actual ColorShade used in palette.
 */
export const VARIANT_STEP_RULES: Record<string, VariantStepRule> = {
  filled: {
    bgShade:     5,               // SHADE_SCALE[5] = 500
    hoverShade:  7,               // SHADE_SCALE[7] = 700  ← +2 ✅
    activeShade: 8,               // SHADE_SCALE[8] = 800
    fgShade:     'white',
  },
  soft: {
    bgShade:     0,               // SHADE_SCALE[0] = 50
    hoverShade:  1,               // SHADE_SCALE[1] = 100
    activeShade: 2,               // SHADE_SCALE[2] = 200
    fgShade:     6,               // SHADE_SCALE[6] = 600
  },
  outlined: {
    bgShade:     'transparent',
    hoverShade:  0,               // SHADE_SCALE[0] = 50
    activeShade: 1,               // SHADE_SCALE[1] = 100
    borderShade: 3,               // SHADE_SCALE[3] = 300
    fgShade:     6,               // SHADE_SCALE[6] = 600
  },
  plain: {
    bgShade:     'transparent',
    hoverShade:  0,               // SHADE_SCALE[0] = 50
    activeShade: 1,               // SHADE_SCALE[1] = 100
    fgShade:     6,               // SHADE_SCALE[6] = 600
  },
};

/**
 * NEUTRAL_VARIANT_STEP_RULES
 *
 * Achromatic (gray-scale) shade-step mapping.
 * Strategy: **achromatic** — neutral is NOT "gray-colored button",
 * it is a "de-branded complete interaction system".
 *
 * Key behavioral differences from chromatic:
 *
 * 1. filled: bg starts at 900 (highest contrast), hover goes LIGHTER (800)
 *    → On dark bg, lighter = "float up" (physical metaphor)
 *    → Chromatic: bg=500, hover=700 (darker = "press in")
 *
 * 2. soft: uses SOLID shades (100/200/300) instead of alpha expressions
 *    → Gray alpha-blend on white bg is nearly invisible
 *    → Solid shades provide clear visible form
 *
 * 3. outlined: border uses shade 300 (solid) instead of alpha(600, 0.32)
 *    → Solid border is always visible regardless of bg
 *
 * 4. All fg values are deeper (700-800) for maximum text readability
 *
 * Hover direction: LIGHTER (brighter = "float up from dark surface")
 *
 * Reference: Shadcn zinc-900, Radix gray-12, MUI Joy neutral-900, Mantine dark.7
 */
export const NEUTRAL_VARIANT_STEP_RULES: Record<string, VariantStepRule> = {
  filled: {
    bgShade:     9,               // SHADE_SCALE[9] = 900  ← highest contrast
    hoverShade:  8,               // SHADE_SCALE[8] = 800  ← lighter on hover (float up)
    activeShade: 7,               // SHADE_SCALE[7] = 700  ← lightest on active
    fgShade:     'white',
  },
  soft: {
    bgShade:     1,               // SHADE_SCALE[1] = 100  ← solid (not alpha)
    hoverShade:  2,               // SHADE_SCALE[2] = 200  ← solid hover
    activeShade: 3,               // SHADE_SCALE[3] = 300  ← solid active
    fgShade:     8,               // SHADE_SCALE[8] = 800  ← deep text
  },
  outlined: {
    bgShade:     'transparent',
    hoverShade:  0,               // SHADE_SCALE[0] = 50   ← ultra-light hover
    activeShade: 1,               // SHADE_SCALE[1] = 100
    borderShade: 3,               // SHADE_SCALE[3] = 300  ← solid (not alpha)
    hoverBorderShade: 4,          // SHADE_SCALE[4] = 400  ← darken on hover
    fgShade:     8,               // SHADE_SCALE[8] = 800  ← deep text
  },
  plain: {
    bgShade:     'transparent',
    hoverShade:  1,               // SHADE_SCALE[1] = 100  ← solid hover
    activeShade: 2,               // SHADE_SCALE[2] = 200  ← solid active
    fgShade:     7,               // SHADE_SCALE[7] = 700  ← mid-high text
  },
};
