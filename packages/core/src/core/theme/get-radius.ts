import type { PrismuiRadius, PrismuiRadiusKey } from './types';
import { rem } from '../../utils';

const RADIUS_KEYS: Set<string> = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Resolves a `PrismuiRadius` value to a CSS string.
 *
 * - Named key (`'md'`) → `var(--prismui-radius-md)`
 * - Number → converted to rem via `rem()`
 * - CSS string (`'4px'`) → converted to rem via `rem()`
 * - `undefined` → `undefined` (caller decides default)
 */
export function getRadius(radius: PrismuiRadius | undefined): string | undefined {
  if (radius === undefined) return undefined;

  if (typeof radius === 'string' && RADIUS_KEYS.has(radius)) {
    return `var(--prismui-radius-${radius as PrismuiRadiusKey})`;
  }

  return rem(radius);
}
