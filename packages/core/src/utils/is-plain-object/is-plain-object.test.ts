import { describe, expect, it } from 'vitest';
import { isPlainObject } from './is-plain-object';

class Foo {
  x = 1;
}

describe('isPlainObject', () => {
  it('returns true for plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });

  it('returns true for objects with null prototype', () => {
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it('returns false for null and non-objects', () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(0)).toBe(false);
    expect(isPlainObject('x')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(() => { })).toBe(false);
  });

  it('returns false for arrays and built-ins', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
  });

  it('returns false for class instances', () => {
    expect(isPlainObject(new Foo())).toBe(false);
  });
});
