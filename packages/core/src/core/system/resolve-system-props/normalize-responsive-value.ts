import { isPlainObject } from '../../../utils';

type BreakpointsMap<BP extends string> = Record<BP, string>;

type ResponsiveInput<V, BP extends string> =
  | V
  | Partial<Record<BP, V>>
  | Partial<Record<BP | 'base', V>>;

export type NormalizedResponsiveValue<V, BP extends string> = {
  base?: V;
  overrides: Partial<Record<BP, V>>;
};

/**
 * Normalizes a responsive value into base + breakpoint overrides.
 *
 * Mobile-first behavior:
 * - If `value` is not an object, it becomes the base value (no overrides).
 * - If `value.base` exists, it is used as the base style (applied without media query).
 * - Breakpoint keys become `min-width` overrides that enhance the base.
 * - Per the responsive design spec, `base` should always be explicitly declared.
 */
export function normalizeResponsiveValue<V, BP extends string>(
  value: ResponsiveInput<V, BP>,
  breakpoints: BreakpointsMap<BP>,
): NormalizedResponsiveValue<V, BP> {

  if (!isPlainObject(value)) {
    return { base: value as V, overrides: {} };
  }

  const input = value as Partial<Record<BP | 'base', V>>;

  const bpKeys = Object.keys(breakpoints) as BP[];

  const overrides: Partial<Record<BP, V>> = {};

  for (const bp of bpKeys) {
    const v = input[bp];
    if (v !== undefined) overrides[bp] = v;
  }

  if (input.base !== undefined) {
    return { base: input.base, overrides };
  }

  // Fallback: use the smallest defined breakpoint as base (not recommended per spec).
  for (const k of bpKeys) {
    const v = overrides[k];
    if (v !== undefined) {
      // Remove from overrides since it becomes the base
      const rest = { ...overrides };
      delete rest[k];
      return { base: v, overrides: rest };
    }
  }

  return { base: undefined, overrides };
}
