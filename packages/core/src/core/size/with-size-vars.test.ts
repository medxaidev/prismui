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
    it('exports exactly 2 system variable names', () => {
      expect(Object.keys(SIZE_CSS_VARS)).toHaveLength(2);
    });

    it('all names start with --prismui-size-', () => {
      Object.values(SIZE_CSS_VARS).forEach((name) => {
        expect(name).toMatch(/^--prismui-size-/);
      });
    });

    it('contains the expected keys: height and paddingX', () => {
      expect(SIZE_CSS_VARS.height).toBe('--prismui-size-height');
      expect(SIZE_CSS_VARS.paddingX).toBe('--prismui-size-padding-x');
    });
  });

  describe('withSizeVars — output structure', () => {
    it('returns a function (VarsResolver)', () => {
      const resolver = withSizeVars(emptyBase);
      expect(typeof resolver).toBe('function');
    });

    it('output always contains both system variable keys', () => {
      const resolver = withSizeVars(emptyBase);
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result).toHaveProperty('--prismui-size-height');
      expect(result).toHaveProperty('--prismui-size-padding-x');
    });
  });

  describe('withSizeVars — 5-tier size mapping', () => {
    const resolver = withSizeVars(emptyBase);

    it('size=xs → 24px height, 8px paddingX', () => {
      const result = resolver({ size: 'xs' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('24px');
      expect(result['--prismui-size-padding-x']).toBe('8px');
    });

    it('size=sm → 32px height, 12px paddingX', () => {
      const result = resolver({ size: 'sm' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('32px');
      expect(result['--prismui-size-padding-x']).toBe('12px');
    });

    it('size=md → 40px height, 16px paddingX', () => {
      const result = resolver({ size: 'md' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('40px');
      expect(result['--prismui-size-padding-x']).toBe('16px');
    });

    it('size=lg → 48px height, 20px paddingX', () => {
      const result = resolver({ size: 'lg' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('48px');
      expect(result['--prismui-size-padding-x']).toBe('20px');
    });

    it('size=xl → 56px height, 24px paddingX', () => {
      const result = resolver({ size: 'xl' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('56px');
      expect(result['--prismui-size-padding-x']).toBe('24px');
    });

    it('no size prop → defaults to md', () => {
      const result = resolver({}, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('40px');
      expect(result['--prismui-size-padding-x']).toBe('16px');
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
      expect(result['--prismui-size-height']).toBe('40px');
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
      expect(result['--btn-height']).toBe('40px');
    });

    it('enabled=true → injects size vars', () => {
      const resolver = withSizeVars(emptyBase, {
        enabled: (p) => p.size !== undefined,
      });
      const result = resolver({ size: 'lg' }, DUMMY_THEME);
      expect(result['--prismui-size-height']).toBe('48px');
    });
  });

  describe('withSizeVars — theme.size override', () => {
    it('theme.size tokens override defaultSizeTokens', () => {
      const customTheme = {
        size: {
          xs: { height: '20px', paddingX: '6px' },
          sm: { height: '28px', paddingX: '10px' },
          md: { height: '36px', paddingX: '14px' },
          lg: { height: '44px', paddingX: '18px' },
          xl: { height: '52px', paddingX: '22px' },
        },
      } as unknown as PrismUITheme;
      const resolver = withSizeVars(emptyBase);
      const result = resolver({ size: 'md' }, customTheme);
      expect(result['--prismui-size-height']).toBe('36px');
      expect(result['--prismui-size-padding-x']).toBe('14px');
    });
  });

});
