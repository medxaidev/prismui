import { rem } from '../../utils';

const FONT_SIZE_KEYS: Set<string> = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Resolves a font size value to a CSS string.
 *
 * - Named key (`'md'`) → `var(--prismui-font-size-md)`
 * - Number → converted to rem via `rem()`
 * - CSS string (`'14px'`) → converted to rem via `rem()`
 * - `undefined` → `undefined`
 */
export function getFontSize(
  size: string | number | undefined,
): string | undefined {
  if (size === undefined) return undefined;

  if (typeof size === 'string' && FONT_SIZE_KEYS.has(size)) {
    return `var(--prismui-font-size-${size})`;
  }

  return rem(size);
}
