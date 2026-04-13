import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useComponentStylingInput } from './use-component-styling-input';
import { PrismUIProvider } from '../theme/provider/PrismUIProvider';
import { createTheme } from '../theme/create-theme';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

type Result = ReturnType<typeof useComponentStylingInput>;

function StylingInputReadout({
  componentName,
  propsClassNames,
  propsStyles,
  propsVars,
  onResult,
}: {
  componentName: string;
  propsClassNames?: Record<string, string>;
  propsStyles?: Record<string, React.CSSProperties>;
  propsVars?: Record<string, string | number>;
  onResult: (r: Result) => void;
}) {
  const result = useComponentStylingInput(componentName, propsClassNames, propsStyles, propsVars);
  onResult(result);
  return null;
}

function renderWithTheme(
  theme: ReturnType<typeof createTheme>,
  componentName: string,
  propsClassNames?: Record<string, string>,
  propsStyles?: Record<string, React.CSSProperties>,
  propsVars?: Record<string, string | number>,
): Result {
  let captured: Result = { classNames: undefined, styles: undefined, themeVars: undefined, vars: undefined };
  render(
    <PrismUIProvider theme={theme}>
      <StylingInputReadout
        componentName={componentName}
        propsClassNames={propsClassNames}
        propsStyles={propsStyles}
        propsVars={propsVars}
        onResult={(r) => { captured = r; }}
      />
    </PrismUIProvider>,
  );
  return captured;
}

const baseTheme = createTheme({});

// ─────────────────────────────────────────────────────────────────
// Fast path (bail-out)
// ─────────────────────────────────────────────────────────────────

describe('useComponentStylingInput — fast path', () => {
  it('no theme config, no props → all undefined', () => {
    const result = renderWithTheme(baseTheme, 'Button');
    expect(result).toEqual({ classNames: undefined, styles: undefined, themeVars: undefined, vars: undefined });
  });

  it('only theme classNames, no styles → styles: undefined', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'theme-root' } } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.styles).toBeUndefined();
    expect(result.classNames).toEqual({ root: 'theme-root' });
  });

  it('only props styles, no classNames → classNames: undefined', () => {
    const result = renderWithTheme(baseTheme, 'Button', undefined, { root: { opacity: 0.5 } });
    expect(result.classNames).toBeUndefined();
    expect(result.styles).toEqual({ root: { opacity: 0.5 } });
  });

  it('theme.components is undefined → no throw, returns fast-path', () => {
    const theme = createTheme({});
    const result = renderWithTheme(theme, 'NonExistent');
    expect(result).toEqual({ classNames: undefined, styles: undefined, themeVars: undefined, vars: undefined });
  });
});

// ─────────────────────────────────────────────────────────────────
// classNames merge — dual-path write
// ─────────────────────────────────────────────────────────────────

describe('useComponentStylingInput — classNames merge', () => {
  it('same slot: cx(theme, props) → both classes present', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'theme-root' } } },
    });
    const result = renderWithTheme(theme, 'Button', { root: 'user-root' });
    expect(result.classNames!.root).toContain('theme-root');
    expect(result.classNames!.root).toContain('user-root');
  });

  it('different slots: each slot is independent', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'a' } } },
    });
    const result = renderWithTheme(theme, 'Button', { label: 'b' });
    expect(result.classNames).toEqual({ root: 'a', label: 'b' });
  });

  it('only props classNames (no theme) → uses props value directly', () => {
    const result = renderWithTheme(baseTheme, 'Button', { root: 'user-only' });
    expect(result.classNames).toEqual({ root: 'user-only' });
  });

  it('only theme classNames (no props) → uses theme value directly', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'theme-only' } } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.classNames).toEqual({ root: 'theme-only' });
  });

  it("props.classNames[slot] = '' (empty string) → theme class preserved (design constraint)", () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'theme-root' } } },
    });
    const result = renderWithTheme(theme, 'Button', { root: '' });
    // cx('theme-root', '') → 'theme-root'; empty string does not clear theme class
    expect(result.classNames!.root).toBe('theme-root');
  });

  it('both sides undefined for a slot → slot removed, not written as empty string', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: undefined as any } } },
    });
    const result = renderWithTheme(theme, 'Button', { root: undefined as any });
    // cx(undefined, undefined) → '' → slot deleted
    expect(result.classNames).toBeUndefined();
  });

  it('all slots produce empty cx → classNames: undefined', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: '' } } },
    });
    const result = renderWithTheme(theme, 'Button', { root: '' });
    expect(result.classNames).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// styles merge — dual-path write + undefined-value strip
// ─────────────────────────────────────────────────────────────────

