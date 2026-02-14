import { describe, it, expect } from 'vitest';
import { defaultVariantColorsResolver } from './default-variant-colors-resolver';
import { defaultTheme } from '../default-theme';
import { createTheme } from '../create-theme';
import type { PrismuiTheme } from '../types';
import type { VariantColorResolverInput } from './variant-color-resolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const theme = createTheme() as PrismuiTheme;

function resolve(
  variant: VariantColorResolverInput['variant'],
  color: string,
  scheme: 'light' | 'dark' = 'light',
) {
  return defaultVariantColorsResolver({ variant, color, theme, scheme });
}

// ---------------------------------------------------------------------------
// Solid variant
// ---------------------------------------------------------------------------

describe('defaultVariantColorsResolver — solid', () => {
  it('inherit: gray-800 bg, white text, gray-700 hover', () => {
    const result = resolve('solid', 'inherit');
    expect(result.background).toBe(theme.colorFamilies.gray[800]);
    expect(result.color).toContain('--prismui-common-white');
    expect(result.hoverBackground).toBe(theme.colorFamilies.gray[700]);
    expect(result.hoverShadow).toContain('--prismui-shadow-sm');
    expect(result.border).toBe('none');
  });

  it('primary: uses semantic CSS variables', () => {
    const result = resolve('solid', 'primary');
    expect(result.background).toBe('var(--prismui-primary-main)');
    expect(result.color).toBe('var(--prismui-primary-contrastText)');
    expect(result.hoverBackground).toBe('var(--prismui-primary-dark)');
    expect(result.hoverShadow).toBe('var(--prismui-shadow-primary)');
    expect(result.border).toBe('none');
  });

  it('secondary: uses semantic CSS variables', () => {
    const result = resolve('solid', 'secondary');
    expect(result.background).toBe('var(--prismui-secondary-main)');
    expect(result.color).toBe('var(--prismui-secondary-contrastText)');
    expect(result.hoverBackground).toBe('var(--prismui-secondary-dark)');
  });

  it('neutral: uses semantic CSS variables', () => {
    const result = resolve('solid', 'neutral');
    expect(result.background).toBe('var(--prismui-neutral-main)');
    expect(result.color).toBe('var(--prismui-neutral-contrastText)');
    expect(result.hoverBackground).toBe('var(--prismui-neutral-dark)');
  });

  it('blue (color family): uses resolved shade values', () => {
    const result = resolve('solid', 'blue');
    // Light scheme: center=5 → shade 500
    expect(result.background).toBe(theme.colorFamilies.blue[500]);
    // Hover: center+2=7 → shade 700
    expect(result.hoverBackground).toBe(theme.colorFamilies.blue[700]);
    expect(result.color).toContain('--prismui-common-white');
    expect(result.hoverShadow).toContain('0 8px 16px 0');
  });

  it('blue (dark scheme): uses shade 600', () => {
    const result = resolve('solid', 'blue', 'dark');
    // Dark scheme: center=6 → shade 600
    expect(result.background).toBe(theme.colorFamilies.blue[600]);
    // Hover: center+2=8 → shade 800
    expect(result.hoverBackground).toBe(theme.colorFamilies.blue[800]);
  });

  it('black: common-black bg, common-white text', () => {
    const result = resolve('solid', 'black');
    expect(result.background).toContain('--prismui-common-black');
    expect(result.color).toContain('--prismui-common-white');
    expect(result.hoverBackground).toContain('--prismui-common-blackChannel');
    expect(result.hoverBackground).toContain('--prismui-opacity-solid-commonHoverBg');
    expect(result.hoverShadow).toContain('--prismui-shadow-sm');
  });

  it('white: common-white bg, common-black text', () => {
    const result = resolve('solid', 'white');
    expect(result.background).toContain('--prismui-common-white');
    expect(result.color).toContain('--prismui-common-black');
    expect(result.hoverBackground).toContain('--prismui-common-whiteChannel');
    expect(result.hoverBackground).toContain('--prismui-opacity-solid-commonHoverBg');
  });

  it('CSS passthrough: raw color used as-is', () => {
    const result = resolve('solid', '#ff0000');
    expect(result.background).toBe('#ff0000');
    expect(result.hoverBackground).toBe('#ff0000');
  });
});

