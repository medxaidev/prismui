/**
 * Stage-16 · Responsive system · resolution helpers · structural tests
 *
 * Coverage map:
 *   - `isResponsiveObject` guard discriminates scalar vs object
 *   - `resolveResponsiveDataAttrs` scalar / responsive / undefined
 *   - `resolveResponsiveCssVars` scalar / responsive / undefined / transform
 *   - `listDefinedBreakpoints` order + filtering
 *   - Cascade order matches `BREAKPOINT_ORDER` (xs → sm → md → lg → xl)
 */
import { describe, it, expect } from 'vitest';
import {
  BREAKPOINT_ORDER,
  isResponsiveObject,
  listDefinedBreakpoints,
  resolveResponsiveCssVars,
  resolveResponsiveDataAttrs,
} from './index';

describe('responsive · BREAKPOINT_ORDER', () => {
  it('locks the 5-tier order ascending by min-width', () => {
    expect([...BREAKPOINT_ORDER]).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });
});

describe('responsive · isResponsiveObject', () => {
  it('returns false for undefined', () => {
    expect(isResponsiveObject(undefined)).toBe(false);
  });
  it('returns false for scalar string', () => {
    expect(isResponsiveObject('md')).toBe(false);
  });
  it('returns false for scalar number', () => {
    expect(isResponsiveObject(4)).toBe(false);
  });
  it('returns false for null', () => {
    expect(isResponsiveObject(null as never)).toBe(false);
  });
  it('returns false for arrays', () => {
    expect(isResponsiveObject([1, 2, 3] as never)).toBe(false);
  });
  it('returns true for an empty plain object', () => {
    expect(isResponsiveObject({})).toBe(true);
  });
  it('returns true for a populated breakpoint map', () => {
    expect(isResponsiveObject({ md: 'lg' })).toBe(true);
  });
});

describe('responsive · resolveResponsiveDataAttrs', () => {
  it('returns {} for undefined (consumer applies its own default)', () => {
    expect(resolveResponsiveDataAttrs('gap', undefined)).toEqual({});
  });

  it('emits a single data-<prefix> for scalar values', () => {
    expect(resolveResponsiveDataAttrs('gap', 'md')).toEqual({ 'data-gap': 'md' });
  });

  it('emits per-breakpoint data-<prefix>-<bp> attrs for responsive object', () => {
    expect(
      resolveResponsiveDataAttrs('gap', { xs: 'sm', md: 'lg' }),
    ).toEqual({
      'data-gap-xs': 'sm',
      'data-gap-md': 'lg',
    });
  });

  it('skips undefined entries within a responsive object', () => {
    expect(
      resolveResponsiveDataAttrs('gap', {
        xs: 'sm',
        sm: undefined,
        md: 'lg',
      }),
    ).toEqual({ 'data-gap-xs': 'sm', 'data-gap-md': 'lg' });
  });

  it('returns {} for an empty responsive object', () => {
    expect(resolveResponsiveDataAttrs('gap', {})).toEqual({});
  });

  it('emits attrs in BREAKPOINT_ORDER (deterministic)', () => {
    const attrs = resolveResponsiveDataAttrs('gap', {
      xl: 'xl',
      xs: 'xs',
      lg: 'lg',
      sm: 'sm',
      md: 'md',
    });
    expect(Object.keys(attrs)).toEqual([
      'data-gap-xs',
      'data-gap-sm',
      'data-gap-md',
      'data-gap-lg',
      'data-gap-xl',
    ]);
  });
});

describe('responsive · resolveResponsiveCssVars', () => {
  it('returns {} for undefined', () => {
    expect(resolveResponsiveCssVars('grid-cols', undefined)).toEqual({});
  });

  it('emits a single --<varName> for scalar string', () => {
    expect(resolveResponsiveCssVars('grid-cols', '200px 1fr')).toEqual({
      '--grid-cols': '200px 1fr',
    });
  });

  it('emits a single --<varName> for scalar number (default transform)', () => {
    expect(resolveResponsiveCssVars('grid-cols', 4)).toEqual({
      '--grid-cols': '4',
    });
  });

  it('applies a transform function for scalars when provided', () => {
    expect(
      resolveResponsiveCssVars('grid-cols', 4, (n) => `repeat(${n}, 1fr)`),
    ).toEqual({ '--grid-cols': 'repeat(4, 1fr)' });
  });

  it('emits per-breakpoint --<varName>-<bp> entries with transform', () => {
    expect(
      resolveResponsiveCssVars(
        'grid-cols',
        { xs: 1, md: 4 },
        (n) => `repeat(${n}, minmax(0, 1fr))`,
      ),
    ).toEqual({
      '--grid-cols-xs': 'repeat(1, minmax(0, 1fr))',
      '--grid-cols-md': 'repeat(4, minmax(0, 1fr))',
    });
  });

  it('returns {} for an empty responsive object', () => {
    expect(resolveResponsiveCssVars('grid-cols', {})).toEqual({});
  });

  it('emits vars in BREAKPOINT_ORDER (deterministic)', () => {
    const vars = resolveResponsiveCssVars('g', {
      xl: 5,
      xs: 1,
      lg: 4,
      sm: 2,
      md: 3,
    });
    expect(Object.keys(vars)).toEqual([
      '--g-xs',
      '--g-sm',
      '--g-md',
      '--g-lg',
      '--g-xl',
    ]);
  });
});

describe('responsive · listDefinedBreakpoints', () => {
  it('returns [] for scalar / undefined', () => {
    expect(listDefinedBreakpoints(undefined)).toEqual([]);
    expect(listDefinedBreakpoints('md')).toEqual([]);
  });
  it('returns BREAKPOINT_ORDER-filtered keys for objects', () => {
    expect(listDefinedBreakpoints({ md: 'lg', xs: 'sm' })).toEqual(['xs', 'md']);
  });
  it('returns [] for empty object', () => {
    expect(listDefinedBreakpoints({})).toEqual([]);
  });
});
