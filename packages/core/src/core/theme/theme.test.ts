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

    it('should use rem for radius (and px for full)', () => {
      expect(defaultTheme.radius.xs).toBe('0.25rem');
      expect(defaultTheme.radius.sm).toBe('0.375rem');
      expect(defaultTheme.radius.md).toBe('0.5rem');
      expect(defaultTheme.radius.lg).toBe('0.75rem');
      expect(defaultTheme.radius.xl).toBe('1rem');
      expect(defaultTheme.radius.full).toBe('9999px');
    });

    it('should have numeric breakpoints (px values as numbers)', () => {
      expect(defaultTheme.breakpoints.xs).toBe(576);
      expect(defaultTheme.breakpoints.sm).toBe(768);
      expect(defaultTheme.breakpoints.md).toBe(992);
      expect(defaultTheme.breakpoints.lg).toBe(1200);
      expect(defaultTheme.breakpoints.xl).toBe(1400);
    });

    it('should have transition duration tokens', () => {
      expect(defaultTheme.transition.duration.fast).toBe('120ms');
      expect(defaultTheme.transition.duration.base).toBe('150ms');
      expect(defaultTheme.transition.duration.slow).toBe('200ms');
    });

    it('should have transition easing tokens', () => {
      expect(defaultTheme.transition.easing.standard).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(defaultTheme.transition.easing.in).toBe('cubic-bezier(0.4, 0, 1, 1)');
      expect(defaultTheme.transition.easing.out).toBe('cubic-bezier(0, 0, 0.2, 1)');
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
          xs: '0.25rem',
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px',
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
        transition: {
          duration: { fast: '120ms', base: '150ms', slow: '200ms' },
          easing: {
            standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        size: {
          xs: { height: '24px', paddingX:  '8px', fontSize: '12px', slotSize: '14px', innerGap:  '4px' },
          sm: { height: '30px', paddingX: '10px', fontSize: '13px', slotSize: '16px', innerGap:  '6px' },
          md: { height: '36px', paddingX: '12px', fontSize: '14px', slotSize: '18px', innerGap:  '8px' },
          lg: { height: '42px', paddingX: '14px', fontSize: '15px', slotSize: '20px', innerGap: '10px' },
          xl: { height: '48px', paddingX: '16px', fontSize: '16px', slotSize: '22px', innerGap: '12px' },
        },
        state: {
          disabled: { opacity: 0.5, cursor: 'not-allowed' },
        },
        focusPointerHalo: {
          width: '2px',
          color: 'rgba(0, 0, 0, 0.16)',
        },
        focusRing: {
          width: '2px',
          offset: '2px',
          color: 'var(--prismui-color-primary)',
        },
        scale: 1,
        textRoles: {
          primary:   { semantic: 'neutral', role: 'high', field: 'fg' },
          secondary: { semantic: 'neutral', role: 'low',  field: 'fg' },
          disabled:  { semantic: 'neutral', role: 'low',  field: 'fg' },
          danger:    { semantic: 'error',   role: 'high', field: 'bg' },
          warning:   { semantic: 'warning', role: 'high', field: 'bg' },
          success:   { semantic: 'success', role: 'high', field: 'bg' },
          info:      { semantic: 'info',    role: 'high', field: 'bg' },
        },
        zIndex: {
          tooltip: 1500,
          popover: 1300,
          modal: 1400,
          toast: 1600,
        },
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
