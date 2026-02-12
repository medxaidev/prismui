import { describe, it, expect } from 'vitest';
import { getShadow } from './get-shadow';

describe('getShadow', () => {
  // ---- Size keys → CSS variable ----

  it('resolves "xs" to var(--prismui-shadow-xs)', () => {
    expect(getShadow('xs')).toBe('var(--prismui-shadow-xs)');
  });

  it('resolves "md" to var(--prismui-shadow-md)', () => {
    expect(getShadow('md')).toBe('var(--prismui-shadow-md)');
  });

  it('resolves "xxl" to var(--prismui-shadow-xxl)', () => {
    expect(getShadow('xxl')).toBe('var(--prismui-shadow-xxl)');
  });

  // ---- Component keys → CSS variable ----

  it('resolves "card" to var(--prismui-shadow-card)', () => {
    expect(getShadow('card')).toBe('var(--prismui-shadow-card)');
  });

  it('resolves "dialog" to var(--prismui-shadow-dialog)', () => {
    expect(getShadow('dialog')).toBe('var(--prismui-shadow-dialog)');
  });

  it('resolves "dropdown" to var(--prismui-shadow-dropdown)', () => {
    expect(getShadow('dropdown')).toBe('var(--prismui-shadow-dropdown)');
  });

  // ---- Semantic keys → CSS variable ----

  it('resolves "primary" to var(--prismui-shadow-primary)', () => {
    expect(getShadow('primary')).toBe('var(--prismui-shadow-primary)');
  });

  it('resolves "error" to var(--prismui-shadow-error)', () => {
    expect(getShadow('error')).toBe('var(--prismui-shadow-error)');
  });

  // ---- "none" ----

  it('resolves "none" to "none"', () => {
    expect(getShadow('none')).toBe('none');
  });

  // ---- Arbitrary CSS string → passthrough ----

  it('passes through arbitrary CSS box-shadow string', () => {
    const css = '0 2px 8px rgba(0,0,0,0.15)';
    expect(getShadow(css)).toBe(css);
  });

  it('passes through "0 0 0 3px red"', () => {
    expect(getShadow('0 0 0 3px red')).toBe('0 0 0 3px red');
  });

  // ---- undefined ----

  it('returns undefined for undefined input', () => {
    expect(getShadow(undefined)).toBeUndefined();
  });
});
