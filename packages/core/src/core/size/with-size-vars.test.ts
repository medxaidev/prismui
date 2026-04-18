import { describe, it, expect } from 'vitest';
import { withSizeVars, SIZE_CSS_VARS } from './with-size-vars';
import { WITH_SIZE_MARK } from '../component/system-marks';
import { defaultSizeTokens } from './default-size-tokens';
import type { VarsResolver } from '../styles/types';
import type { PrismUITheme } from '../theme/types';

const DUMMY_THEME = { size: defaultSizeTokens } as unknown as PrismUITheme;
const emptyBase: VarsResolver<Record<string, any>> = () => ({});

describe('Size System — Step 5.2: withSizeVars Middleware', () => {

  describe('SIZE_CSS_VARS constant', () => {
    it('exports exactly 5 system variable names (v3)', () => {
      expect(Object.keys(SIZE_CSS_VARS)).toHaveLength(5);
    });

    it('all names start with --prismui-size-', () => {
      Object.values(SIZE_CSS_VARS).forEach((name) => {
        expect(name).toMatch(/^--prismui-size-/);
      });
    });

    it('contains all 5 expected keys: height, paddingX, fontSize, slotSize, innerGap', () => {
      expect(SIZE_CSS_VARS.height).toBe('--prismui-size-height');
      expect(SIZE_CSS_VARS.paddingX).toBe('--prismui-size-padding-x');
      expect(SIZE_CSS_VARS.fontSize).toBe('--prismui-size-font-size');
      expect(SIZE_CSS_VARS.slotSize).toBe('--prismui-size-slot-size');
      expect(SIZE_CSS_VARS.innerGap).toBe('--prismui-size-inner-gap');
    });
  });

  describe('withSizeVars — output structure', () => {
    it('returns a function (VarsResolver)', () => {
      const resolver = withSizeVars(emptyBase);
      expect(typeof resolver).toBe('function');
    });

    it('output always contains all 5 system variable keys', () => {
      const resolver = withSizeVars(emptyBase);
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result).toHaveProperty('--prismui-size-height');
      expect(result).toHaveProperty('--prismui-size-padding-x');
      expect(result).toHaveProperty('--prismui-size-font-size');
      expect(result).toHaveProperty('--prismui-size-slot-size');
      expect(result).toHaveProperty('--prismui-size-inner-gap');
    });
  });

  describe('withSizeVars — 5-tier Layer-1 mapping (height / paddingX / fontSize)', () => {
    const resolver = withSizeVars(emptyBase);

    it('size=xs → 24px height, 8px paddingX, 12px fontSize', () => {
      const result = resolver({ size: 'xs' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('24px');
      expect(result['--prismui-size-padding-x']).toBe('8px');
      expect(result['--prismui-size-font-size']).toBe('12px');
    });

    it('size=sm → 30px height, 10px paddingX, 13px fontSize', () => {
      const result = resolver({ size: 'sm' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('30px');
      expect(result['--prismui-size-padding-x']).toBe('10px');
      expect(result['--prismui-size-font-size']).toBe('13px');
    });

    it('size=md → 36px height, 12px paddingX, 14px fontSize', () => {
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('36px');
      expect(result['--prismui-size-padding-x']).toBe('12px');
      expect(result['--prismui-size-font-size']).toBe('14px');
    });

    it('size=lg → 42px height, 14px paddingX, 15px fontSize', () => {
      const result = resolver({ size: 'lg' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('42px');
      expect(result['--prismui-size-padding-x']).toBe('14px');
      expect(result['--prismui-size-font-size']).toBe('15px');
    });

    it('size=xl → 48px height, 16px paddingX, 16px fontSize', () => {
      const result = resolver({ size: 'xl' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('48px');
      expect(result['--prismui-size-padding-x']).toBe('16px');
      expect(result['--prismui-size-font-size']).toBe('16px');
    });

    it('no size prop → defaults to md (Layer 1)', () => {
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('36px');
      expect(result['--prismui-size-padding-x']).toBe('12px');
      expect(result['--prismui-size-font-size']).toBe('14px');
    });
  });

  describe('withSizeVars — 5-tier Layer-2 mapping (slotSize / innerGap) [v3]', () => {
    const resolver = withSizeVars(emptyBase);

    it('size=xs → 14px slotSize, 4px innerGap', () => {
      const result = resolver({ size: 'xs' }, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('14px');
      expect(result['--prismui-size-inner-gap']).toBe('4px');
    });

    it('size=sm → 16px slotSize, 6px innerGap', () => {
      const result = resolver({ size: 'sm' }, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('16px');
      expect(result['--prismui-size-inner-gap']).toBe('6px');
    });

    it('size=md → 18px slotSize, 8px innerGap', () => {
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('18px');
      expect(result['--prismui-size-inner-gap']).toBe('8px');
    });

    it('size=lg → 20px slotSize, 10px innerGap', () => {
      const result = resolver({ size: 'lg' }, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('20px');
      expect(result['--prismui-size-inner-gap']).toBe('10px');
    });

    it('size=xl → 22px slotSize, 12px innerGap', () => {
      const result = resolver({ size: 'xl' }, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('22px');
      expect(result['--prismui-size-inner-gap']).toBe('12px');
    });

    it('no size prop → defaults to md (Layer 2)', () => {
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-size-slot-size']).toBe('18px');
      expect(result['--prismui-size-inner-gap']).toBe('8px');
    });
  });

  describe('withSizeVars — Layer-2 proportion invariants (v3 §3)', () => {
    const resolver = withSizeVars(emptyBase);
    const parsePx = (v: unknown) => parseFloat(String(v).replace('px', ''));
    const tiers: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

    it('slotSize > fontSize on all tiers (slot fits icon larger than text)', () => {
      for (const size of tiers) {
        const r = resolver({ size }, DUMMY_THEME);
        expect(parsePx(r['--prismui-size-slot-size']))
          .toBeGreaterThan(parsePx(r['--prismui-size-font-size']));
      }
    });

    it('slotSize / height stays within visual-reasonable range on all tiers', () => {
      // Math note: height steps +6 while slotSize steps +2, so the ratio
      // is naturally higher at xs (0.58) and lower at xl (0.46). The bound
      // 0.45 ~ 0.60 captures "slot is roughly half of height" across all tiers.
      for (const size of tiers) {
        const r = resolver({ size }, DUMMY_THEME);
        const ratio = parsePx(r['--prismui-size-slot-size']) / parsePx(r['--prismui-size-height']);
        expect(ratio).toBeGreaterThanOrEqual(0.45);
        expect(ratio).toBeLessThanOrEqual(0.60);
      }
    });

    it('innerGap <= paddingX on all tiers (gap tighter than padding)', () => {
      for (const size of tiers) {
        const r = resolver({ size }, DUMMY_THEME);
        expect(parsePx(r['--prismui-size-inner-gap']))
          .toBeLessThanOrEqual(parsePx(r['--prismui-size-padding-x']));
      }
    });
  });

  describe('withSizeVars — spread order (baseVars priority)', () => {
    it('baseVars override size system vars when same key returned', () => {
      const overrideBase: VarsResolver<any> = () => ({
        '--prismui-size-height': '999px',
      });
      const resolver = withSizeVars(overrideBase);
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('999px');
    });

    it('baseVars are preserved alongside size vars', () => {
      const base: VarsResolver<any> = () => ({ '--btn-extra': 'value' });
      const resolver = withSizeVars(base);
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result['--btn-extra']).toBe('value');
      expect(result['--prismui-size-height']).toBe('36px');
    });
  });

  describe('withSizeVars — Symbol mark (double-wrap prevention)', () => {
    it('WITH_SIZE_MARK is stamped on the returned resolver', () => {
      const wrapped = withSizeVars(emptyBase);
      expect((wrapped as any)[WITH_SIZE_MARK]).toBe(true);
    });

    it('manually wrapped resolver already has WITH_SIZE_MARK', () => {
      const wrapped = withSizeVars(emptyBase);
      const alreadyMarked = !!(wrapped as any)[WITH_SIZE_MARK];
      expect(alreadyMarked).toBe(true);
    });
  });

  describe('withSizeVars — enabled guard', () => {
    it('enabled=false → returns only baseVars, no --prismui-size-* injected', () => {
      const base: VarsResolver<any> = () => ({ '--btn-height': '40px' });
      const resolver = withSizeVars(base, {
        enabled: (p) => p.size !== undefined,
      });
      const result = resolver({}, DUMMY_THEME); // no size prop
      expect(result['--prismui-size-height']).toBeUndefined();
      expect(result['--prismui-size-padding-x']).toBeUndefined();
      expect(result['--prismui-size-font-size']).toBeUndefined();
      expect(result['--btn-height']).toBe('40px');
    });

    it('enabled=true → injects size vars', () => {
      const resolver = withSizeVars(emptyBase, {
        enabled: (p) => p.size !== undefined,
      });
      const result = resolver({ size: 'lg' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('42px');
    });
  });

  describe('withSizeVars — theme.size override', () => {
    it('theme.size tokens override defaultSizeTokens', () => {
      const customTheme = {
        size: {
          xs: { height: '20px', paddingX: '6px',  fontSize: '11px' },
          sm: { height: '28px', paddingX: '10px', fontSize: '12px' },
          md: { height: '34px', paddingX: '14px', fontSize: '13px' },
          lg: { height: '44px', paddingX: '18px', fontSize: '15px' },
          xl: { height: '52px', paddingX: '22px', fontSize: '17px' },
        },
      } as unknown as PrismUITheme;
      const resolver = withSizeVars(emptyBase);
      const result = resolver({ size: 'md' }, customTheme);
      expect(result['--prismui-size-height']).toBe('34px');
      expect(result['--prismui-size-padding-x']).toBe('14px');
      expect(result['--prismui-size-font-size']).toBe('13px');
    });
  });

});