// ---------------------------------------------------------------------------
// Outlined variant
// ---------------------------------------------------------------------------

describe('defaultVariantColorsResolver — outlined', () => {
  it('inherit: transparent bg, inherit color, gray-500 border', () => {
    const result = resolve('outlined', 'inherit');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe('inherit');
    expect(result.border).toContain('--prismui-color-gray-500Channel');
    expect(result.border).toContain('--prismui-opacity-outlined-border');
    expect(result.hoverBorder).toBe('currentcolor');
    expect(result.hoverShadow).toContain('currentcolor');
    expect(result.hoverShadow).toContain('0.75px');
  });

  it('primary: transparent bg, primary-main color, color-mix border', () => {
    const result = resolve('outlined', 'primary');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe('var(--prismui-primary-main)');
    expect(result.border).toContain('color-mix');
    expect(result.border).toContain('--prismui-opacity-outlined-border');
    expect(result.hoverBackground).toContain('color-mix');
    expect(result.hoverBackground).toContain('--prismui-action-hoverOpacity');
  });

  it('blue (color family): uses resolved shade for color', () => {
    const result = resolve('outlined', 'blue');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe(theme.colorFamilies.blue[500]);
    expect(result.border).toContain('1px solid');
  });

  it('blue (dark scheme): uses shade 600', () => {
    const result = resolve('outlined', 'blue', 'dark');
    expect(result.color).toBe(theme.colorFamilies.blue[600]);
  });

  it('black: common-black color', () => {
    const result = resolve('outlined', 'black');
    expect(result.color).toContain('--prismui-common-black');
    expect(result.border).toContain('color-mix');
  });

  it('white: common-white color', () => {
    const result = resolve('outlined', 'white');
    expect(result.color).toContain('--prismui-common-white');
  });
});

// ---------------------------------------------------------------------------
// Soft variant
// ---------------------------------------------------------------------------

describe('defaultVariantColorsResolver — soft', () => {
  it('inherit: gray-500 channel bg, inherit color', () => {
    const result = resolve('soft', 'inherit');
    expect(result.background).toContain('--prismui-color-gray-500Channel');
    expect(result.background).toContain('--prismui-opacity-soft-bg');
    expect(result.color).toBe('inherit');
    expect(result.hoverBackground).toContain('--prismui-color-gray-500Channel');
    expect(result.hoverBackground).toContain('--prismui-opacity-soft-hoverBg');
    expect(result.border).toBe('none');
  });

  it('primary: mainChannel bg, dark text', () => {
    const result = resolve('soft', 'primary');
    expect(result.background).toContain('--prismui-primary-mainChannel');
    expect(result.background).toContain('--prismui-opacity-soft-bg');
    expect(result.color).toBe('var(--prismui-primary-dark)');
    expect(result.hoverBackground).toContain('--prismui-primary-mainChannel');
    expect(result.hoverBackground).toContain('--prismui-opacity-soft-hoverBg');
  });

  it('blue (color family): uses channel for bg, dark shade for text', () => {
    const result = resolve('soft', 'blue');
    expect(result.background).toContain('--prismui-opacity-soft-bg');
    // Text color should be the dark shade (center+2 = 700 in light)
    expect(result.color).toBe(theme.colorFamilies.blue[700]);
  });

  it('black: color-mix bg with soft-commonBg opacity', () => {
    const result = resolve('soft', 'black');
    expect(result.color).toContain('--prismui-common-black');
    expect(result.background).toContain('color-mix');
    expect(result.background).toContain('--prismui-opacity-soft-commonBg');
    expect(result.hoverBackground).toContain('--prismui-opacity-soft-commonHoverBg');
  });

  it('white: color-mix bg with soft-commonBg opacity', () => {
    const result = resolve('soft', 'white');
    expect(result.color).toContain('--prismui-common-white');
    expect(result.background).toContain('color-mix');
    expect(result.background).toContain('--prismui-opacity-soft-commonBg');
  });
});