describe('useComponentStylingInput — styles merge', () => {
  it('same slot, different keys → theme-only key preserved, props key added', () => {
    const theme = createTheme({
      components: { Button: { styles: { root: { opacity: 0.5 } } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, { root: { color: 'red' } });
    expect(result.styles!.root).toEqual({ opacity: 0.5, color: 'red' });
  });

  it('same slot, same key → props value wins', () => {
    const theme = createTheme({
      components: { Button: { styles: { root: { opacity: 0.5 } } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, { root: { opacity: 0.9 } });
    expect(result.styles!.root).toEqual({ opacity: 0.9 });
  });

  it('different slots → each slot is independent', () => {
    const theme = createTheme({
      components: { Button: { styles: { root: { opacity: 0.5 } } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, { label: { color: 'blue' } });
    expect(result.styles!.root).toEqual({ opacity: 0.5 });
    expect(result.styles!.label).toEqual({ color: 'blue' });
  });

  it('props.styles[slot] = { opacity: undefined } → undefined is stripped, slot not written if empty', () => {
    const theme = createTheme({
      components: { Button: { styles: { root: { opacity: 0.5 } } } },
    });
    // opacity: undefined overrides theme opacity, but gets stripped → merged = {}
    // After stripping, merged = {} → slot not written
    const result = renderWithTheme(theme, 'Button', undefined, {
      root: { opacity: undefined },
    });
    // The merged result has opacity stripped → empty → root slot not written
    // theme pass1 wrote { opacity: 0.5 }, but pass2 overrides with { opacity: undefined }
    // After strip: {} → root not written; but theme value was already overwritten in pass2
    // So root is removed entirely — no <div style="opacity: undefined">
    expect(result.styles?.root).toBeUndefined();
  });

  it('themeStyles = {}, propsStyles = {} → styles: undefined', () => {
    const theme = createTheme({
      components: { Button: { styles: {} } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, {});
    expect(result.styles).toBeUndefined();
  });

  it('merged slot is empty object {} → slot not written', () => {
    const theme = createTheme({
      components: { Button: { styles: { root: {} } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, { root: {} });
    // Both sides are empty; merged = {} → not written
    expect(result.styles).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// vars — dual-channel (Stage 8.2)
// ─────────────────────────────────────────────────────────────────

describe('useComponentStylingInput — vars dual-channel', () => {
  it('fast path: no theme vars, no props vars → themeVars: undefined, vars: undefined', () => {
    const result = renderWithTheme(baseTheme, 'Button');
    expect(result.themeVars).toBeUndefined();
    expect(result.vars).toBeUndefined();
  });

  it('only theme vars → themeVars set, vars: undefined', () => {
    const theme = createTheme({
      components: { Button: { vars: { '--btn-h': '40px' } } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.themeVars).toEqual({ '--btn-h': '40px' });
    expect(result.vars).toBeUndefined();
  });

  it('only props vars → themeVars: undefined, vars set', () => {
    const result = renderWithTheme(baseTheme, 'Button', undefined, undefined, { '--btn-h': '60px' });
    expect(result.themeVars).toBeUndefined();
    expect(result.vars).toEqual({ '--btn-h': '60px' });
  });

  it('dual-channel independence: same key in both — NOT merged', () => {
    const theme = createTheme({
      components: { Button: { vars: { '--btn-h': '40px' } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, undefined, { '--btn-h': '60px' });
    expect(result.themeVars).toEqual({ '--btn-h': '40px' });
    expect(result.vars).toEqual({ '--btn-h': '60px' });
  });

  it('dual-channel independence: different keys — each preserved independently', () => {
    const theme = createTheme({
      components: { Button: { vars: { '--btn-h': '40px' } } },
    });
    const result = renderWithTheme(theme, 'Button', undefined, undefined, { '--btn-color': 'red' });
    expect(result.themeVars).toEqual({ '--btn-h': '40px' });
    expect(result.vars).toEqual({ '--btn-color': 'red' });
  });

  it('themeVars empty guard: theme.vars = {} → themeVars: undefined', () => {
    const theme = createTheme({
      components: { Button: { vars: {} } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.themeVars).toBeUndefined();
  });

  it('propsVars empty guard: props.vars = {} → vars: undefined', () => {
    const result = renderWithTheme(baseTheme, 'Button', undefined, undefined, {});
    expect(result.vars).toBeUndefined();
  });

  it('independent bail-out: classNames present, no vars → themeVars/vars: undefined', () => {
    const theme = createTheme({
      components: { Button: { classNames: { root: 'theme-root' } } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.classNames).toBeDefined();
    expect(result.themeVars).toBeUndefined();
    expect(result.vars).toBeUndefined();
  });

  it('independent bail-out: vars present, no classNames/styles → classNames/styles: undefined', () => {
    const theme = createTheme({
      components: { Button: { vars: { '--btn-h': '40px' } } },
    });
    const result = renderWithTheme(theme, 'Button');
    expect(result.classNames).toBeUndefined();
    expect(result.styles).toBeUndefined();
    expect(result.themeVars).toEqual({ '--btn-h': '40px' });
  });
});
