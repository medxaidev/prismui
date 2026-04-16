import { describe, it, expect } from 'vitest';
import { variantColorResolver, VARIANT_TO_ROLE } from './variant-color-resolver';
import { VARIANTS, THEME_COLORS } from './types';

describe('Variant System — Step 4.2: Variant Color Resolver', () => {
  describe('VARIANT_TO_ROLE', () => {
    it('maps filled → high', () => {
      expect(VARIANT_TO_ROLE.filled).toBe('high');
    });

    it('maps soft → low', () => {
      expect(VARIANT_TO_ROLE.soft).toBe('low');
    });

    it('maps outlined → bordered', () => {
      expect(VARIANT_TO_ROLE.outlined).toBe('bordered');
    });

    it('maps plain → minimal', () => {
      expect(VARIANT_TO_ROLE.plain).toBe('minimal');
    });

    it('covers all 4 variants', () => {
      expect(Object.keys(VARIANT_TO_ROLE)).toHaveLength(4);
      for (const v of VARIANTS) {
        expect(VARIANT_TO_ROLE).toHaveProperty(v);
      }
    });
  });

  describe('filled variant', () => {
    it('returns high-role CSS variables for primary', () => {
      const result = variantColorResolver({ variant: 'filled', color: 'primary' });
      expect(result.bg).toBe('var(--prismui-color-primary-high-bg)');
      expect(result.fg).toBe('var(--prismui-color-primary-high-fg)');
      expect(result.hoverBg).toBe('var(--prismui-color-primary-high-hover-bg)');
      expect(result.border).toBe('transparent');
    });

    it('returns high-role CSS variables for error', () => {
      const result = variantColorResolver({ variant: 'filled', color: 'error' });
      expect(result.bg).toBe('var(--prismui-color-error-high-bg)');
      expect(result.fg).toBe('var(--prismui-color-error-high-fg)');
      expect(result.hoverBg).toBe('var(--prismui-color-error-high-hover-bg)');
      expect(result.border).toBe('transparent');
    });

    it('border is always transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'filled', color });
        expect(result.border).toBe('transparent');
      }
    });

    it('bg is never transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'filled', color });
        expect(result.bg).not.toBe('transparent');
      }
    });
  });

  describe('soft variant', () => {
    it('returns low-role CSS variables for success', () => {
      const result = variantColorResolver({ variant: 'soft', color: 'success' });
      expect(result.bg).toBe('var(--prismui-color-success-low-bg)');
      expect(result.fg).toBe('var(--prismui-color-success-low-fg)');
      expect(result.hoverBg).toBe('var(--prismui-color-success-low-hover-bg)');
      expect(result.border).toBe('transparent');
    });

    it('border is always transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'soft', color });
        expect(result.border).toBe('transparent');
      }
    });

    it('bg is never transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'soft', color });
        expect(result.bg).not.toBe('transparent');
      }
    });
  });

  describe('outlined variant', () => {
    it('returns bordered-role CSS variables for warning', () => {
      const result = variantColorResolver({ variant: 'outlined', color: 'warning' });
      expect(result.bg).toBe('var(--prismui-color-warning-bordered-bg)');
      expect(result.fg).toBe('var(--prismui-color-warning-bordered-fg)');
      expect(result.hoverBg).toBe('var(--prismui-color-warning-bordered-hover-bg)');
      expect(result.activeBg).toBe('var(--prismui-color-warning-bordered-active-bg)');
      expect(result.border).toBe('var(--prismui-color-warning-bordered-border)');
      expect(result.hoverBorder).toBe('var(--prismui-color-warning-bordered-hover-border)');
      expect(result.hoverShadow).toBe('var(--prismui-color-warning-bordered-hover-shadow)');
    });

    it('bg references bordered-bg var (resolved to transparent via palette)', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'outlined', color });
        expect(result.bg).toContain('-bordered-bg)');
      }
    });

    it('border is never transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'outlined', color });
        expect(result.border).not.toBe('transparent');
      }
    });
  });

  describe('plain variant', () => {
    it('returns minimal-role CSS variables for neutral', () => {
      const result = variantColorResolver({ variant: 'plain', color: 'neutral' });
      expect(result.bg).toBe('transparent');
      expect(result.fg).toBe('var(--prismui-color-neutral-minimal-fg)');
      expect(result.hoverBg).toBe('var(--prismui-color-neutral-minimal-hover-bg)');
      expect(result.border).toBe('transparent');
    });

    it('bg is always transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'plain', color });
        expect(result.bg).toBe('transparent');
      }
    });

    it('border is always transparent', () => {
      for (const color of THEME_COLORS) {
        const result = variantColorResolver({ variant: 'plain', color });
        expect(result.border).toBe('transparent');
      }
    });
  });

  describe('all 28 combinations coverage', () => {
    it('all combinations produce 7 defined output fields', () => {
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          expect(result.bg).toBeDefined();
          expect(result.fg).toBeDefined();
          expect(result.hoverBg).toBeDefined();
          expect(result.activeBg).toBeDefined();
          expect(result.border).toBeDefined();
          expect(result.hoverBorder).toBeDefined();
          expect(result.hoverShadow).toBeDefined();
        }
      }
    });

    it('fg always references correct color name', () => {
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          expect(result.fg).toContain(`--prismui-color-${color}-`);
        }
      }
    });

    it('hoverBg always references correct color name', () => {
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          expect(result.hoverBg).toContain(`--prismui-color-${color}-`);
        }
      }
    });
  });

  describe('CSS variable format', () => {
    it('all non-transparent values follow var(--prismui-color-*) format', () => {
      const varPattern = /^var\(--prismui-color-[a-z]+-[a-z-]+-[a-z-]+\)$/;
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          for (const value of [result.bg, result.fg, result.hoverBg, result.activeBg, result.border, result.hoverBorder, result.hoverShadow]) {
            if (value !== 'transparent' && value !== 'none') {
              expect(value).toMatch(varPattern);
            }
          }
        }
      }
    });
  });

  describe('design constraints', () => {
    it('no hex values in output (zero runtime color resolution)', () => {
      const hexPattern = /^#[0-9a-fA-F]{3,8}$/;
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          for (const value of Object.values(result)) {
            expect(value).not.toMatch(hexPattern);
          }
        }
      }
    });

    it('no rgb/rgba values in output', () => {
      const rgbPattern = /^rgba?\(/;
      for (const variant of VARIANTS) {
        for (const color of THEME_COLORS) {
          const result = variantColorResolver({ variant, color });
          for (const value of Object.values(result)) {
            expect(value).not.toMatch(rgbPattern);
          }
        }
      }
    });

    it('filled and soft always have bg (not transparent)', () => {
      for (const color of THEME_COLORS) {
        expect(variantColorResolver({ variant: 'filled', color }).bg).not.toBe('transparent');
        expect(variantColorResolver({ variant: 'soft', color }).bg).not.toBe('transparent');
      }
    });

    it('plain always has transparent bg, outlined has bordered-bg var', () => {
      for (const color of THEME_COLORS) {
        expect(variantColorResolver({ variant: 'outlined', color }).bg).toContain('-bordered-bg)');
        expect(variantColorResolver({ variant: 'plain', color }).bg).toBe('transparent');
      }
    });

    it('only outlined has a non-transparent border', () => {
      for (const color of THEME_COLORS) {
        expect(variantColorResolver({ variant: 'filled', color }).border).toBe('transparent');
        expect(variantColorResolver({ variant: 'soft', color }).border).toBe('transparent');
        expect(variantColorResolver({ variant: 'outlined', color }).border).not.toBe('transparent');
        expect(variantColorResolver({ variant: 'plain', color }).border).toBe('transparent');
      }
    });
  });
});
