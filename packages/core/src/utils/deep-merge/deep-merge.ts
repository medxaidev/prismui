import { isPlainObject } from '../is-plain-object/is-plain-object';

/**
 * Recursively merges `source` into `target`.
 *
 * Rules:
 * - `null` / `undefined` source → returns target unchanged.
 * - Arrays are **not** deep-merged; source array replaces target.
 * - Plain objects are merged key-by-key recursively.
 * - Primitives and non-plain objects in source overwrite target.
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  if (source === null || source === undefined) return target;

  if (Array.isArray(target) || Array.isArray(source)) {
    return source as T;
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const result: Record<string, unknown> = { ...target };
    for (const [key, value] of Object.entries(source)) {
      const existing = (result as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        result[key] = value;
        continue;
      }
      if (isPlainObject(existing) && isPlainObject(value)) {
        result[key] = deepMerge(existing, value);
        continue;
      }
      result[key] = value;
    }
    return result as T;
  }

  return source as T;
}