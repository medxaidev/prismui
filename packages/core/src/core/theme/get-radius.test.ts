import { describe, it, expect } from 'vitest';
import { getRadius } from './get-radius';

describe('getRadius', () => {
  // ---- Named keys → CSS variable ----

  it('resolves "xs" to var(--prismui-radius-xs)', () => {
    expect(getRadius('xs')).toBe('var(--prismui-radius-xs)');
  });

  it('resolves "sm" to var(--prismui-radius-sm)', () => {
    expect(getRadius('sm')).toBe('var(--prismui-radius-sm)');
  });

  it('resolves "md" to var(--prismui-radius-md)', () => {
    expect(getRadius('md')).toBe('var(--prismui-radius-md)');
  });

  it('resolves "lg" to var(--prismui-radius-lg)', () => {
    expect(getRadius('lg')).toBe('var(--prismui-radius-lg)');
  });

  it('resolves "xl" to var(--prismui-radius-xl)', () => {
    expect(getRadius('xl')).toBe('var(--prismui-radius-xl)');
  });

  // ---- Number → rem ----

  it('converts number 0 to rem', () => {
    expect(getRadius(0)).toBe('0rem');
  });

  it('converts number 8 via rem()', () => {
    expect(getRadius(8)).toContain('0.5rem');
  });

  it('converts number 16 via rem()', () => {
    expect(getRadius(16)).toContain('1rem');
  });

  // ---- CSS string → rem ----

  it('converts "4px" via rem()', () => {
    expect(getRadius('4px')).toContain('0.25rem');
  });

  it('passes through rem values', () => {
    expect(getRadius('1.5rem')).toContain('1.5rem');
  });

  // ---- undefined ----

  it('returns undefined for undefined input', () => {
    expect(getRadius(undefined)).toBeUndefined();
  });

  // ---- Non-key strings ----

  it('does not treat arbitrary strings as named keys', () => {
    const result = getRadius('custom');
    expect(result).not.toContain('var(--prismui-radius-');
  });
});
