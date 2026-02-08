import { describe, expect, it } from 'vitest';
import { defaultTheme } from '../../../theme/default-theme';
import { spacingResolver } from './spacing-resolver';

const theme = defaultTheme as any;

describe('spacingResolver', () => {
  it('returns undefined for null/undefined', () => {
    expect(spacingResolver(undefined, theme)).toBe(undefined);
    expect(spacingResolver(null, theme)).toBe(undefined);
  });

  it('resolves numbers with theme.spacingUnit (default 4) via rem()', () => {
    // 10 * 4 = 40px => 2.5rem => scaled
    expect(spacingResolver(10, theme)).toBe('calc(2.5rem * var(--prismui-scale))');
    expect(spacingResolver(-10, theme)).toBe('calc(-2.5rem * var(--prismui-scale))');
    expect(spacingResolver(0, theme)).toBe('0rem');
  });

  it('resolves token values to css vars', () => {
    expect(spacingResolver('xs', theme)).toBe('var(--prismui-spacing-xs)');
    expect(spacingResolver('md', theme)).toBe('var(--prismui-spacing-md)');
  });

  it('resolves negative token values to calc(var * -1)', () => {
    expect(spacingResolver('-md', theme)).toBe('calc(var(--prismui-spacing-md) * -1)');
  });

  it('passes other strings through rem()', () => {
    expect(spacingResolver('10px', theme)).toBe('calc(0.625rem * var(--prismui-scale))');
    expect(spacingResolver('1rem', theme)).toBe('1rem');
    expect(spacingResolver('calc(100% - 10px)', theme)).toBe('calc(100% - 10px)');
  });

  it('preserves leading whitespace', () => {
    expect(spacingResolver(' 10px', theme)).toBe(` ${'calc(0.625rem * var(--prismui-scale))'}`);
    expect(spacingResolver(' xs', theme)).toBe(' var(--prismui-spacing-xs)');
  });
});
