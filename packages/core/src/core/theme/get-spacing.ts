import { rem } from '../../utils';

const SPACING_KEYS: Set<string> = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Resolves a spacing value to a CSS string.
 *
 * - Named key (`'md'`) → `var(--prismui-spacing-md)`
 * - Number → converted to rem via `rem()`
 * - CSS string (`'16px'`) → converted to rem via `rem()`
 * - `undefined` → `undefined`
 */
export function getSpacing(
  spacing: string | number | undefined,
): string | undefined {
  if (spacing === undefined) return undefined;

  if (typeof spacing === 'string' && SPACING_KEYS.has(spacing)) {
    return `var(--prismui-spacing-${spacing})`;
  }

  return rem(spacing);
}
