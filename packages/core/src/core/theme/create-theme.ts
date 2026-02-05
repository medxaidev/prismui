import type { PrismuiTheme } from './types';
import { defaultTheme } from './default-theme';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepMerge<T>(target: T, source: Partial<T>): T {
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

export function createTheme(config: Partial<PrismuiTheme> = {}): PrismuiTheme {
  return deepMerge(defaultTheme, config);
}