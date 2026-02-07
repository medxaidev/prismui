import { describe, expect, it, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { CssBaseline } from './CssBaseline';
import { BASELINE_CSS } from './baseline-css';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { __resetInsertedCacheForTesting } from '../style-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStyleEngineEl(): HTMLStyleElement | null {
  return document.head.querySelector(
    'style[data-prismui-style-engine]',
  ) as HTMLStyleElement | null;
}

function getInjectedCssText(): string {
  const el = getStyleEngineEl();
  if (!el) return '';
  if (el.sheet) {
    return Array.from(el.sheet.cssRules)
      .map((r: CSSRule) => r.cssText)
      .join('\n');
  }
  return el.textContent ?? '';
}

// ---------------------------------------------------------------------------
// BASELINE_CSS constant
// ---------------------------------------------------------------------------

describe('BASELINE_CSS', () => {
  it('contains color-scheme rule', () => {
    expect(BASELINE_CSS).toContain('color-scheme: var(--prismui-scheme)');
  });

  it('contains box-sizing reset', () => {
    expect(BASELINE_CSS).toContain('box-sizing: border-box');
  });

  it('contains body font-family via CSS variable', () => {
    expect(BASELINE_CSS).toContain('font-family: var(--prismui-font-family)');
  });

  it('contains body background-color via CSS variable', () => {
    expect(BASELINE_CSS).toContain('background-color: var(--prismui-background-default)');
  });

  it('contains body color via CSS variable', () => {
    expect(BASELINE_CSS).toContain('color: var(--prismui-text-primary)');
  });

  it('contains font-smoothing', () => {
    expect(BASELINE_CSS).toContain('-webkit-font-smoothing: antialiased');
    expect(BASELINE_CSS).toContain('-moz-osx-font-smoothing: grayscale');
  });

  it('contains typography reset (h1-h6, p margin: 0)', () => {
    expect(BASELINE_CSS).toContain('h1, h2, h3, h4, h5, h6, p');
    expect(BASELINE_CSS).toContain('margin: 0');
  });

  it('contains link reset', () => {
    expect(BASELINE_CSS).toContain('color: inherit');
    expect(BASELINE_CSS).toContain('text-decoration: inherit');
  });

  it('contains media element reset', () => {
    expect(BASELINE_CSS).toContain('img, svg, video, canvas, audio, iframe, embed, object');
    expect(BASELINE_CSS).toContain('max-width: 100%');
  });

  it('contains form element reset', () => {
    expect(BASELINE_CSS).toContain('font: inherit');
  });

  it('contains number input spinner removal', () => {
    expect(BASELINE_CSS).toContain('input[type="number"]');
    expect(BASELINE_CSS).toContain('-moz-appearance: textfield');
  });

  it('contains focus-visible with primary color variable', () => {
    expect(BASELINE_CSS).toContain(':focus-visible');
    expect(BASELINE_CSS).toContain('outline: 2px solid var(--prismui-primary-main)');
  });

  it('does not contain palette- prefix in variable names', () => {
    expect(BASELINE_CSS).not.toContain('--prismui-palette-');
  });
});

// ---------------------------------------------------------------------------
// CssBaseline component
// ---------------------------------------------------------------------------

describe('CssBaseline', () => {
  beforeEach(() => {
    document.head.querySelectorAll('style').forEach((el) => el.remove());
    __resetInsertedCacheForTesting();
  });

  it('injects baseline CSS into the document', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={false}>
          <CssBaseline />
        </PrismuiProvider>,
      );
    });

    const css = getInjectedCssText();
    expect(css).toContain('box-sizing');
  });

  it('injects baseline via PrismuiProvider withCssBaseline', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={true}>
          <div />
        </PrismuiProvider>,
      );
    });

    const css = getInjectedCssText();
    expect(css).toContain('box-sizing');
  });

  it('does not inject baseline when withCssBaseline is false', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={false}>
          <div />
        </PrismuiProvider>,
      );
    });

    const el = getStyleEngineEl();
    // Either no style element at all, or it doesn't contain baseline rules
    if (el) {
      const css = getInjectedCssText();
      expect(css).not.toContain('box-sizing');
    } else {
      expect(el).toBeNull();
    }
  });

  it('deduplicates baseline injection (only one copy)', async () => {
    await act(async () => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={false}>
          <CssBaseline />
          <CssBaseline />
        </PrismuiProvider>,
      );
    });

    const el = getStyleEngineEl();
    expect(el).not.toBeNull();
    // Count occurrences of box-sizing in the injected CSS
    const css = getInjectedCssText();
    const matches = css.match(/box-sizing/g);
    // Should appear exactly once (deduplicated)
    expect(matches?.length).toBe(1);
  });
});
