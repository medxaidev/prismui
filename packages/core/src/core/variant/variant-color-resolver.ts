import type { Variant, ThemeColor } from './types';
import type { ColorRoleLevel } from '../theme/types';

/**
 * VARIANT_TO_ROLE
 *
 * Static lookup table: Variant → ColorRoleLevel (Step 3.4).
 *
 * Variant (Step 4.1) and ColorRole (Step 3.4) are intentionally 1:1 aligned.
 * This table is the entire mapping logic — no conditionals needed beyond
 * the four role-specific output shapes.
 */
export const VARIANT_TO_ROLE = {
  filled:   'high',
  soft:     'low',
  outlined: 'bordered',
  plain:    'minimal',
} as const satisfies Record<Variant, ColorRoleLevel>;

export interface VariantColorResolverInput {
  variant: Variant;
  color: ThemeColor;
}

/**
 * VariantColorOutput
 *
 * Seven CSS variable references covering all color needs of a variant:
 *   bg          — resting background
 *   fg          — foreground: text, icons
 *   hoverBg     — background revealed on hover
 *   activeBg    — background on active/pressed
 *   border      — border color
 *   hoverBorder — border color on hover
 *   hoverShadow — shadow on hover (per-color glow or outline)
 *
 * Values are CSS var() references or literal CSS values ("transparent", "none").
 * The CSS engine resolves them via PrismUIProvider's injected --prismui-color-* variables.
 * This means colorScheme switching is handled automatically at the CSS level.
 */
export interface VariantColorOutput {
  bg: string;
  fg: string;
  hoverBg: string;
  activeBg: string;
  border: string;
  hoverBorder: string;
  hoverShadow: string;
}

/**
 * variantColorResolver
 *
 * Maps (variant, color) → seven CSS variable references.
 *
 * Pure function: string template, zero computation, no theme object needed.
 * Depends only on PrismUIProvider having injected --prismui-color-* variables.
 *
 * @example
 * variantColorResolver({ variant: 'filled', color: 'primary' })
 * // → {
 * //   bg:          'var(--prismui-color-primary-high-bg)',
 * //   fg:          'var(--prismui-color-primary-high-fg)',
 * //   hoverBg:     'var(--prismui-color-primary-high-hover-bg)',
 * //   activeBg:    'var(--prismui-color-primary-high-active-bg)',
 * //   border:      'transparent',
 * //   hoverBorder: 'transparent',
 * //   hoverShadow: 'var(--prismui-color-primary-high-hover-shadow)',
 * // }
 */
export function variantColorResolver(
  { variant, color }: VariantColorResolverInput,
): VariantColorOutput {
  const role = VARIANT_TO_ROLE[variant];
  const p = `--prismui-color-${color}`;

  if (role === 'high') {
    return {
      bg:          `var(${p}-high-bg)`,
      fg:          `var(${p}-high-fg)`,
      hoverBg:     `var(${p}-high-hover-bg)`,
      activeBg:    `var(${p}-high-active-bg)`,
      border:      'transparent',
      hoverBorder: 'transparent',
      hoverShadow: `var(${p}-high-hover-shadow)`,
    };
  }

  if (role === 'low') {
    return {
      bg:          `var(${p}-low-bg)`,
      fg:          `var(${p}-low-fg)`,
      hoverBg:     `var(${p}-low-hover-bg)`,
      activeBg:    `var(${p}-low-active-bg)`,
      border:      'transparent',
      hoverBorder: 'transparent',
      hoverShadow: 'none',
    };
  }

  if (role === 'bordered') {
    return {
      bg:          `var(${p}-bordered-bg)`,
      fg:          `var(${p}-bordered-fg)`,
      hoverBg:     `var(${p}-bordered-hover-bg)`,
      activeBg:    `var(${p}-bordered-active-bg)`,
      border:      `var(${p}-bordered-border)`,
      hoverBorder: `var(${p}-bordered-hover-border)`,
      hoverShadow: `var(${p}-bordered-hover-shadow)`,
    };
  }

  // role === 'minimal' (plain)
  return {
    bg:          'transparent',
    fg:          `var(${p}-minimal-fg)`,
    hoverBg:     `var(${p}-minimal-hover-bg)`,
    activeBg:    `var(${p}-minimal-active-bg)`,
    border:      'transparent',
    hoverBorder: 'transparent',
    hoverShadow: 'none',
  };
}
