import { describe, it, expect } from 'vitest';
import { resolveRadiusToken, RADIUS_SCALE } from './index';

describe('resolveRadiusToken', () => {
  it.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
    'maps scale key "%s" to var(--prismui-radius-%s)',
    (scale) => {
      expect(resolveRadiusToken(scale)).toBe(`var(--prismui-radius-${scale})`);
    },
  );

  it.each([
    '4px', '0.5em', '1rem', '50%', 'calc(100% - 4px)', '0',
  ])('passes through CSS length %s verbatim', (value) => {
    expect(resolveRadiusToken(value)).toBe(value);
  });

  it('unknown scale-looking string is treated as length (not a scale token)', () => {
    // "xxl" is not in the scale set → pass-through
    expect(resolveRadiusToken('xxl')).toBe('xxl');
  });

  it('RADIUS_SCALE exports all 6 scale keys', () => {
    expect([...RADIUS_SCALE].sort()).toEqual(
      ['full', 'lg', 'md', 'sm', 'xl', 'xs'],
    );
  });
});
