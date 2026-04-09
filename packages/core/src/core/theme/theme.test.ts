import { describe, it, expect } from 'vitest';
import { defaultTheme } from './default-theme';
import type {
  PrismUITheme,
  CSSLength,
  TokenRef,
  SpacingValue,
  FontSizeValue,
  RadiusValue,
  BreakpointValue,
} from './types';

describe('Theme System', () => {
  describe('defaultTheme', () => {
    it('should have correct structure', () => {
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme.colors).toBeDefined();
      expect(defaultTheme.palette).toBeDefined();
      expect(defaultTheme.typography).toBeDefined();
      expect(defaultTheme.spacing).toBeDefined();
      expect(defaultTheme.radius).toBeDefined();
      expect(defaultTheme.shadows).toBeDefined();
      expect(defaultTheme.breakpoints).toBeDefined();
      expect(defaultTheme.scale).toBe(1);
    });

    it('should have correct typography', () => {
      expect(defaultTheme.typography.fontFamily).toContain('Public Sans Variable');
      expect(defaultTheme.typography.fontFamily).toContain('sans-serif');
      expect(defaultTheme.typography.fontSize.md).toBe('1rem');
      expect(defaultTheme.typography.fontWeight.regular).toBe(400);
      expect(defaultTheme.typography.fontWeight.extrabold).toBe(800);
      expect(defaultTheme.typography.lineHeight.xs).toBe(1.25);
      expect(defaultTheme.typography.lineHeight.md).toBe(1.5);
    });

    it('should use rem for spacing', () => {
      expect(defaultTheme.spacing.xs).toBe('0.25rem');
      expect(defaultTheme.spacing.sm).toBe('0.5rem');
      expect(defaultTheme.spacing.md).toBe('1rem');
      expect(defaultTheme.spacing.lg).toBe('1.5rem');
      expect(defaultTheme.spacing.xl).toBe('2rem');
    });

    it('should use rem for radius', () => {
      expect(defaultTheme.radius.xs).toBe('0.125rem');
      expect(defaultTheme.radius.sm).toBe('0.25rem');
      expect(defaultTheme.radius.md).toBe('0.5rem');
      expect(defaultTheme.radius.lg).toBe('0.75rem');
      expect(defaultTheme.radius.xl).toBe('1rem');
    });

    it('should have numeric breakpoints (px values as numbers)', () => {
      expect(defaultTheme.breakpoints.xs).toBe(576);
      expect(defaultTheme.breakpoints.sm).toBe(768);
      expect(defaultTheme.breakpoints.md).toBe(992);
      expect(defaultTheme.breakpoints.lg).toBe(1200);
      expect(defaultTheme.breakpoints.xl).toBe(1400);
    });

    it('should have shadow definitions', () => {
      expect(defaultTheme.shadows.xs).toContain('rgba');
      expect(defaultTheme.shadows.md).toContain('rgba');
      expect(defaultTheme.shadows.xl).toContain('rgba');
    });

    it('should use MUI-style gray-tinted shadows for xs/sm/md/lg', () => {
      expect(defaultTheme.shadows.xs).toContain('145, 158, 171');
      expect(defaultTheme.shadows.sm).toContain('145, 158, 171');
      expect(defaultTheme.shadows.md).toContain('145, 158, 171');
      expect(defaultTheme.shadows.lg).toContain('145, 158, 171');
    });

    it('should have all 5 font weights including extrabold', () => {
      expect(defaultTheme.typography.fontWeight.regular).toBe(400);
      expect(defaultTheme.typography.fontWeight.medium).toBe(500);
      expect(defaultTheme.typography.fontWeight.semibold).toBe(600);
      expect(defaultTheme.typography.fontWeight.bold).toBe(700);
      expect(defaultTheme.typography.fontWeight.extrabold).toBe(800);
    });
  });

  describe('Type System', () => {
    it('should allow CSSLength values', () => {
      const values: CSSLength[] = [
        12,
        '12px',
        '1rem',
        '50%',
      ];
      expect(values).toHaveLength(4);
    });

    it('should allow SpacingValue', () => {
      const values: SpacingValue[] = [
        'xs',
        'md',
        'xl',
        12,
        '12px',
        '1rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow FontSizeValue', () => {
      const values: FontSizeValue[] = [
        'xs',
        'md',
        'xl',
        14,
        '14px',
        '0.875rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow RadiusValue', () => {
      const values: RadiusValue[] = [
        'xs',
        'md',
        'xl',
        8,
        '8px',
        '0.5rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow BreakpointValue', () => {
      const values: BreakpointValue[] = [
        'xs',
        'md',
        'xl',
        768,
        1200,
      ];
      expect(values).toHaveLength(5);
    });
  });

  describe('Type Safety', () => {
    it('should enforce PrismUITheme structure', () => {
      const theme: PrismUITheme = {
        colors: {} as any,
        palette: {
          light: {} as any,
          dark: {} as any,
        },
        typography: {
          fontFamily: 'Arial',
          fontFamilyMonospace: 'Courier',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
          },
          fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
          },
          lineHeight: {
            xs: 1.4,
            sm: 1.45,
            md: 1.5,
            lg: 1.55,
            xl: 1.6,
          },
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        radius: {
          xs: '0.125rem',
          sm: '0.25rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
        },
        shadows: {
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'none',
          xl: 'none',
        },
        breakpoints: {
          xs: 576,
          sm: 768,
          md: 992,
          lg: 1200,
          xl: 1400,
        },
        scale: 1,
      };

      expect(theme).toBeDefined();
    });

    it('should allow TokenRef as string', () => {
      const ref1: TokenRef = 'colors.blue.6';
      const ref2: TokenRef = 'spacing.md';
      const ref3: TokenRef = 'typography.fontSize.lg';

      expect(ref1).toBe('colors.blue.6');
      expect(ref2).toBe('spacing.md');
      expect(ref3).toBe('typography.fontSize.lg');
    });
  });
});
