import { describe, it, expect } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('concatenates multiple class names', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out undefined values', () => {
    expect(cx('a', undefined, 'c')).toBe('a c');
  });

  it('filters out false values', () => {
    expect(cx('a', false, 'c')).toBe('a c');
  });

  it('filters out null values', () => {
    expect(cx('a', null, 'c')).toBe('a c');
  });

  it('returns empty string when no arguments', () => {
    expect(cx()).toBe('');
  });

  it('returns empty string when all arguments are falsy', () => {
    expect(cx(undefined, false, null)).toBe('');
  });
});
