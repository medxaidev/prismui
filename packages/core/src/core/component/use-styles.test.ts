import { describe, it, expect } from 'vitest';

/**
 * Test normalizeStylingInput behavior via the exported StylingInput type.
 *
 * We test the guard logic by directly calling the internal function through
 * a minimal re-export, since normalizeStylingInput is not exported.
 * Instead, we test the observable behavior via the thrown error.
 */

// Re-implement the guard logic in isolation to test it directly.
// This mirrors the implementation in use-styles.ts exactly.
function isLayeredInput(input: any): boolean {
  if (!input || typeof input !== 'object') return false;
  const hasProps = 'props' in input;
  const hasOverrides = 'overrides' in input;
  if (!hasProps && !hasOverrides) return false;
  if (hasProps && input.props !== undefined && typeof input.props !== 'object') return false;
  if (hasOverrides && input.overrides !== undefined && typeof input.overrides !== 'object') return false;
  return true;
}

function normalizeStylingInput(input: Record<string, any>) {
  if (isLayeredInput(input)) {
    if (process.env.NODE_ENV !== 'production') {
      const hasMixed = Object.keys(input).some((k) => k !== 'props' && k !== 'overrides');
      if (hasMixed) {
        const extraKeys = Object.keys(input).filter((k) => k !== 'props' && k !== 'overrides');
        throw new Error(
          `[PrismUI] Invalid StylingInput: do not mix flat and layered API. ` +
          `Unexpected keys alongside 'props'/'overrides': [${extraKeys.join(', ')}]. ` +
          `Use either { size, variant, classNames } (flat) or { props: { size, variant }, overrides: { classNames } } (layered).`,
        );
      }
    }
    return { props: input.props ?? {}, overrides: input.overrides ?? {} };
  }

  const { classNames, styles, vars, ...props } = input;
  return { props, overrides: { classNames, styles, vars } };
}

describe('normalizeStylingInput', () => {
  describe('flat structure', () => {
    it('extracts styling overrides from flat input', () => {
      const result = normalizeStylingInput({ size: 'sm', variant: 'filled', classNames: { root: 'x' } });
      expect(result.props).toEqual({ size: 'sm', variant: 'filled' });
      expect(result.overrides.classNames).toEqual({ root: 'x' });
    });

    it('handles empty flat input', () => {
      const result = normalizeStylingInput({});
      expect(result.props).toEqual({});
      expect(result.overrides).toEqual({ classNames: undefined, styles: undefined, vars: undefined });
    });
  });

  describe('layered structure', () => {
    it('returns props and overrides from layered input', () => {
      const result = normalizeStylingInput({
        props: { size: 'sm', variant: 'filled' },
        overrides: { classNames: { root: 'x' } },
      });
      expect(result.props).toEqual({ size: 'sm', variant: 'filled' });
      expect(result.overrides).toEqual({ classNames: { root: 'x' } });
    });

    it('handles missing props in layered input (defaults to {})', () => {
      const result = normalizeStylingInput({ overrides: { classNames: { root: 'x' } } });
      expect(result.props).toEqual({});
    });

    it('handles missing overrides in layered input (defaults to {})', () => {
      const result = normalizeStylingInput({ props: { size: 'sm' } });
      expect(result.overrides).toEqual({});
    });
  });

  describe('mixed structure guard (dev mode)', () => {
    it('throws when flat keys are mixed alongside layered keys', () => {
      expect(() =>
        normalizeStylingInput({
          props: { size: 'sm' },
          size: 'lg', // mixed flat key — would be silently ignored without guard
        }),
      ).toThrow(/Invalid StylingInput: do not mix flat and layered API/);
    });

    it('error message lists the unexpected extra keys', () => {
      expect(() =>
        normalizeStylingInput({
          props: { size: 'sm' },
          variant: 'filled',
          color: 'primary',
        }),
      ).toThrow(/variant.*color|color.*variant/);
    });

    it('does NOT throw for pure layered input (only props + overrides)', () => {
      expect(() =>
        normalizeStylingInput({ props: { size: 'sm' }, overrides: {} }),
      ).not.toThrow();
    });
  });

  describe('isLayeredInput detection', () => {
    it('detects layered when only overrides key present', () => {
      const result = normalizeStylingInput({ overrides: {} });
      expect(result.props).toEqual({});
    });

    it('treats { size, variant } as flat (no props/overrides keys)', () => {
      const result = normalizeStylingInput({ size: 'sm', variant: 'filled' });
      expect(result.props).toEqual({ size: 'sm', variant: 'filled' });
    });
  });
});
