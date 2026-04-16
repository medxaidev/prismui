import { describe, it, expect } from 'vitest';
import { VARIANTS, THEME_COLORS } from './types';
import type { Variant, ThemeColor } from './types';
import { VARIANT_STEP_RULES, NEUTRAL_VARIANT_STEP_RULES, getColorStrategy, SHADE_SCALE } from './variant-step-rules';
import type { ColorStrategy } from './variant-step-rules';

describe('Variant System — Step 4.1: Variant Model', () => {
  describe('VARIANTS constant', () => {
    it('contains exactly 4 variants', () => {
      expect(VARIANTS).toHaveLength(4);
    });

    it('contains all expected variant values', () => {
      expect(VARIANTS).toContain('filled');
      expect(VARIANTS).toContain('outlined');
      expect(VARIANTS).toContain('soft');
      expect(VARIANTS).toContain('plain');
    });

    it('is an Array (as const tuple, TypeScript readonly at compile time)', () => {
      expect(Array.isArray(VARIANTS)).toBe(true);
    });

    it('does not contain legacy Mantine variants', () => {
      expect(VARIANTS).not.toContain('light');
      expect(VARIANTS).not.toContain('subtle');
      expect(VARIANTS).not.toContain('transparent');
      expect(VARIANTS).not.toContain('default');
      expect(VARIANTS).not.toContain('white');
    });

    it('does not contain MUI Core variants', () => {
      expect(VARIANTS).not.toContain('contained');
      expect(VARIANTS).not.toContain('text');
    });

    it('does not contain Joy UI naming (solid)', () => {
      expect(VARIANTS).not.toContain('solid');
    });
  });

  describe('THEME_COLORS constant', () => {
    it('contains exactly 7 semantic colors', () => {
      expect(THEME_COLORS).toHaveLength(7);
    });

    it('contains all expected semantic color values', () => {
      expect(THEME_COLORS).toContain('primary');
      expect(THEME_COLORS).toContain('secondary');
      expect(THEME_COLORS).toContain('info');
      expect(THEME_COLORS).toContain('success');
      expect(THEME_COLORS).toContain('warning');
      expect(THEME_COLORS).toContain('error');
      expect(THEME_COLORS).toContain('neutral');
    });

    it('is an Array (as const tuple, TypeScript readonly at compile time)', () => {
      expect(Array.isArray(THEME_COLORS)).toBe(true);
    });

    it('does not contain raw color family names', () => {
      expect(THEME_COLORS).not.toContain('blue');
      expect(THEME_COLORS).not.toContain('red');
      expect(THEME_COLORS).not.toContain('green');
      expect(THEME_COLORS).not.toContain('yellow');
      expect(THEME_COLORS).not.toContain('violet');
      expect(THEME_COLORS).not.toContain('gray');
    });

    it('does not use Joy UI / MUI naming (danger)', () => {
      expect(THEME_COLORS).not.toContain('danger');
    });
  });

  describe('Variant × ThemeColor combinatorial coverage', () => {
    it('produces 28 unique combinations (4 × 7)', () => {
      const combinations: Array<{ variant: Variant; color: ThemeColor }> = [];
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          combinations.push({ variant, color });
        }
      }
      expect(combinations).toHaveLength(28);
    });

    it('all combinations are unique', () => {
      const keys = new Set<string>();
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          keys.add(`${variant}:${color}`);
        }
      }
      expect(keys.size).toBe(28);
    });
  });

  describe('Type safety (compile-time checks via assignments)', () => {
    it('Variant type accepts all 4 values', () => {
      const filled: Variant = 'filled';
      const outlined: Variant = 'outlined';
      const soft: Variant = 'soft';
      const plain: Variant = 'plain';
      expect([filled, outlined, soft, plain]).toHaveLength(4);
    });

    it('ThemeColor type accepts all 7 values', () => {
      const primary: ThemeColor = 'primary';
      const secondary: ThemeColor = 'secondary';
      const info: ThemeColor = 'info';
      const success: ThemeColor = 'success';
      const warning: ThemeColor = 'warning';
      const error: ThemeColor = 'error';
      const neutral: ThemeColor = 'neutral';
      expect([primary, secondary, info, success, warning, error, neutral]).toHaveLength(7);
    });

    it('VARIANTS elements are assignable to Variant type', () => {
      VARIANTS.forEach((v) => {
        const typed: Variant = v;
        expect(typeof typed).toBe('string');
      });
    });

    it('THEME_COLORS elements are assignable to ThemeColor type', () => {
      THEME_COLORS.forEach((c) => {
        const typed: ThemeColor = c;
        expect(typeof typed).toBe('string');
      });
    });
  });

  describe('Design constraints', () => {
    it('variant and color are independent dimensions (no coupling)', () => {
      const filledPrimary = { variant: 'filled' as Variant, color: 'primary' as ThemeColor };
      const filledError = { variant: 'filled' as Variant, color: 'error' as ThemeColor };
      const softPrimary = { variant: 'soft' as Variant, color: 'primary' as ThemeColor };

      expect(filledPrimary.variant).toBe(filledError.variant);
      expect(filledPrimary.color).toBe(softPrimary.color);
    });

    it('default variant is filled (highest emphasis)', () => {
      expect(VARIANTS[0]).toBe('filled');
    });

    it('default color is primary', () => {
      expect(THEME_COLORS[0]).toBe('primary');
    });
  });
});

