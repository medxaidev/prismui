import { describe, it, expect } from 'vitest';
import { getFontSize } from './get-font-size';

describe('getFontSize', () => {
  // --- Named keys ---

  it('resolves "xs" to var(--prismui-font-size-xs)', () => {
    expect(getFontSize('xs')).toBe('var(--prismui-font-size-xs)');
  });

  it('resolves "sm" to var(--prismui-font-size-sm)', () => {
    expect(getFontSize('sm')).toBe('var(--prismui-font-size-sm)');
  });

  it('resolves "md" to var(--prismui-font-size-md)', () => {
    expect(getFontSize('md')).toBe('var(--prismui-font-size-md)');
  });

  it('resolves "lg" to var(--prismui-font-size-lg)', () => {
    expect(getFontSize('lg')).toBe('var(--prismui-font-size-lg)');
  });

  it('resolves "xl" to var(--prismui-font-size-xl)', () => {
    expect(getFontSize('xl')).toBe('var(--prismui-font-size-xl)');
  });

  // --- Number → rem ---

  it('converts number 14 via rem()', () => {
    expect(getFontSize(14)).toContain('rem');
  });

  it('converts number 0 to rem', () => {
    expect(getFontSize(0)).toBe('0rem');
  });

  // --- CSS string → rem ---

  it('converts "16px" via rem()', () => {
    expect(getFontSize('16px')).toContain('rem');
  });

  it('passes through rem values', () => {
    expect(getFontSize('1.25rem')).toContain('1.25rem');
  });

  // --- undefined ---

  it('returns undefined for undefined input', () => {
    expect(getFontSize(undefined)).toBeUndefined();
  });

  // --- Non-key strings ---

  it('does not treat arbitrary strings as named keys', () => {
    const result = getFontSize('body1');
    expect(result).not.toContain('var(--prismui-font-size-');
  });
});
