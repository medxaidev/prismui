import { describe, it, expect } from 'vitest';
import { createTheme, deepMerge } from './create-theme';
import { defaultTheme } from './default-theme';
import type { DefaultColorFamily } from './types';

// ─────────────────────────────────────────────────────────────────
// deepMerge
// ─────────────────────────────────────────────────────────────────

describe('deepMerge', () => {
  it('returns base when override is empty', () => {
    const base = { a: 1, b: { c: 2 } };
    const result = deepMerge(base, {});
    expect(result).toEqual(base);
  });

  it('does NOT mutate base object', () => {
    const base = { a: 1, b: { c: 2 } };
    const frozen = structuredClone(base);
    deepMerge(base, { b: { c: 99 } } as any);
    expect(base).toEqual(frozen);
  });

  it('overrides top-level scalar', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 99 });
    expect(result.b).toBe(99);
    expect(result.a).toBe(1);
  });

  it('undefined override field → keeps base value', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: undefined });
    expect(result.b).toBe(2);
  });

  it('null override field → sets null (explicit clear)', () => {
    const result = deepMerge({ a: 1 }, { a: null } as any);
    expect(result.a).toBeNull();
  });

  it('recursively merges nested objects', () => {
    const base = { x: { a: 1, b: 2 } };
    const result = deepMerge(base, { x: { a: 99 } });
    expect(result.x.a).toBe(99);
    expect(result.x.b).toBe(2);
  });

  it('{} override on object → result equals base (no clear)', () => {
    const base = { x: { a: 1, b: 2 } };
    const result = deepMerge(base, { x: {} });
    expect(result.x).toEqual({ a: 1, b: 2 });
  });

  it('new key in override → added to result', () => {
    const base = { a: 1 };
    const result = deepMerge(base, { b: 2 } as any);
    expect((result as any).b).toBe(2);
  });

  it('non-object override replaces base', () => {
    const result = deepMerge({ a: { b: 1 } }, { a: 'replaced' } as any);
    expect(result.a).toBe('replaced');
  });
});

// ─────────────────────────────────────────────────────────────────
// createTheme — no overrides
// ─────────────────────────────────────────────────────────────────

describe('createTheme — no overrides', () => {
  it('returns object equivalent to defaultTheme', () => {
    const theme = createTheme();
    expect(theme.scale).toBe(defaultTheme.scale);
    expect(theme.spacing.md).toBe(defaultTheme.spacing.md);
    expect(theme.typography.fontFamily).toBe(defaultTheme.typography.fontFamily);
  });

  it('does NOT return the same reference as defaultTheme', () => {
    const theme = createTheme();
    expect(theme).not.toBe(defaultTheme);
  });

  it('internal objects are NOT shared with defaultTheme', () => {
    const theme = createTheme();
    expect(theme.typography).not.toBe(defaultTheme.typography);
    expect(theme.palette).not.toBe(defaultTheme.palette);
    expect(theme.spacing).not.toBe(defaultTheme.spacing);
  });

  it('mutating returned theme does NOT pollute defaultTheme', () => {
    const theme = createTheme();
    const original = defaultTheme.typography.fontFamily;
    (theme.typography as any).fontFamily = 'MUTATED';
    expect(defaultTheme.typography.fontFamily).toBe(original);
  });

  it('createTheme({}) is equivalent to createTheme()', () => {
    const a = createTheme();
    const b = createTheme({});
    expect(a.scale).toBe(b.scale);
    expect(a.typography.fontFamily).toBe(b.typography.fontFamily);
    expect(a.spacing.md).toBe(b.spacing.md);
  });
});

// ─────────────────────────────────────────────────────────────────
// createTheme — partial overrides
// ─────────────────────────────────────────────────────────────────

describe('createTheme — partial overrides', () => {
  it('overrides top-level scalar (scale)', () => {
    const theme = createTheme({ scale: 2 });
    expect(theme.scale).toBe(2);
    expect(theme.spacing.md).toBe(defaultTheme.spacing.md);
  });

  it('deep override: typography.fontFamily only — other typography fields preserved', () => {
    const theme = createTheme({ typography: { fontFamily: 'Inter, sans-serif' } });
    expect(theme.typography.fontFamily).toBe('Inter, sans-serif');
    expect(theme.typography.fontFamilyMonospace).toBe(defaultTheme.typography.fontFamilyMonospace);
    expect(theme.typography.fontSize.md).toBe(defaultTheme.typography.fontSize.md);
    expect(theme.typography.fontWeight.bold).toBe(defaultTheme.typography.fontWeight.bold);
  });

  it('radius partial override: md only — other radius scales preserved', () => {
    const theme = createTheme({ radius: { md: '12px' } });
    expect(theme.radius.md).toBe('12px');
    expect(theme.radius.xs).toBe(defaultTheme.radius.xs);
    expect(theme.radius.xl).toBe(defaultTheme.radius.xl);
  });

  it('spacing partial override', () => {
    const theme = createTheme({ spacing: { lg: '2rem' } });
    expect(theme.spacing.lg).toBe('2rem');
    expect(theme.spacing.md).toBe(defaultTheme.spacing.md);
  });

  it('size token partial override: sm.height only — sm.paddingX + other sizes preserved', () => {
    const theme = createTheme({ size: { sm: { height: '28px' } } });
    expect(theme.size.sm.height).toBe('28px');
    expect(theme.size.sm.paddingX).toBe(defaultTheme.size.sm.paddingX);
    expect(theme.size.md.height).toBe(defaultTheme.size.md.height);
  });

  it('state token partial override', () => {
    const theme = createTheme({ state: { disabled: { opacity: 0.3 } } });
    expect(theme.state.disabled.opacity).toBe(0.3);
    expect(theme.state.disabled.cursor).toBe(defaultTheme.state.disabled.cursor);
  });

  it('customTokens override', () => {
    const theme = createTheme({
      customTokens: { '--app-sidebar-width': '240px' },
    });
    expect(theme.customTokens?.['--app-sidebar-width']).toBe('240px');
  });

  it('multiple simultaneous overrides merged correctly', () => {
    const theme = createTheme({
      scale: 1.5,
      radius: { md: '12px' },
      typography: { fontFamily: 'Inter' },
      customTokens: { '--app-bg': '#fff' },
    });
    expect(theme.scale).toBe(1.5);
    expect(theme.radius.md).toBe('12px');
    expect(theme.radius.xs).toBe(defaultTheme.radius.xs);
    expect(theme.typography.fontFamily).toBe('Inter');
    expect(theme.typography.fontSize.md).toBe(defaultTheme.typography.fontSize.md);
    expect(theme.customTokens?.['--app-bg']).toBe('#fff');
  });
});

// ─────────────────────────────────────────────────────────────────
// createTheme — generic: custom color family
// ─────────────────────────────────────────────────────────────────

describe('createTheme — generic custom color family', () => {
  it('createTheme<MyC> with brand color family', () => {
    type MyC = DefaultColorFamily | 'brand';
    const theme = createTheme<MyC>({
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    });
    expect(theme.colors.brand[500]).toBe('#3b82f6');
    expect(theme.colors.blue[500]).toBe(defaultTheme.colors.blue[500]);
  });
});