describe('Color Strategy — Chromatic vs Achromatic', () => {
  describe('getColorStrategy', () => {
    it('returns achromatic for neutral', () => {
      expect(getColorStrategy('neutral')).toBe('achromatic');
    });

    it('returns chromatic for all non-neutral colors', () => {
      const chromatic = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];
      for (const color of chromatic) {
        expect(getColorStrategy(color)).toBe('chromatic');
      }
    });

    it('return type is ColorStrategy', () => {
      const result: ColorStrategy = getColorStrategy('primary');
      expect(['chromatic', 'achromatic']).toContain(result);
    });
  });

  describe('NEUTRAL_VARIANT_STEP_RULES', () => {
    it('covers all 4 variants', () => {
      expect(Object.keys(NEUTRAL_VARIANT_STEP_RULES)).toHaveLength(4);
      expect(NEUTRAL_VARIANT_STEP_RULES).toHaveProperty('filled');
      expect(NEUTRAL_VARIANT_STEP_RULES).toHaveProperty('soft');
      expect(NEUTRAL_VARIANT_STEP_RULES).toHaveProperty('outlined');
      expect(NEUTRAL_VARIANT_STEP_RULES).toHaveProperty('plain');
    });

    it('filled: bg=900 (highest contrast), hover reverses direction (lighter)', () => {
      const { bgShade, hoverShade, activeShade } = NEUTRAL_VARIANT_STEP_RULES.filled;
      expect(SHADE_SCALE[bgShade as number]).toBe(900);
      expect(SHADE_SCALE[hoverShade as number]).toBe(800);
      expect(SHADE_SCALE[activeShade as number]).toBe(700);
      // Verify: hover is LIGHTER than bg (opposite of chromatic)
      expect(hoverShade).toBeLessThan(bgShade as number);
    });

    it('chromatic filled: hover is DARKER than bg', () => {
      const { bgShade, hoverShade } = VARIANT_STEP_RULES.filled;
      // chromatic: 500 → 700 (deeper)
      expect(hoverShade).toBeGreaterThan(bgShade as number);
    });

    it('soft: uses solid shade indices (not transparent/alpha)', () => {
      const { bgShade, hoverShade, activeShade, fgShade } = NEUTRAL_VARIANT_STEP_RULES.soft;
      expect(typeof bgShade).toBe('number');
      expect(typeof hoverShade).toBe('number');
      expect(typeof activeShade).toBe('number');
      // bg=100, hover=200, active=300 (ascending)
      expect(SHADE_SCALE[bgShade as number]).toBe(100);
      expect(SHADE_SCALE[hoverShade as number]).toBe(200);
      expect(SHADE_SCALE[activeShade as number]).toBe(300);
      // fg deeper than chromatic soft (800 vs 600)
      expect(fgShade).toBe(8); // shade 800
    });

    it('outlined: has solid borderShade and hoverBorderShade', () => {
      const { borderShade, hoverBorderShade, fgShade } = NEUTRAL_VARIANT_STEP_RULES.outlined;
      expect(borderShade).toBe(3);  // shade 300
      expect(hoverBorderShade).toBe(4);  // shade 400
      expect(fgShade).toBe(8);  // shade 800
    });

    it('plain: fg deeper than chromatic plain', () => {
      expect(NEUTRAL_VARIANT_STEP_RULES.plain.fgShade).toBe(7);  // shade 700
      expect(VARIANT_STEP_RULES.plain.fgShade).toBe(6);  // shade 600
    });
  });
});
