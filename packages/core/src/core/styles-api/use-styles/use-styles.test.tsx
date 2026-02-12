import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { useStyles } from './use-styles';
import type { PrismuiThemeComponents } from '../../theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper(components: PrismuiThemeComponents = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PrismuiProvider theme={{ components }}>
        {children}
      </PrismuiProvider>
    );
  };
}

const classes: Record<string, string> = {
  root: 'Btn_root_abc',
  inner: 'Btn_inner_def',
  'root--filled': 'Btn_root_filled',
  'root--outlined': 'Btn_root_outlined',
};

function useTestStyles(overrides: Record<string, any> = {}) {
  return useStyles({
    name: 'Button',
    classes,
    props: {},
    ...overrides,
  } as any);
}

// ---------------------------------------------------------------------------
// useStyles — basic getStyles() behavior
// ---------------------------------------------------------------------------

describe('useStyles', () => {
  // ---- CSS Module class ----

  it('returns CSS module class for root selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root').className).toContain('Btn_root_abc');
  });

  it('returns CSS module class for non-root selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('inner').className).toContain('Btn_inner_def');
  });

  it('returns empty style object when no styles configured', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root').style).toEqual({});
  });

  // ---- Static class names ----

  it('includes static class name (prismui-Button-root)', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root').className).toContain('prismui-Button-root');
  });

  it('includes static class for inner selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('inner').className).toContain('prismui-Button-inner');
  });

  it('supports multiple theme names', () => {
    const { result } = renderHook(
      () => useTestStyles({ name: ['Button', 'ActionButton'] }),
      { wrapper: createWrapper() },
    );
    const cn = result.current('root').className;
    expect(cn).toContain('prismui-Button-root');
    expect(cn).toContain('prismui-ActionButton-root');
  });

  // ---- unstyled ----

  it('skips CSS module classes when unstyled is true', () => {
    const { result } = renderHook(
      () => useTestStyles({ unstyled: true }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').className).not.toContain('Btn_root_abc');
  });

  it('skips variant class when unstyled is true', () => {
    const { result } = renderHook(
      () => useTestStyles({ unstyled: true }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root', { variant: 'filled' }).className).not.toContain('Btn_root_filled');
  });

  it('still includes user className when unstyled', () => {
    const { result } = renderHook(
      () => useTestStyles({ unstyled: true, className: 'my-btn' }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').className).toContain('my-btn');
  });

  // ---- className (root only) ----

  it('includes className only for root selector', () => {
    const { result } = renderHook(
      () => useTestStyles({ className: 'user-class' }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').className).toContain('user-class');
    expect(result.current('inner').className).not.toContain('user-class');
  });

  it('includes className for custom rootSelector', () => {
    const { result } = renderHook(
      () => useTestStyles({ className: 'user-class', rootSelector: 'inner' }),
      { wrapper: createWrapper() },
    );
    expect(result.current('inner').className).toContain('user-class');
    expect(result.current('root').className).not.toContain('user-class');
  });

  it('does not include className for non-root selectors', () => {
    const { result } = renderHook(
      () => useTestStyles({ className: 'user-class' }),
      { wrapper: createWrapper() },
    );
    expect(result.current('inner').className).not.toContain('user-class');
  });

  // ---- variant ----

  it('includes variant class from options', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root', { variant: 'filled' }).className).toContain('Btn_root_filled');
  });

  it('includes different variant class', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root', { variant: 'outlined' }).className).toContain('Btn_root_outlined');
  });

  it('does not include variant class for missing variant', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('root', { variant: 'ghost' }).className).not.toContain('ghost');
  });

  // ---- classNames (component-level) ----

  it('includes component-level classNames', () => {
    const { result } = renderHook(
      () => useTestStyles({ classNames: { root: 'comp-root', inner: 'comp-inner' } }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').className).toContain('comp-root');
    expect(result.current('inner').className).toContain('comp-inner');
  });

  it('includes function classNames', () => {
    const { result } = renderHook(
      () => useTestStyles({
        props: { size: 'lg' },
        classNames: (_t: any, props: any) => ({ root: `size-${props.size}` }),
      }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').className).toContain('size-lg');
  });

  it('merges component classNames with theme classNames', () => {
    const wrapper = createWrapper({ Button: { classNames: { root: 'theme-root' } } });
    const { result } = renderHook(
      () => useTestStyles({ classNames: { root: 'comp-root' } }),
      { wrapper },
    );
    const cn = result.current('root').className;
    expect(cn).toContain('theme-root');
    expect(cn).toContain('comp-root');
  });

  // ---- theme classNames ----

  it('includes theme classNames for registered component', () => {
    const wrapper = createWrapper({ Button: { classNames: { root: 'theme-btn' } } });
    const { result } = renderHook(() => useTestStyles(), { wrapper });
    expect(result.current('root').className).toContain('theme-btn');
  });

  it('includes theme function classNames', () => {
    const wrapper = createWrapper({
      Button: { classNames: (_t: any, _p: any) => ({ root: 'theme-fn-root' }) },
    });
    const { result } = renderHook(() => useTestStyles(), { wrapper });
    expect(result.current('root').className).toContain('theme-fn-root');
  });

  it('does not include theme classNames for unregistered component', () => {
    const wrapper = createWrapper({ Card: { classNames: { root: 'card-root' } } });
    const { result } = renderHook(() => useTestStyles(), { wrapper });
    expect(result.current('root').className).not.toContain('card-root');
  });

  // ---- styles (inline style merging) ----

  it('includes component-level styles', () => {
    const { result } = renderHook(
      () => useTestStyles({ styles: { root: { color: 'red' } } }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').style).toEqual({ color: 'red' });
  });

  it('includes theme styles', () => {
    const wrapper = createWrapper({ Button: { styles: { root: { padding: 8 } } } });
    const { result } = renderHook(() => useTestStyles(), { wrapper });
    expect(result.current('root').style).toEqual({ padding: 8 });
  });

  it('component styles override theme styles', () => {
    const wrapper = createWrapper({ Button: { styles: { root: { color: 'blue', padding: 8 } } } });
    const { result } = renderHook(
      () => useTestStyles({ styles: { root: { color: 'red' } } }),
      { wrapper },
    );
    const s = result.current('root').style;
    expect(s.color).toBe('red');
    expect(s.padding).toBe(8);
  });

  // ---- root style ----

  it('includes root style only for root selector', () => {
    const { result } = renderHook(
      () => useTestStyles({ style: { margin: 4 } }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').style.margin).toBe(4);
    expect(result.current('inner').style.margin).toBeUndefined();
  });

  it('resolves function root style', () => {
    const { result } = renderHook(
      () => useTestStyles({ style: (t: any) => ({ fontFamily: t.fontFamily }) }),
      { wrapper: createWrapper() },
    );
    expect(result.current('root').style.fontFamily).toBeTruthy();
  });

  it('resolves array root style', () => {
    const { result } = renderHook(
      () => useTestStyles({ style: [{ color: 'red' }, { padding: 4 }] }),
      { wrapper: createWrapper() },
    );
    const s = result.current('root').style;
    expect(s.color).toBe('red');
    expect(s.padding).toBe(4);
  });

  // ---- varsResolver ----

  it('includes CSS variables from varsResolver', () => {
    const varsResolver = () => ({ root: { '--btn-height': '36px' } });
    const { result } = renderHook(
      () => useTestStyles({ varsResolver }),
      { wrapper: createWrapper() },
    );
    expect((result.current('root').style as any)['--btn-height']).toBe('36px');
  });

  it('theme vars override varsResolver', () => {
    const wrapper = createWrapper({
      Button: { vars: () => ({ root: { '--btn-height': '48px' } }) },
    });
    const varsResolver = () => ({ root: { '--btn-height': '36px' } });
    const { result } = renderHook(
      () => useTestStyles({ varsResolver }),
      { wrapper },
    );
    expect((result.current('root').style as any)['--btn-height']).toBe('48px');
  });

  it('user vars override theme vars', () => {
    const wrapper = createWrapper({
      Button: { vars: () => ({ root: { '--btn-height': '48px' } }) },
    });
    const userVars = () => ({ root: { '--btn-height': '24px' } });
    const { result } = renderHook(
      () => useTestStyles({ vars: userVars }),
      { wrapper },
    );
    expect((result.current('root').style as any)['--btn-height']).toBe('24px');
  });

  // ---- options.className / options.style ----

  it('includes options.className for any selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('inner', { className: 'opts-class' }).className).toContain('opts-class');
  });

  it('includes options.style for any selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(result.current('inner', { style: { border: '1px solid' } }).style.border).toBe('1px solid');
  });

  it('includes options.classNames per selector', () => {
    const { result } = renderHook(() => useTestStyles(), { wrapper: createWrapper() });
    expect(
      result.current('root', { classNames: { root: 'opts-root' } }).className,
    ).toContain('opts-root');
  });
});
