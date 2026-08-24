/**
 * Stage-16 · Phase 3 · useBreakpoint + up() test suite.
 *
 * Shares the min-width-aware matchMedia mock pattern with
 * use-media-query.test; strict afterEach restoration prevents cross-file
 * global/listener leaks.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { useBreakpoint } from './use-breakpoint';
import { up, BREAKPOINT_MIN_WIDTHS } from '../core/responsive';

const originalMatchMedia = window.matchMedia;

function installMatchMedia(initialWidth: number) {
  let width = initialWidth;
  const registry = new Map<string, Set<(e: unknown) => void>>();
  const parseMin = (q: string): number => {
    const m = /min-width:\s*(\d+)px/.exec(q);
    return m ? Number(m[1]) : 0;
  };
  window.matchMedia = vi.fn((q: string) => {
    const min = parseMin(q);
    return {
      media: q,
      get matches() {
        return width >= min;
      },
      addEventListener: (_: string, cb: (e: unknown) => void) => {
        if (!registry.has(q)) registry.set(q, new Set());
        registry.get(q)!.add(cb);
      },
      removeEventListener: (_: string, cb: (e: unknown) => void) => {
        registry.get(q)?.delete(cb);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
  });
  return {
    setWidth(w: number) {
      width = w;
      for (const set of registry.values()) for (const cb of set) cb({});
    },
  };
}

function Probe() {
  const bp = useBreakpoint();
  return <span data-testid="bp">{String(bp)}</span>;
}

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

describe('up()', () => {
  it('builds a min-width query string from the breakpoint px scale', () => {
    expect(up('xs')).toBe('(min-width: 576px)');
    expect(up('sm')).toBe('(min-width: 768px)');
    expect(up('md')).toBe('(min-width: 992px)');
    expect(up('lg')).toBe('(min-width: 1200px)');
    expect(up('xl')).toBe('(min-width: 1400px)');
  });

  it('BREAKPOINT_MIN_WIDTHS matches theme.breakpoints values', () => {
    expect(BREAKPOINT_MIN_WIDTHS).toEqual({
      xs: 576,
      sm: 768,
      md: 992,
      lg: 1200,
      xl: 1400,
    });
  });
});

describe('useBreakpoint', () => {
  it.each([
    [1500, 'xl'],
    [1300, 'lg'],
    [1000, 'md'],
    [800, 'sm'],
    [600, 'xs'],
  ])('viewport %ipx → tier %s', (width, tier) => {
    installMatchMedia(width);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('bp').textContent).toBe(tier);
  });

  it('returns undefined below the xs floor (< 576px, no named tier)', () => {
    installMatchMedia(400);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('bp').textContent).toBe('undefined');
  });

  it('updates when the viewport crosses tier boundaries', () => {
    const mm = installMatchMedia(600);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('bp').textContent).toBe('xs');
    act(() => mm.setWidth(1000));
    expect(getByTestId('bp').textContent).toBe('md');
    act(() => mm.setWidth(1500));
    expect(getByTestId('bp').textContent).toBe('xl');
  });

  it('returns undefined when matchMedia is unavailable (SSR)', () => {
    // @ts-expect-error — deliberately deleting for the test.
    window.matchMedia = undefined;
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('bp').textContent).toBe('undefined');
  });
});
