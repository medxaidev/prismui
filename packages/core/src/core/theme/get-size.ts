import { rem } from '../../utils';

const SIZE_KEYS: Set<string> = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Resolves a size value to a CSS string using a component-specific prefix.
 *
 * - Named key (`'md'`) → `var(--{prefix}-md)`
 * - Number → converted to rem via `rem()`
 * - CSS string (`'42px'`) → converted to rem via `rem()`
 * - `undefined` → `undefined`
 *
 * @param size - Size value (named key, number, or CSS string)
 * @param prefix - CSS variable prefix (e.g. `'button-height'` → `var(--button-height-md)`)
 */
export function getSize(
  size: string | number | undefined,
  prefix: string,
): string | undefined {
  if (size === undefined) return undefined;

  if (typeof size === 'string' && SIZE_KEYS.has(size)) {
    return `var(--${prefix}-${size})`;
  }

  return rem(size);
}
