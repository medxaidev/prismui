import { describe, it, expect } from 'vitest';
import { withVariantColors, VARIANT_CSS_VARS } from './with-variant-colors';
import { WITH_VARIANT_MARK } from '../component/system-marks';
import { VARIANTS, THEME_COLORS } from './types';
import type { VarsResolver } from '../styles/types';
import type { PrismUITheme } from '../theme/types';

const DUMMY_THEME = {} as PrismUITheme;

const emptyBase: VarsResolver<Record<string, any>> = () => ({});

describe('Variant System — Step 4.3: withVariantColors Middleware', () => {

  describe('VARIANT_CSS_VARS constant', () => {
    it('exports exactly 7 system variable names', () => {
      expect(Object.keys(VARIANT_CSS_VARS)).toHaveLength(7);
    });

    it('all names start with --prismui-variant-', () => {
      Object.values(VARIANT_CSS_VARS).forEach((name) => {
        expect(name).toMatch(/^--prismui-variant-/);
      });
    });

    it('contains the 7 expected keys', () => {
      expect(VARIANT_CSS_VARS.bg).toBe('--prismui-variant-bg');
      expect(VARIANT_CSS_VARS.fg).toBe('--prismui-variant-fg');
      expect(VARIANT_CSS_VARS.hoverBg).toBe('--prismui-variant-hover-bg');
      expect(VARIANT_CSS_VARS.activeBg).toBe('--prismui-variant-active-bg');
      expect(VARIANT_CSS_VARS.border).toBe('--prismui-variant-border');
      expect(VARIANT_CSS_VARS.hoverBorder).toBe('--prismui-variant-hover-border');
      expect(VARIANT_CSS_VARS.hoverShadow).toBe('--prismui-variant-hover-shadow');
    });
  });

  describe('withVariantColors — output structure', () => {
    it('returns a function (VarsResolver)', () => {
      const resolver = withVariantColors(emptyBase);
      expect(typeof resolver).toBe('function');
    });

    it('output always contains all 7 system variable keys', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      expect(result).toHaveProperty('--prismui-variant-bg');
      expect(result).toHaveProperty('--prismui-variant-fg');
      expect(result).toHaveProperty('--prismui-variant-hover-bg');
      expect(result).toHaveProperty('--prismui-variant-active-bg');
      expect(result).toHaveProperty('--prismui-variant-border');
      expect(result).toHaveProperty('--prismui-variant-hover-border');
      expect(result).toHaveProperty('--prismui-variant-hover-shadow');
    });

    it('output values are CSS var() references or "transparent"', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      Object.values(result).forEach((value) => {
        expect(
          String(value).startsWith('var(') || value === 'transparent' || value === 'none'
        ).toBe(true);
      });
    });

    it('output contains no hex or rgb values', () => {
      const resolver = withVariantColors(emptyBase);
      VARIANTS.forEach((variant) => {
        THEME_COLORS.forEach((color) => {
          const result = resolver({ variant, color }, DUMMY_THEME);
          Object.values(result).forEach((value) => {
            expect(String(value)).not.toMatch(/#[0-9a-fA-F]{3,6}/);
            expect(String(value)).not.toMatch(/rgba?\(/);
          });
        });
      });
    });
  });

  describe('withVariantColors — all 28 variant x color combinations', () => {
    VARIANTS.forEach((variant) => {
      THEME_COLORS.forEach((color) => {
        it(`variant="${variant}" color="${color}" injects correct --prismui-variant-* vars`, () => {
          const resolver = withVariantColors(emptyBase);
          const result = resolver({ variant, color }, DUMMY_THEME);

          const bg = result['--prismui-variant-bg'] as string;
          const fg = result['--prismui-variant-fg'] as string;
          const hoverBg = result['--prismui-variant-hover-bg'] as string;
          const activeBg = result['--prismui-variant-active-bg'] as string;
          const border = result['--prismui-variant-border'] as string;
          const hoverBorder = result['--prismui-variant-hover-border'] as string;
          const hoverShadow = result['--prismui-variant-hover-shadow'] as string;

          if (variant === 'filled') {
            expect(bg).toBe(`var(--prismui-color-${color}-high-bg)`);
            expect(fg).toBe(`var(--prismui-color-${color}-high-fg)`);
            expect(hoverBg).toBe(`var(--prismui-color-${color}-high-hover-bg)`);
            expect(activeBg).toBe(`var(--prismui-color-${color}-high-active-bg)`);
            expect(border).toBe('transparent');
            expect(hoverBorder).toBe('transparent');
            expect(hoverShadow).toBe(`var(--prismui-color-${color}-high-hover-shadow)`);
          } else if (variant === 'soft') {
            expect(bg).toBe(`var(--prismui-color-${color}-low-bg)`);
            expect(fg).toBe(`var(--prismui-color-${color}-low-fg)`);
            expect(hoverBg).toBe(`var(--prismui-color-${color}-low-hover-bg)`);
            expect(activeBg).toBe(`var(--prismui-color-${color}-low-active-bg)`);
            expect(border).toBe('transparent');
            expect(hoverBorder).toBe('transparent');
            expect(hoverShadow).toBe('none');
          } else if (variant === 'outlined') {
            expect(bg).toBe(`var(--prismui-color-${color}-bordered-bg)`);
            expect(fg).toBe(`var(--prismui-color-${color}-bordered-fg)`);
            expect(hoverBg).toBe(`var(--prismui-color-${color}-bordered-hover-bg)`);
            expect(activeBg).toBe(`var(--prismui-color-${color}-bordered-active-bg)`);
            expect(border).toBe(`var(--prismui-color-${color}-bordered-border)`);
            expect(hoverBorder).toBe(`var(--prismui-color-${color}-bordered-hover-border)`);
            expect(hoverShadow).toBe(`var(--prismui-color-${color}-bordered-hover-shadow)`);
          } else if (variant === 'plain') {
            expect(bg).toBe('transparent');
            expect(fg).toBe(`var(--prismui-color-${color}-minimal-fg)`);
            expect(hoverBg).toBe(`var(--prismui-color-${color}-minimal-hover-bg)`);
            expect(activeBg).toBe(`var(--prismui-color-${color}-minimal-active-bg)`);
            expect(border).toBe('transparent');
            expect(hoverBorder).toBe('transparent');
            expect(hoverShadow).toBe('none');
          }
        });
      });
    });
  });

  describe('withVariantColors — default fallback', () => {
    it('uses filled/primary when variant and color props are absent', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBe('var(--prismui-color-primary-high-bg)');
      expect(result['--prismui-variant-fg']).toBe('var(--prismui-color-primary-high-fg)');
    });

    it('uses filled when only color is present', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({ color: 'error' }, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBe('var(--prismui-color-error-high-bg)');
    });

    it('uses primary when only variant is present', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({ variant: 'soft' }, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBe('var(--prismui-color-primary-low-bg)');
    });
  });

  describe('withVariantColors — spread order (baseVars override priority)', () => {
    it('baseVars spread last: base can override a --prismui-variant-* key', () => {
      const overridingBase: VarsResolver<Record<string, any>> = () => ({
        '--prismui-variant-bg': 'OVERRIDE',
      });
      const resolver = withVariantColors(overridingBase);
      const result = resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBe('OVERRIDE');
    });

    it('baseVars keys are merged alongside system variant keys', () => {
      const sizeBase: VarsResolver<Record<string, any>> = () => ({
        '--button-height': '40px',
        '--button-padding-x': '16px',
      });
      const resolver = withVariantColors(sizeBase);
      const result = resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      expect(result['--button-height']).toBe('40px');
      expect(result['--button-padding-x']).toBe('16px');
      expect(result['--prismui-variant-bg']).toBe('var(--prismui-color-primary-high-bg)');
    });

    it('passes theme argument through to baseVarsResolver', () => {
      let capturedTheme: any = null;
      const capturingBase: VarsResolver<Record<string, any>> = (_props, theme) => {
        capturedTheme = theme;
        return {};
      };
      const resolver = withVariantColors(capturingBase);
      resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      expect(capturedTheme).toBe(DUMMY_THEME);
    });
  });

  describe('withVariantColors — options.enabled guard', () => {
    it('injects variant vars when enabled returns true', () => {
      const resolver = withVariantColors(emptyBase, {
        enabled: (props) => props.variant !== undefined,
      });
      const result = resolver({ variant: 'filled', color: 'primary' }, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBe('var(--prismui-color-primary-high-bg)');
      expect(result['--prismui-variant-fg']).toBe('var(--prismui-color-primary-high-fg)');
    });

    it('skips variant vars when enabled returns false', () => {
      const resolver = withVariantColors(emptyBase, {
        enabled: (props) => props.variant !== undefined,
      });
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBeUndefined();
      expect(result['--prismui-variant-fg']).toBeUndefined();
      expect(result['--prismui-variant-hover-bg']).toBeUndefined();
      expect(result['--prismui-variant-active-bg']).toBeUndefined();
      expect(result['--prismui-variant-border']).toBeUndefined();
      expect(result['--prismui-variant-hover-border']).toBeUndefined();
      expect(result['--prismui-variant-hover-shadow']).toBeUndefined();
    });

    it('when disabled, still returns baseVars', () => {
      const baseWithSize: VarsResolver<Record<string, any>> = () => ({
        '--button-height': '40px',
      });
      const resolver = withVariantColors(baseWithSize, {
        enabled: (props) => props.variant !== undefined,
      });
      const result = resolver({}, DUMMY_THEME);
      expect(result['--button-height']).toBe('40px');
      expect(result['--prismui-variant-bg']).toBeUndefined();
    });

    it('without options.enabled, always injects (default behavior unchanged)', () => {
      const resolver = withVariantColors(emptyBase);
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-variant-bg']).toBeDefined();
    });

    it('enabled predicate receives the full props object', () => {
      let capturedProps: any = null;
      const resolver = withVariantColors(emptyBase, {
        enabled: (props) => { capturedProps = props; return true; },
      });
      const input = { variant: 'soft', color: 'info', size: 'lg' };
      resolver(input, DUMMY_THEME);
      expect(capturedProps).toBe(input);
    });
  });

  describe('withVariantColors — Symbol mark (double-wrap prevention)', () => {
    it('stamps WITH_VARIANT_MARK on the returned resolver', () => {
      const wrapped = withVariantColors(emptyBase);
      expect((wrapped as any)[WITH_VARIANT_MARK]).toBe(true);
    });

    it('stamps WITH_VARIANT_MARK even when options are provided', () => {
      const wrapped = withVariantColors(emptyBase, {
        enabled: (props) => props.variant !== undefined,
      });
      expect((wrapped as any)[WITH_VARIANT_MARK]).toBe(true);
    });

    it('base resolver does NOT have the mark (only wrapped one does)', () => {
      expect((emptyBase as any)[WITH_VARIANT_MARK]).toBeUndefined();
    });

    it('mark is a Symbol (not a string or boolean property collision)', () => {
      const wrapped = withVariantColors(emptyBase);
      const ownSymbols = Object.getOwnPropertySymbols(wrapped);
      expect(ownSymbols).toContain(WITH_VARIANT_MARK);
    });
  });
});
