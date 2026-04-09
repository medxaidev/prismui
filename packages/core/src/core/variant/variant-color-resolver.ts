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
 * Four CSS variable references covering all color needs of a variant:
 *   bg      — resting background (transparent for outlined/plain)
 *   fg      — foreground: text, icons
 *   hoverBg — background revealed on hover
 *   border  — border color (transparent for filled/soft/plain)
 *
 * Values are CSS var() references, not hex.
 * The CSS engine resolves them via PrismUIProvider's injected --prismui-color-* variables.
 * This means colorScheme switching is handled automatically at the CSS level.
 */
export interface VariantColorOutput {
  bg: string;
  fg: string;
  hoverBg: string;
  border: string;
}

/**
 * variantColorResolver
 *
 * Maps (variant, color) → four CSS variable references.
 *
 * Pure function: string template, zero computation, no theme object needed.
 * Depends only on PrismUIProvider having injected --prismui-color-* variables.
 *
 * @example
 * variantColorResolver({ variant: 'filled', color: 'primary' })
 * // → {
 * //   bg:      'var(--prismui-color-primary-high-bg)',
 * //   fg:      'var(--prismui-color-primary-high-fg)',
 * //   hoverBg: 'var(--prismui-color-primary-high-hover-bg)',
 * //   border:  'transparent',
 * // }
 */
export function variantColorResolver(
  { variant, color }: VariantColorResolverInput,
): VariantColorOutput {
  const role = VARIANT_TO_ROLE[variant];
  const p = `--prismui-color-${color}`;

  if (role === 'high') {
    return {
      bg:      `var(${p}-high-bg)`,
      fg:      `var(${p}-high-fg)`,
      hoverBg: `var(${p}-high-hover-bg)`,
      border:  'transparent',
    };
  }

  if (role === 'low') {
    return {
      bg:      `var(${p}-low-bg)`,
      fg:      `var(${p}-low-fg)`,
      hoverBg: `var(${p}-low-hover-bg)`,
      border:  'transparent',
    };
  }

  if (role === 'bordered') {
    return {
      bg:      'transparent',
      fg:      `var(${p}-bordered-fg)`,
      hoverBg: `var(${p}-bordered-hover-bg)`,
      border:  `var(${p}-bordered-border)`,
    };
  }

  // role === 'minimal' (plain)
  return {
    bg:      'transparent',
    fg:      `var(${p}-minimal-fg)`,
    hoverBg: `var(${p}-minimal-hover-bg)`,
    border:  'transparent',
  };
}
