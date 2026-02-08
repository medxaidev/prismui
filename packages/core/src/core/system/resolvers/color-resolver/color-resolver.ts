import type { PrismuiTheme } from '../../../theme/types';

/**
 * Resolves color values for background-related props.
 *
 * Supports:
 * - `blue.500` → `var(--prismui-color-blue-500)`
 * - `primary.main` → `var(--prismui-primary-main)`
 * - `white` / `black` → `var(--prismui-common-white)` / `var(--prismui-common-black)`
 * - Any other CSS color string passes through as-is
 */
export function colorResolver(value: unknown, _theme: PrismuiTheme): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') return undefined;
  return resolveColorString(value);
}

function resolveColorString(color: string): string {
  if (color === 'white') return 'var(--prismui-common-white)';
  if (color === 'black') return 'var(--prismui-common-black)';

  const dotIndex = color.indexOf('.');
  if (dotIndex === -1) return color;

  const family = color.slice(0, dotIndex);
  const shade = color.slice(dotIndex + 1);

  const colorFamilies = [
    'blue', 'cyan', 'green', 'red', 'orange', 'yellow',
    'violet', 'pink', 'teal', 'indigo', 'gray', 'neutral', 'dark', 'light',
  ];

  if (colorFamilies.includes(family) && /^\d+$/.test(shade)) {
    return `var(--prismui-color-${family}-${shade})`;
  }

  const semanticFamilies = [
    'primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral',
    'text', 'background', 'action', 'common',
  ];

  if (semanticFamilies.includes(family)) {
    return `var(--prismui-${family}-${shade})`;
  }

  return color;
}
