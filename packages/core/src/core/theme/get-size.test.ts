import { describe, it, expect } from 'vitest';
import { getSize } from './get-size';

describe('getSize', () => {
  // --- Named keys ---

  it('resolves "xs" to var(--prefix-xs)', () => {
    expect(getSize('xs', 'button-height')).toBe('var(--button-height-xs)');
  });

  it('resolves "sm" to var(--prefix-sm)', () => {
    expect(getSize('sm', 'button-height')).toBe('var(--button-height-sm)');
  });

  it('resolves "md" to var(--prefix-md)', () => {
    expect(getSize('md', 'button-height')).toBe('var(--button-height-md)');
  });

  it('resolves "lg" to var(--prefix-lg)', () => {
    expect(getSize('lg', 'container-size')).toBe('var(--container-size-lg)');
  });

  it('resolves "xl" to var(--prefix-xl)', () => {
    expect(getSize('xl', 'container-size')).toBe('var(--container-size-xl)');
  });

  // --- Number → rem ---

  it('converts number 0 to rem', () => {
    expect(getSize(0, 'button-height')).toBe('0rem');
  });

  it('converts number 42 via rem()', () => {
    expect(getSize(42, 'button-height')).toContain('rem');
  });

  // --- CSS string → rem ---

  it('converts "36px" via rem()', () => {
    expect(getSize('36px', 'button-height')).toContain('rem');
  });

  it('passes through rem values', () => {
    expect(getSize('2.5rem', 'button-height')).toContain('2.5rem');
  });

  // --- undefined ---

  it('returns undefined for undefined input', () => {
    expect(getSize(undefined, 'button-height')).toBeUndefined();
  });

  // --- Non-key strings ---

  it('does not treat arbitrary strings as named keys', () => {
    const result = getSize('compact-sm', 'button-height');
    expect(result).not.toContain('var(--button-height-');
  });
});
