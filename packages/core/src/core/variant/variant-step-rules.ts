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
  fgShade:     number | 'white' | 'black';
}

/**
 * VARIANT_STEP_RULES
 *
 * The canonical shade-step mapping for PrismUI's four variants.
 *
 * Key decisions:
 * - filled hoverShade = 7 (shade 700): +2 from bg (500), aligns with MUI primary.dark
 * - soft/outlined/plain hoverShade = 0 (shade 50): lightweight surface reveal, aligns with Mantine
 * - No dark mode entries: dark palette is designed independently (not mirrored)
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