// ---------------------------------------------------------------------------
// Plain variant
// ---------------------------------------------------------------------------

describe('defaultVariantColorsResolver — plain', () => {
  it('inherit: transparent bg, inherit color, action-hover on hover', () => {
    const result = resolve('plain', 'inherit');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe('inherit');
    expect(result.border).toBe('none');
    expect(result.hoverBackground).toContain('--prismui-action-hover');
    expect(result.hoverShadow).toBe('none');
  });

  it('primary: transparent bg, primary-main color', () => {
    const result = resolve('plain', 'primary');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe('var(--prismui-primary-main)');
    expect(result.hoverBackground).toContain('color-mix');
    expect(result.hoverBackground).toContain('--prismui-action-hoverOpacity');
  });

  it('blue (color family): uses resolved shade for color', () => {
    const result = resolve('plain', 'blue');
    expect(result.background).toBe('transparent');
    expect(result.color).toBe(theme.colorFamilies.blue[500]);
  });

  it('blue (dark scheme): uses shade 600', () => {
    const result = resolve('plain', 'blue', 'dark');
    expect(result.color).toBe(theme.colorFamilies.blue[600]);
  });

  it('black: common-black color, color-mix hover', () => {
    const result = resolve('plain', 'black');
    expect(result.color).toContain('--prismui-common-black');
    expect(result.hoverBackground).toContain('color-mix');
  });

  it('white: common-white color', () => {
    const result = resolve('plain', 'white');
    expect(result.color).toContain('--prismui-common-white');
  });

  it('CSS passthrough: raw color used as-is', () => {
    const result = resolve('plain', 'rgb(100, 200, 50)');
    expect(result.color).toBe('rgb(100, 200, 50)');
    expect(result.background).toBe('transparent');
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting concerns
// ---------------------------------------------------------------------------

describe('defaultVariantColorsResolver — general', () => {
  it('unknown variant falls back to solid', () => {
    const result = defaultVariantColorsResolver({
      variant: 'unknown' as any,
      color: 'primary',
      theme,
      scheme: 'light',
    });
    // Should behave like solid
    expect(result.background).toBe('var(--prismui-primary-main)');
  });

  it('all semantic colors work with solid', () => {
    const semantics = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'];
    for (const color of semantics) {
      const result = resolve('solid', color);
      expect(result.background).toBe(`var(--prismui-${color}-main)`);
      expect(result.color).toBe(`var(--prismui-${color}-contrastText)`);
    }
  });

  it('all semantic colors work with outlined', () => {
    const semantics = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'];
    for (const color of semantics) {
      const result = resolve('outlined', color);
      expect(result.color).toBe(`var(--prismui-${color}-main)`);
      expect(result.background).toBe('transparent');
    }
  });

  it('all semantic colors work with soft', () => {
    const semantics = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'];
    for (const color of semantics) {
      const result = resolve('soft', color);
      expect(result.color).toBe(`var(--prismui-${color}-dark)`);
      expect(result.background).toContain(`--prismui-${color}-mainChannel`);
    }
  });

  it('all semantic colors work with plain', () => {
    const semantics = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral'];
    for (const color of semantics) {
      const result = resolve('plain', color);
      expect(result.color).toBe(`var(--prismui-${color}-main)`);
      expect(result.background).toBe('transparent');
    }
  });

  it('custom variantColorResolver can be provided via createTheme', () => {
    const customResolver = (input: VariantColorResolverInput) => ({
      background: 'custom-bg',
      color: 'custom-color',
      border: 'custom-border',
      hoverBackground: 'custom-hover-bg',
      hoverColor: 'custom-hover-color',
      hoverBorder: 'custom-hover-border',
      hoverShadow: 'custom-hover-shadow',
    });

    const customTheme = createTheme({ variantColorResolver: customResolver }) as PrismuiTheme;
    const result = customTheme.variantColorResolver({
      variant: 'solid',
      color: 'primary',
      theme: customTheme,
      scheme: 'light',
    });
    expect(result.background).toBe('custom-bg');
    expect(result.color).toBe('custom-color');
  });
});
