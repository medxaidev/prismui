import { describe, expect, it } from 'vitest';
import { resolveSystemProps } from './resolve-system-props';
import { defaultTheme } from '../../theme/default-theme';

const theme = defaultTheme as any;

function getInjectedCssText() {
  const styleEl = document.head.querySelector(
    'style[data-prismui-style-engine="true"]'
  ) as HTMLStyleElement | null;

  const sheet = styleEl?.sheet as CSSStyleSheet | null;
  if (!sheet) return '';

  return Array.from(sheet.cssRules)
    .map((r) => (r as CSSRule).cssText)
    .join('\n');
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('resolveSystemProps', () => {
  it('returns empty inlineStyles when no system props provided', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: {},
    });
    expect(result.hasResponsiveStyles).toBe(false);
    expect(result.inlineStyles).toEqual({});
    expect(result.className).toBeUndefined();
  });

  it('resolves non-responsive m=2 to inline margin', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { m: 2 },
    });
    expect(result.hasResponsiveStyles).toBe(false);
    // 2 * 4 (spacingUnit) = 8px = 0.5rem => scaled
    expect(result.inlineStyles.margin).toBe('calc(0.5rem * var(--prismui-scale))');
  });

  it('resolves token m="md" to inline margin via CSS var', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { m: 'md' as any },
    });
    expect(result.hasResponsiveStyles).toBe(false);
    expect(result.inlineStyles.margin).toBe('var(--prismui-spacing-md)');
  });

  it('resolves negative token m="-md" to calc(var * -1)', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { m: '-md' as any },
    });
    expect(result.inlineStyles.margin).toBe('calc(var(--prismui-spacing-md) * -1)');
  });

  it('resolves multiple non-responsive props', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { m: 2, p: 4, display: 'flex' as any },
    });
    expect(result.hasResponsiveStyles).toBe(false);
    expect(result.inlineStyles.margin).toBe('calc(0.5rem * var(--prismui-scale))');
    expect(result.inlineStyles.padding).toBe('calc(1rem * var(--prismui-scale))');
    expect(result.inlineStyles.display).toBe('flex');
  });

  it('resolves bdrs="theme" to var(--prismui-radius-md)', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { bdrs: 'theme' as any },
    });
    expect(result.inlineStyles.borderRadius).toBe('var(--prismui-radius-md)');
  });

  it('resolves fz="base" to var(--prismui-font-size)', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { fz: 'base' as any },
    });
    expect(result.inlineStyles.fontSize).toBe('var(--prismui-font-size)');
  });

  it('resolves ff="mono" to var(--prismui-font-family-monospace)', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { ff: 'mono' as any },
    });
    expect(result.inlineStyles.fontFamily).toBe('var(--prismui-font-family-monospace)');
  });

  it('resolves lh="base" to var(--prismui-line-height-md)', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: { lh: 'base' as any },
    });
    expect(result.inlineStyles.lineHeight).toBe('var(--prismui-line-height-md)');
  });
});

describe('resolveSystemProps (mobile-first responsive)', () => {
  it('generates min-width media queries for responsive values with explicit base', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: {
        m: { base: 2, md: 4 } as any,
      },
    });

    expect(result.hasResponsiveStyles).toBe(true);
    expect(result.className).toBeTruthy();

    const cssText = getInjectedCssText();
    const cn = escapeRegExp(result.className!);

    // Base style (no media query)
    expect(cssText).toMatch(
      new RegExp(`\\.${cn}\\s*\\{[^}]*margin:\\s*calc\\(0\\.5rem\\s*\\*\\s*var\\(--prismui-scale\\)\\)`, 'i')
    );

    // md override via min-width
    expect(cssText).toMatch(
      new RegExp(
        `@media\\s*\\(min-width:\\s*62rem\\)\\s*\\{[^}]*\\.${cn}[^}]*margin:\\s*calc\\(1rem\\s*\\*\\s*var\\(--prismui-scale\\)\\)`
      )
    );
  });

  it('generates multiple min-width queries sorted ascending', () => {
    const result = resolveSystemProps({
      theme,
      styleProps: {
        m: { base: 1, sm: 3, lg: 6 } as any,
      },
    });

    expect(result.hasResponsiveStyles).toBe(true);

    const cssText = getInjectedCssText();

    // sm (48rem) should appear before lg (75rem)
    const smIndex = cssText.indexOf('min-width: 48rem');
    const lgIndex = cssText.indexOf('min-width: 75rem');
    expect(smIndex).toBeGreaterThan(-1);
    expect(lgIndex).toBeGreaterThan(-1);
    expect(smIndex).toBeLessThan(lgIndex);
  });

  it('falls back to smallest breakpoint as base when base is not explicit', () => {
    // Not recommended per spec, but should still work gracefully
    const result = resolveSystemProps({
      theme,
      styleProps: {
        m: { sm: 2, md: 4 } as any,
      },
    });

    expect(result.hasResponsiveStyles).toBe(true);
    expect(result.className).toBeTruthy();

    const cssText = getInjectedCssText();
    const cn = escapeRegExp(result.className!);

    // sm becomes base (no media query), md becomes min-width override
    expect(cssText).toMatch(
      new RegExp(`\\.${cn}\\s*\\{[^}]*margin:\\s*calc\\(0\\.5rem\\s*\\*\\s*var\\(--prismui-scale\\)\\)`, 'i')
    );
    expect(cssText).toMatch(
      new RegExp(`@media\\s*\\(min-width:\\s*62rem\\)`)
    );
  });

  it('deduplicates identical responsive CSS (same class reused)', () => {
    const r1 = resolveSystemProps({
      theme,
      styleProps: { m: { base: 2, sm: 6 } as any },
    });
    const r2 = resolveSystemProps({
      theme,
      styleProps: { m: { base: 2, sm: 6 } as any },
    });

    expect(r1.className).toBe(r2.className);
  });
});
