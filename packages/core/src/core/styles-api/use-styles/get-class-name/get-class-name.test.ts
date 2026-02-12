import { describe, it, expect } from 'vitest';
import { cx } from './get-class-name';
import { getSelectorClassName } from './get-selector-class-name';
import { getStaticClassNames } from './get-static-class-names';
import { getVariantClassName } from './get-variant-class-name';
import { getRootClassName } from './get-root-class-name';
import { resolveClassNames } from './resolve-class-names';
import { getThemeClassNames } from './get-theme-class-names';
import { getClassName } from './get-class-name';
import { defaultTheme } from '../../../theme/default-theme';
import type { PrismuiTheme } from '../../../theme';

// ---------------------------------------------------------------------------
// cx
// ---------------------------------------------------------------------------

describe('cx', () => {
  it('joins multiple strings', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(cx('a', undefined, null, false, 'b')).toBe('a b');
  });

  it('flattens arrays', () => {
    expect(cx('a', ['b', 'c'], 'd')).toBe('a b c d');
  });

  it('filters undefined inside arrays', () => {
    expect(cx(['a', undefined, 'b'])).toBe('a b');
  });

  it('returns empty string for no input', () => {
    expect(cx()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getSelectorClassName
// ---------------------------------------------------------------------------

describe('getSelectorClassName', () => {
  const classes = { root: 'Button_root_abc', inner: 'Button_inner_def' };

  it('returns class for given selector', () => {
    expect(getSelectorClassName('root', classes, false)).toBe('Button_root_abc');
  });

  it('returns class for non-root selector', () => {
    expect(getSelectorClassName('inner', classes, false)).toBe('Button_inner_def');
  });

  it('returns undefined when unstyled is true', () => {
    expect(getSelectorClassName('root', classes, true)).toBeUndefined();
  });

  it('returns undefined for missing selector', () => {
    expect(getSelectorClassName('missing', classes, false)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getStaticClassNames
// ---------------------------------------------------------------------------

describe('getStaticClassNames', () => {
  it('returns static class names with prismui prefix', () => {
    expect(getStaticClassNames(['Button'], 'root')).toEqual(['prismui-Button-root']);
  });

  it('returns multiple names for multiple theme names', () => {
    expect(getStaticClassNames(['Button', 'ActionButton'], 'root')).toEqual([
      'prismui-Button-root',
      'prismui-ActionButton-root',
    ]);
  });

  it('returns static class for non-root selector', () => {
    expect(getStaticClassNames(['Button'], 'inner')).toEqual(['prismui-Button-inner']);
  });

  it('returns empty array when withStaticClass is false', () => {
    expect(getStaticClassNames(['Button'], 'root', false)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getVariantClassName
// ---------------------------------------------------------------------------

describe('getVariantClassName', () => {
  const classes = {
    root: 'Button_root',
    'root--filled': 'Button_root_filled',
    'root--outlined': 'Button_root_outlined',
  };

  it('returns variant class when variant exists', () => {
    expect(getVariantClassName('filled', classes, 'root', false)).toBe('Button_root_filled');
  });

  it('returns different variant class', () => {
    expect(getVariantClassName('outlined', classes, 'root', false)).toBe('Button_root_outlined');
  });

  it('returns undefined when unstyled', () => {
    expect(getVariantClassName('filled', classes, 'root', true)).toBeUndefined();
  });

  it('returns undefined when no variant', () => {
    expect(getVariantClassName(undefined, classes, 'root', false)).toBeUndefined();
  });

  it('returns undefined when variant class does not exist', () => {
    expect(getVariantClassName('ghost', classes, 'root', false)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getRootClassName
// ---------------------------------------------------------------------------

describe('getRootClassName', () => {
  it('returns className when selector matches rootSelector', () => {
    expect(getRootClassName('root', 'root', 'my-class')).toBe('my-class');
  });

  it('returns undefined when selector does not match', () => {
    expect(getRootClassName('root', 'inner', 'my-class')).toBeUndefined();
  });

  it('returns undefined when className is undefined', () => {
    expect(getRootClassName('root', 'root', undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resolveClassNames
// ---------------------------------------------------------------------------

describe('resolveClassNames', () => {
  const theme = defaultTheme as PrismuiTheme;

  it('resolves object classNames', () => {
    const result = resolveClassNames(theme, { root: 'a', inner: 'b' }, {}, undefined);
    expect(result).toEqual({ root: 'a', inner: 'b' });
  });

  it('resolves function classNames', () => {
    const fn = (_t: any, _p: any) => ({ root: 'from-fn' });
    const result = resolveClassNames(theme, fn, {}, undefined);
    expect(result).toEqual({ root: 'from-fn' });
  });

  it('resolves array of classNames and merges', () => {
    const result = resolveClassNames(
      theme,
      [{ root: 'a' }, { root: 'b', inner: 'c' }],
      {},
      undefined,
    );
    expect(result).toEqual({ root: 'a b', inner: 'c' });
  });

  it('handles undefined classNames', () => {
    const result = resolveClassNames(theme, undefined, {}, undefined);
    expect(result).toEqual({});
  });

  it('passes props and stylesCtx to function classNames', () => {
    const fn = (_t: any, props: any, ctx: any) => ({
      root: `${props.size}-${ctx?.variant}`,
    });
    const result = resolveClassNames(theme, fn, { size: 'lg' }, { variant: 'filled' });
    expect(result).toEqual({ root: 'lg-filled' });
  });
});

// ---------------------------------------------------------------------------
// getThemeClassNames
// ---------------------------------------------------------------------------

describe('getThemeClassNames', () => {
  it('returns theme classNames for registered component', () => {
    const theme = {
      ...defaultTheme,
      components: {
        Button: { classNames: { root: 'theme-btn-root' } },
      },
    } as PrismuiTheme;

    const result = getThemeClassNames(theme, ['Button'], 'root', {}, undefined);
    expect(result).toEqual(['theme-btn-root']);
  });

  it('returns undefined for unregistered component', () => {
    const theme = { ...defaultTheme, components: {} } as PrismuiTheme;
    const result = getThemeClassNames(theme, ['Missing'], 'root', {}, undefined);
    expect(result).toEqual([undefined]);
  });

  it('resolves function classNames from theme', () => {
    const theme = {
      ...defaultTheme,
      components: {
        Button: {
          classNames: (_t: any, _p: any) => ({ root: 'fn-root' }),
        },
      },
    } as PrismuiTheme;

    const result = getThemeClassNames(theme, ['Button'], 'root', {}, undefined);
    expect(result).toEqual(['fn-root']);
  });
});

// ---------------------------------------------------------------------------
// getClassName (integration)
// ---------------------------------------------------------------------------

describe('getClassName', () => {
  const theme = { ...defaultTheme, components: {} } as PrismuiTheme;
  const classes = {
    root: 'Btn_root',
    inner: 'Btn_inner',
    'root--filled': 'Btn_root_filled',
  };

  it('combines CSS module class + static class for root', () => {
    const result = getClassName({
      theme,
      options: undefined,
      themeName: ['Button'],
      selector: 'root',
      classNames: undefined,
      classes,
      unstyled: false,
      className: undefined,
      rootSelector: 'root',
      props: {},
      withStaticClasses: true,
    });
    expect(result).toContain('Btn_root');
    expect(result).toContain('prismui-Button-root');
  });

  it('includes user className only for root selector', () => {
    const rootResult = getClassName({
      theme,
      options: undefined,
      themeName: ['Button'],
      selector: 'root',
      classNames: undefined,
      classes,
      unstyled: false,
      className: 'my-btn',
      rootSelector: 'root',
      props: {},
    });
    expect(rootResult).toContain('my-btn');

    const innerResult = getClassName({
      theme,
      options: undefined,
      themeName: ['Button'],
      selector: 'inner',
      classNames: undefined,
      classes,
      unstyled: false,
      className: 'my-btn',
      rootSelector: 'root',
      props: {},
    });
    expect(innerResult).not.toContain('my-btn');
  });

  it('includes variant class when variant is provided via options', () => {
    const result = getClassName({
      theme,
      options: { variant: 'filled' },
      themeName: ['Button'],
      selector: 'root',
      classNames: undefined,
      classes,
      unstyled: false,
      className: undefined,
      rootSelector: 'root',
      props: {},
    });
    expect(result).toContain('Btn_root_filled');
  });

  it('skips CSS module classes when unstyled is true', () => {
    const result = getClassName({
      theme,
      options: { variant: 'filled' },
      themeName: ['Button'],
      selector: 'root',
      classNames: undefined,
      classes,
      unstyled: true,
      className: 'my-btn',
      rootSelector: 'root',
      props: {},
    });
    expect(result).not.toContain('Btn_root');
    expect(result).not.toContain('Btn_root_filled');
    expect(result).toContain('my-btn');
  });

  it('merges theme classNames + component classNames + options classNames', () => {
    const themeWithCN = {
      ...defaultTheme,
      components: {
        Button: { classNames: { root: 'theme-root' } },
      },
    } as PrismuiTheme;

    const result = getClassName({
      theme: themeWithCN,
      options: { classNames: { root: 'opts-root' } },
      themeName: ['Button'],
      selector: 'root',
      classNames: { root: 'comp-root' },
      classes,
      unstyled: false,
      className: undefined,
      rootSelector: 'root',
      props: {},
    });
    expect(result).toContain('theme-root');
    expect(result).toContain('comp-root');
    expect(result).toContain('opts-root');
  });
});
