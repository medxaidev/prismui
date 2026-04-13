import { defaultTheme } from './default-theme';
import type { PrismUITheme } from './types';
import type { DefaultColorFamily } from './types';

// ── DeepPartial ────────────────────────────────────────────────────────────
// Excludes Function before recursing into object to avoid
// unintentionally spreading function types into partial.
export type DeepPartial<T> =
  T extends Function ? T :
  T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } :
  T;

// ── deepMerge ──────────────────────────────────────────────────────────────
// Pure function — does NOT mutate base or override.
// Returns a new object that is the deep merge of base and override.
//
// Rules:
//   undefined override field  → keep base value (field not provided)
//   null override field        → null (explicit clear, advanced usage)
//   both plain objects         → recursive merge (safe: {} merges to base values)
//   otherwise                  → override replaces base
//   key only in override       → added to result (supports customTokens extension)
function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override as T) ?? base;
  }

  const result: Record<string, unknown> = {};

  // First: deep-clone ALL keys from base (no shared references)
  for (const key of Object.keys(base as object)) {
    const baseVal = (base as Record<string, unknown>)[key];
    result[key] = isPlainObject(baseVal)
      ? deepMerge(baseVal, {} as DeepPartial<typeof baseVal>)
      : baseVal;
  }

  // Then: apply overrides
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overrideVal = (override as Record<string, unknown>)[key];

    if (overrideVal === undefined) {
      continue;
    }

    if (overrideVal === null) {
      result[key] = null;
      continue;
    }

    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      result[key] = deepMerge(baseVal, overrideVal as DeepPartial<typeof baseVal>);
    } else {
      result[key] = overrideVal;
    }
  }

  return result as T;
}

// ── validateThemeComponents ────────────────────────────────────────────────
// DEV-only: validates theme.components key naming conventions.
// Runs once per unique theme object (WeakSet guard).
//
// Checks:
//   1. All simple keys (no namespace ".") are lowercase → likely typo, warn once.
//   2. Duplicate keys differing only in casing → grouped into one warn per collision set.
const _validatedThemes =
  process.env.NODE_ENV !== 'production' ? new WeakSet<object>() : null;

function validateThemeComponents(theme: PrismUITheme): void {
  if (process.env.NODE_ENV !== 'production') {
    if (_validatedThemes!.has(theme)) return;
    _validatedThemes!.add(theme);

    const keys = Object.keys(theme.components ?? {});
    if (keys.length === 0) return;

    // Check 1: all simple keys (no ".") are lowercase → normalization hint
    const simpleKeys = keys.filter((k) => !k.includes('.'));
    const hasAllLowercase =
      simpleKeys.length > 0 &&
      simpleKeys.every((k) => k === k.toLowerCase());
    if (hasAllLowercase) {
      console.warn(
        `[PrismUI] theme.components keys are all lowercase. ` +
        `Component names are case-sensitive (e.g. "Button", not "button"). ` +
        `Keys: ${simpleKeys.join(', ')}.`,
      );
    }

    // Check 2: case-insensitive duplicate keys — one warn per collision group
    const groups = new Map<string, string[]>();
    for (const key of keys) {
      const lower = key.toLowerCase();
      const list = groups.get(lower) ?? [];
      list.push(key);
      groups.set(lower, list);
    }
    for (const [, group] of groups) {
      if (group.length > 1) {
        console.warn(
          `[PrismUI] Duplicate theme.components keys with different casing: ` +
          `${group.map((k) => `"${k}"`).join(', ')}. Keys are case-sensitive.`,
        );
      }
    }
  }
}

// ── createTheme ────────────────────────────────────────────────────────────
// Always uses deepMerge — no shallow copy branch.
// Guarantees: returned theme shares NO internal object references with defaultTheme.
//
// @param overrides - Partial theme overrides (any depth). Omit to get a clean copy.
//   null values explicitly clear a field (advanced usage).
export function createTheme<
  C extends string = DefaultColorFamily,
  S extends string = 'light' | 'dark',
>(
  overrides?: DeepPartial<PrismUITheme<C, S>>,
): PrismUITheme<C, S> {
  const theme = deepMerge(
    defaultTheme as unknown as PrismUITheme<C, S>,
    (overrides ?? {}) as DeepPartial<PrismUITheme<C, S>>,
  );
  validateThemeComponents(theme as unknown as PrismUITheme);
  return theme;
}
