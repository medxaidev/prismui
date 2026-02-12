import { describe, it, expect } from 'vitest';
import { resolveStyle } from './resolve-style';
import { resolveStyles } from './resolve-styles';
import { resolveVars } from './resolve-vars';
import { getThemeStyles } from './get-theme-styles';
import { getStyle } from './get-style';
import { defaultTheme } from '../../../theme/default-theme';
import type { PrismuiTheme } from '../../../theme';

// ---------------------------------------------------------------------------
// resolveStyle
// ---------------------------------------------------------------------------

describe('resolveStyle', () => {
  const theme = defaultTheme as PrismuiTheme;

  it('returns object style as-is', () => {
    expect(resolveStyle({ color: 'red' }, theme)).toEqual({ color: 'red' });
  });

  it('resolves function style', () => {
    const fn = (t: PrismuiTheme) => ({ fontFamily: t.fontFamily });
    const result = resolveStyle(fn, theme);
    expect(result.fontFamily).toBe(theme.fontFamily);
  });

  it('resolves array of styles (merged left-to-right)', () => {
    const result = resolveStyle(
      [{ color: 'red', fontSize: 12 }, { color: 'blue' }],
      theme,
    );
    expect(result).toEqual({ color: 'blue', fontSize: 12 });
  });

  it('returns empty object for null/undefined', () => {
    expect(resolveStyle(null as any, theme)).toEqual({});
    expect(resolveStyle(undefined, theme)).toEqual({});
  });

  it('resolves mixed array of objects and functions', () => {
    const result = resolveStyle(
      [{ color: 'red' }, (t: PrismuiTheme) => ({ fontFamily: t.fontFamily })],
      theme,
    );
    expect(result.color).toBe('red');
    expect(result.fontFamily).toBe(theme.fontFamily);
  });
});

// ---------------------------------------------------------------------------
// resolveStyles
// ---------------------------------------------------------------------------

