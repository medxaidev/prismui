/**
 * `ensureClasses` runtime test (D-6 · test-coverage gap closed in v0.1).
 *
 * The compile-time value of `ensureClasses` is its TYPE constraint (Names ⊆
 * classes keys). At runtime it is an identity pass-through that returns the
 * `classes` object untouched. These tests lock that runtime contract so a
 * future refactor cannot silently start mutating / cloning the map.
 */
import { describe, it, expect } from 'vitest';
import { ensureClasses } from './ensure-classes';

describe('ensureClasses · runtime identity', () => {
  it('returns the exact same classes object reference', () => {
    const classes = { root: 'a1b2', inner: 'c3d4', label: 'e5f6' };
    const result = ensureClasses(['root', 'inner', 'label'] as const, classes);
    expect(result).toBe(classes); // same reference — no clone
  });

  it('preserves every class mapping unchanged', () => {
    const classes = { root: 'hashed-root' };
    const result = ensureClasses(['root'] as const, classes);
    expect(result).toEqual({ root: 'hashed-root' });
  });

  it('does not mutate the input or add keys', () => {
    const classes = { root: 'r', box: 'b' };
    const before = { ...classes };
    ensureClasses(['root', 'box'] as const, classes);
    expect(classes).toEqual(before);
    expect(Object.keys(classes)).toEqual(['root', 'box']);
  });
});
