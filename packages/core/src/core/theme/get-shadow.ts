import type { PrismuiShadow, PrismuiShadowKey } from './types';

const SHADOW_SIZE_KEYS: Set<string> = new Set([
  'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl',
]);
const SHADOW_COMPONENT_KEYS: Set<string> = new Set([
  'dialog', 'card', 'dropdown',
]);
const SHADOW_SEMANTIC_KEYS: Set<string> = new Set([
  'primary', 'secondary', 'info', 'success', 'warning', 'error',
]);

function isShadowKey(value: string): value is PrismuiShadowKey {
  return SHADOW_SIZE_KEYS.has(value)
    || SHADOW_COMPONENT_KEYS.has(value)
    || SHADOW_SEMANTIC_KEYS.has(value);
}

/**
 * Resolves a `PrismuiShadow` value to a CSS string.
 *
 * - Named key (`'md'`, `'card'`, `'primary'`) → `var(--prismui-shadow-md)`
 * - `'none'` → `'none'`
 * - Arbitrary CSS string → passed through as-is
 * - `undefined` → `undefined`
 */
export function getShadow(shadow: PrismuiShadow | undefined): string | undefined {
  if (shadow === undefined) return undefined;

  if (shadow === 'none') return 'none';

  if (isShadowKey(shadow)) {
    return `var(--prismui-shadow-${shadow})`;
  }

  // Arbitrary CSS box-shadow string
  return shadow;
}