describe('resolveStyles', () => {
  const theme = defaultTheme as PrismuiTheme;

  it('resolves object styles', () => {
    const result = resolveStyles(
      theme,
      { root: { color: 'red' }, inner: { padding: 8 } },
      {},
      undefined,
    );
    expect(result.root).toEqual({ color: 'red' });
    expect(result.inner).toEqual({ padding: 8 });
  });

  it('resolves function styles', () => {
    const fn = (_t: any, props: any) => ({
      root: { fontSize: props.size === 'lg' ? 18 : 14 },
    });
    const result = resolveStyles(theme, fn, { size: 'lg' }, undefined);
    expect(result.root).toEqual({ fontSize: 18 });
  });

  it('resolves array of styles (merged)', () => {
    const result = resolveStyles(
      theme,
      [
        { root: { color: 'red' } },
        { root: { color: 'blue', padding: 4 } },
      ],
      {},
      undefined,
    );
    expect(result.root).toEqual({ color: 'blue', padding: 4 });
  });

  it('handles undefined styles', () => {
    const result = resolveStyles(theme, undefined, {}, undefined);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// resolveVars
// ---------------------------------------------------------------------------

describe('resolveVars', () => {
  const theme = { ...defaultTheme, components: {} } as PrismuiTheme;

  it('resolves varsResolver for given selector', () => {
    const varsResolver = () => ({
      root: { '--btn-color': 'red' as string | undefined },
    });
    const result = resolveVars(theme, {}, undefined, 'root', ['Button'], varsResolver, undefined);
    expect(result).toEqual({ '--btn-color': 'red' });
  });

  it('merges theme vars over varsResolver', () => {
    const themeWithVars = {
      ...defaultTheme,
      components: {
        Button: {
          vars: () => ({
            root: { '--btn-color': 'blue' as string | undefined },
          }),
        },
      },
    } as PrismuiTheme;

    const varsResolver = () => ({
      root: { '--btn-color': 'red' as string | undefined, '--btn-size': '14px' as string | undefined },
    });

    const result = resolveVars(themeWithVars, {}, undefined, 'root', ['Button'], varsResolver, undefined);
    expect(result).toEqual({ '--btn-color': 'blue', '--btn-size': '14px' });
  });

  it('user vars override theme vars', () => {
    const themeWithVars = {
      ...defaultTheme,
      components: {
        Button: {
          vars: () => ({
            root: { '--btn-color': 'blue' as string | undefined },
          }),
        },
      },
    } as PrismuiTheme;

    const userVars = () => ({
      root: { '--btn-color': 'green' as string | undefined },
    });

    const result = resolveVars(themeWithVars, {}, undefined, 'root', ['Button'], undefined, userVars);
    expect(result).toEqual({ '--btn-color': 'green' });
  });

  it('returns empty object when no vars', () => {
    const result = resolveVars(theme, {}, undefined, 'root', ['Button'], undefined, undefined);
    expect(result).toEqual({});
  });

  it('filters out undefined var values', () => {
    const varsResolver = () => ({
      root: { '--btn-color': undefined as string | undefined, '--btn-size': '14px' as string | undefined },
    });
    const result = resolveVars(theme, {}, undefined, 'root', ['Button'], varsResolver, undefined);
    expect(result).toEqual({ '--btn-size': '14px' });
  });
});

// ---------------------------------------------------------------------------
// getThemeStyles
// ---------------------------------------------------------------------------

describe('getThemeStyles', () => {
  it('returns theme styles for registered component', () => {
    const theme = {
      ...defaultTheme,
      components: {
        Button: { styles: { root: { color: 'red' } } },
      },
    } as PrismuiTheme;

    const result = getThemeStyles(theme, ['Button'], {}, undefined, 'root');
    expect(result).toEqual({ color: 'red' });
  });

  it('returns empty object for unregistered component', () => {
    const theme = { ...defaultTheme, components: {} } as PrismuiTheme;
    const result = getThemeStyles(theme, ['Missing'], {}, undefined, 'root');
    expect(result).toEqual({});
  });

  it('resolves function styles from theme', () => {
    const theme = {
      ...defaultTheme,
      components: {
        Button: {
          styles: (_t: any, props: any) => ({
            root: { fontSize: props.size === 'lg' ? 18 : 14 },
          }),
        },
      },
    } as PrismuiTheme;

    const result = getThemeStyles(theme, ['Button'], { size: 'lg' }, undefined, 'root');
    expect(result).toEqual({ fontSize: 18 });
  });

  it('merges styles from multiple theme names', () => {
    const theme = {
      ...defaultTheme,
      components: {
        Button: { styles: { root: { color: 'red' } } },
        ActionButton: { styles: { root: { fontWeight: 'bold' } } },
      },
    } as PrismuiTheme;

    const result = getThemeStyles(
      theme,
      ['Button', 'ActionButton'],
      {},
      undefined,
      'root',
    );
    expect(result).toEqual({ color: 'red', fontWeight: 'bold' });
  });
});

// ---------------------------------------------------------------------------
// getStyle (integration)
// ---------------------------------------------------------------------------

describe('getStyle', () => {
  const theme = { ...defaultTheme, components: {} } as PrismuiTheme;

  it('merges theme styles + component styles + root style', () => {
    const themeWithStyles = {
      ...defaultTheme,
      components: {
        Button: { styles: { root: { color: 'theme-red' } } },
      },
    } as PrismuiTheme;

    const result = getStyle({
      theme: themeWithStyles,
      themeName: ['Button'],
      selector: 'root',
      rootSelector: 'root',
      options: undefined,
      props: {},
      stylesCtx: undefined,
      styles: { root: { padding: 8 } },
      style: { margin: 4 },
      vars: undefined,
      varsResolver: undefined,
    });

    expect(result.color).toBe('theme-red');
    expect(result.padding).toBe(8);
    expect(result.margin).toBe(4);
  });

  it('does not apply root style to non-root selector', () => {
    const result = getStyle({
      theme,
      themeName: ['Button'],
      selector: 'inner',
      rootSelector: 'root',
      options: undefined,
      props: {},
      stylesCtx: undefined,
      styles: { inner: { padding: 8 } },
      style: { margin: 4 },
      vars: undefined,
      varsResolver: undefined,
    });

    expect(result.padding).toBe(8);
    expect(result.margin).toBeUndefined();
  });

  it('includes options.style for any selector', () => {
    const result = getStyle({
      theme,
      themeName: ['Button'],
      selector: 'inner',
      rootSelector: 'root',
      options: { style: { border: '1px solid' } },
      props: {},
      stylesCtx: undefined,
      styles: undefined,
      style: undefined,
      vars: undefined,
      varsResolver: undefined,
    });

    expect(result.border).toBe('1px solid');
  });

  it('includes CSS variables from varsResolver', () => {
    const varsResolver = () => ({
      root: { '--btn-height': '36px' as string | undefined },
    });

    const result = getStyle({
      theme,
      themeName: ['Button'],
      selector: 'root',
      rootSelector: 'root',
      options: undefined,
      props: {},
      stylesCtx: undefined,
      styles: undefined,
      style: undefined,
      vars: undefined,
      varsResolver: varsResolver as any,
    });

    expect((result as any)['--btn-height']).toBe('36px');
  });
});
